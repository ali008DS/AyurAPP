import { useState, useEffect } from "react";
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

interface Center {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string[];
  email: string;
}

interface EditCenterDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  center: Center | null;
}

function EditCenterDialog({
  open,
  onClose,
  onSuccess,
  center,
}: EditCenterDialogProps) {
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: "",
      contactName: "",
      contactPhone: "",
      email: "",
    },
  });

  const { setAlert } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!center) return;

    setValue("name", center.name || "");
    setValue("contactName", center.contactName || "");
    setValue("contactPhone", center.contactPhone.join(", ") || "");
    setValue("email", center.email || "");
  }, [center, setValue]);

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
    };
    console.log("Edit Diagnostic Center data:", formData);
    try {
      await ApiManager.updateDiagnosticCenter(center!.id, formData);
      setAlert({
        severity: "success",
        message: "Diagnostic center updated successfully!",
      });
      onClose();
      reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to update diagnostic center", error);
      setAlert({
        severity: "error",
        message: "Failed to update diagnostic center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Diagnostic Center</DialogTitle>
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditCenterDialog;
