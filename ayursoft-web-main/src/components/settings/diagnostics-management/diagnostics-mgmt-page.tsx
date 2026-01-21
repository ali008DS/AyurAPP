import { useState, useEffect } from "react";
import HeadingText from "../../ui/HeadingText";
import {
  Paper,
  Box,
  Table,
  TableBody,
  Grid,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import apimanager from "../../../components/services/apimanager";
import { useAppContext } from "../../../context/app-context";
import { AddDiagnosticDialog } from "./add-diagnostic-dialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface DiagnosticItem {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DialogState {
  open: boolean;
  type: "complaint" | "general-examination" | "diagnostic";
  title: string;
}

function DiagnosticsManagement() {
  const [complaints, setComplaints] = useState<DiagnosticItem[]>([]);
  const [generalExams, setGeneralExams] = useState<DiagnosticItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosticItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    type: "complaint",
    title: "Complaint",
  });
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [complaintsRes, generalExamRes, diagnosisRes] = await Promise.all([
        apimanager.getComplaints(),
        apimanager.getGeneralExamination(),
        apimanager.getDiagnosis(),
      ]);
      setComplaints(complaintsRes.data || []);
      setGeneralExams(generalExamRes.data || []);
      setDiagnoses(diagnosisRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlert({
        severity: "error",
        message: "Error fetching diagnostic data",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, type: string) => {
    setDeletingId(id);
    try {
      if (type === "complaint") {
        await apimanager.deleteComplaint(id);
      } else if (type === "general-examination") {
        await apimanager.deleteGeneralExamination(id);
      } else if (type === "diagnostic") {
        await apimanager.deleteDiagnosis(id);
      }
      setAlert({
        severity: "success",
        message: `${type} deleted successfully`,
      });
      setTimeout(fetchData, 300);
    } catch (error) {
      setAlert({ severity: "error", message: `Error deleting ${type}` });
      console.error(`Error deleting ${type}:`, error);
    } finally {
      setDeletingId(null);
    }
  };

  const renderTable = (
    items: DiagnosticItem[],
    type: string,
    title: string
  ) => (
    <Grid item xs={4}>
      <HeadingText name={title} />
      <Paper elevation={3} sx={{ padding: "20px" }}>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          onClick={() =>
            setDialogState({
              open: true,
              type: type as "complaint" | "general-examination" | "diagnostic",
              title: title,
            })
          }
        >
          Add {title}
        </Button>
        <TableContainer
          sx={{ maxHeight: "calc(65vh)" }}
          className="custom-scrollbar"
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell width="80%">{item.name}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDelete(item._id, type)}
                      disabled={deletingId === item._id}
                    >
                      {deletingId === item._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Grid>
  );

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => {
              navigate("/settings");
            }}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <HeadingText name="Diagnostics Management" />
        </Box>
        <Grid container spacing={2}>
          {renderTable(complaints, "complaint", "Complaints")}
          {renderTable(
            generalExams,
            "general-examination",
            "General Examination"
          )}
          {renderTable(diagnoses, "diagnostic", "Diagnosis")}
        </Grid>
      </Box>

      <AddDiagnosticDialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        onSubmit={fetchData}
        type={dialogState.type}
        title={dialogState.title}
      />
    </>
  );
}

export default DiagnosticsManagement;
