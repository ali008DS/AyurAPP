import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box, Button, Typography } from "@mui/material";
import { Plus, Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import AddMedicineRoom from "../../../components/medicine-room/add";
import EditMedicineRoom from "../../../components/medicine-room/edit";
import DataTable from "../../../components/medicine-room/data-table";
import ApiManager from "../../../components/services/apimanager";
import ConfirmationDialog from "../../../components/ui/confirmation-dialog";
import { useAppContext } from "../../../context/app-context";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  uhId?: string;
}

interface Medicine {
  _id: string;
  name: string;
  unitType?: string;
  baseUnitType?: string;
  totalQuantityInAUnit?: number;
}

interface MedicineEntry {
  medicine: Medicine;
  quantity: number;
  batchNumber: string;
}

interface MedicineRoomEntry {
  _id: string;
  patient: Patient;
  medicines?: MedicineEntry[];
  checkedBy: any;
  usageDate?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

function normalizeMedicines(entry: any): MedicineEntry[] {
  if (!entry) return [];
  if (Array.isArray(entry.medicines)) return entry.medicines;
  if (entry.medicine) {
    return [
      {
        medicine: entry.medicine,
        quantity: entry.quantity ?? 0,
        batchNumber: entry.batchNumber ?? "",
      },
    ];
  }
  return [];
}

const MedicineRoom: React.FC = () => {
  const { setAlert } = useAppContext();

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MedicineRoomEntry | null>(
    null
  );
  const [entries, setEntries] = useState<MedicineRoomEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const now = dayjs();
  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(now);

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async (
    month?: number,
    year?: number,
    query?: { month?: number; year?: number; date?: string }
  ) => {
    try {
      setLoading(true);
      let response: any;
      if (query && query.date) {
        response = await ApiManager.getMedicineRoomCurrentMonthByDate(
          query.date
        );
      } else if (query && (query.month || query.year)) {
        response = await ApiManager.getMedicineRoomByQuery(query);
      } else if (month && year) {
        response = await ApiManager.getMedicineRoomByMonth(year, month);
      } else {
        response = await ApiManager.getMedicineRoomCurrentMonth();
      }

      const payload = response && response.data ? response.data : response;
      setEntries(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setAlert({
        severity: "error",
        message: "Failed to load medicine room entries",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((e) => e._id === id);
    if (entry) {
      setSelectedEntry(entry);
      setOpenEdit(true);
    }
  };

  const handleEditSuccess = () => {
    setOpenEdit(false);
    setSelectedEntry(null);
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    setEntryToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmClose = async (confirmed: boolean) => {
    if (confirmed && entryToDelete) {
      try {
        await ApiManager.deleteMedicineRoom(entryToDelete);
        setAlert({
          severity: "success",
          message: "Entry deleted successfully",
        });
        fetchEntries();
      } catch (error) {
        console.error("Error deleting entry:", error);
        setAlert({ severity: "error", message: "Failed to delete entry" });
      }
    }
    setConfirmDialogOpen(false);
    setEntryToDelete(null);
  };

  const handleExportExcel = () => {
    if (entries.length === 0) {
      setAlert({ severity: "warning", message: "No data to export" });
      return;
    }

    // Prepare data for Excel
    const dataToExport = entries.flatMap((entry, index) => {
      const medicines = normalizeMedicines(entry);
      const rowDate = new Date(
        entry.usageDate || entry.createdAt
      ).toLocaleDateString("en-GB");

      if (medicines.length === 0) {
        return [
          {
            "S.No": index + 1,
            Date: rowDate,
            "Patient Name": `${entry.patient?.firstName || ""} ${
              entry.patient?.lastName || ""
            }`.trim(),
            UHID: entry.patient?.uhId || "-",
            "Medicine Name": "-",
            "Batch Number": "-",
            Quantity: 0,
            "Checked By": entry.checkedBy
              ? typeof entry.checkedBy === "string"
                ? entry.checkedBy
                : `${entry.checkedBy.firstName} ${entry.checkedBy.lastName}`
              : "Admin",
          },
        ];
      }

      return medicines.map((med, medIndex) => ({
        "S.No": medIndex === 0 ? index + 1 : "",
        Date: rowDate,
        "Patient Name": `${entry.patient?.firstName || ""} ${
          entry.patient?.lastName || ""
        }`.trim(),
        UHID: entry.patient?.uhId || "-",
        "Medicine Name": med.medicine?.name || "-",
        "Batch Number": med.batchNumber || "-",
        Quantity: med.quantity || 0,
        "Checked By": entry.checkedBy
          ? typeof entry.checkedBy === "string"
            ? entry.checkedBy
            : `${entry.checkedBy.firstName} ${entry.checkedBy.lastName}`
          : "Admin",
      }));
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicine Room");

    // Generate filename
    const date = selectedMonthDate ? selectedMonthDate.toDate() : new Date();
    const monthName = date
      .toLocaleString("default", { month: "long" })
      .toLowerCase();
    const yearNumber = date.getFullYear();
    const fileName = `medicine-room-${monthName}-${yearNumber}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, fileName);
    setAlert({
      severity: "success",
      message: "Excel file downloaded successfully",
    });
  };

  return (
    <Box
      sx={{
        m: 1,
        pt: 2,
        height: "calc(100vh - 25px)",
        overflowY: "scroll",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <DatePicker
            views={["year", "month"]}
            label="Filter by month"
            value={selectedMonthDate}
            onChange={(newValue) => setSelectedMonthDate(newValue)}
            slotProps={{ textField: { size: "small", sx: { width: 180 } } }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              const iso = selectedMonthDate
                ? selectedMonthDate.toISOString()
                : dayjs().toISOString();
              fetchEntries(undefined, undefined, { date: iso });
            }}
            sx={{
              px: 3,
              borderStyle: "dashed",
              borderWidth: 1.5,
              "&:hover": { borderStyle: "dashed", borderWidth: 1.5 },
            }}
          >
            Load
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<Download size={18} />}
            onClick={handleExportExcel}
            disabled={entries.length === 0}
            sx={{
              borderStyle: "dashed",
              borderWidth: 1.5,
              "&:hover": { borderStyle: "dashed", borderWidth: 1.5 },
            }}
          >
            Export XLSX
          </Button>

          <Button
            variant="outlined"
            color="info"
            startIcon={<Printer size={18} />}
            onClick={() => handlePrint()}
            disabled={entries.length === 0}
            sx={{
              borderStyle: "dashed",
              borderWidth: 1.5,
              "&:hover": { borderStyle: "dashed", borderWidth: 1.5 },
            }}
          >
            Print
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAdd(true)}
            sx={{
              borderStyle: "dashed",
              borderWidth: 1.5,
              fontWeight: 600,
              "&:hover": { borderStyle: "dashed", borderWidth: 1.5 },
            }}
          >
            Add New Record
          </Button>
        </Box>
      </Box>

      <Box ref={componentRef} sx={{ "@media print": { p: 3 } }}>
        <style type="text/css" media="print">
          {`
            @media print {
              @page { size: landscape; margin: 10mm; }
              .MuiTableContainer-root { 
                max-height: none !important; 
                overflow: visible !important; 
                border: none !important;
              }
              .MuiTable-root {
                width: 100% !important;
              }
              .MuiTableCell-root {
                border: 1px solid #000 !important;
                padding: 4px 8px !important;
              }
              .MuiTableCell-head {
                background-color: #f5f5f5 !important;
                -webkit-print-color-adjust: exact;
              }
              /* Hide action column when printing */
              .MuiTableRow-root td:last-child,
              .MuiTableRow-root th:last-child {
                display: none !important;
              }
            }
          `}
        </style>
        {/* Current Month/Year Display */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#666" }}>
          {selectedMonthDate
            ? selectedMonthDate.toDate().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
          Register
        </Typography>

        {/* Excel-like Data Table */}
        <DataTable
          entries={entries}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      {/* Summary */}
      {!loading && entries.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Entries: <strong>{entries.length}</strong> • Total Medicines
            Dispensed:{" "}
            <strong>
              {entries.reduce(
                (sum, entry) => sum + normalizeMedicines(entry).length,
                0
              )}
            </strong>{" "}
            • Total Quantity:{" "}
            <strong>
              {entries.reduce(
                (sum, entry) =>
                  sum +
                  normalizeMedicines(entry).reduce(
                    (medSum, med) => medSum + (med.quantity ?? 0),
                    0
                  ),
                0
              )}
            </strong>{" "}
            • Admin Checked:{" "}
            <strong>
              {entries.filter((entry) => entry.checkedBy === null).length}
            </strong>
          </Typography>
        </Box>
      )}

      {/* Add Medicine Room Dialog */}
      <AddMedicineRoom
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          setOpenAdd(false);
          fetchEntries();
        }}
      />

      {/* Edit Medicine Room Dialog */}
      {selectedEntry && (
        <EditMedicineRoom
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setSelectedEntry(null);
          }}
          onSuccess={handleEditSuccess}
          entry={{
            ...selectedEntry,
            medicines: normalizeMedicines(selectedEntry),
          }}
        />
      )}

      {/* Confirmation Dialog for delete actions */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Delete Entry"
        message="Are you sure you want to delete this medicine room entry? This action cannot be undone."
        onClose={handleConfirmClose}
      />
    </Box>
  );
};

export default MedicineRoom;
