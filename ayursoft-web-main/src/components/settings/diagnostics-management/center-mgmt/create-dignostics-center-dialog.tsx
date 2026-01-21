import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ApiManager from "../../../services/apimanager";
import { useAppContext } from "../../../../context/app-context";

interface CreateCenterDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateCenterDialog({
  open,
  onClose,
  onSuccess,
}: CreateCenterDialogProps) {
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      contactName: "",
      contactPhone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { setAlert } = useAppContext();
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const contactPhoneArray = data.contactPhone
      .split(",")
      .map((phone: string) => phone.trim());
    const formData = {
      name: data.name,
      contactName: data.contactName,
      contactPhone: contactPhoneArray,
      email: data.email,
      password: data.password,
    };
    console.log("Create Diagnostic Center data:", formData);
    try {
      const response = await ApiManager.createDiagnosticCenter(formData);
      console.log("Response:", response);
      setAlert({
        severity: "success",
        message: "Diagnostic center created successfully!",
      });
      onClose();
      reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to create diagnostic center", error);
      setAlert({
        severity: "error",
        message: "Failed to create diagnostic center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Diagnostic Center</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} size="small" label="Name" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="contactName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Contact Name"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Contact Phones (comma separated)"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} size="small" label="Email" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Password"
                  type="password"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  error={password !== confirmPassword}
                  helperText={
                    password !== confirmPassword ? "Passwords do not match" : ""
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            onClose();
          }}
          sx={{ mr: 1, color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : null}
          disabled={loading}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateCenterDialog;
