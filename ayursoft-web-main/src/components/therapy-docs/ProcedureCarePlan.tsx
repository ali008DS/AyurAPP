import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface ProcedureCarePlanProps {
  open: boolean;
  onClose: () => void;
  data: {
    therapy: string | undefined;
    patient: string | undefined;
  };
}

function ProcedureCarePlan({ open, onClose, data }: ProcedureCarePlanProps) {
  const { setAlert } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Zod schema
  const schema = useMemo(
    () =>
      z.object({
        procedurePerform: z
          .string({ required_error: "Required" })
          .trim()
          .min(1, "Procedure is required"),
        doctorName: z
          .string({ required_error: "Required" })
          .trim()
          .min(1, "Doctor name is required"),
        therapistName: z
          .string({ required_error: "Required" })
          .trim()
          .min(1, "Therapist name is required"),
        therapyDetails: z.string().optional().default(""),
        treatmentBenefits: z.string().optional().default(""),
        treatmentRisks: z.string().optional().default(""),
        treatmentAlternatives: z.string().optional().default(""),
        treatmentOutcome: z.string().optional().default(""),
        footerDoctorName: z.string().optional().default(""),
        date: z.string().optional().default(today),
        signature: z.string().optional().default(""),
      }),
    [today]
  );

  type FormValues = z.infer<typeof schema>;

  const defaultValues: FormValues = useMemo(
    () => ({
      procedurePerform: existingData?.procedurePerform || "",
      doctorName: existingData?.doctorName || "",
      therapistName: existingData?.therapistName || "",
      therapyDetails: existingData?.therapyDetails || "",
      treatmentBenefits: existingData?.treatmentBenefits || "",
      treatmentRisks: existingData?.treatmentRisks || "",
      treatmentAlternatives: existingData?.treatmentAlternatives || "",
      treatmentOutcome: existingData?.treatmentOutcome || "",
      footerDoctorName: existingData?.footerDoctorName || "",
      date: existingData?.date || today,
      signature: existingData?.signature || "",
    }),
    [existingData, today]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  // Fetch existing data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !data.therapy) return;

      setLoading(true);
      try {
        const response = await ApiManager.getProcedureCaresByTherapyId(
          data.therapy
        );
        console.log("Fetched Procedure Care Data:", response);
        if (response && response.data.length > 0) {
          setExistingData(response.data[0]);
        } else {
          setExistingData(null);
        }
      } catch (error) {
        console.error("Failed to fetch procedure care data:", error);
        setExistingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, data.therapy]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

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
        await ApiManager.updateProcedureCare(existingData._id, payload);
        setAlert({
          severity: "success",
          message: "Procedure Care Plan updated successfully",
        });
      } else {
        // Create new record
        await ApiManager.createProcedureCare(payload);
        setAlert({
          severity: "success",
          message: "Procedure Care Plan created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message: error?.message || "Failed to save Procedure Care Plan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => reset(defaultValues);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Procedure Care Plan</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Procedure Perform (प्रक्रिया)"
                  {...register("procedurePerform")}
                  fullWidth
                  error={!!errors.procedurePerform}
                  helperText={errors.procedurePerform?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Doctor Name (चिकित्सक नाम)"
                  {...register("doctorName")}
                  fullWidth
                  error={!!errors.doctorName}
                  helperText={errors.doctorName?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Therapist Name (सहायक नाम)"
                  {...register("therapistName")}
                  fullWidth
                  error={!!errors.therapistName}
                  helperText={errors.therapistName?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Details of Therapy
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Details of Therapy"
                  {...register("therapyDetails")}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Treatment Benefits</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Treatment Benefits"
                  {...register("treatmentBenefits")}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Treatment Risks</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Treatment Risks"
                  {...register("treatmentRisks")}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Treatment Alternatives
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Treatment Alternatives"
                  {...register("treatmentAlternatives")}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Treatment Outcome</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Treatment Outcome"
                  {...register("treatmentOutcome")}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Doctor’s Name (चिकित्सक नाम)"
                  {...register("footerDoctorName")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Date (दिनांक)"
                  type="date"
                  {...register("date")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Signature (हस्ताक्षर)"
                  {...register("signature")}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            type="button"
            sx={{ border: "dashed 1px" }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            color="primary"
            type="submit"
            disabled={isSubmitting}
          >
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

export default ProcedureCarePlan;
