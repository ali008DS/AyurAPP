import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  InputAdornment,
  FormControl,
  Autocomplete,
  Box,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useCallback } from "react";
import ApiManager from "../services/apimanager";
import IOSSwitch from "../ui/ios-switch";
import { useAppContext } from "../../context/app-context";

interface CreatePrescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  patient: any;
  onPrescriptionCreated?: () => void;
}

interface Department {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  userRole?: {
    department: Department[];
  };
}

interface Vitals {
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  height: string;
  weight: string;
  bmi: string;
  spo2: string;
  rbs: string;
  abdGrith: string;
  cvs: string;
  cns: string;
}

interface FormData {
  opdId: string;
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  height: string;
  weight: string;
  bmi: string;
  spo2: string;
  rbs: string;
  abdGrith: string;
  cvs: string;
  cns: string;
  paymentStatus: boolean;
  prescriptionType: boolean;
  doctor: Doctor | null;
  department: Department | null;
}

export default function CreatePrescriptionDialog({
  open,
  onClose,
  patient,
  onPrescriptionCreated,
}: CreatePrescriptionDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      bpSystolic: "",
      bpDiastolic: "",
      pulse: "",
      height: "",
      weight: "",
      bmi: "",
      spo2: "",
      rbs: "",
      abdGrith: "",
      cvs: "Normal",
      cns: "Normal",
      opdId: "",
      paymentStatus: false,
      prescriptionType: false,
      doctor: null,
      department: null,
    },
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const { setAlert } = useAppContext();

  const prescriptionType = watch("prescriptionType");
  const height = watch("height");
  const weight = watch("weight");
  const department = watch("department");
  const selectedDoctor = watch("doctor");

  useEffect(() => {
    const parsedHeight = parseFloat(height || "0");
    const parsedWeight = parseFloat(weight || "0");
    const heightInMeters = parsedHeight / 100;

    if (heightInMeters > 0 && parsedWeight > 0) {
      const bmi = (parsedWeight / (heightInMeters * heightInMeters)).toFixed(2);
      setValue("bmi", bmi);
    } else {
      setValue("bmi", "");
    }
  }, [height, weight, setValue]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRes = await ApiManager.getDoctors();
        setDoctors(doctorsRes.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setAlert({
          severity: "error",
          message: "Error fetching doctors",
        });
      }
    };

    if (open) {
      fetchDoctors();
    }
  }, [open, setAlert]);

  useEffect(() => {
    if (open && patient?.opdId) {
      setValue("opdId", patient.opdId);
    }
  }, [open, patient?.opdId, setValue]);

  useEffect(() => {
    if (selectedDoctor?.userRole?.department) {
      setDepartments(selectedDoctor.userRole.department);
      setValue("department", null);
    } else {
      setDepartments([]);
      setValue("department", null);
    }
  }, [selectedDoctor, setValue]);

  useEffect(() => {
    if (!department) {
      setDisabled(true);
      setValue("bpSystolic", "");
      setValue("bpDiastolic", "");
      setValue("pulse", "");
      setValue("height", "");
      setValue("weight", "");
      setValue("bmi", "");
      setValue("spo2", "");
      setValue("rbs", "");
      setValue("abdGrith", "");
      setValue("cvs", "Normal");
      setValue("cns", "Normal");
      setValue("opdId", "");
      return;
    }

    const fetchPreviousPrescription = async () => {
      try {
        setDisabled(true);
        let vitals: Vitals;
        const departmentName = department.name.toLowerCase();

        if (departmentName === "spine") {
          const response = await ApiManager.getPreviousSpinePrescription(
            patient.id
          );
          vitals = response.data.vitals;
          console.log("spine VITALS:", vitals);
        } else if (departmentName === "piles") {
          const response = await ApiManager.getPreviousPilesPrescription(
            patient.id
          );
          vitals = response.data.vitals;
          console.log("piles VITALS:", vitals);
        } else if (departmentName === "general") {
          const response = await ApiManager.getPreviousGeneralPrescription(
            patient.id
          );
          vitals = response.data.vitals;
          console.log("general VITALS:", vitals);
        } else {
          setDisabled(false);
          return;
        }

        if (vitals) {
          Object.entries(vitals).forEach(([key, value]) => {
            if (value) {
              setValue(key as keyof FormData, value);
            }
          });
        }

        setDisabled(false);
      } catch (error) {
        console.error("Error fetching previous prescription:", error);
        setDisabled(false);
      }
    };

    fetchPreviousPrescription();
  }, [department, patient.id, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!data.department) {
      setAlert({
        severity: "error",
        message: "Please select a department",
      });
      return;
    }

    setLoading(true);

    const payload = {
      patient: patient.id,
      vitals: {
        bpSystolic: data.bpSystolic,
        bpDiastolic: data.bpDiastolic,
        pulse: data.pulse,
        height: data.height,
        weight: data.weight,
        bmi: data.bmi,
        spo2: data.spo2,
        rbs: data.rbs,
        abdGrith: data.abdGrith,
        cvs: data.cvs,
        cns: data.cns,
      },
      department: data.department._id,
      user: data.doctor?._id,
      paymentStatus: data.paymentStatus ? "paid" : "unpaid",
      prescriptionType: data.prescriptionType ? "online" : "offline",
      opdId: data.opdId,
    };

    try {
      const updatePatient = await ApiManager.updatePatient(patient.id, {
        firstName: patient.firstName,
      });

      if (!updatePatient.status) {
        setAlert({
          severity: "error",
          message: "Error updating patient status",
        });
        return;
      }

      const departmentName = data.department.name.toLowerCase();
      let createPrescription;

      if (departmentName === "spine") {
        createPrescription = await ApiManager.createPrescription(payload);
      } else if (departmentName === "piles") {
        createPrescription = await ApiManager.createPilesPrescription(payload);
      } else {
        createPrescription = await ApiManager.createGeneralPrescription(
          payload
        );
      }

      console.log("createPrescription", createPrescription);

      setAlert({
        severity: "success",
        message: "Prescription created successfully",
      });

      reset();
      onClose();
      onPrescriptionCreated?.();
    } catch (error) {
      console.error("Error creating prescription:", error);
      setAlert({
        severity: "error",
        message: "Error creating prescription",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Create Prescription
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <Controller
                  name="doctor"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      size="small"
                      {...field}
                      options={doctors}
                      getOptionLabel={(option) =>
                        `${option.firstName} ${option.lastName}`
                      }
                      value={field.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Doctor"
                          error={!!errors.doctor}
                          helperText={errors.doctor?.message}
                        />
                      )}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      size="small"
                      {...field}
                      options={departments}
                      getOptionLabel={(option) => option.name}
                      value={field.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      disabled={!selectedDoctor || departments.length === 0}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Department"
                          error={!!errors.department}
                          helperText={errors.department?.message}
                          required
                        />
                      )}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Vital Signs */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="bpSystolic"
                control={control}
                rules={{
                  required: !prescriptionType
                    ? "BP Systolic is required"
                    : false,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="BP Systolic"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mmHg</InputAdornment>
                      ),
                    }}
                    fullWidth
                    error={!!errors.bpSystolic}
                    helperText={errors.bpSystolic?.message}
                    required={!prescriptionType}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="bpDiastolic"
                control={control}
                rules={{
                  required: !prescriptionType
                    ? "BP Diastolic is required"
                    : false,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="BP Diastolic"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mmHg</InputAdornment>
                      ),
                    }}
                    fullWidth
                    error={!!errors.bpDiastolic}
                    helperText={errors.bpDiastolic?.message}
                    required={!prescriptionType}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="pulse"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="Pulse"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">bpm</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="Height"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="Weight"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">kg</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="bmi"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="BMI"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">kg/m²</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="spo2"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="SPO2"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="rbs"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="RBS"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mg/dL</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="abdGrith"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="Abdominal Girth"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="cvs"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="CVS"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="cns"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={disabled}
                    size="small"
                    label="CNS"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="opdId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled
                    size="small"
                    label="OPD ID"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Toggle Switches */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mr: 1,
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  OFFLINE
                </Typography>
                <Controller
                  name="prescriptionType"
                  control={control}
                  render={({ field }) => (
                    <IOSSwitch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  ONLINE
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mr: 1,
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  UNPAID
                </Typography>
                <Controller
                  name="paymentStatus"
                  control={control}
                  render={({ field }) => (
                    <IOSSwitch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  PAID
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button
              variant="text"
              sx={{ color: "text.secondary" }}
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading || disabled}
            >
              {loading ? <CircularProgress size={24} /> : "Create Prescription"}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
