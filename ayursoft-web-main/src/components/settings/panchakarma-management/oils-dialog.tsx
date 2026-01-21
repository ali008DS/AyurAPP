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

interface OilsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingOil: { _id: string; name: string } | null;
}

export function OilsDialog({
  open,
  onClose,
  onSubmit,
  editingOil,
}: OilsDialogProps) {
  const [oilName, setOilName] = useState(editingOil?.name || "");

  useEffect(() => {
    setOilName(editingOil?.name || "");
  }, [editingOil]);
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    if (!oilName.trim()) return;
    setLoading(true);
    try {
      if (editingOil) {
        await apimanager.updateOil(editingOil._id, {
          name: oilName.trim(),
        });
        setAlert({
          severity: "success",
          message: "Oil option updated successfully",
        });
      } else {
        await apimanager.createOil({ name: oilName.trim() });
        setOilName("");
        setAlert({
          severity: "success",
          message: "Oil option added successfully",
        });
      }
      onSubmit();
      onClose();
    } catch (error) {
      setAlert({
        severity: "error",
        message: "Error adding Oil option",
      });
      console.error("Error adding Oil option:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingOil ? "Edit Oil Option" : "Add Oil Option"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          size="small"
          margin="dense"
          label="Oil"
          fullWidth
          value={oilName}
          onChange={(e) => setOilName(e.target.value)}
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
            ? editingOil
              ? "Updating..."
              : "Adding..."
            : editingOil
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
