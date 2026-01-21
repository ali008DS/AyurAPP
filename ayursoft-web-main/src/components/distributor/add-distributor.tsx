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
import {
  DistributorFormSchema,
  DistributorFormType,
} from "../../utils/validationSchemas";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface DistributorDrawerProps {
  open: boolean;
  onClose: () => void;
  recall: () => void; // Function to recall the parent component
  distributor?: DistributorFormType | null; // Optional prop for editing
}

function AddDistributorDialog({
  open,
  onClose,
  recall,
  distributor,
}: DistributorDrawerProps) {
  const { setAlert } = useAppContext();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DistributorFormType>({
    defaultValues: distributor || {
      name: "",
      gstNo: "",
      primaryContactNo: "",
      secondaryContactNo: "",
      address: "",
    },
    resolver: zodResolver(DistributorFormSchema),
  });

  const onSubmit = async (data: DistributorFormType) => {
    try {
      await ApiManager.createDistributor(data);
      setAlert({
        severity: "success",
        message: "Distributor created successfully!",
      });
    } catch (error: any) {
      console.error("Error creating distributor:", error);
      setAlert({
        severity: "error",
        message: error?.message || "Failed to create distributor.",
      });
      return;
    }
    reset();
    recall();
    onClose();
  };

  return (
    <BootstrapDialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>Add Distributor</DialogTitle>
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="GST Number"
                variant="outlined"
                size="small"
                {...register("gstNo")}
                error={!!errors.gstNo}
                helperText={errors.gstNo?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Primary Contact Number"
                variant="outlined"
                size="small"
                {...register("primaryContactNo")}
                error={!!errors.primaryContactNo}
                helperText={errors.primaryContactNo?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Secondary Contact Number"
                variant="outlined"
                size="small"
                {...register("secondaryContactNo")}
                error={!!errors.secondaryContactNo}
                helperText={errors.secondaryContactNo?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                size="small"
                multiline
                rows={3}
                {...register("address")}
                error={!!errors.address}
                helperText={errors.address?.message}
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

export default AddDistributorDialog;
