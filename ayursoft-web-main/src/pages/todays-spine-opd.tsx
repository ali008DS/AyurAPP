import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import HeadingText from "../components/ui/HeadingText";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Trash, ClipboardPlus, FilePenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiManager from "../components/services/apimanager";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import { useAppContext } from "../context/app-context";
import { useAuth } from "../context/auth-context";

function TodaysOPD() {
  const { setAlert } = useAppContext();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const theme = useTheme();

  console.log("IS-ADMIN", isAdmin);

  const fetchPrescriptions = async () => {
    try {
      const response = isAdmin
        ? await ApiManager.getTodaysPrescriptions()
        : await ApiManager.getAllPrescriptions(user?.id ? user.id : "");
      const prescriptionsWithId = response.data.map((prescription: any) => ({
        ...prescription,
        id: prescription._id,
      }));
      setPrescriptions(prescriptionsWithId);
    } catch (error) {
      console.error("Failed to fetch today's prescriptions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const statusColors = {
    pending: "#FAAD14",
    completed: "#52C41A",
    canceled: "#CF1322",
  };

  const columns: GridColDef[] = [
    {
      field: "patient",
      headerName: "Name",
      width: 150,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <span
            style={{
              textTransform: "capitalize",
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "700",
              color: "#222",
            }}
          >
            {`${params.row?.patient?.firstName || ""} ${params.row?.patient?.lastName || ""
              }`.trim() || "N/A"}
          </span>
        );
      },
    },
    // {
    //   field: "doctor",
    //   headerName: "Doctor",
    //   width: 150,
    //   flex: 1,
    //   renderCell: (params: any) => {
    //     return (
    //       <span
    //         style={{
    //           fontSize: "13px",
    //           fontFamily: "Nunito, sans-serif",
    //           fontWeight: "700",
    //           color: "#222",
    //         }}
    //       >
    //         {`${params.row.user?.firstName
    //           .charAt(0)
    //           .toUpperCase()}${params.row.user?.firstName.slice(
    //           1
    //         )} ${params.row.user?.lastName
    //           .charAt(0)
    //           .toUpperCase()}${params.row.user?.lastName.slice(1)}` || "N/A"}
    //       </span>
    //     );
    //   },
    // },
    {
      field: "opdId",
      headerName: "OPD ID",
      width: 100,
      renderCell: (params: any) => (
        <>
          {params.row.patient.opdId && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "16px",
                fontSize: "10px",
                lineHeight: 1,
                borderRadius: "4px",
                padding: "0px 8px",
                mr: 0.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "Nunito,sans-serif",
                }}
              >
                {params.row.patient.opdId}
              </Typography>
            </Box>
          )}
        </>
      ),
    },
    {
      field: "ipdId",
      headerName: "IPD ID",
      width: 100,
      renderCell: (params: any) => (
        <>
          {params.row?.patient.ipdId && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "16px",
                fontSize: "10px",
                lineHeight: 1,
                borderRadius: "4px",
                backgroundColor: "#e8f5e9",
                padding: "0px 8px",
                mr: 0.5,
              }}
            >
              <Typography
                sx={{
                  color: "#388e3c",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "Nunito,sans-serif",
                }}
              >
                {params.row.patient.ipdId}
              </Typography>
            </Box>
          )}
        </>
      ),
    },
    {
      field: "uhid",
      headerName: "UHID",
      width: 100,
      renderCell: (params: any) => (
        <>
          {params.row?.patient.uhId && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "16px",
                fontSize: "10px",
                lineHeight: 1,
                borderRadius: "4px",
                backgroundColor: "#fff3e0",
                padding: "0px 8px",
              }}
            >
              <Typography
                sx={{
                  color: "#e65100",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "Nunito,sans-serif",
                }}
              >
                {params.row.patient.uhId}
              </Typography>
            </Box>
          )}
        </>
      ),
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      width: 150,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <Tooltip
            placement="right"
            title={`Payment Status: ${params.value}`}
            arrow
          >
            <Chip
              color={params.value === "paid" ? "success" : "warning"}
              size="small"
              variant="outlined"
              label={
                params.value?.charAt(0).toUpperCase() + params.value.slice(1)
              }
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
            color:
              statusColors[params.value as keyof typeof statusColors] || "#555",
          }}
        >
          {params.value?.charAt(0).toUpperCase() + params.value.slice(1)}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
            color: "#777",
          }}
        >
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        const patientId = params.row.patient._id;
        const prescriptionId = params.row.id;
        return (
          <Box display="flex" gap={1} justifyContent="center" p={0.2}>
            {params.row.status === "pending" && (
              <Button
                onClick={() =>
                  navigate(
                    `/prescription/create/${patientId}/${prescriptionId}`
                  )
                }
                variant="outlined"
                size="small"
                color="success"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e4f7e7",
                  color: "#52C41A",
                  minWidth: 80,
                }}
                startIcon={<ClipboardPlus size={14} />}
              >
                Create
              </Button>
            )}
            {params.row.status === "completed" && (
              <Button
                onClick={() =>
                  navigate(`/prescription/edit/${patientId}/${prescriptionId}`)
                }
                variant="outlined"
                color="warning"
                size="small"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#FFFbF5",
                  color: "#FAAD14",
                  minWidth: 80,
                }}
                startIcon={<FilePenLine size={14} />}
              >
                Edit
              </Button>
            )}
            <IconButton
              onClick={() => {
                setSelectedPrescriptionId(params.row.id);
                setConfirmDialogOpen(true);
              }}
              size="small"
              sx={{
                backgroundColor: "#FCE8E6",
                color: "#CF1322",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash size={14} />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await ApiManager.deletePrescription(id);
      console.log("Deleted prescription with id:", id);
      setAlert({
        severity: "success",
        message: "Deleted successfully.",
      });
      fetchPrescriptions();
    } catch (error) {
      console.error("Failed to delete", error);
      setAlert({
        severity: "error",
        message: "Failed to delete.",
      });
    }
  };

  const handleConfirmClose = (result: boolean) => {
    setConfirmDialogOpen(false);
    console.log("Result", result);
    if (result && selectedPrescriptionId) {
      handleDelete(selectedPrescriptionId);
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <HeadingText name="Today's Prescriptions" />
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          autoHeight
          disableColumnMenu
          disableRowSelectionOnClick
          density="compact"
          rows={prescriptions}
          columns={columns}
          loading={loading}
          pageSizeOptions={[20, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pagination
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "Nunito, sans-serif",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Box>
      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Delete Prescription"
        message="Are you sure you want to delete this prescription ?
        This action is irreversible !"
        onClose={handleConfirmClose}
      />
    </Box>
  );
}

export default TodaysOPD;
