import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface CreateTestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export default function CreateTestDialog({
  open,
  onClose,
  onSuccess,
}: CreateTestDialogProps) {
  const [name, setName] = useState("");
  const [loading] = useState(false);

  const handleSubmit = async () => {
    onSuccess(name);
    setName("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Internal Note</DialogTitle>
      <DialogContent>
        <TextField
          size="small"
          autoFocus
          margin="dense"
          label="Note Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
