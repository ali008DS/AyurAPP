import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface AddMedicineDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const AddMedicineDialog: React.FC<AddMedicineDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [name, setName] = React.useState("");

  const handleSave = () => {
    onSave(name);
    setName("");
    onClose();
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Add Medicine Unit</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Medicine Unit Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMedicineDialog;
