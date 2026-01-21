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
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Minus } from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";
import IOSSwitch from "../ui/ios-switch";

interface DailyMedicationsScheduleProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function DailyMedicationsSchedule({
  open,
  onClose,
  data,
}: DailyMedicationsScheduleProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  type FormValues = any;

  const defaultMedication: any = useMemo(
    () => ({
      nameOfDrug: "",
      dose: "",
      date: today,
      timeM: "false",
      timeA: "false",
      timeE: "false",
      adr: "",
      doctorAdvice: "",
      nurseSignatureM: "",
      nurseSignatureA: "",
      nurseSignatureE: "",
    }),
    [today]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      allergies: "",
      consultant: "",
      doa: today,
      medications: [defaultMedication],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  // Fetch existing data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !data.therapy) return;

      setLoading(true);
      try {
        const response = await ApiManager.getDailyMedicationsByTherapyId(
          data.therapy
        );
        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch daily medications data:", error);
        setExistingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, data.therapy]);

  // Reset form when existing data is loaded
  useEffect(() => {
    if (existingData) {
      // Convert ISO date to YYYY-MM-DD format
      const formatDate = (dateString: string) => {
        if (!dateString) return today;
        try {
          return new Date(dateString).toISOString().slice(0, 10);
        } catch {
          return today;
        }
      };

      reset({
        allergies: existingData.allergies || "",
        consultant: existingData.consultant || "",
        doa: formatDate(existingData.doa),
        medications: existingData.medications?.map((med: any) => ({
          ...med,
          date: formatDate(med.date),
        })) || [defaultMedication],
      });
    }
  }, [existingData, reset, today, defaultMedication]);

  const onSubmit = async (formData: FormValues) => {
    console.log("Form submitted with data:", formData);
    console.log("existingData:", existingData);
    console.log("data.therapy:", data.therapy);
    console.log("data.patient:", data.patient);

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

      console.log("Payload to send:", payload);

      if (existingData) {
        // Update existing record
        console.log("Updating existing record with ID:", existingData._id);
        await ApiManager.updateDailyMedication(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Daily Medications Schedule updated successfully",
        });
      } else {
        // Create new record
        console.log("Creating new record");
        await ApiManager.createDailyMedication(payload);
        setAlert({
          severity: "success",
          message: "Daily Medications Schedule created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      console.error("Error during submission:", error);
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Daily Medications Schedule",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Daily Medications Schedule</DialogTitle>
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
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600 }}
                ></Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="Allergies"
                      fullWidth
                      {...register("allergies")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="Consultant"
                      fullWidth
                      {...register("consultant")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      size="small"
                      label="DOA"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      {...register("doa")}
                    />
                  </Grid>
                </Grid>

                {/* Medications Schedule Table */}
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600 }}
                ></Typography>

                <TableContainer component={Paper}>
                  <Table
                    size="small"
                    sx={{
                      "& .MuiTableCell-root": { padding: "4px 8px" },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 120,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          NAME OF DRUG
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
                            minWidth: 250,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          TIME
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 100,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          ADR
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 120,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          DOCTOR ADVICE
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            minWidth: 250,
                            height: 40,
                            padding: "4px 8px",
                          }}
                        >
                          NURSE SIGNATURE
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
                                `medications.${index}.nameOfDrug` as any
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
                              {...register(`medications.${index}.dose` as any)}
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
                              {...register(`medications.${index}.date` as any)}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: "auto",
                              minWidth: 250,
                              padding: "4px 8px",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                justifyContent: "space-around",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="caption" sx={{ mb: 0.5 }}>
                                  M
                                </Typography>
                                <Controller
                                  name={`medications.${index}.timeM` as any}
                                  control={control}
                                  render={({ field }) => (
                                    <IOSSwitch
                                      checked={field.value === "true" || field.value === true}
                                      onChange={(e) => field.onChange(e.target.checked ? "true" : "false")}
                                    />
                                  )}
                                />
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="caption" sx={{ mb: 0.5 }}>
                                  A
                                </Typography>
                                <Controller
                                  name={`medications.${index}.timeA` as any}
                                  control={control}
                                  render={({ field }) => (
                                    <IOSSwitch
                                      checked={field.value === "true" || field.value === true}
                                      onChange={(e) => field.onChange(e.target.checked ? "true" : "false")}
                                    />
                                  )}
                                />
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="caption" sx={{ mb: 0.5 }}>
                                  E
                                </Typography>
                                <Controller
                                  name={`medications.${index}.timeE` as any}
                                  control={control}
                                  render={({ field }) => (
                                    <IOSSwitch
                                      checked={field.value === "true" || field.value === true}
                                      onChange={(e) => field.onChange(e.target.checked ? "true" : "false")}
                                    />
                                  )}
                                />
                              </Box>
                            </Box>
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
                              {...register(`medications.${index}.adr` as any)}
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
                                `medications.${index}.doctorAdvice` as any
                              )}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              height: "auto",
                              minWidth: 250,
                              padding: "4px 8px",
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1 }}>
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
                                placeholder="M"
                                {...register(
                                  `medications.${index}.nurseSignatureM` as any
                                )}
                              />
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
                                placeholder="A"
                                {...register(
                                  `medications.${index}.nurseSignatureA` as any
                                )}
                              />
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
                                placeholder="E"
                                {...register(
                                  `medications.${index}.nurseSignatureE` as any
                                )}
                              />
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              height: 60,
                              width: 100,
                              padding: "4px 8px",
                            }}
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
                                onClick={() => append(defaultMedication)}
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

                {errors.medications && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {errors.medications.message as string}
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

export default DailyMedicationsSchedule;
