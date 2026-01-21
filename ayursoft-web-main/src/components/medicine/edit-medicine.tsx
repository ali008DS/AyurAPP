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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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

// Define the medicine form schema
const MedicineFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  unitType: z.string().min(1, "Unit type is required"),
  baseUnitType: z.string().min(1, "Base unit type is required"),
  totalQuantityInAUnit: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type MedicineFormType = z.infer<typeof MedicineFormSchema>;

interface MedPurchaseDrawerProps {
  open: boolean;
  onClose: () => void;
  recall: () => void; // Function to recall the parent component
  medicine: MedicineFormType & { id: string }; // Medicine data for editing
}

interface ManufacturerData {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
}

// Define a type for unit data
interface UnitData {
  _id: string;
  name: string;
  type: "unit" | "subUnit";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function EditMedicineDialog({ open, onClose, recall, medicine }: MedPurchaseDrawerProps) {
  const { setAlert } = useAppContext();
  const [manufacturers, setManufacturers] = useState<ManufacturerData[]>([]);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [subUnits, setSubUnits] = useState<UnitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MedicineFormType>({
    defaultValues: {
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      unitType: medicine.unitType,
      baseUnitType: medicine.baseUnitType,
      totalQuantityInAUnit: medicine.totalQuantityInAUnit,
    },
    resolver: zodResolver(MedicineFormSchema),
  });

  // Fetch manufacturers and units when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch manufacturers
        const manufacturerResponse = await ApiManager.getManufacturer();
        setManufacturers(manufacturerResponse.data || []);

        // Fetch units
        const unitsResponse = await ApiManager.getUnits();
        const unitsData = unitsResponse.data || [];

        // Separate units and subUnits based on type
        const unitsList = unitsData.filter((unit: UnitData) => unit.type === "unit");
        const subUnitsList = unitsData.filter((unit: UnitData) => unit.type === "subUnit");

        setUnits(unitsList);
        setSubUnits(subUnitsList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({
          severity: "error",
          message: "Failed to fetch data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setAlert]);

  const onSubmit = async (data: MedicineFormType) => {
    try {
      await ApiManager.updateMedicine(medicine.id, data);
      setAlert({
        severity: "success",
        message: "Medicine updated successfully!",
      });
      reset();
      recall();
      onClose();
    } catch (error: any) {
      console.error("Error updating medicine:", error);
      setAlert({
        severity: "error",
        message: error?.message || "Failed to update medicine.",
      });
    }
  };

  return (
    <BootstrapDialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>Edit Medicine</DialogTitle>
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
                name="manufacturer"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.manufacturer}>
                    <InputLabel id="manufacturer-select-label">Manufacturer</InputLabel>
                    <Select
                      labelId="manufacturer-select-label"
                      id="manufacturer-select"
                      label="Manufacturer"
                      {...field}
                    >
                      {isLoading ? (
                        <MenuItem value="">Loading manufacturers...</MenuItem>
                      ) : (
                        manufacturers.map((mfr) => (
                          <MenuItem key={mfr._id} value={mfr._id}>
                            {mfr.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.manufacturer && (
                      <FormHelperText>{errors.manufacturer.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="unitType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    size="small"
                    options={units}
                    getOptionLabel={(option) => option.name}
                    value={units.find((u) => u.name === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue?.name || "");
                    }}
                    loading={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unit Type"
                        error={!!errors.unitType}
                        helperText={errors.unitType?.message}
                        fullWidth
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="baseUnitType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    size="small"
                    options={subUnits}
                    getOptionLabel={(option) => option.name}
                    value={subUnits.find((u) => u.name === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue?.name || "");
                    }}
                    loading={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="SubUnit Type"
                        error={!!errors.baseUnitType}
                        helperText={errors.baseUnitType?.message}
                        fullWidth
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subunit Quanity"
                variant="outlined"
                size="small"
                type="number"
                inputProps={{ min: 1 }}
                {...register("totalQuantityInAUnit")}
                error={!!errors.totalQuantityInAUnit}
                helperText={errors.totalQuantityInAUnit?.message}
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

export default EditMedicineDialog;
