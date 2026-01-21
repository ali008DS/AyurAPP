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
import { useAppContext } from "../../../context/app-context";

interface CreateTestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTestDialog({
  open,
  onClose,
  onSuccess,
}: CreateTestDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await ApiManager.createTest({
        name,
        description,
        note,
        marketPrice: Number(marketPrice) || 0,
        discountedPrice: Number(discountedPrice) || 0,
      });
      setAlert({
        severity: "success",
        message: "Test created successfully",
      });
      onSuccess();
      onClose();
      setName("");
      setDescription("");
      setNote("");
      setMarketPrice("");
      setDiscountedPrice("");
    } catch (error) {
      console.error("Error creating test:", error);
      setAlert({
        severity: "error",
        message: "Failed to create test. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Medical Test</DialogTitle>
      <DialogContent>
        <TextField
          size="small"
          autoFocus
          margin="dense"
          label="Test Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          size="small"
          margin="dense"
          label="Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
          multiline
          rows={2}
        />
        <TextField
          size="small"
          margin="dense"
          label="Note"
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
          multiline
          rows={2}
        />
        <TextField
          size="small"
          margin="dense"
          label="Market Price"
          fullWidth
          type="number"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          size="small"
          margin="dense"
          label="Discounted Price"
          fullWidth
          type="number"
          value={discountedPrice}
          onChange={(e) => setDiscountedPrice(e.target.value)}
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
