import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  TextField,
  CircularProgress,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import React from "react";
import dayjs, { Dayjs } from "dayjs";

interface TherapistType {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  _id: string;
}

interface TherapySessionDialogProps {
  open: boolean;
  session: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "#FFA500",
    bg: "#FFF3E0",
    fontFamily: "Nunito, sans-serif",
  },
  {
    value: "reScheduled",
    label: "Re-Scheduled",
    color: "#2196F3",
    bg: "#E3F2FD",
    fontFamily: "Nunito, sans-serif",
  },
  {
    value: "completed",
    label: "Completed",
    color: "#4CAF50",
    bg: "#E8F5E9",
    fontFamily: "Nunito, sans-serif",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "#F44336",
    bg: "#FFEBEE",
    fontFamily: "Nunito, sans-serif",
  },
  {
    value: "missed",
    label: "Missed",
    color: "#9E9E9E",
    bg: "#F5F5F5",
    fontFamily: "Nunito, sans-serif",
  },
];

function TherapySessionDialog({
  open,
  session,
  onClose,
  onSubmit,
}: TherapySessionDialogProps) {
  const [status, setStatus] = React.useState(session?.status || "pending");
  const [therapist, setTherapist] = React.useState<TherapistType>(session?.therapist || "");
  const [sessionDate, setSessionDate] = React.useState<Dayjs | null>(null);
  const [slotStart, setSlotStart] = React.useState<Dayjs | null>(null);
  const [slotEnd, setSlotEnd] = React.useState<Dayjs | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (session) {
      setStatus(session.status);
      setTherapist(session.therapist);
      setSessionDate(dayjs(session.sessionDate));
      setSlotStart(dayjs(session.slotStart));
      setSlotEnd(dayjs(session.slotEnd));
    }
  }, [session]);

  if (!session) return null;

  console.log("SESSION-->>",session);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "16px", pb: 1 }}>
        Edit Therapy Session
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: "600" }}
            >
              Patient
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "700", textTransform: "uppercase" }}
            >
              {session.therapy?.patient?.firstName}{" "}
              {session.therapy?.patient?.lastName} (UHID-RAH{" "}
              {session.therapy?.patient?.uhId})
            </Typography>
          </Grid>

          <Grid item xs={8}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: "600" }}
            >
              Therapies
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "700", textTransform: "uppercase" }}
            >
              {session.therapy?.therapies?.join(", ")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Therapist"
              value={therapist.firstName + " " + therapist.lastName}
              // onChange={(e) => setTherapist(e.target.value.)}
              disabled
              size="small"
              fullWidth
              InputLabelProps={{ sx: { fontSize: "13px" } }}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="Session Date"
              value={sessionDate}
              onChange={(newValue) => setSessionDate(newValue)}
                format="DD/MM/YYYY"
              disabled
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  InputLabelProps: { sx: { fontSize: "13px" } },
                },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="Start Time"
              value={slotStart}
              onChange={(newValue) => {
                setSlotStart(newValue);
                if (
                  newValue &&
                  slotEnd &&
                  slotEnd.diff(newValue, "hour", true) > 3
                ) {
                  setSlotEnd(newValue.add(3, "hour"));
                }
              }}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="End Time"
              value={slotEnd}
              onChange={(newValue) => setSlotEnd(newValue)}
              minTime={slotStart || undefined}
              maxTime={slotStart ? slotStart.add(3, "hour") : undefined}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ fontWeight: "700", mb: 1.5, mt: 1 }}
            >
              Update Status
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {statusOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  onClick={() => setStatus(opt.value)}
                  sx={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    cursor: "pointer",
                    border:
                      status === opt.value
                        ? `2px solid ${opt.color}`
                        : "2px solid transparent",
                    backgroundColor: opt.bg,
                    fontFamily: opt.fontFamily,
                    color: opt.color,
                    "&:hover": { backgroundColor: opt.bg, opacity: 0.8 },
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={async () => {
            setLoading(true);
            await onSubmit({
              status,
              therapist:therapist._id,
              sessionDate: sessionDate?.toISOString(),
              slotStart: slotStart?.toISOString(),
              slotEnd: slotEnd?.toISOString(),
            });
            setLoading(false);
          }}
          variant="outlined"
          sx={{ border: "dashed 1px" }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TherapySessionDialog;
