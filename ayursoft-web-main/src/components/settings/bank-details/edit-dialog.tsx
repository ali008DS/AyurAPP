import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { useState, useEffect } from "react";
import ApiManager from "../../services/apimanager";
import { useAppContext } from "../../../context/app-context";

interface CreateBankDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  initialData?: any;
}

export default function CreateTestDialog({
  open,
  onClose,
  onSuccess,
  initialData,
}: CreateBankDialogProps) {
  const { setAlert } = useAppContext();
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branch, setBranch] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name ?? "");
      setAccountNumber(
        initialData.accountNumber ?? initialData.bankAccount ?? ""
      );
      setIfscCode(initialData.ifscCode ?? "");
      setBranch(initialData.branch ?? initialData.branchName ?? "");
      setAddress(initialData.address ?? "");
    } else if (open && !initialData) {
      setName("");
      setAccountNumber("");
      setIfscCode("");
      setBranch("");
      setAddress("");
    }
  }, [open, initialData]);

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
      let response: any;
      if (initialData && initialData._id) {
        response = await ApiManager.updateBankDetail(initialData._id, payload);
        setAlert({
          severity: "success",
          message: "Bank detail updated successfully",
        });
      } else {
        response = await ApiManager.addBankDetail(payload);
        setAlert({
          severity: "success",
          message: "Bank detail created successfully",
        });
      }

      const created = response?.data?.data ?? response?.data ?? response;
      onSuccess(created);

      if (!initialData) {
        setName("");
        setAccountNumber("");
        setIfscCode("");
        setBranch("");
        setAddress("");
      }
    } catch (e: any) {
      console.error("CreateBankDialog submit error:", e);
      setAlert({
        severity: "error",
        message: e?.message || "Failed to save bank detail",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData && initialData._id
          ? "Edit Bank Detail"
          : "Add Bank Detail"}
      </DialogTitle>
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
          {loading
            ? initialData && initialData._id
              ? "Updating..."
              : "Creating..."
            : initialData && initialData._id
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
