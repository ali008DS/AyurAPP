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

interface TherapyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingTherapy: { _id: string; name: string } | null;
}

export function TherapyDialog({
  open,
  onClose,
  onSubmit,
  editingTherapy,
}: TherapyDialogProps) {
  const [therapyName, setTherapyName] = useState(editingTherapy?.name || "");

  useEffect(() => {
    setTherapyName(editingTherapy?.name || "");
  }, [editingTherapy]);
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    if (!therapyName.trim()) return;
    setLoading(true);
    try {
      if (editingTherapy) {
        await apimanager.updateTherapy(editingTherapy._id, {
          name: therapyName.trim(),
        });
        setAlert({
          severity: "success",
          message: "Therapy option updated successfully",
        });
      } else {
        await apimanager.createTherapy({ name: therapyName.trim() });
        setTherapyName("");
        setAlert({
          severity: "success",
          message: "Therapy option added successfully",
        });
      }
      onSubmit();
      onClose();
    } catch (error) {
      setAlert({
        severity: "error",
        message: "Error adding Therapy option",
      });
      console.error("Error adding Therapy option:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingTherapy ? "Edit Therapy Option" : "Add Therapy Option"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          size="small"
          margin="dense"
          label="Therapy"
          fullWidth
          value={therapyName}
          onChange={(e) => setTherapyName(e.target.value)}
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
            ? editingTherapy
              ? "Updating..."
              : "Adding..."
            : editingTherapy
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
