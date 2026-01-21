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
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus } from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface DailyVitalFeedbackProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function DailyVitalFeedback({ open, onClose, data }: DailyVitalFeedbackProps) {
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
        const response = await ApiManager.getDailyVitalFeedbacksByTherapyId(
          data.therapy
        );
        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch daily vital feedback data:", error);
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
        await ApiManager.updateDailyVitalFeedback(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Daily Vital Feedback updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createDailyVitalFeedback(payload);
        setAlert({
          severity: "success",
          message: "Daily Vital Feedback created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Daily Vital Feedback",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Daily Vital Pain Scoring & Daily Feedback Form</DialogTitle>
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
              <Box
                sx={{
                  maxHeight: "calc(98vh - 420px)",
                  overflowY: "auto",
                  overflowX: "auto",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {fields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        px: 1,
                        pb: 1,
                        pt: 2,
                        borderRadius: 1,
                        background: "rgba(176,212,255,0.15)",
                      }}
                    >
                      <TextField
                        size="small"
                        label="S.No"
                        value={index + 1}
                        InputProps={{ readOnly: true }}
                        sx={{ width: 60 }}
                      />
                      <TextField
                        size="small"
                        label="Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 170 }}
                        {...register(`rows.${index}.date` as const)}
                      />
                      <TextField
                        size="small"
                        label="Time"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                        {...register(`rows.${index}.time` as const)}
                      />
                      <TextField
                        size="small"
                        label="Weight"
                        sx={{ width: 100 }}
                        {...register(`rows.${index}.weight` as const)}
                      />
                      <TextField
                        size="small"
                        label="Temp."
                        sx={{ width: 100 }}
                        {...register(`rows.${index}.temp` as const)}
                      />
                      <TextField
                        size="small"
                        label="B.P."
                        placeholder="120/80"
                        sx={{ width: 100 }}
                        {...register(`rows.${index}.bp` as const)}
                      />
                      <TextField
                        size="small"
                        label="Pulse"
                        sx={{ width: 80 }}
                        {...register(`rows.${index}.pulse` as const)}
                      />
                      <TextField
                        size="small"
                        label="Pain"
                        sx={{ width: 70 }}
                        {...register(`rows.${index}.pain` as const)}
                      />
                      <TextField
                        size="small"
                        label="Therapy"
                        sx={{ width: 150 }}
                        {...register(`rows.${index}.therapy` as const)}
                      />
                      <TextField
                        size="small"
                        label="Patient Feedback"
                        sx={{ width: 200 }}
                        {...register(`rows.${index}.patientFeedback` as const)}
                      />
                      <TextField
                        size="small"
                        label="Patient Sign."
                        sx={{ width: 120 }}
                        {...register(`rows.${index}.patientSign` as const)}
                      />
                      <TextField
                        size="small"
                        label="Therapist Sign."
                        sx={{ width: 120 }}
                        {...register(`rows.${index}.therapistSign` as const)}
                      />
                      <TextField
                        size="small"
                        label="Doctor Sign."
                        sx={{ width: 120 }}
                        {...register(`rows.${index}.doctorSign` as const)}
                      />
                      <Box sx={{ display: "flex", gap: 0.5, ml: 0.5 }}>
                        <IconButton
                          sx={{
                            background: "#fff",
                            border: "1px solid #bebebe",
                          }}
                          size="small"
                          onClick={() => append(defaultRow)}
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
                          disabled={fields.length === 1}
                        >
                          <Minus size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
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

export default DailyVitalFeedback;
