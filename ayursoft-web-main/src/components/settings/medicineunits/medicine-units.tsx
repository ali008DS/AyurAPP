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
import AddMedicineDialog from "./addmedicine-dialog";

interface Medicine {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function MedicineUnits() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [openAddMedicineDialog, setOpenAddMedicineDialog] = useState(false);

  const [deletingMedicineId, setDeletingMedicineId] = useState<string | null>(
    null
  );

  const { setAlert } = useAppContext();

  const fetchData = async () => {
    const [medicinesRes, _] = await Promise.all([
      apimanager.getMedicines(),
      apimanager.getWhenHow(),
    ]);
    setMedicines(medicinesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingMedicineId(id);
    try {
      await apimanager.deleteMedicine(id);
      setAlert({
        severity: "success",
        message: "Medicine deleted successfully",
      });
      setTimeout(fetchData, 300);
    } catch (error) {
      setAlert({ severity: "error", message: "Error deleting medicine" });
      console.error("Error deleting medicine:", error);
    } finally {
      setDeletingMedicineId(null);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <HeadingText name="Create Medicine Units" />
          <Paper elevation={3} sx={{ padding: "20px" }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() => setOpenAddMedicineDialog(true)}
            >
              Click to add Medicine Unit
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
                  {medicines.map((medicine) => (
                    <TableRow key={medicine._id}>
                      <TableCell width="80%">{medicine.name}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDelete(medicine._id)}
                          disabled={deletingMedicineId === medicine._id}
                        >
                          {deletingMedicineId === medicine._id ? (
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
      </Grid>

      <AddMedicineDialog
        open={openAddMedicineDialog}
        onClose={() => setOpenAddMedicineDialog(false)}
        onSave={fetchData}
      />
    </Box>
  );
}

export default MedicineUnits;
