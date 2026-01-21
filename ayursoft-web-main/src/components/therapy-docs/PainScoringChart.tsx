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
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus } from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface PainScoringChartProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function PainScoringChart({ open, onClose, data }: PainScoringChartProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  // Zod schema
  const beforeRowSchema = z.object({
    time: z.string().optional().default(nowTime),
    date: z.string().optional().default(today),
    checkedBy: z.string().optional().default(""),
    painScoring: z.string().optional().default(""),
  });

  const afterRowSchema = z.object({
    time: z.string().optional().default(nowTime),
    date: z.string().optional().default(today),
    checkedBy: z.string().optional().default(""),
    painScoring: z.string().optional().default(""),
  });

  const schema = z.object({
    uhidNo: z
      .string({ required_error: "Required" })
      .trim()
      .min(1, "UHID is required"),
    ipdNo: z.string().optional().default(""),
    opdNo: z.string().optional().default(""),
    name: z
      .string({ required_error: "Required" })
      .trim()
      .min(1, "Name is required"),
    age: z.string().optional().default(""),
    sex: z.string().optional().default(""),
    consultant: z.string().optional().default(""),
    dateOfAdmission: z.string().optional().default(today),
    beforeTreatment: z
      .array(beforeRowSchema)
      .min(1, "At least one row required"),
    afterTreatment: z.array(afterRowSchema).min(1, "At least one row required"),
  });

  type FormValues = z.infer<typeof schema>;

  const defaultBeforeRow: z.infer<typeof beforeRowSchema> = useMemo(
    () => ({
      time: nowTime,
      date: today,
      checkedBy: "",
      painScoring: "",
    }),
    [nowTime, today]
  );

  const defaultAfterRow: z.infer<typeof afterRowSchema> = useMemo(
    () => ({
      time: nowTime,
      date: today,
      checkedBy: "",
      painScoring: "",
    }),
    [nowTime, today]
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
      uhidNo: "",
      ipdNo: "",
      opdNo: "",
      name: "",
      age: "",
      sex: "",
      consultant: "",
      dateOfAdmission: today,
      beforeTreatment: [defaultBeforeRow],
      afterTreatment: [defaultAfterRow],
    },
    mode: "onBlur",
  });

  const {
    fields: beforeFields,
    append: appendBefore,
    remove: removeBefore,
  } = useFieldArray({ control, name: "beforeTreatment" });

  const {
    fields: afterFields,
    append: appendAfter,
    remove: removeAfter,
  } = useFieldArray({ control, name: "afterTreatment" });

  // Fetch existing data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !data.therapy) return;

      setLoading(true);
      try {
        const response = await ApiManager.getPainScoringsByTherapyId(
          data.therapy
        );
        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch pain scoring data:", error);
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
      reset({
        uhidNo: existingData.uhidNo || "",
        ipdNo: existingData.ipdNo || "",
        opdNo: existingData.opdNo || "",
        name: existingData.name || "",
        age: existingData.age || "",
        sex: existingData.sex || "",
        consultant: existingData.consultant || "",
        dateOfAdmission: existingData.dateOfAdmission || today,
        beforeTreatment: existingData.beforeTreatment || [defaultBeforeRow],
        afterTreatment: existingData.afterTreatment || [defaultAfterRow],
      });
    }
  }, [existingData, reset, today, defaultBeforeRow, defaultAfterRow]);

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
        await ApiManager.updatePainScoring(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Pain Scoring Chart updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createPainScoring(payload);
        setAlert({
          severity: "success",
          message: "Pain Scoring Chart created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Pain Scoring Chart",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Pain Scoring Chart :</DialogTitle>
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
              {/* Header Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="UHID No."
                    fullWidth
                    {...register("uhidNo")}
                    error={!!errors.uhidNo}
                    helperText={errors.uhidNo?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="IPD No."
                    fullWidth
                    {...register("ipdNo")}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="OPD No."
                    fullWidth
                    {...register("opdNo")}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Name"
                    fullWidth
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    size="small"
                    label="Age"
                    fullWidth
                    {...register("age")}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    size="small"
                    label="Sex"
                    fullWidth
                    {...register("sex")}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Consultant"
                    fullWidth
                    {...register("consultant")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Date of Admission"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    {...register("dateOfAdmission")}
                  />
                </Grid>
              </Grid>

              {/* Two column layout for Before and After */}
              <Grid container spacing={3}>
                {/* BEFORE TREATMENT */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: "rgba(135, 185, 255, 0.1)",
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Before Treatment
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {/* Table Header */}
                      <Grid container spacing={1} sx={{ mb: 0.5 }}>
                        <Grid item xs={1.5}>
                          <Typography variant="caption" fontWeight="bold">
                            S.NO.
                          </Typography>
                        </Grid>
                        <Grid item xs={2.5}>
                          <Typography variant="caption" fontWeight="bold">
                            TIME
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" fontWeight="bold">
                            DATE
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" fontWeight="bold">
                            CHECKED BY
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="caption" fontWeight="bold">
                            PAIN
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Rows */}
                      {beforeFields.map((field, index) => (
                        <Grid
                          container
                          spacing={1}
                          key={field.id}
                          alignItems="center"
                        >
                          <Grid item xs={1.5}>
                            <TextField
                              size="small"
                              value={index + 1}
                              InputProps={{ readOnly: true }}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2.5}>
                            <TextField
                              size="small"
                              type="time"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              {...register(
                                `beforeTreatment.${index}.time` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              size="small"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              {...register(
                                `beforeTreatment.${index}.date` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              size="small"
                              fullWidth
                              {...register(
                                `beforeTreatment.${index}.checkedBy` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={1.5}>
                            <TextField
                              size="small"
                              fullWidth
                              {...register(
                                `beforeTreatment.${index}.painScoring` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => removeBefore(index)}
                              disabled={beforeFields.length === 1}
                              sx={{
                                background: "#fff",
                                border: "1px solid #bebebe",
                              }}
                            >
                              <Minus size={16} />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                      onClick={() => appendBefore(defaultBeforeRow)}
                      fullWidth
                      sx={{ mt: 2, border: "dashed 1px" }}
                    >
                      Add Row
                    </Button>
                  </Box>
                </Grid>

                {/* AFTER TREATMENT */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: "rgba(135, 185, 255, 0.1)",
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      After Treatment
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {/* Table Header */}
                      <Grid container spacing={1} sx={{ mb: 0.5 }}>
                        <Grid item xs={1.5}>
                          <Typography variant="caption" fontWeight="bold">
                            S. NO.
                          </Typography>
                        </Grid>
                        <Grid item xs={2.5}>
                          <Typography variant="caption" fontWeight="bold">
                            TIME
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" fontWeight="bold">
                            DATE
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" fontWeight="bold">
                            CHECKED BY
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="caption" fontWeight="bold">
                            PAIN
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Rows */}
                      {afterFields.map((field, index) => (
                        <Grid
                          container
                          spacing={1}
                          key={field.id}
                          alignItems="center"
                        >
                          <Grid item xs={1.5}>
                            <TextField
                              size="small"
                              value={index + 1}
                              InputProps={{ readOnly: true }}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2.5}>
                            <TextField
                              size="small"
                              type="time"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              {...register(
                                `afterTreatment.${index}.time` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              size="small"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              {...register(
                                `afterTreatment.${index}.date` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              size="small"
                              fullWidth
                              {...register(
                                `afterTreatment.${index}.checkedBy` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={1.5}>
                            <TextField
                              size="small"
                              fullWidth
                              {...register(
                                `afterTreatment.${index}.painScoring` as const
                              )}
                            />
                          </Grid>
                          <Grid item xs={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => removeAfter(index)}
                              disabled={afterFields.length === 1}
                              sx={{
                                background: "#fff",
                                border: "1px solid #bebebe",
                              }}
                            >
                              <Minus size={16} />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                      onClick={() => appendAfter(defaultAfterRow)}
                      fullWidth
                      sx={{ mt: 2, border: "dashed 1px" }}
                    >
                      Add Row
                    </Button>
                  </Box>
                </Grid>
              </Grid>
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

export default PainScoringChart;
