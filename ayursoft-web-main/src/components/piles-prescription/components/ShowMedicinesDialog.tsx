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
import { Medicine } from "../context/PilesPrescriptionContext";
import ApiManager from "../../services/apimanager";

interface ShowMedicinesDialogProps {
  open: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onGroupAdded: () => Promise<void>;
}

export const ShowMedicinesDialog = ({
  open,
  onClose,
  medicines,
  onGroupAdded,
}: ShowMedicinesDialogProps) => {
  const { setAlert } = useAppContext();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddGroup = async () => {
    setLoading(true);
    try {
      await ApiManager.createRxGroup({ name: groupName, medicines });
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
    { field: "type", headerName: "Type", width: 150, flex: 1 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "dose", headerName: "Dose", width: 150 },
    { field: "whenHow", headerName: "When & How", width: 200 },
  ];

  const rows = medicines.map((medicine, index) => ({
    id: index,
    ...medicine,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Current Medicines</DialogTitle>
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

export default ShowMedicinesDialog;
