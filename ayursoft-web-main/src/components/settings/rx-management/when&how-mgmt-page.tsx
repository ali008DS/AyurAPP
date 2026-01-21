import { useState, useEffect } from "react";
import HeadingText from "../../ui/HeadingText";
import {
  Box,
  Table,
  TableBody,
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
import { WhenHowDialog } from "./when-how-dialog";
import { useAppContext } from "../../../context/app-context";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface WhenHow {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function WhenHowManagement() {
  const [whenHow, setWhenHow] = useState<WhenHow[]>([]);
  const [openWhenHowDialog, setOpenWhenHowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingWhenHow, setEditingWhenHow] = useState<WhenHow | null>(null);
  const [deletingWhenHowId, setDeletingWhenHowId] = useState<string | null>(
    null
  );
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const whenHowRes = await apimanager.getWhenHow();
      setWhenHow(whenHowRes.data);
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

  const handleDeleteWhenHow = async (id: string) => {
    setDeletingWhenHowId(id);
    try {
      await apimanager.deleteWhenHow(id);
      setAlert({
        severity: "success",
        message: "When & How option deleted successfully",
      });
      setTimeout(fetchData, 300);
    } catch (error) {
      setAlert({
        severity: "error",
        message: "Error deleting When & How option",
      });
      console.error("Error deleting When & How option:", error);
    } finally {
      setDeletingWhenHowId(null);
    }
  };

  return (
    <Box sx={{ px: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => {
            navigate("/settings");
          }}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <HeadingText name="When & How" />
      </Box>
      <Box sx={{ padding: "20px" }}>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mb: 2, border: "dashed 1px" }}
          onClick={() => setOpenWhenHowDialog(true)}
        >
          Add When & How Opts
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
              ) : whenHow.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No when & how options found
                  </TableCell>
                </TableRow>
              ) : (
                whenHow.map((item) => (
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
                            setEditingWhenHow(item);
                            setOpenWhenHowDialog(true);
                          }}
                        >
                          <Pencil size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWhenHow(item._id)}
                          disabled={deletingWhenHowId === item._id}
                        >
                          {deletingWhenHowId === item._id ? (
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
      </Box>

      <WhenHowDialog
        open={openWhenHowDialog}
        onClose={() => {
          setOpenWhenHowDialog(false);
          setEditingWhenHow(null);
        }}
        onSubmit={fetchData}
        editingWhenHow={editingWhenHow}
      />
    </Box>
  );
}

export default WhenHowManagement;
