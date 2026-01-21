import { Alert, Snackbar } from "@mui/material";

type CustomeAlertProps = {
  onOpen: boolean;
  onClose: VoidFunction;
  severity: any;
  message: string;
  position: "right" | "left" | "center";
};

const CustomAlert = ({
  onOpen,
  onClose,
  severity,
  message,
  position,
}: CustomeAlertProps) => {
  return (
    <Snackbar
      open={onOpen}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: position }}
    >
      <Alert
        severity={severity || "success"}
        sx={{ fontSize: 14, py: 0, whiteSpace: "pre-line" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomAlert;
