import { Box, IconButton, Chip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import HeadingText from "../components/ui/HeadingText";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FilePenLine } from "lucide-react";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import dayjs from "dayjs";
import TherapySessionDialog from "../components/therapy-management/TherapySessionDialog";

interface TherapySession {
  _id: string;
  therapy: {
    _id: string;
    therapies: string[];
    patient: {
      _id: string;
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      uhId: string;
    };
    therapist: string;
  };
  sessionDate: string;
  slotStart: string;
  slotEnd: string;
  patient: string;
  therapist: string;
  status: string;
}

function TherapySessions() {
  const { setAlert } = useAppContext();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });
  const theme = useTheme();

  const fetchSessions = async () => {
    try {
      const response = await ApiManager.getTherapySessions();
      const sessionsWithId = response.data.map((session: any) => ({
        ...session,
        id: session._id,
      }));
      setSessions(sessionsWithId);
    } catch (error) {
      console.error("Failed to fetch therapy sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "patient",
      headerName: "Patient",
      width: 150,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.3px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ color: "#222" }}>
            {`${params.row.therapy?.patient?.firstName || ""} ${params.row.therapy?.patient?.lastName || ""
              }`}
          </span>

          <span style={{ color: "#666" }}>
            {`: UHID-RAH ${params.row.therapy?.patient?.uhId || ""}`}
          </span>

          <span style={{ color: "#888" }}>
            ☎︎ {params.row.therapy?.patient?.phone || ""}
          </span>
        </span>
      ),
    },
    {
      field: "therapies",
      headerName: "Therapies",
      width: 180,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#444",
          }}
        >
          {params.row.therapy?.therapies?.join(", ")}
        </span>
      ),
    },
    {
      field: "therapist",
      headerName: "Therapist",
      width: 150,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#666",
          }}
        >
          {params?.value && typeof params.value === "object"
            ? `${params.value?.firstName || "N/A"} ${params.value?.lastName || "N/A"
            }`
            : "N/A"}
        </span>
      ),
    },
    {
      field: "sessionDate",
      headerName: "Session Date",
      width: 120,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#666",
          }}
        >
          {dayjs(params.value).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      field: "slotStart",
      headerName: "Slot Start",
      width: 110,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#888",
          }}
        >
          {dayjs(params.value).format("hh:mm A")}
        </span>
      ),
    },
    {
      field: "slotEnd",
      headerName: "Slot End",
      width: 110,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#888",
          }}
        >
          {dayjs(params.value).format("hh:mm A")}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 170,
      renderCell: (params: any) => {
        const statusColors: Record<string, { color: string; bg: string }> = {
          pending: { color: "#FFA500", bg: "#FFF3E0" },
          reScheduled: { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
          completed: { color: "#4CAF50", bg: "#E8F5E9" },
          cancelled: { color: "#F44336", bg: "#FFEBEE" },
          missed: { color: "#9E9E9E", bg: "#F5F5F5" },
        };
        const statusStyle = statusColors[params.value] || statusColors.pending;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: "11px",
              fontFamily: "Nunito, sans-serif",
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <Box
          display="flex"
          sx={{ mt: 0.5, justifyContent: "center", alignItems: "center" }}
        >
          <IconButton
            onClick={() => handleEdit(params.row)}
            size="small"
            sx={{
              backgroundColor: "#ffe3b887",
              color: "#FAAD14",
              width: 28,
              height: 28,
            }}
          >
            <FilePenLine size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (session: TherapySession) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (!selectedSession) return;
    try {
      await ApiManager.updateTherapySession(selectedSession._id, data);
      setAlert({
        severity: "success",
        message: "Session updated successfully.",
      });
      setDialogOpen(false);
      fetchSessions();
    } catch (error) {
      console.error("Failed to update session", error);
      setAlert({ severity: "error", message: "Failed to update session." });
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <HeadingText name="Therapy Sessions" />
      <Box>
        <DataGrid
          disableColumnMenu
          disableRowSelectionOnClick
          density="compact"
          rows={sessions}
          columns={columns}
          loading={loading}
          pageSizeOptions={[20, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pagination
          sx={{
            maxHeight: "calc(98vh - 150px)",
            maxWidth: "100%",
            border: 0,
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "Nunito, sans-serif",
            },
          }}
        />
      </Box>

      <TherapySessionDialog
        open={dialogOpen}
        session={selectedSession}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

export default TherapySessions;
