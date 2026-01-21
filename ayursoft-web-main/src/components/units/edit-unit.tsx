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
  Autocomplete,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";
import { z } from "zod";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

// Define the unit form schema
const UnitFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["unit", "subUnit"], {
    errorMap: () => ({ message: "Type must be either 'unit' or 'subUnit'" }),
  }),
});

type UnitFormType = z.infer<typeof UnitFormSchema>;

export interface UnitData {
  _id: string;
  name: string;
  type: "unit" | "subUnit";
}

interface EditUnitDialogProps {
  open: boolean;
  onClose: () => void;
  recall: () => void;
  unit: UnitData;
}

function EditUnitDialog({ open, onClose, recall, unit }: EditUnitDialogProps) {
  const { setAlert } = useAppContext();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UnitFormType>({
    defaultValues: {
      name: unit.name,
      type: unit.type,
    },
    resolver: zodResolver(UnitFormSchema),
  });

  const onSubmit = async (data: UnitFormType) => {
    try {
      await ApiManager.patchUnit(unit._id, data);
      setAlert({
        severity: "success",
        message: "Unit updated successfully!",
      });
      reset();
      recall();
      onClose();
    } catch (error: any) {
      console.error("Error updating unit:", error);
      const errorMessage: string = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message || "Failed to update unit.";
      setAlert({
        severity: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <BootstrapDialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>Edit Unit</DialogTitle>
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
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    size="small"
                    options={["unit", "subUnit"]}
                    value={field.value}
                    onChange={(_, newValue) => field.onChange(newValue || "unit")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Type"
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        fullWidth
                      />
                    )}
                  />
                )}
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
          Update
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default EditUnitDialog;
