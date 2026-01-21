import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus } from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface VitalChartProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function VitalChart({ open, onClose, data }: VitalChartProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  const rowSchema = z.object({
    date: z.string().optional().default(today),
    time: z.string().optional().default(nowTime),
    weight: z.string().optional().default(""),
    temp: z.string().optional().default(""),
    bp: z.string().optional().default(""),
    pulse: z.string().optional().default(""),
    pain: z.string().optional().default(""),
    therapy: z.string().optional().default(""),
    patientFeedback: z.string().optional().default(""),
    patientSign: z.string().optional().default(""),
    therapistSign: z.string().optional().default(""),
    doctorSign: z.string().optional().default(""),
  });

  const schema = z.object({
    rows: z.array(rowSchema).min(1, "Add at least one row"),
  });

  type FormValues = z.infer<typeof schema>;

  const defaultRow: z.infer<typeof rowSchema> = useMemo(
    () => ({
      date: today,
      time: nowTime,
      weight: "",
      temp: "",
      bp: "",
      pulse: "",
      pain: "",
      therapy: "",
      patientFeedback: "",
      patientSign: "",
      therapistSign: "",
      doctorSign: "",
    }),
    [today, nowTime]
  );

  const { control, register, handleSubmit, reset, formState } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        rows: [defaultRow],
      },
      mode: "onBlur",
    });

  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  // Fetch existing data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !data.therapy) return;

      setLoading(true);
      try {
        const response = await ApiManager.getVitalChartsByTherapyId(
          data.therapy
        );
        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch vital chart data:", error);
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
      reset({ rows: existingData.rows });
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
        await ApiManager.updateVitalChart(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Vital Chart updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createVitalChart(payload);
        setAlert({
          severity: "success",
          message: "Vital Chart created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Vital Chart",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Vital Chart</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ pt: 0, pb: 0.5 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Vital Chart Table */}
              <Box
                sx={{
                  maxHeight: "calc(98vh - 420px)",
                  overflowY: "auto",
                  overflowX: "auto",
                }}
              >
                <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                  <Table sx={{ minWidth: 1600 }} size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 60 }}
                        >
                          S.No
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 140 }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 100 }}
                        >
                          Time
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 100 }}
                        >
                          Weight (kg)
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 120 }}
                        >
                          Temperature (°C)
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 120 }}
                        >
                          Blood Pressure
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 100 }}
                        >
                          Pulse
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 140 }}
                        >
                          Pain
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 150 }}
                        >
                          Patient Feedback
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 120 }}
                        >
                          Patient Sign
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 120 }}
                        >
                          Therapist Sign
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 120 }}
                        >
                          Doctor Sign
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: 100 }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell align="center">
                            <Typography variant="body2">{index + 1}</Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              {...register(`rows.${index}.date` as const)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="time"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              {...register(`rows.${index}.time` as const)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="70"
                              fullWidth
                              {...register(`rows.${index}.weight` as const)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="98.6"
                              fullWidth
                              {...register(
                                `rows.${index}.temp` as const
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="120/80"
                              fullWidth
                              {...register(
                                `rows.${index}.bp` as const
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="72"
                              fullWidth
                              {...register(`rows.${index}.pulse` as const)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="0-10"
                              fullWidth
                              {...register(`rows.${index}.pain` as const)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="Feedback"
                              fullWidth
                              {...register(
                                `rows.${index}.patientFeedback` as const
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="Signature"
                              fullWidth
                              {...register(
                                `rows.${index}.patientSign` as const
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="Signature"
                              fullWidth
                              {...register(
                                `rows.${index}.therapistSign` as const
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="Signature"
                              fullWidth
                              {...register(
                                `rows.${index}.doctorSign` as const
                              )}
                            />
                          </TableCell>
                          <TableCell>
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
                                onClick={() => append(defaultRow)}
                                disabled={isSubmitting}
                              >
                                <Plus size={18} />
                              </IconButton>
                              <IconButton
                                sx={{
                                  background: "#fff",
                                  border: "1px solid #bebebe",
                                }}
                                size="small"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1 || isSubmitting}
                              >
                                <Minus size={18} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {formState.errors.rows && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {formState.errors.rows.message as string}
                </Typography>
              )}
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
            {existingData ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default VitalChart;
