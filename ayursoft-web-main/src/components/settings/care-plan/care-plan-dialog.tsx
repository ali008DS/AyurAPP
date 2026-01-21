import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import ApiManager from "../../services/apimanager";
import { useAppContext } from "../../../context/app-context";

export enum CarePlanGroupType {
  BENEFIT = 'benefit',
  RISK = 'risk',
  ALTERNATIVE = 'alternative',
  OUTCOME = 'outcome',
  PATHYA = 'pathya',
  APATHYA = 'apathya',
  PREVENTIVE = 'preventive',
  CURATIVE = 'curative',
  REHABILITATIVE = 'rehabilitative',
  INTERNAL_NOTE = 'internalNote',
}

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
  const [groupType, setGroupType] = useState<CarePlanGroupType>(CarePlanGroupType.BENEFIT);
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAppContext();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await ApiManager.createCarePlanGroup({
        name,
        type: groupType,
      });
      setAlert({
        severity: "success",
        message: "Group created successfully",
      });
      onSuccess();
      onClose();
      setName("");
      setGroupType(CarePlanGroupType.BENEFIT);
    } catch (error) {
      console.error("Error creating group:", error);
      setAlert({
        severity: "error",
        message: "Failed to create group. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Test</DialogTitle>
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
          select
          label="Group Type"
          value={groupType}
          onChange={(e) => setGroupType(e.target.value as CarePlanGroupType)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {Object.entries(CarePlanGroupType).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1).replace("_", " ")}
            </MenuItem>
          ))}
        </TextField>
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
