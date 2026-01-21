import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAppContext } from "../../../context/app-context";
import { Panchakarma } from "../context/PilesPrescriptionContext";
import ApiManager from "../../services/apimanager";

interface ShowPanchakarmasDialogProps {
  open: boolean;
  onClose: () => void;
  panchakarmas: Panchakarma[];
  onGroupAdded: () => Promise<void>;
}

export const ShowPanchakarmasDialog = ({
  open,
  onClose,
  panchakarmas,
  onGroupAdded,
}: ShowPanchakarmasDialogProps) => {
  const { setAlert } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddGroup = async () => {
    setLoading(true);
    try {
      await ApiManager.createPanchakarmaGroup({ name: groupName, panchakarmas });
      await onGroupAdded();
      setAlert({ severity: "success", message: "Group added successfully" });
      onClose();
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to add group" });
    } finally {
      setLoading(false);
    }
  };


  const columns: GridColDef[] = [
    { field: "therapy", headerName: "Therapy", width: 150, flex: 1 },
    { field: "oil", headerName: "Oil", width: 150 },
    { field: "quantity", headerName: "Quantity", width: 150 },
    { field: "duration", headerName: "Duration", width: 150 },
    { field: "days", headerName: "Days", width: 150 },
  ];

  const rows = panchakarmas.map((panchakarma, index) => ({
    id: index,
    ...panchakarma,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Current Therapies</DialogTitle>
      <DialogContent>
        <TextField
          label="Group Name"
          size="small"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} autoHeight />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{ mr: 1, color: "text.secondary" }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddGroup}
          color="primary"
          disabled={loading || !groupName.trim()}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Add Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowPanchakarmasDialog;
