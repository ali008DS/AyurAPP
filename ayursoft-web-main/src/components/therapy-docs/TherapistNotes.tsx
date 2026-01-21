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

interface TherapistNotesProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function TherapistNotes({ open, onClose, data }: TherapistNotesProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nowTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);

  const rowSchema = z.object({
    date: z.string().optional().default(today),
    time: z.string().optional().default(nowTime),
    bp: z.string().optional().default(""),
    pulse: z.string().optional().default(""),
    temp: z.string().optional().default(""),
    pain: z.string().optional().default(""),
  });

  const schema = z.object({
    rows: z.array(rowSchema).min(1, "At least one row required"),
  });

  type FormValues = z.infer<typeof schema>;

  const defaultRow: z.infer<typeof rowSchema> = useMemo(
    () => ({
      date: today,
      time: nowTime,
      bp: "",
      pulse: "",
      temp: "",
      pain: "",
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
        const response = await ApiManager.getTherapistNotesByTherapyId(
          data.therapy
        );
        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch therapist notes data:", error);
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
        await ApiManager.updateTherapistNote(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Therapist Notes updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createTherapistNote(payload);
        setAlert({
          severity: "success",
          message: "Therapist Notes created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Therapist Notes",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Therapist Notes</DialogTitle>
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
              <Box sx={{ maxHeight: "calc(98vh - 420px)", overflowY: "auto" }}>
                {fields.map((field, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={field.id}
                    sx={{ mt: index === 0 ? 0.2 : 0 }}
                  >
                    <Grid item xs={12} sm={2}>
                      <TextField
                        size="small"
                        label="DATE:"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        {...register(`rows.${index}.date` as const)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        size="small"
                        label="TIME:"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        {...register(`rows.${index}.time` as const)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        size="small"
                        label="B.P.:"
                        placeholder="120/80"
                        fullWidth
                        {...register(`rows.${index}.bp` as const)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1.5}>
                      <TextField
                        size="small"
                        label="PULSE:"
                        fullWidth
                        {...register(`rows.${index}.pulse` as const)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1.5}>
                      <TextField
                        size="small"
                        label="TEMP.:"
                        fullWidth
                        {...register(`rows.${index}.temp` as const)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={fields.length > 1 ? 1.5 : 2.3}>
                      <TextField
                        size="small"
                        label="PAIN:"
                        fullWidth
                        {...register(`rows.${index}.pain` as const)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={fields.length > 1 ? 1.5 : 0.7}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          justifyContent: "center",
                        }}
                      >
                        <IconButton
                          sx={{
                            background: "#ffffffff",
                            border: "1px solid #bebebeff",
                          }}
                          onClick={() => append(defaultRow)}
                          size="small"
                        >
                          <Plus size={26} />
                        </IconButton>
                        {fields.length > 1 && (
                          <IconButton
                            sx={{
                              background: "#ffffffff",
                              border: "1px solid #bebebeff",
                            }}
                            onClick={() => remove(index)}
                            size="small"
                          >
                            <Minus size={26} />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                ))}
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

export default TherapistNotes;
