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
import { Trash2, Pencil } from "lucide-react";
import apimanager from "../../services/apimanager";
import { TherapyDialog } from "./therapy-dialog";
import { OilsDialog } from "./oils-dialog";
import { useAppContext } from "../../../context/app-context";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";



interface Item {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function PanchakarmaManagement() {
  const [therapies, setTherapies] = useState<Item[]>([]);
  const [oils, setOils] = useState<Item[]>([]);
  const [openTherapyDialog, setOpenTherapyDialog] = useState(false);
  const [openOilsDialog, setOpenOilsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTherapy, setEditingTherapy] = useState<Item | null>(null);
  const [editingOil, setEditingOil] = useState<Item | null>(null);
  const [deletingTherapyId, setDeletingTherapyId] = useState<string | null>(
    null
  );
  const [deletingOilId, setDeletingOilId] = useState<string | null>(
    null
  );
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [therapiesRes, oilsRes] = await Promise.all([
        apimanager.getTherapies(),
        apimanager.getOils(),
      ]);
      setTherapies(therapiesRes.data);
      setOils(oilsRes.data);
    } catch (error) {
      setAlert({ severity: "error", message: "Error fetching data" });
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTherapy = async (id: string) => {
    setDeletingTherapyId(id);
    try {
      await apimanager.deleteTherapy(id);
      setAlert({
        severity: "success",
        message: "Therapy deleted successfully",
      });
      setTimeout(fetchData, 300);
    } catch (error) {
      setAlert({ severity: "error", message: "Error deleting therapy" });
      console.error("Error deleting therapy:", error);
    } finally {
      setDeletingTherapyId(null);
    }
  };

  const handleDeleteOil = async (id: string) => {
    setDeletingOilId(id);
    try {
      await apimanager.deleteOil(id);
      setAlert({
        severity: "success",
        message: "Oil option deleted successfully",
      });
      setTimeout(fetchData, 300);
    } catch (error) {
      setAlert({
        severity: "error",
        message: "Error deleting Oil option",
      });
      console.error("Error deleting Oil option:", error);
    } finally {
      setDeletingOilId(null);
    }
  };

  return (
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
        <HeadingText name="Therapy Management" />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper elevation={3} sx={{ padding: "20px" }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() => setOpenTherapyDialog(true)}
            >
              Add Therapy Option
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : therapies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No therapies found
                      </TableCell>
                    </TableRow>
                  ) : (
                    therapies.map((therapy) => (
                      <TableRow key={therapy._id}>
                        <TableCell
                          width="80%"
                          style={{ textTransform: "none" }}
                        >
                          {therapy.name}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingTherapy(therapy);
                                setOpenTherapyDialog(true);
                              }}
                            >
                              <Pencil size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTherapy(therapy._id)}
                              disabled={deletingTherapyId === therapy._id}
                            >
                              {deletingTherapyId === therapy._id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <HeadingText name="Oils" />
          <Paper elevation={3} sx={{ padding: "20px" }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() => setOpenOilsDialog(true)}
            >
              Add Oil Option
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : oils.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No oils found
                      </TableCell>
                    </TableRow>
                  ) : (
                    oils.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell
                          width="80%"
                          style={{ textTransform: "capitalize" }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingOil(item);
                                setOpenOilsDialog(true);
                              }}
                            >
                              <Pencil size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteOil(item._id)}
                              disabled={deletingOilId === item._id}
                            >
                              {deletingOilId === item._id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <TherapyDialog
        open={openTherapyDialog}
        onClose={() => {
          setOpenTherapyDialog(false);
          setEditingTherapy(null);
        }}
        onSubmit={fetchData}
        editingTherapy={editingTherapy}
      />

      <OilsDialog
        open={openOilsDialog}
        onClose={() => {
          setOpenOilsDialog(false);
          setEditingOil(null);
        }}
        onSubmit={fetchData}
        editingOil={editingOil}
      />
    </Box>
  );
}

export default PanchakarmaManagement;
