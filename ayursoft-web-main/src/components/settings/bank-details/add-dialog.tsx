import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { useState } from "react";
import ApiManager from "../../services/apimanager";
import { useAppContext } from "../../../context/app-context";

interface CreateBankDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function CreateTestDialog({
  open,
  onClose,
  onSuccess,
}: CreateBankDialogProps) {
  const { setAlert } = useAppContext();
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branch, setBranch] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = () => {
    return name.trim() !== "" && accountNumber.trim() !== "";
  };

  const handleSubmit = async () => {
    if (!isValid()) return;
    const payload = {
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim(),
      branch: branch.trim(),
      address: address.trim(),
    };

    try {
      setLoading(true);
      const response = await ApiManager.addBankDetail(payload);
      const created = response?.data?.data ?? response?.data ?? response;
      setAlert({
        severity: "success",
        message: "Bank detail created successfully",
      });
      onSuccess(created);
      // clear local state
      setName("");
      setAccountNumber("");
      setIfscCode("");
      setBranch("");
      setAddress("");
    } catch (e: any) {
      console.error("CreateBankDialog submit error:", e);
      setAlert({
        severity: "error",
        message: e?.message || "Failed to create bank detail",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Bank Detail</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              size="small"
              autoFocus
              margin="dense"
              label="Account Holder Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              margin="dense"
              label="Account Number"
              fullWidth
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              margin="dense"
              label="IFSC Code"
              fullWidth
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              margin="dense"
              label="Branch"
              fullWidth
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              margin="dense"
              label="Address"
              fullWidth
              multiline
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !isValid()}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
