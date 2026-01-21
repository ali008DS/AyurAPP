import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";
import ApiManager from "../../services/apimanager";

interface CreateTestCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTestCategoryDialog({
  open,
  onClose,
  onSuccess,
}: CreateTestCategoryDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await ApiManager.createTestCategory(name);
      onSuccess();
      onClose();
      setName("");
    } catch (error) {
      console.error("Error creating test category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Test Category</DialogTitle>
      <DialogContent>
        <TextField
          size="small"
          autoFocus
          margin="dense"
          label="Category Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
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
