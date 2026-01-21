import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Chip,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  uhId?: string;
}

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
}

const therapySchema = z.object({
  therapies: z.array(z.string()).min(1, "At least one therapy is required"),
  patient: z
    .string()
    .nullable()
    .refine((val) => val !== null && val !== "", "Patient is required"),
  therapist: z.string().min(1, "Therapist is required"),
  startDate: z.custom<Dayjs>(
    (val) => val !== null && val !== undefined,
    "Start date is required"
  ),
  endDate: z.custom<Dayjs>(
    (val) => val !== null && val !== undefined,
    "End date is required"
  ),
  slotStart: z.custom<Dayjs>(
    (val) => val !== null && val !== undefined,
    "Slot start time is required"
  ),
  slotEnd: z.custom<Dayjs>(
    (val) => val !== null && val !== undefined,
    "Slot end time is required"
  ),
  gaps: z.union([z.string(), z.number()]).refine((val) => {
    const num = Number(val);
    return val === "" || (!isNaN(num) && num >= 0 && num <= 20);
  }, "Gaps must be between 0 and 20"),
});

type TherapyFormData = z.infer<typeof therapySchema>;

interface TherapyDialogProps {
  open: boolean;
  editMode: boolean;
  formData: {
    therapies: string[];
    patient: string | null;
    therapist: string;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    slotStart: Dayjs | null;
    slotEnd: Dayjs | null;
    gaps: string | number;
  };
  therapyOptions: Array<{ _id: string; name: string }>;
  therapists: Therapist[];
  patientOptions: Patient[];
  selectedPatient: Patient | null;
  loadingPatients: boolean;
  patientInputValue: string;
  onPatientInputChange: (value: string) => void;
  onPatientChange: (patient: Patient | null) => void;
  onClose: () => void;
  onSubmit: (data: TherapyFormData) => void;
  onChange: (field: string, value: any) => void;
  onTimePeriodChange: (days: number) => void;
}

function TherapyDialog({
  open,
  editMode,
  formData,
  therapyOptions,
  therapists,
  patientOptions,
  selectedPatient,
  loadingPatients,
  patientInputValue,
  onPatientInputChange,
  onPatientChange,
  onClose,
  onSubmit,
  onChange,
  onTimePeriodChange,
}: TherapyDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(therapySchema),
    mode: "onChange",
    defaultValues: formData as any,
  });

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{editMode ? "Edit" : "Add"} Therapy Session</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller
              name="patient"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={patientOptions}
                  value={selectedPatient}
                  isOptionEqualToValue={(option, value) =>
                    option?._id === value?._id
                  }
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName} ${
                      option.uhId
                        ? `(${option.uhId})`
                        : `(${option.phone || ""})`
                    }`
                  }
                  loading={loadingPatients}
                  inputValue={patientInputValue}
                  onInputChange={(_, newInputValue) =>
                    onPatientInputChange(newInputValue)
                  }
                  onChange={(_, newValue) => {
                    onPatientChange(newValue);
                    field.onChange(newValue?._id || "");
                    onChange("patient", newValue?._id || null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Patient"
                      size="small"
                      fullWidth
                      error={!!errors.patient}
                      helperText={
                        (errors.patient?.message as string) ||
                        "Type at least 2 characters to search"
                      }
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="therapies"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={therapyOptions}
                  getOptionLabel={(option) => option.name}
                  value={therapyOptions.filter((t) =>
                    field.value.includes(t.name)
                  )}
                  onChange={(_, newValue) => {
                    const therapyNames = newValue.map((v) => v.name);
                    field.onChange(therapyNames);
                    onChange("therapies", therapyNames);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Therapies"
                      size="small"
                      fullWidth
                      error={!!errors.therapies}
                      helperText={errors.therapies?.message as string}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="therapist"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={therapists}
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? option
                      : `${option.firstName} ${option.lastName}`
                  }
                  value={therapists.find((t) => t._id === field.value) || null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?._id || "");
                    onChange("therapist", newValue?._id || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Therapist Name"
                      size="small"
                      fullWidth
                      error={!!errors.therapist}
                      helperText={errors.therapist?.message as string}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              label="Time Period (days)"
              type="number"
              onChange={(e) => {
                const days = parseInt(e.target.value) || 0;
                if (days > 0) onTimePeriodChange(days);
              }}
              fullWidth
              helperText="Enter number of days to auto-fill start and end dates"
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Start Date"
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    onChange("startDate", date);
                  }}
                  minDate={dayjs()}
                  readOnly={editMode}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.startDate,
                      helperText: errors.startDate?.message as string,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="End Date"
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    onChange("endDate", date);
                  }}
                  minDate={
                    formData.startDate
                      ? formData.startDate.add(0, "day")
                      : dayjs().add(1, "day")
                  }
                  maxDate={
                    formData.startDate
                      ? formData.startDate.add(6, "month")
                      : dayjs().add(6, "month")
                  }
                  readOnly={editMode}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.endDate,
                      helperText: errors.endDate?.message as string,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="slotStart"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Slot Start"
                  value={field.value}
                  onChange={(time) => {
                    field.onChange(time);
                    onChange("slotStart", time);
                    if (
                      time &&
                      formData.slotEnd &&
                      formData.slotEnd.diff(time, "hour", true) > 3
                    ) {
                      const newEndTime = time.add(3, "hour"); // means 4 (if start at 1PM it will allow 4PM)
                      onChange("slotEnd", newEndTime);
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.slotStart,
                      helperText: errors.slotStart?.message as string,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="slotEnd"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Slot End"
                  value={field.value}
                  onChange={(time) => {
                    field.onChange(time);
                    onChange("slotEnd", time);
                  }}
                  minTime={formData.slotStart || undefined}
                  maxTime={
                    formData.slotStart
                      ? formData.slotStart.add(3, "hour")
                      : undefined
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.slotEnd,
                      helperText: errors.slotEnd?.message as string,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="gaps"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  label="Gaps (days)"
                  type="number"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onChange("gaps", e.target.value);
                  }}
                  inputProps={{ min: 0, max: 20 }}
                  error={!!errors.gaps}
                  helperText={errors.gaps?.message as string}
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="outlined"
          color="primary"
        >
          {editMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TherapyDialog;
