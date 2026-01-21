import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

interface TrackingReportDialogProps {
  open: boolean;
  editMode: boolean;
  formData: {
    documentName: string;
    issuingAuthority: string;
    licenceNumber: string;
    issueDate: Dayjs | null;
    expiryDate: Dayjs | null;
    remarks: string;
  };
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: string, value: any) => void;
}

function TrackingReportDialog({
  open,
  editMode,
  formData,
  onClose,
  onSubmit,
  onChange,
}: TrackingReportDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editMode ? "Edit" : "Add"} Tracking Report</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              label="Document Name"
              value={formData.documentName}
              onChange={(e) => onChange("documentName", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              label="Issuing Authority"
              value={formData.issuingAuthority}
              onChange={(e) => onChange("issuingAuthority", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              size="small"
              label="Licence Number"
              value={formData.licenceNumber}
              onChange={(e) => onChange("licenceNumber", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Issue Date"
              value={formData.issueDate}
              onChange={(date) => onChange("issueDate", date)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={(date) => onChange("expiryDate", date)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              label="Remarks"
              value={formData.remarks}
              onChange={(e) => onChange("remarks", e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="outlined" color="primary">
          {editMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrackingReportDialog;
