import {
  Button,
  IconButton,
  TextField,
  Grid,
  Dialog,
  styled,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";
import { ManufacturerFormSchema, ManufacturerFormType } from "../../utils/validationSchemas";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface MedPurchaseDrawerProps {
  open: boolean;
  onClose: () => void;
  recall: () => void; // Function to recall the parent component
  manufacturer?: ManufacturerFormType | null; // Optional prop for editing
}

function AddManufacturerDialog({ open, onClose, recall, manufacturer }: MedPurchaseDrawerProps) {
  const { setAlert } = useAppContext();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }, // Removed isSubmitting as it is unused
  } = useForm<ManufacturerFormType>({
    defaultValues: manufacturer || {
      name: "",
      agencyName: "",
      mrName: "",
      contactNumber: "",
      secondaryNumber: "",
    },
    resolver: zodResolver(ManufacturerFormSchema),
  });

  const onSubmit = async (data: ManufacturerFormType) => {
    try {
      await ApiManager.createManufacturer(data); // Use createManufacturer API
      setAlert({
        severity: "success",
        message: "Manufacturer created successfully!",
      });
    } catch (error: any) {
      console.error("Error creating manufacturer:", error);
      const errorMessage: string = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message ||
          "Failed to create manufacturer.";
      setAlert({
        severity: "error",
        message: errorMessage,
      });
      return;
    }
    reset();
    recall();
    onClose();
  };

  return (
    <BootstrapDialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>Add Manufacturer</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <GridCloseIcon />
      </IconButton>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                size="small"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Agency Name"
                variant="outlined"
                size="small"
                {...register("agencyName")}
                error={!!errors.agencyName}
                helperText={errors.agencyName?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="MR Name"
                variant="outlined"
                size="small"
                {...register("mrName")}
                error={!!errors.mrName}
                helperText={errors.mrName?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Number"
                variant="outlined"
                size="small"
                {...register("contactNumber")}
                error={!!errors.contactNumber}
                helperText={errors.contactNumber?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Secondary Number"
                variant="outlined"
                size="small"
                {...register("secondaryNumber")}
                error={!!errors.secondaryNumber}
                helperText={errors.secondaryNumber?.message}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default AddManufacturerDialog;
