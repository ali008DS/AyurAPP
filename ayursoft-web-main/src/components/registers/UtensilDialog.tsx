import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface UtensilDialogProps {
  open: boolean;
  editMode: boolean;
  formData: { name: string };
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: string, value: string) => void;
}

function UtensilDialog({
  open,
  editMode,
  formData,
  onClose,
  onSubmit,
  onChange,
}: UtensilDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editMode ? "Edit" : "Add"} Utensil</DialogTitle>
      <DialogContent>
        <TextField
          size="small"
          label="Utensil Name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#999", borderColor: "#999" }}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="outlined" color="primary">
          {editMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UtensilDialog;
