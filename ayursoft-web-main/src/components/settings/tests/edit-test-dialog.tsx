import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import ApiManager from "../../services/apimanager";
import { useAppContext } from "../../../context/app-context";

interface EditTestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  test?: {
    _id: string;
    name: string;
    description: string;
    note: string;
    marketPrice?: number;
    discountedPrice?: number;
  } | null;
}

export default function EditTestDialog({
  open,
  onClose,
  onSuccess,
  test,
}: EditTestDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  useEffect(() => {
    if (test) {
      setName(test.name || "");
      setDescription(test.description || "");
      setNote(test.note || "");
      setMarketPrice(
        test.marketPrice !== undefined ? String(test.marketPrice) : ""
      );
      setDiscountedPrice(
        test.discountedPrice !== undefined ? String(test.discountedPrice) : ""
      );
    }
  }, [test, open]);

  const handleSubmit = async () => {
    if (!test) return;
    try {
      setLoading(true);
      await ApiManager.editTest(test._id, {
        name,
        description,
        note,
        marketPrice: Number(marketPrice) || 0,
        discountedPrice: Number(discountedPrice) || 0,
      });
      setAlert({
        severity: "success",
        message: "Test updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating test:", error);
      setAlert({
        severity: "error",
        message: "Failed to update test. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Medical Test</DialogTitle>
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
