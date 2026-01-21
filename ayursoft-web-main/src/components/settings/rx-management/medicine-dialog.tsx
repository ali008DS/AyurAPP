import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAppContext } from "../../../context/app-context";
import apimanager from "../../services/apimanager";

interface MedicineDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingMedicine: { _id: string; name: string } | null;
}

export function MedicineDialog({
  open,
  onClose,
  onSubmit,
  editingMedicine,
}: MedicineDialogProps) {
  const [medicineName, setMedicineName] = useState(editingMedicine?.name || "");

  useEffect(() => {
    setMedicineName(editingMedicine?.name || "");
  }, [editingMedicine]);
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    if (!medicineName.trim()) return;

    setLoading(true);
    try {
      if (editingMedicine) {
        await apimanager.updateMedicine(editingMedicine._id, {
          name: medicineName.trim(),
        });
        setAlert({
          severity: "success",
          message: "Medicine updated successfully",
        });
      } else {
        await apimanager.createMedicine({ name: medicineName.trim() });
        setMedicineName("");
        setAlert({
          severity: "success",
          message: "Medicine added successfully",
        });
      }
      onSubmit();
      onClose();
    } catch (error) {
      setAlert({ severity: "error", message: "Error adding medicine" });
      console.error("Error adding medicine:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          size="small"
          margin="dense"
          label="Medicine Name"
          fullWidth
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="text"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading
            ? editingMedicine
              ? "Updating..."
              : "Adding..."
            : editingMedicine
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
