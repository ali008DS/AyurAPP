import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import apimanager from "../../../components/services/apimanager";
import { useAppContext } from "../../../context/app-context";

interface AddDiagnosticDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  type: "complaint" | "general-examination" | "diagnostic";
  title: string;
}

export function AddDiagnosticDialog({
  open,
  onClose,
  onSubmit,
  type,
  title,
}: AddDiagnosticDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setAlert({
        severity: "error",
        message: "Please enter a name",
      });
      return;
    }

    setLoading(true);
    try {
      if (type === "complaint") {
        await apimanager.createComplaint({ name });
      } else if (type === "general-examination") {
        await apimanager.createGeneralExamination({ name });
      } else if (type === "diagnostic") {
        await apimanager.createDiagnosis({ name });
      }
      setAlert({
        severity: "success",
        message: `${title} added successfully`,
      });
      onSubmit();
      handleClose();
    } catch (error) {
      console.error("Error adding item:", error);
      setAlert({
        severity: "error",
        message: `Error adding ${title.toLowerCase()}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add {title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
