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
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface EditTodaysOpdProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  centerId: string | null;
}

function EditTodaysOpd({
  open,
  onClose,
  onSuccess,
  centerId,
}: EditTodaysOpdProps) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      department: "",
      doctor: "",
      time: "",
    },
  });

  const { setAlert } = useAppContext();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = {
      name: data.name,
      department: data.department,
      doctor: data.doctor,
      time: data.time,
    };
    console.log("Edit Todays OPD:", formData);
    try {
      await ApiManager.updateDiagnosticCenter(centerId!, formData);
      setAlert({
        severity: "success",
        message: "Today's OPD updated successfully!",
      });
      onClose();
      reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to update", error);
      setAlert({
        severity: "error",
        message: "Failed to update ",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Todays OPD</DialogTitle>
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
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Department"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="doctor"
              control={control}
              render={({ field }) => (
                <TextField {...field} size="small" label="Doctor" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TextField {...field} size="small" label="Time" fullWidth />
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

export default EditTodaysOpd;
