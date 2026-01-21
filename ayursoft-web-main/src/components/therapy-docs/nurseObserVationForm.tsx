import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus } from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface NurseObservationFormProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function NurseObservationForm({
  open,
  onClose,
  data,
}: NurseObservationFormProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  // Zod schema for the form
  const treatmentSchema = z.object({
    date: z.string().optional().default(today),
    treatmentMedicine: z.string().optional().default(""),
    dose: z.string().optional().default(""),
    time: z.string().optional().default(nowTime),
    instructions: z.string().optional().default(""),
    doctorName: z.string().optional().default(""),
    nurseSign: z.string().optional().default(""),
  });

  const schema = z.object({
    patientName: z
      .string({ required_error: "Required" })
      .trim()
      .min(1, "Patient name is required"),
    diagnosis: z.string().optional().default(""),
    uhidNo: z
      .string({ required_error: "Required" })
      .trim()
      .min(1, "UHID No is required"),
    opdNo: z.string().optional().default(""),
    ipdNo: z.string().optional().default(""),
    roomBedNo: z.string().optional().default(""),
    treatments: z
      .array(treatmentSchema)
      .min(1, "At least one treatment required"),
  });

  type FormValues = z.infer<typeof schema>;

  const defaultTreatment: z.infer<typeof treatmentSchema> = useMemo(
    () => ({
      date: today,
      treatmentMedicine: "",
      dose: "",
      time: nowTime,
      instructions: "",
      doctorName: "",
      nurseSign: "",
    }),
    [today, nowTime]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: "",
      diagnosis: "",
      uhidNo: "",
      opdNo: "",
      ipdNo: "",
      roomBedNo: "",
      treatments: [defaultTreatment],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatments",
  });

  // Fetch existing data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      setLoading(true);
      try {
        // Fetch patient data if patient ID is available
        if (data.patient) {
          try {
            const patientResponse = await ApiManager.getPatientById(data.patient);
            setPatientData(patientResponse);
          } catch (error) {
            console.error("Failed to fetch patient data:", error);
            setPatientData(null);
          }
        }

        // Fetch existing nurse observation data
        if (data.therapy) {
          const response = await ApiManager.getNurseObservationsByTherapyId(
            data.therapy
          );
          if (response && response.data && response.data.length > 0) {
            setExistingData(response.data[0]);
          } else {
            setExistingData(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch nurse observation data:", error);
        setExistingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, data.therapy, data.patient]);

  // Reset form when data is loaded
  useEffect(() => {
    if (existingData) {
      // If existing nurse observation data exists, use it
      reset({
        patientName: existingData.patientName || "",
        diagnosis: existingData.diagnosis || "",
        uhidNo: existingData.uhidNo || "",
        opdNo: existingData.opdNo || "",
        ipdNo: existingData.ipdNo || "",
        roomBedNo: existingData.roomBedNo || "",
        treatments: existingData.treatments || [defaultTreatment],
      });
    } else if (patientData) {
      // If no existing data but patient data is available, auto-fill from patient
      reset({
        patientName: patientData.name || patientData.patientName || "",
        diagnosis: "",
        uhidNo: patientData.uhid || patientData.uhidNo || "",
        opdNo: patientData.opdNo || "",
        ipdNo: patientData.ipdNo || "",
        roomBedNo: patientData.roomBedNo || "",
        treatments: [defaultTreatment],
      });
    }
  }, [existingData, patientData, reset, defaultTreatment]);

  const onSubmit = async (formData: FormValues) => {
    if (!data.therapy) {
      setAlert({
        severity: "error",
        message: "Therapy ID is required",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        therapy: data.therapy,
        patient: data.patient,
        ...formData,
      };

      if (existingData) {
        // Update existing record
        await ApiManager.updateNurseObservation(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Nurse Observation updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createNurseObservation(payload);
        setAlert({
          severity: "success",
          message: "Nurse Observation created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Nurse Observation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Nurse Observation Form</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ pt: 0, pb: 0.5 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ maxHeight: "calc(98vh - 200px)", overflowY: "auto" }}>
                {/* Patient Information Section */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Patient Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="Patient Name"
                      fullWidth
                      {...register("patientName")}
                      error={!!errors.patientName}
                      helperText={errors.patientName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="Diagnosis"
                      fullWidth
                      {...register("diagnosis")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="UHID NO"
                      fullWidth
                      {...register("uhidNo")}
                      error={!!errors.uhidNo}
                      helperText={errors.uhidNo?.message}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="OPD NO"
                      fullWidth
                      {...register("opdNo")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="IPD NO"
                      fullWidth
                      {...register("ipdNo")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="Room No/Bed No"
                      fullWidth
                      {...register("roomBedNo")}
                    />
                  </Grid>
                </Grid>

                {/* Treatment/Medication Table */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Treatment/Medication Administration
                </Typography>

                <TableContainer component={Paper}>
                  <Table
                    size="small"
                    sx={{ "& .MuiTableCell-root": { padding: "4px 8px" } }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 100,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          DATE
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 120,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          TREATMENT/MEDICINE
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 80,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          DOSE
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 80,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          TIME
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 150,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          INSTRUCTIONS
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 100,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          DOCTOR NAME
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 100,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          NURSE SIGN
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: 100,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 100,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(`treatments.${index}.date` as any)}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 120,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              minRows={1}
                              maxRows={2}
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "auto",
                                  minHeight: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(
                                `treatments.${index}.treatmentMedicine` as any
                              )}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 80,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(`treatments.${index}.dose` as any)}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 80,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              type="time"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(`treatments.${index}.time` as any)}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 150,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              minRows={1}
                              maxRows={2}
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "auto",
                                  minHeight: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(
                                `treatments.${index}.instructions` as any
                              )}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 100,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(
                                `treatments.${index}.doctorName` as any
                              )}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              minWidth: 100,
                              padding: "4px 8px",
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: 40,
                                  padding: "2px 4px",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "0.75rem",
                                },
                              }}
                              {...register(
                                `treatments.${index}.nurseSign` as any
                              )}
                            />
                          </TableCell>
                          <TableCell
                            sx={{ height: 60, width: 100, padding: "4px 8px" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                sx={{
                                  background: "#fff",
                                  border: "1px solid #bebebe",
                                }}
                                size="small"
                                onClick={() => append(defaultTreatment)}
                              >
                                <Plus size={16} />
                              </IconButton>
                              <IconButton
                                sx={{
                                  background: "#fff",
                                  border: "1px solid #bebebe",
                                }}
                                size="small"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                              >
                                <Minus size={16} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {errors.treatments && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {errors.treatments.message as string}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ border: "dashed 1px" }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button variant="outlined" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : existingData
              ? "Update"
              : "Submit"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default NurseObservationForm;
