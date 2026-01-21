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

interface WhenHowDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingWhenHow: { _id: string; name: string } | null;
}

export function WhenHowDialog({
  open,
  onClose,
  onSubmit,
  editingWhenHow,
}: WhenHowDialogProps) {
  const [whenHowName, setWhenHowName] = useState(editingWhenHow?.name || "");

  useEffect(() => {
    setWhenHowName(editingWhenHow?.name || "");
  }, [editingWhenHow]);
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    if (!whenHowName.trim()) return;
    setLoading(true);
    try {
      if (editingWhenHow) {
        await apimanager.updateWhenHow(editingWhenHow._id, {
          name: whenHowName.trim(),
        });
        setAlert({
          severity: "success",
          message: "When & How option updated successfully",
        });
      } else {
        await apimanager.createWhenHow({ name: whenHowName.trim() });
        setWhenHowName("");
        setAlert({
          severity: "success",
          message: "When & How option added successfully",
        });
      }
      onSubmit();
      onClose();
    } catch (error) {
      setAlert({
        severity: "error",
        message: "Error adding When & How option",
      });
      console.error("Error adding When & How option:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingWhenHow ? "Edit When & How Option" : "Add When & How Option"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          size="small"
          margin="dense"
          label="When & How"
          fullWidth
          value={whenHowName}
          onChange={(e) => setWhenHowName(e.target.value)}
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
            ? editingWhenHow
              ? "Updating..."
              : "Adding..."
            : editingWhenHow
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
