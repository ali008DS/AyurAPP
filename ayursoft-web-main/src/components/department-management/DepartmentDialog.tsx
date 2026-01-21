import { useState } from "react";
import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputLabel,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Department } from "./types";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (department: Partial<Department>) => void;
  editingDepartment: Department | null;
  newDepartment: Partial<Department>;
  setNewDepartment: (department: Partial<Department>) => void;
}

function DepartmentDialog({
  open,
  onClose,
  onSave,
  editingDepartment,
  newDepartment,
  setNewDepartment,
}: DepartmentDialogProps) {
  console.log("inside dialog", "New", newDepartment, "edit", editingDepartment);
  const { setAlert } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    console.log("insdide save", newDepartment);
    if (!newDepartment.name) {
      setAlert({ severity: "error", message: "Department name is required" });
      return;
    }

    setLoading(true);
    try {
      if (editingDepartment) {
        await ApiManager.updateDepartment(
          editingDepartment.id.toString(),
          newDepartment.name
        );
        setAlert({
          severity: "success",
          message: "Department updated successfully",
        });
      } else {
        await ApiManager.createDepartment(newDepartment.name);
        setAlert({
          severity: "success",
          message: "Department created successfully",
        });
      }
      onSave(newDepartment);
    } catch (error) {
      setAlert({
        severity: "error",
        message: "An error occurred while saving the department",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "Nunito, sans-serif", fontWeight: "400" }}>
        {editingDepartment ? "Edit Department" : "Add New Department"}
      </DialogTitle>
      <DialogContent>
        <Box>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <InputLabel shrink sx={{ fontSize: 18 }}>
                Name :
              </InputLabel>
              <TextField
                size="small"
                fullWidth
                value={newDepartment.name || ""}
                onChange={(e) =>
                  setNewDepartment({ ...newDepartment, name: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{ color: "text.secondary" }}
          variant="text"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="text"
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DepartmentDialog;
