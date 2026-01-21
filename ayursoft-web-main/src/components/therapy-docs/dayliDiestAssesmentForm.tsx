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

interface DailyDietAssessmentFormProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function DailyDietAssessmentForm({
  open,
  onClose,
  data,
}: DailyDietAssessmentFormProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Zod schema for a single patient assessment
  const patientAssessmentSchema = z.object({
    name: z
      .string({ required_error: "Required" })
      .trim()
      .min(1, "Name is required"),
    date: z.string().optional().default(today),
    doa: z.string().optional().default(today),
    opd: z.string().optional().default(""),
    ipd: z.string().optional().default(""),
    uhidNo: z
      .string({ required_error: "Required" })
      .trim()
      .min(1, "UHID No is required"),
    wodOs: z.string().optional().default(""),
    age: z.string().optional().default(""),
    sex: z.string().optional().default(""),
    consultantName: z.string().optional().default(""),
    provisionalDiagnosis: z.string().optional().default(""),
    confirmDiagnosis: z.string().optional().default(""),
    // Diet table data
    earlyMorning: z.object({
      advisedDiet: z.string().optional().default(""),
      upparavaDietChanges: z.string().optional().default(""),
      signOfDietitian: z.string().optional().default(""),
      consultant: z.string().optional().default(""),
      kitchen: z.string().optional().default(""),
    }),
    breakfast: z.object({
      advisedDiet: z.string().optional().default(""),
      upparavaDietChanges: z.string().optional().default(""),
      signOfDietitian: z.string().optional().default(""),
      consultant: z.string().optional().default(""),
      kitchen: z.string().optional().default(""),
    }),
    lunch: z.object({
      advisedDiet: z.string().optional().default(""),
      upparavaDietChanges: z.string().optional().default(""),
      signOfDietitian: z.string().optional().default(""),
      consultant: z.string().optional().default(""),
      kitchen: z.string().optional().default(""),
    }),
    afternoon: z.object({
      advisedDiet: z.string().optional().default(""),
      upparavaDietChanges: z.string().optional().default(""),
      signOfDietitian: z.string().optional().default(""),
      consultant: z.string().optional().default(""),
      kitchen: z.string().optional().default(""),
    }),
    dinner: z.object({
      advisedDiet: z.string().optional().default(""),
      upparavaDietChanges: z.string().optional().default(""),
      signOfDietitian: z.string().optional().default(""),
      consultant: z.string().optional().default(""),
      kitchen: z.string().optional().default(""),
    }),
    night: z.object({
      advisedDiet: z.string().optional().default(""),
      upparavaDietChanges: z.string().optional().default(""),
      signOfDietitian: z.string().optional().default(""),
      consultant: z.string().optional().default(""),
      kitchen: z.string().optional().default(""),
    }),
  });

  const schema = z.object({
    assessments: z
      .array(patientAssessmentSchema)
      .min(1, "At least one assessment required"),
  });

  type FormValues = z.infer<typeof schema>;

  const defaultAssessment: z.infer<typeof patientAssessmentSchema> = useMemo(
    () => ({
      name: "",
      date: today,
      doa: today,
      opd: "",
      ipd: "",
      uhidNo: "",
      wodOs: "",
      age: "",
      sex: "",
      consultantName: "",
      provisionalDiagnosis: "",
      confirmDiagnosis: "",
      earlyMorning: {
        advisedDiet: "",
        upparavaDietChanges: "",
        signOfDietitian: "",
        consultant: "",
        kitchen: "",
      },
      breakfast: {
        advisedDiet: "",
        upparavaDietChanges: "",
        signOfDietitian: "",
        consultant: "",
        kitchen: "",
      },
      lunch: {
        advisedDiet: "",
        upparavaDietChanges: "",
        signOfDietitian: "",
        consultant: "",
        kitchen: "",
      },
      afternoon: {
        advisedDiet: "",
        upparavaDietChanges: "",
        signOfDietitian: "",
        consultant: "",
        kitchen: "",
      },
      dinner: {
        advisedDiet: "",
        upparavaDietChanges: "",
        signOfDietitian: "",
        consultant: "",
        kitchen: "",
      },
      night: {
        advisedDiet: "",
        upparavaDietChanges: "",
        signOfDietitian: "",
        consultant: "",
        kitchen: "",
      },
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
    resolver: zodResolver(schema),
    defaultValues: {
      assessments: [defaultAssessment],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assessments",
  });

  // Fetch existing data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !data.therapy) return;

      setLoading(true);
      try {
        const response = await ApiManager.getDailyDietAssessmentsByTherapyId(
          data.therapy
        );

        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch daily diet assessment data:", error);
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
      reset({ assessments: existingData.assessments });
    }
  }, [existingData, reset]);

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
        await ApiManager.updateDailyDietAssessment(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Daily Diet Assessment updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createDailyDietAssessment(payload);
        setAlert({
          severity: "success",
          message: "Daily Diet Assessment created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Daily Diet Assessment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  const dietRows = [
    { key: "earlyMorning", label: "Early Morning" },
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "afternoon", label: "Afternoon" },
    { key: "dinner", label: "Dinner" },
    { key: "night", label: "Night" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Daily Diet Assessment Form</DialogTitle>
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
                {fields.map((field, assessmentIndex) => (
                  <Box
                    key={field.id}
                    sx={{
                      mb: 4,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      backgroundColor: "rgba(176,212,255,0.05)",
                    }}
                  >
                    {/* Assessment Header with Controls */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Patient Assessment #{assessmentIndex + 1}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          sx={{
                            background: "#fff",
                            border: "1px solid #bebebe",
                          }}
                          size="small"
                          onClick={() => append(defaultAssessment)}
                        >
                          <Plus size={18} />
                        </IconButton>
                        <IconButton
                          sx={{
                            background: "#fff",
                            border: "1px solid #bebebe",
                          }}
                          size="small"
                          onClick={() => remove(assessmentIndex)}
                          disabled={fields.length === 1}
                        >
                          <Minus size={18} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Patient Information Section */}
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      Patient Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Name"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.name` as any
                          )}
                          error={!!errors.assessments?.[assessmentIndex]?.name}
                          helperText={
                            errors.assessments?.[assessmentIndex]?.name?.message
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.date` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="DOA"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.doa` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="OPD"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.opd` as any
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="IPD"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.ipd` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="UHID No"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.uhidNo` as any
                          )}
                          error={
                            !!errors.assessments?.[assessmentIndex]?.uhidNo
                          }
                          helperText={
                            errors.assessments?.[assessmentIndex]?.uhidNo
                              ?.message
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="W/O/D/O/S"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.wodOs` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Age"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.age` as any
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Sex"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.sex` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Consultant Name"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.consultantName` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Provisional Diagnosis"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.provisionalDiagnosis` as any
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          size="small"
                          label="Confirm Diagnosis"
                          fullWidth
                          {...register(
                            `assessments.${assessmentIndex}.confirmDiagnosis` as any
                          )}
                        />
                      </Grid>
                    </Grid>

                    {/* Diet Assessment Table */}
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      Diet Assessment
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table
                        stickyHeader
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
                              Time
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                minWidth: 120,
                                height: 40,
                                padding: "4px 8px",
                              }}
                            >
                              Advised Diet
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                minWidth: 120,
                                height: 40,
                                padding: "4px 8px",
                              }}
                            >
                              Upparava Diet Changes
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                minWidth: 100,
                                height: 40,
                                padding: "4px 8px",
                              }}
                            >
                              Sign of Dietitian
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                minWidth: 100,
                                height: 40,
                                padding: "4px 8px",
                              }}
                            >
                              Consultant
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                minWidth: 100,
                                height: 40,
                                padding: "4px 8px",
                              }}
                            >
                              Kitchen
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dietRows.map((row) => (
                            <TableRow key={row.key}>
                              <TableCell
                                sx={{
                                  fontWeight: "medium",
                                  height: 60,
                                  minWidth: 100,
                                  padding: "4px 8px",
                                }}
                              >
                                {row.label}
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
                                    `assessments.${assessmentIndex}.${row.key}.advisedDiet` as any
                                  )}
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
                                    `assessments.${assessmentIndex}.${row.key}.upparavaDietChanges` as any
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
                                    `assessments.${assessmentIndex}.${row.key}.signOfDietitian` as any
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
                                    `assessments.${assessmentIndex}.${row.key}.consultant` as any
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
                                    `assessments.${assessmentIndex}.${row.key}.kitchen` as any
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}

                {errors.assessments && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {errors.assessments.message as string}
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

export default DailyDietAssessmentForm;
