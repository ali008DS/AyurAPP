import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Edit, Trash2 } from "lucide-react";

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
}

interface DataTableProps {
  entries: MedicineRoomEntry[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Helper function to normalize medicines
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

const DataTable: React.FC<DataTableProps> = ({
  entries,
  loading,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getPatientDisplay = (patient: Patient | string) => {
    if (!patient) return "Unknown Patient";
    if (typeof patient === "string") return patient;
    const firstName = patient.firstName || "";
    const lastName = patient.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || patient._id || "Unknown Patient";
  };

  const getMedicineDisplay = (medicine: Medicine | string) => {
    if (!medicine) return "Unknown Medicine";
    if (typeof medicine === "string") return medicine;
    return medicine.name || medicine._id || "Unknown Medicine";
  };

  const getCheckedByDisplay = (checkedBy: any) => {
    if (!checkedBy) return "Admin";
    if (typeof checkedBy === "string") return checkedBy;

    const firstName = checkedBy.firstName || "";
    const lastName = checkedBy.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName ? `User: ${fullName}` : "Admin";
  };

  // Flatten entries to show one medicine per row
  type FlattenedRow = {
    entryId: string;
    patient: Patient;
    medicine: Medicine | null;
    quantity: number;
    batchNumber: string;
    checkedBy: any;
    usageDate: string;
    medicineCount: number;
    isFirstRow: boolean;
  };

  const flattenedRows: FlattenedRow[] = entries.flatMap(
    (entry): FlattenedRow[] => {
      const medicines = normalizeMedicines(entry);
      if (medicines.length === 0) {
        // Entry with no medicines
        return [
          {
            entryId: entry._id,
            patient: entry.patient,
            medicine: null,
            quantity: 0,
            batchNumber: "",
            checkedBy: entry.checkedBy,
            usageDate: entry.usageDate || entry.createdAt,
            medicineCount: 0,
            isFirstRow: true,
          },
        ];
      }
      return medicines.map(
        (med, index): FlattenedRow => ({
          entryId: entry._id,
          patient: entry.patient,
          medicine: med.medicine,
          quantity: med.quantity,
          batchNumber: med.batchNumber,
          checkedBy: entry.checkedBy,
          usageDate: entry.usageDate || entry.createdAt,
          medicineCount: medicines.length,
          isFirstRow: index === 0,
        })
      );
    }
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "#f5f5f5",
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary" gutterBottom>
          No medicine room entries found.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the spreadsheet above to create your first entry.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid #e0e0e0",
        maxHeight: 600,
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: "#555",
          },
        },
      }}
    >
      <Table
        size="small"
        stickyHeader
        sx={{
          "& .MuiTableCell-root": {
            borderRight: "1px solid #e0e0e0",
            padding: "8px 12px",
            fontSize: "13px",
          },
          "& .MuiTableCell-head": {
            backgroundColor: "#f5f5f5",
            fontWeight: 600,
            borderBottom: "2px solid #d0d0d0",
            position: "sticky",
            top: 0,
            zIndex: 10,
          },
          "& .MuiTableRow-root:hover": {
            backgroundColor: "#fafafa",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "5%", textAlign: "center" }}>
              S.No
            </TableCell>
            <TableCell sx={{ width: "10%" }}>Date</TableCell>
            <TableCell sx={{ width: "15%" }}>Patient Name</TableCell>
            <TableCell sx={{ width: "10%" }}>UHID</TableCell>
            <TableCell sx={{ width: "20%" }}>Medicine Name</TableCell>
            <TableCell sx={{ width: "12%" }}>Batch Number</TableCell>
            <TableCell sx={{ width: "8%", textAlign: "center" }}>
              Quantity
            </TableCell>
            <TableCell sx={{ width: "10%", textAlign: "center" }}>
              Checked By
            </TableCell>
            <TableCell
              sx={{ width: "10%", textAlign: "center", borderRight: "none" }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flattenedRows.map((row: FlattenedRow, index: number) => (
            <TableRow
              key={`${row.entryId}-${index}`}
              sx={{
                "&:nth-of-type(odd)": {
                  backgroundColor: "#fafafa",
                },
              }}
            >
              {/* S.No */}
              <TableCell sx={{ textAlign: "center", fontWeight: 500 }}>
                {index + 1}
              </TableCell>

              {/* Date */}
              <TableCell>{formatDate(row.usageDate)}</TableCell>

              {/* Patient Name */}
              <TableCell sx={{ fontWeight: 500 }}>
                {getPatientDisplay(row.patient)}
              </TableCell>

              {/* UHID */}
              <TableCell sx={{ color: "#1976d2", fontWeight: 500 }}>
                {row.patient?.uhId || "-"}
              </TableCell>

              {/* Medicine Name */}
              <TableCell sx={{ fontWeight: 500 }}>
                {row.medicine ? getMedicineDisplay(row.medicine) : "-"}
              </TableCell>

              {/* Batch Number */}
              <TableCell sx={{ color: "#666", fontFamily: "monospace" }}>
                {row.batchNumber || "-"}
              </TableCell>

              {/* Quantity */}
              <TableCell
                sx={{ textAlign: "center", fontWeight: 600, color: "#2e7d32" }}
              >
                {row.quantity || "-"}
              </TableCell>

              {/* Checked By */}
              <TableCell
                sx={{ textAlign: "center", fontSize: "12px", color: "#666" }}
              >
                {getCheckedByDisplay(row.checkedBy)}
              </TableCell>

              {/* Actions - Only show on first row of each entry */}
              <TableCell sx={{ textAlign: "center", borderRight: "none" }}>
                {row.isFirstRow && (
                  <Box
                    sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(row.entryId)}
                      title="Edit entry"
                      sx={{ padding: "4px" }}
                    >
                      <Edit size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(row.entryId)}
                      title="Delete entry"
                      sx={{ padding: "4px" }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
