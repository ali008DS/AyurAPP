import {
  Box,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  MenuItem,
  Typography,
  InputLabel,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "../utils/validationSchemas";
import ApiManager from "./services/apimanager";
import { useAppContext } from "../context/app-context";

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onPatientAdded?: () => void;
}

export interface Patient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age?: string;
  address: string;
  dob: string;
  city: string;
  state: string;
  status: string;
  uhId: string;
  ipdId: string;
  opdId: string;
}

const initialValues: Patient = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: "",
  address: "",
  dob: "",
  city: "",
  state: "",
  status: "enquiry",
  uhId: "",
  ipdId: "",
  opdId: "",
};

const AddPatientDialog = ({
  open,
  onClose,
  onPatientAdded,
}: AddPatientDialogProps) => {
  const [loading, setLoading] = useState(false);

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };

  const calculateDOB = (age: string) => {
    if (!age || isNaN(Number(age))) return "";
    const today = new Date();
    const birthYear = today.getFullYear() - Number(age);
    return new Date(birthYear, today.getMonth(), today.getDate())
      .toISOString()
      .split("T")[0];
  };
  const { setAlert } = useAppContext();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Patient>({
    defaultValues: initialValues,
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (values: Patient) => {
    setLoading(true);
    try {
      console.log("Patient data being sent:", values);
      await ApiManager.createPatient(values);
      setAlert({ severity: "success", message: "Patient added successfully" });
      onClose();

      onPatientAdded?.();
    } catch (error) {
      console.error("Failed to create patient:", error);
      setAlert({ severity: "error", message: "Failed to add patient" });
    } finally {
      reset();
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Nunito, sans-serif",
          fontWeight: 600,
        }}
      >
        Add Patient
        <IconButton
          aria-label="close"
          onClick={() => {
            onClose();
            reset();
          }}
          size="small"
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      First Name :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Last Name :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors?.lastName}
                      helperText={errors?.lastName?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Phone :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      type="tel"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Age :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      type="number"
                      onChange={(e) => {
                        field.onChange(e);
                        const newDob = calculateDOB(e.target.value);
                        if (newDob) {
                          const currentDob = getValues("dob");
                          if (!currentDob || currentDob !== newDob) {
                            setValue("dob", newDob);
                          }
                        }
                      }}
                      error={!!errors.age}
                      helperText={errors.age?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Date of Birth :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      error={!!errors.dob}
                      helperText={errors.dob?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        const newAge = calculateAge(e.target.value);
                        if (newAge) {
                          const currentAge = getValues("age");
                          if (!currentAge || currentAge !== newAge) {
                            setValue("age", newAge);
                          }
                        }
                      }}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="uhId"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      UH ID :
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.uhId}
                      helperText={errors.uhId?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="ipdId"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      IPD ID :
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.ipdId}
                      helperText={errors.ipdId?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="opdId"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      OPD ID :
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.opdId}
                      helperText={errors.opdId?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      City :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Address :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Email :
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      State :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink sx={{ fontSize: 18 }}>
                      Status :{" "}
                    </InputLabel>
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.status}
                    >
                      <MenuItem value="enquiry">Enquiry</MenuItem>
                      <MenuItem value="patient">Patient</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </TextField>
                  </>
                )}
              />
              {errors.status && (
                <Typography
                  variant="caption"
                  sx={{ marginLeft: 1, color: "#FE535A" }}
                >
                  {errors.status.message}
                </Typography>
              )}
            </Grid>
          </Grid>
          <DialogActions sx={{ px: 2, pt: 2, pb: 0 }}>
            <Button
              onClick={onClose}
              size="medium"
              sx={{ color: (theme) => theme.palette.grey[600] }}
              variant="text"
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AddCircleOutlineIcon />
                )
              }
              variant="text"
            >
              Add
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;
