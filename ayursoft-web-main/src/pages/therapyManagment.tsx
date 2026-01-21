import { Box, Button, IconButton } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import HeadingText from "../components/ui/HeadingText";
import { useState, useEffect, useCallback } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FilePenLine, FilePlus, Trash2, FileText, Printer } from "lucide-react";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import dayjs, { Dayjs } from "dayjs";
import TherapyDialog from "../components/therapy-management/TherapyDialog";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import PrintDialog from "../components/therapy-management/PrintDialog";
import { useNavigate } from "react-router-dom";

interface TherapySession {
  _id: string;
  therapies: string[];
  patient: { _id: string; firstName: string; lastName: string };
  therapist: { _id: string; firstName: string; lastName: string } | string;
  startDate: string;
  endDate: string;
  slotStart: string;
  slotEnd: string;
  gaps: number;
}

function TherapyManagement() {
  const { setAlert } = useAppContext();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [therapyOptions, setTherapyOptions] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientInputValue, setPatientInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [therapyToPrint, setTherapyToPrint] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<
    Array<{ _id: string; firstName: string; lastName: string }>
  >([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  });
  const [formData, setFormData] = useState({
    therapies: [] as string[],
    patient: null as string | null,
    therapist: "",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    slotStart: null as Dayjs | null,
    slotEnd: null as Dayjs | null,
    gaps: "" as string | number,
  });
  const theme = useTheme();

  const fetchSessions = async () => {
    try {
      const response = await ApiManager.getPatientTherapies();
      const sessionsWithId = response.data.map((session: any) => ({
        ...session,
        id: session._id,
      }));
      setSessions(sessionsWithId);
    } catch (error) {
      console.error("Failed to fetch patient therapies", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTherapies = async () => {
    try {
      const response = await ApiManager.getTherapies();
      setTherapyOptions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch therapies", error);
    }
  };

  const fetchTherapists = async () => {
    try {
      const response = await ApiManager.getUsers();
      const therapistUsers = response.data.filter((user: any) =>
        user.userRole?.name?.toLowerCase().includes("therap")
      );
      setTherapists(therapistUsers);
    } catch (error) {
      console.error("Failed to fetch therapists", error);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchTherapies();
    fetchTherapists();
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedInputValue(patientInputValue.trim()),
      400
    );
    return () => clearTimeout(timer);
  }, [patientInputValue]);

  useEffect(() => {
    if (!debouncedInputValue || debouncedInputValue.length < 2) {
      setPatients([]);
      setLoadingPatients(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingPatients(true);
      try {
        const resp = await ApiManager.getPatients(1, 50, debouncedInputValue);
        const rows = resp?.data?.data ?? [];
        if (!cancelled) setPatients(rows);
      } catch (err) {
        console.error("Error fetching patients:", err);
        if (!cancelled) setPatients([]);
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedInputValue]);

  const columns: GridColDef[] = [
    {
      field: "therapies",
      headerName: "Therapies",
      width: 200,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#222",
          }}
        >
          {params.value.join(", ")}
        </span>
      ),
    },
    {
      field: "patient",
      headerName: "Patient",
      width: 180,
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#333",
          }}
        >
          {params.value?.firstName} {params.value?.lastName} ➜ UHID-RAH{" "}
          {params.value?.uhId}
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
            color: "#444",
          }}
        >
          {typeof params.value === "object"
            ? `${params.value?.firstName || "N/A"} ${params.value?.lastName || "N/A"
            }`
            : "N/A"}
        </span>
      ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 120,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#555",
          }}
        >
          {dayjs(params.value).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      field: "endDate",
      headerName: "End Date",
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
      width: 120,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#777",
          }}
        >
          {dayjs(params.value).format("hh:mm A")}
        </span>
      ),
    },
    {
      field: "slotEnd",
      headerName: "Slot End",
      width: 120,
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
      field: "gaps",
      headerName: "Gaps (days)",
      width: 100,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#999",
            textAlign: "center",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box
          display="flex"
          gap={1}
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

          <IconButton
            onClick={() => handleDeleteClick(params.row._id)}
            size="small"
            sx={{
              backgroundColor: "#ffe0e0",
              color: "#f44336",
              width: 28,
              height: 28,
            }}
          >
            <Trash2 size={16} />
          </IconButton>
          <IconButton
            onClick={() =>
              navigate(`/therapy-docs/${params.row._id}`, {
                state: { patient: params.row.patient._id },
              })
            }
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              width: 28,
              height: 28,
            }}
          >
            <FileText size={16} />
          </IconButton>
          <IconButton
            onClick={() => {
              setTherapyToPrint(params.row._id);
              setPrintDialogOpen(true);
            }}
            size="small"
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#4caf50",
              width: 28,
              height: 28,
            }}
          >
            <Printer size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (session: TherapySession) => {
    setEditMode(true);
    setSelectedSessionId(session._id);
    setSelectedPatient(session.patient);
    setFormData({
      therapies: session.therapies,
      patient: session.patient._id,
      therapist:
        typeof session.therapist === "object"
          ? session.therapist._id
          : session.therapist,
      startDate: dayjs(session.startDate),
      endDate: dayjs(session.endDate),
      slotStart: dayjs(session.slotStart),
      slotEnd: dayjs(session.slotEnd),
      gaps: session.gaps,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditMode(false);
    setSelectedSessionId(null);
    setSelectedPatient(null);
    setPatientInputValue("");
    setFormData({
      therapies: [],
      patient: null,
      therapist: "",
      startDate: null,
      endDate: null,
      slotStart: null,
      slotEnd: null,
      gaps: "",
    });
    setDialogOpen(true);
  };

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTimePeriodChange = useCallback((days: number) => {
    const startDate = dayjs();
    const endDate = startDate.add(days - 1, "day");
    setFormData((prev) => ({ ...prev, startDate, endDate }));
  }, []);

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (confirmed: boolean) => {
    if (confirmed && sessionToDelete) {
      try {
        await ApiManager.deletePatientTherapy(sessionToDelete);
        setAlert({
          severity: "success",
          message: "Therapy session deleted successfully.",
        });
        fetchSessions();
      } catch (error) {
        console.error("Failed to delete therapy session", error);
        setAlert({
          severity: "error",
          message: "Failed to delete therapy session.",
        });
      }
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  function toLocalMidnightISO(date: Dayjs) {
    const d = date.toDate(); // convert to JS Date
    d.setHours(0, 0, 0, 0); // local midnight
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  }
  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        therapies: data.therapies,
        patient: data.patient,
        therapist: data.therapist,
        startDate: data.startDate ? toLocalMidnightISO(data.startDate) : null,
        endDate: data.endDate ? toLocalMidnightISO(data.endDate) : null,
        slotStart: data.slotStart?.toISOString(),
        slotEnd: data.slotEnd?.toISOString(),
        gaps: data.gaps === "" ? 0 : Number(data.gaps),
      };

      if (editMode && selectedSessionId) {
        await ApiManager.updatePatientTherapy(selectedSessionId, payload);
        setAlert({ severity: "success", message: "Updated successfully." });
      } else {
        await ApiManager.createPatientTherapy(payload);
        setAlert({ severity: "success", message: "Created successfully." });
      }
      setDialogOpen(false);
      fetchSessions();
    } catch (error) {
      console.error("Failed to save", error);
      setAlert({ severity: "error", message: "Failed to save." });
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <HeadingText name="Therapy Management" />
        <Button
          variant="outlined"
          startIcon={<FilePlus size={16} />}
          onClick={handleCreate}
          sx={{ fontWeight: "bold", border: "dashed 1px" }}
        >
          Add Therapy Session
        </Button>
      </Box>
      <Box sx={{ width: "100%", mt: 2 }}>
        <DataGrid
          autoHeight
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
            border: 0,
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "Nunito, sans-serif",
            },
          }}
        />
      </Box>

      <TherapyDialog
        open={dialogOpen}
        editMode={editMode}
        formData={formData}
        therapyOptions={therapyOptions}
        therapists={therapists}
        patientOptions={patients}
        selectedPatient={selectedPatient}
        loadingPatients={loadingPatients}
        patientInputValue={patientInputValue}
        onPatientInputChange={setPatientInputValue}
        onPatientChange={setSelectedPatient}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        onTimePeriodChange={handleTimePeriodChange}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Therapy Session"
        message="If you delete this therapy, all its associated sessions will also be deleted. Are you sure?"
        onClose={handleDeleteConfirm}
      />

      <PrintDialog
        open={printDialogOpen}
        therapyId={therapyToPrint}
        onClose={() => setPrintDialogOpen(false)}
      />
    </Box>
  );
}

export default TherapyManagement;
