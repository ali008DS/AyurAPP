import { Box, Button, IconButton } from "@mui/material";
import HeadingText from "../components/ui/HeadingText";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Trash, FilePenLine, FilePlus } from "lucide-react";
import ApiManager from "../components/services/apimanager";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import { useAppContext } from "../context/app-context";
import dayjs, { Dayjs } from "dayjs";
import TrackingReportDialog from "../components/reports/tracking-reports/TrackingReportDialog";

interface TrackingReport {
  _id: string;
  documentName: string;
  issuingAuthority: string;
  licenceNumber: string;
  issueDate: string;
  expiryDate: string;
  remarks: string;
}

function TrackingReports() {
  const { setAlert } = useAppContext();
  const [reports, setReports] = useState<TrackingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });
  const [formData, setFormData] = useState({
    documentName: "",
    issuingAuthority: "",
    licenceNumber: "",
    issueDate: null as Dayjs | null,
    expiryDate: null as Dayjs | null,
    remarks: "",
  });

  const fetchReports = async () => {
    try {
      const response = await ApiManager.getTrackingReports();
      const reportsWithId = response.data.map((report: any) => ({
        ...report,
        id: report._id,
      }));
      setReports(reportsWithId);
    } catch (error) {
      console.error("Failed to fetch tracking reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "documentName",
      headerName: "Document Name",
      width: 200,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "capitalize",
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#222",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "issuingAuthority",
      headerName: "Issuing Authority",
      width: 180,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "600",
            color: "#333",
          }}
        >
          {params.value.toUpperCase()}
        </span>
      ),
    },
    {
      field: "licenceNumber",
      headerName: "Licence Number",
      width: 150,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "600",
            color: "#555",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "issueDate",
      headerName: "Issue Date",
      width: 120,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
            color: "#666",
          }}
        >
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </span>
      ),
    },
    {
      field: "expiryDate",
      headerName: "Expiry Date",
      width: 120,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
            color: "#666",
          }}
        >
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </span>
      ),
    },
    {
      field: "remarks",
      headerName: "Remarks",
      width: 200,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
            color: "#777",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box
          display="flex"
          gap={2}
          sx={{
            flex: "row",
            alignItems: "center",
            justifyContent: "center",
            mt: 0.5,
          }}
        >
          <IconButton
            onClick={() => handleEdit(params.row)}
            size="small"
            sx={{
              backgroundColor: "#ffffffff",
              color: "#FAAD14",
              width: 28,
              height: 28,
            }}
          >
            <FilePenLine size={16} />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedReportId(params.row.id);
              setConfirmDialogOpen(true);
            }}
            size="small"
            sx={{
              backgroundColor: "#ffffffff",
              color: "#CF1322",
              width: 28,
              height: 28,
            }}
          >
            <Trash size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (report: TrackingReport) => {
    setEditMode(true);
    setSelectedReportId(report._id);
    setFormData({
      documentName: report.documentName,
      issuingAuthority: report.issuingAuthority,
      licenceNumber: report.licenceNumber,
      issueDate: dayjs(report.issueDate),
      expiryDate: dayjs(report.expiryDate),
      remarks: report.remarks,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditMode(false);
    setSelectedReportId(null);
    setFormData({
      documentName: "",
      issuingAuthority: "",
      licenceNumber: "",
      issueDate: null,
      expiryDate: null,
      remarks: "NO",
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        documentName: formData.documentName,
        issuingAuthority: formData.issuingAuthority,
        licenceNumber: formData.licenceNumber,
        issueDate: formData.issueDate?.toISOString(),
        expiryDate: formData.expiryDate?.toISOString(),
        remarks: formData.remarks,
      };

      if (editMode && selectedReportId) {
        await ApiManager.updateTrackingReport(selectedReportId, payload);
        setAlert({ severity: "success", message: "Updated successfully." });
      } else {
        await ApiManager.createTrackingReport(payload);
        setAlert({ severity: "success", message: "Created successfully." });
      }
      setDialogOpen(false);
      fetchReports();
    } catch (error) {
      console.error("Failed to save", error);
      setAlert({ severity: "error", message: "Failed to save." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiManager.deleteTrackingReport(id);
      setAlert({ severity: "success", message: "Deleted successfully." });
      fetchReports();
    } catch (error) {
      console.error("Failed to delete", error);
      setAlert({ severity: "error", message: "Failed to delete." });
    }
  };

  const handleConfirmClose = (result: boolean) => {
    setConfirmDialogOpen(false);
    if (result && selectedReportId) {
      handleDelete(selectedReportId);
    }
  };

  const getRowClassName = (params: any) => {
    const daysUntilExpiry = dayjs(params.row.expiryDate).diff(dayjs(), "day");
    return daysUntilExpiry <= 10 && daysUntilExpiry >= 0 ? "expiring-soon" : "";
  };

  return (
    <Box sx={{ px: 3, overflowY: "auto", height: "calc(100vh - 25px)" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <HeadingText name="Tracking Reports" />
        <Button
          variant="outlined"
          startIcon={<FilePlus size={16} />}
          onClick={handleCreate}
          sx={{ fontWeight: "bold", border: "dashed 1px" }}
        >
          Add Report
        </Button>
      </Box>
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          autoHeight
          disableColumnMenu
          disableRowSelectionOnClick
          density="compact"
          rows={reports}
          columns={columns}
          loading={loading}
          pageSizeOptions={[20, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pagination
          getRowClassName={getRowClassName}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "Nunito, sans-serif",
            },
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .expiring-soon": {
              backgroundColor: "#ff000012",
              "&:hover": { backgroundColor: "#ff000025" },
            },
          }}
        />
      </Box>

      <TrackingReportDialog
        open={dialogOpen}
        editMode={editMode}
        formData={formData}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Delete Tracking Report"
        message="Are you sure you want to delete this tracking report? This action is irreversible!"
        onClose={handleConfirmClose}
      />
    </Box>
  );
}

export default TrackingReports;
