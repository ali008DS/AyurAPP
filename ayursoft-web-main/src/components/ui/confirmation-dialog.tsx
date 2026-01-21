import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { ShieldQuestion } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: (result: boolean) => void;
}

function ConfirmationDialog({
  open,
  title,
  message,
  onClose,
}: ConfirmationDialogProps) {
  const handleYes = () => {
    onClose(true);
  };

  const handleNo = () => {
    onClose(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Nunito, sans-serif",
          fontWeight: 700,
          fontSize: "1.25rem",
          color: "#222",
          textAlign: "center",
          p: 3,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          p: 4,
        }}
      >
        <ShieldQuestion
          color="#ff5e5eff"
          style={{
            width: 80,
            height: 80,
            marginBottom: 20,
          }}
        />
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: "1rem",
            color: "#555",
            lineHeight: 1.5,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          gap: 2,
          p: 3,
        }}
      >
        <Button
          onClick={handleNo}
          variant="outlined"
          fullWidth
          sx={{
            color: "#555",
            borderColor: "#ccc",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleYes}
          variant="contained"
          fullWidth
          color="error"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(255,0,0,0.2)",
          }}
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
