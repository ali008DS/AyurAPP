import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Box,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import ApiManager from "../services/apimanager";

interface MedicineRoomResponsiblityDialogProps {
  open: boolean;
  editMode: boolean;
  formData: {
    items: Array<{ utensilItem: string; quantity: number }>;
  };
  onClose: () => void;
  onSubmit: (data: {
    items: Array<{ utensilItem: string; quantity: number }>;
  }) => void;
  onRefetch?: () => void;
}

interface Utensil {
  _id: string;
  name: string;
}

function MedicineRoomResponsiblityDialog({
  open,
  editMode,
  formData,
  onClose,
  onSubmit,
  onRefetch,
}: MedicineRoomResponsiblityDialogProps) {
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [items, setItems] = useState<
    Array<{ utensilItem: string; quantity: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUtensils().then(() => {
        if (formData.items.length > 0) {
          setItems(formData.items);
        } else {
          setItems([{ utensilItem: "", quantity: 1 }]);
        }
      });
    }
  }, [open, formData]);

  const fetchUtensils = async () => {
    try {
      const response = await ApiManager.getUtensils("medicinePreparation");
      const utensilsData = Array.isArray(response)
        ? response
        : response.data || [];
      setUtensils(utensilsData);
      return utensilsData;
    } catch (error) {
      console.error("Failed to fetch utensils", error);
      return [];
    }
  };

  const handleAddItem = () => {
    setItems([...items, { utensilItem: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "utensilItem" | "quantity",
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const validItems = items.filter(
      (item) => item.utensilItem && item.quantity > 0
    );
    if (validItems.length === 0) return;
    setLoading(true);
    try {
      await onSubmit({ items: validItems });
      onRefetch?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editMode ? "Edit" : "Add"} Medicine Preparation Inventory
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {items.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={7}>
                <Autocomplete
                  size="small"
                  options={utensils}
                  getOptionLabel={(option) => option.name}
                  value={
                    utensils.find(
                      (u) =>
                        u.name === item.utensilItem ||
                        u._id === item.utensilItem
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    handleItemChange(index, "utensilItem", newValue?.name || "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Utensil Item" required />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={items.length > 1 ? 4 : 5}>
                <TextField
                  size="small"
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                {items.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                    size="small"
                  >
                    <Trash size={18} />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}
          <Button
            startIcon={<Plus size={16} />}
            onClick={handleAddItem}
            variant="outlined"
            fullWidth
            sx={{ mt: 1, border: "dashed 1px" }}
          >
            Add Item
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : editMode ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MedicineRoomResponsiblityDialog;
