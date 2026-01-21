import {
  Button,
  IconButton,
  TextField,
  Grid2 as Grid,
  Dialog,
  styled,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { BookmarkPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { OpenStockSchema, OpenStockType } from "../../utils/validationSchemas";
import { GridCloseIcon } from "@mui/x-data-grid";
import { UnitTypeBase } from "../department-management/types";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";
import { useNavigate } from "react-router-dom";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface MedOpenDrawerProps {
  open: boolean;
  onClose: () => void;
  recall: () => void;
}

export interface Medicine {
  _id: string;
  name: string;
  manufacturer: string;
  baseUnitType: UnitTypeBase;
  totalQuantityInAUnit: number;
}

function MedOpenDrawer({ open, onClose, recall }: MedOpenDrawerProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OpenStockType>({
    defaultValues: {
      medicine: "",
      batchNumber: "",
      adjustmentDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      totalQuantity: 0,
      sellingPrice: 0,
      manufacturingDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      expiryDate: dayjs().add(1, "year").format("YYYY-MM-DDTHH:mm:ss"),
    },
    resolver: zodResolver(OpenStockSchema),
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      const response = await ApiManager.getMedicines();
      setMedicines(response.data);
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (selectedMedicine) {
      const calculatedTotal =
        selectedMedicine.totalQuantityInAUnit * quantityInput;
      setValue("totalQuantity", calculatedTotal);
    }
  }, [quantityInput, selectedMedicine, setValue]);

  const onSubmit = async (data: OpenStockType) => {
    try {
      const calculatedTotalQuantity =
        (selectedMedicine?.totalQuantityInAUnit || 1) * quantityInput;

      // Convert price from per main unit to per subunit
      const pricePerSubunit = data.sellingPrice / (selectedMedicine?.totalQuantityInAUnit || 1);

      const openingStockData = {
        medicine: data.medicine,
        batchNumber: data.batchNumber,
        adjustmentDate: data.adjustmentDate,
        totalQuantity: calculatedTotalQuantity,
        sellingPrice: pricePerSubunit,
        manufacturingDate: data.manufacturingDate,
        unitType: selectedMedicine?.baseUnitType || "",
        expiryDate: data.expiryDate,
      };

      await ApiManager.openStock(openingStockData);

      setAlert({
        severity: "success",
        message: "Stock opened successfully!",
      });

      reset();
      setQuantityInput(1);
      recall();
      onClose();
    } catch (error: any) {
      console.error("Error submitting opening stock data:", error);
      reset();
      onClose();
      setAlert({
        severity: "error",
        message: "Failed to process opening stock data.",
      });
    }
  };

  return (
    <BootstrapDialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle className="m-0 p-4">Open Stock</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-500"
      >
        <GridCloseIcon />
      </IconButton>
      <DialogContent dividers className="p-4 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container rowSpacing={2} columnSpacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                Medicine Name
              </Typography>
              <Controller
                name="medicine"
                control={control}
                rules={{ required: "Medicine is required" }}
                render={({ field }) => (
                  <Autocomplete
                    size="small"
                    {...field}
                    options={[
                      { _id: "NEW_MEDICINE", name: "➕ Add New Medicine", manufacturer: "", baseUnitType: "" as UnitTypeBase, totalQuantityInAUnit: 0 },
                      ...(medicines || [])
                    ]}
                    getOptionLabel={(option) => option.name}
                    value={
                      medicines.find((med) => med._id === field.value) || null
                    }
                    onChange={(_, newValue) => {
                      if (newValue?._id === "NEW_MEDICINE") {
                        onClose();
                        navigate("/medicine");
                        return;
                      }
                      field.onChange(newValue?._id);
                      setSelectedMedicine(newValue);
                      setQuantityInput(1);
                    }}
                    renderOption={(props, option) => (
                      <li
                        {...props}
                        className={`${option._id === "NEW_MEDICINE"
                          ? "font-semibold text-blue-600 border-b border-gray-200"
                          : ""
                          }`}
                      >
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        placeholder="Select Medicine"
                        {...params}
                        error={!!errors.medicine}
                        helperText={errors.medicine?.message}
                        required
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                Base Unit Type
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={selectedMedicine?.baseUnitType || ""}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                Adjustment Date
              </Typography>
              <Controller
                name="adjustmentDate"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                    {...field}
                    format="DD/MM/YYYY"
                    onChange={(date) =>
                      date && field.onChange(date.format("YYYY-MM-DDTHH:mm:ss"))
                    }
                    value={field.value ? dayjs(field.value) : null}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                SubUnits in a Unit
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={selectedMedicine?.totalQuantityInAUnit || ""}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                Quantity (Units)
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={quantityInput === 0 ? "" : quantityInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || value === null) {
                    setQuantityInput(0);
                  } else {
                    setQuantityInput(Math.max(0, Number(value)));
                  }
                }}
                inputProps={{ min: "0", step: "1" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                Batch Number
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.batchNumber}
                helperText={errors.batchNumber?.message}
                {...register("batchNumber")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Selling Price per Main Unit
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                error={!!errors.sellingPrice}
                helperText={errors.sellingPrice?.message}
                inputProps={{ min: "0", step: "0.01" }}
                {...register("sellingPrice")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Expiry Date
              </Typography>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                    {...field}
                    format="DD/MM/YYYY"
                    onChange={(date) =>
                      date && field.onChange(date.format("YYYY-MM-DDTHH:mm:ss"))
                    }
                    value={field.value ? dayjs(field.value) : null}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Manufacturing Date
              </Typography>
              <Controller
                name="manufacturingDate"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                    {...field}
                    format="DD/MM/YYYY"
                    onChange={(date) =>
                      date && field.onChange(date.format("YYYY-MM-DDTHH:mm:ss"))
                    }
                    value={field.value ? dayjs(field.value) : null}
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
          disabled={isSubmitting}
          color="primary"
          startIcon={<BookmarkPlus size={18} />}
          onClick={() => {
            console.log("Form errors:", errors);
            handleSubmit(onSubmit)();
          }}
        >
          {isSubmitting && <CircularProgress size={20} />}
          Save
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default MedOpenDrawer;
