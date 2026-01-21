import {
  Button,
  IconButton,
  TextField,
  Grid2 as Grid,
  Select,
  MenuItem,
  Dialog,
  styled,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  PurchaseEntrySchema,
  PurchaseEntryType,
} from "../../utils/validationSchemas";
import { GridCloseIcon } from "@mui/x-data-grid";
import { UnitType, UnitTypeBase } from "../department-management/types";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface MedEditDrawerProps {
  open: boolean;
  onClose: () => void;
  recall: () => void;
  editingMedicine: any;
}

export interface Medicine {
  _id: string;
  name: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  manufacturer: string;
  baseUnitType: UnitTypeBase;
  totalQuantityInAUnit: number;
  unitType: UnitType;
}

function MedEditDrawer({
  open,
  onClose,
  recall,
  editingMedicine,
}: MedEditDrawerProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [taxableAmount, setTaxableAmount] = useState<number>(0);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const { setAlert } = useAppContext();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseEntryType>({
    resolver: zodResolver(PurchaseEntrySchema),
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      const response = await ApiManager.getMedicines();
      setMedicines(response.data);

      if (editingMedicine && response.data) {
        // Handle both cases where medicine is a string ID or an object
        const medicineId = typeof editingMedicine.medicine === 'string'
          ? editingMedicine.medicine
          : editingMedicine.medicine?._id;

        if (medicineId) {
          const medicineFound = response.data.find(
            (med: Medicine) => med._id === medicineId
          );
          setSelectedMedicine(medicineFound || null);
        }
      }
    };

    fetchMedicines();
  }, [editingMedicine]);

  useEffect(() => {
    if (editingMedicine && open) {
      // Handle both cases where medicine is a string ID or an object
      const medicineId = typeof editingMedicine.medicine === 'string'
        ? editingMedicine.medicine
        : editingMedicine.medicine?._id;

      setValue("medicine", medicineId);
      setValue("totalPurchasedUnit", editingMedicine.totalPurchasedUnit);
      setValue("pricePerUnit", editingMedicine.pricePerUnit);
      setValue("totalPrice", editingMedicine.totalPrice);
      setValue("mrp", editingMedicine.mrp);
      setValue("batchNumber", editingMedicine.batchNumber);
      setValue("taxType", editingMedicine.taxType);
      setValue("cgst", editingMedicine.cgst);
      setValue("sgst", editingMedicine.sgst);
      setValue("igst", editingMedicine.igst);
      setValue("sellingPrice", editingMedicine.sellingPrice);
      setValue("discount", editingMedicine.discount);
      setValue("hsnCode", editingMedicine.hsnCode);
      setValue(
        "purchaseDate",
        dayjs(editingMedicine.purchaseDate).format("YYYY-MM-DDTHH:mm:ss")
      );
      setValue(
        "expiryDate",
        dayjs(editingMedicine.expiryDate).format("YYYY-MM-DDTHH:mm:ss")
      );
      setValue(
        "manufacturingDate",
        editingMedicine.manufacturingDate
          ? dayjs(editingMedicine.manufacturingDate).format("YYYY-MM-DDTHH:mm:ss")
          : dayjs().format("YYYY-MM-DDTHH:mm:ss")
      );

      // Set the initial taxable amount
      calculateInitialTaxableAmount();
    }
  }, [editingMedicine, open, setValue]);

  const calculateInitialTaxableAmount = () => {
    if (!editingMedicine) return;

    const totalPrice = editingMedicine.totalPrice;
    const discountAmount = (totalPrice * (editingMedicine.discount || 0)) / 100;
    const calculatedTaxableAmount = Math.max(0, totalPrice - discountAmount);

    setTaxableAmount(calculatedTaxableAmount);

    // Calculate tax amounts
    const taxType = editingMedicine.taxType;
    let taxAmount = 0;

    if (taxType === "central") {
      taxAmount = (calculatedTaxableAmount * (editingMedicine.igst || 0)) / 100;
    } else if (taxType === "state") {
      const cgstAmount = (calculatedTaxableAmount * (editingMedicine.cgst || 0)) / 100;
      const sgstAmount = (calculatedTaxableAmount * (editingMedicine.sgst || 0)) / 100;
      taxAmount = cgstAmount + sgstAmount;
    }

    const calculatedGrandTotal = calculatedTaxableAmount + taxAmount;
    setGrandTotal(Math.max(0, calculatedGrandTotal));
  };

  useEffect(() => {
    const taxType = watch("taxType");
    if (taxType === "central") {
      setValue("cgst", 0);
      setValue("sgst", 0);
    } else if (taxType === "state") {
      setValue("igst", 0);
    } else if (taxType === "noTax") {
      setValue("cgst", 0);
      setValue("sgst", 0);
      setValue("igst", 0);
    }
  }, [watch("taxType"), setValue]);

  useEffect(() => {
    // Calculate the base price
    const totalPurchasedUnit = watch("totalPurchasedUnit") || 0;
    const pricePerUnit = watch("pricePerUnit") || 0;
    const totalPrice = totalPurchasedUnit * pricePerUnit;

    // Calculate discount
    const discountPercentage = watch("discount") || 0;
    const discountAmount = (totalPrice * discountPercentage) / 100;

    // Calculate taxable amount (price after discount)
    const calculatedTaxableAmount = Math.max(0, totalPrice - discountAmount);
    setTaxableAmount(calculatedTaxableAmount);

    // Calculate tax on the taxable amount (after discount)
    const taxType = watch("taxType");
    let taxAmount = 0;

    if (taxType === "central") {
      const igst = watch("igst") || 0;
      taxAmount = (calculatedTaxableAmount * igst) / 100;
    } else if (taxType === "state") {
      const cgst = watch("cgst") || 0;
      const sgst = watch("sgst") || 0;
      // Calculate CGST and SGST separately then combine
      const cgstAmount = (calculatedTaxableAmount * cgst) / 100;
      const sgstAmount = (calculatedTaxableAmount * sgst) / 100;
      taxAmount = cgstAmount + sgstAmount;
    }

    // Calculate grand total: taxable amount + tax
    const calculatedGrandTotal = calculatedTaxableAmount + taxAmount;
    setGrandTotal(Math.max(0, calculatedGrandTotal)); // Ensure grand total is not negative

    // Set the total price in the form (before tax and discount)
    setValue("totalPrice", totalPrice);
  }, [
    watch("totalPurchasedUnit"),
    watch("pricePerUnit"),
    watch("cgst"),
    watch("sgst"),
    watch("igst"),
    watch("discount"),
    watch("taxType"),
    setValue,
  ]);

  // Calculate individual tax amounts for display
  const calculateCgstAmount = () => {
    if (watch("taxType") === "state") {
      return (taxableAmount * (watch("cgst") || 0)) / 100;
    }
    return 0;
  };

  const calculateSgstAmount = () => {
    if (watch("taxType") === "state") {
      return (taxableAmount * (watch("sgst") || 0)) / 100;
    }
    return 0;
  };

  const calculateIgstAmount = () => {
    if (watch("taxType") === "central") {
      return (taxableAmount * (watch("igst") || 0)) / 100;
    }
    return 0;
  };

  const onSubmit = async (data: PurchaseEntryType) => {
    try {
      const taxType = data.taxType;
      let taxPercentage = 0;

      if (taxType === "central") {
        taxPercentage = data.igst || 0;
      } else if (taxType === "state") {
        taxPercentage = (data.cgst || 0) + (data.sgst || 0);
      }

      const apiData = {
        ...data,
        taxPercentage,
        taxableAmount,
      };

      await ApiManager.patchPurchaseMedicine(editingMedicine._id, apiData);
      setAlert({
        severity: "success",
        message: "Medicine purchase entry updated successfully!",
      });

      reset();
      recall();
      onClose();
    } catch (error: any) {
      console.error("Error updating medicine details:", error);
      const errorMessage: string = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message ||
          "Failed to update medicine purchase entry.";
      setAlert({
        severity: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <BootstrapDialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Edit Medicine Purchase
      </DialogTitle>
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
      <DialogContent
        dividers
        sx={{
          p: 2,
          height: "contain",
          position: "relative",
          overflowY: "auto",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container rowSpacing={2} columnSpacing={1}>
            <Grid size={{ xs: 12, sm: 3 }}>
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
                    options={medicines || []}
                    getOptionLabel={(option) => option.name}
                    value={
                      medicines.find((med) => med._id === field.value) || null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue?._id);
                      setSelectedMedicine(newValue);
                    }}
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Unit Type
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={
                  selectedMedicine?.unitType ||
                  (editingMedicine?.medicine && typeof editingMedicine.medicine !== 'string'
                    ? editingMedicine.medicine.unitType
                    : "")
                }
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Base Unit Type
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={
                  selectedMedicine?.baseUnitType ||
                  (editingMedicine?.medicine && typeof editingMedicine.medicine !== 'string'
                    ? editingMedicine.medicine.baseUnitType
                    : "")
                }
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Total Purchased Unit
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                error={!!errors.totalPurchasedUnit}
                helperText={errors.totalPurchasedUnit?.message}
                inputProps={{ min: "0", step: "1" }}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                {...register("totalPurchasedUnit", {
                  required: true,
                  pattern: /^[0-9]*$/,
                })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Price Per Unit
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                error={!!errors.pricePerUnit}
                helperText={errors.pricePerUnit?.message}
                inputProps={{ min: "0", step: "0.01" }}
                {...register("pricePerUnit")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Total Price
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={(
                  (watch("totalPurchasedUnit") || 0) *
                  (watch("pricePerUnit") || 0) 
                ).toFixed(2)}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#444",
                    fontWeight: "600",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                MRP
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                error={!!errors.mrp}
                helperText={errors.mrp?.message}
                inputProps={{ min: "0", step: "0.01" }}
                {...register("mrp")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Batch Number
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="text"
                error={!!errors.batchNumber}
                helperText={errors.batchNumber?.message}
                {...register("batchNumber")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Tax Type
              </Typography>
              <Controller
                name="taxType"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    size="small"
                    fullWidth
                    error={!!fieldState.error}
                    displayEmpty
                    {...register("taxType")}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value || ""}
                  >
                    <MenuItem value="" disabled>
                      Select Tax Type
                    </MenuItem>
                    <MenuItem value="central">Central</MenuItem>
                    <MenuItem value="state">State</MenuItem>
                    <MenuItem value="noTax">No Tax</MenuItem>
                  </Select>
                )}
              />
              {errors.taxType && (
                <Typography sx={{ ml: 2 }} variant="caption" color="error">
                  {errors.taxType.message}
                </Typography>
              )}
            </Grid>

            {watch("taxType") === "central" && (
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  IGST (%)
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="number"
                  inputProps={{ min: "0", max: "100", step: "0.01" }}
                  error={!!errors.igst}
                  helperText={errors.igst?.message}
                  {...register("igst")}
                />
              </Grid>
            )}

            {watch("taxType") === "state" && (
              <>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    CGST (%)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ min: "0", max: "100", step: "0.01" }}
                    error={!!errors.cgst}
                    helperText={errors.cgst?.message}
                    {...register("cgst")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    SGST (%)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ min: "0", max: "100", step: "0.01" }}
                    error={!!errors.sgst}
                    helperText={errors.sgst?.message}
                    {...register("sgst")}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Selling Price
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

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Discount Percentage (%)
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                inputProps={{ min: "0", max: "100", step: "0.01" }}
                error={!!errors.discount}
                helperText={errors.discount?.message}
                {...register("discount")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Purchase Percentage
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={(
                  ((watch("pricePerUnit") || 0) / (watch("mrp") || 1)) *
                  100
                ).toFixed(2)}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#ff9800",
                    fontWeight: "600",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Sub Total
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={(
                  (watch("totalPurchasedUnit") || 0) *
                  (watch("pricePerUnit") || 0)
                ).toFixed(2)}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#444",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Discount Amount
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={(
                  ((watch("totalPurchasedUnit") || 0) *
                    (watch("pricePerUnit") || 0) *
                    (watch("discount") || 0)) /
                  100
                ).toFixed(2)}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#4caf50",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Taxable Amount
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={taxableAmount.toFixed(2)}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#444",
                    fontWeight: "600",
                  },
                }}
              />
            </Grid>

            {watch("taxType") === "state" && (
              <>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    CGST Amount ({watch("cgst") || 0}%)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    value={calculateCgstAmount().toFixed(2)}
                    disabled
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "#555",
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    SGST Amount ({watch("sgst") || 0}%)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    value={calculateSgstAmount().toFixed(2)}
                    disabled
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "#555",
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            {watch("taxType") === "central" && (
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  IGST Amount ({watch("igst") || 0}%)
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="number"
                  value={calculateIgstAmount().toFixed(2)}
                  disabled
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#555",
                    },
                  }}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Grand Total
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={grandTotal.toFixed(2)}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#1976d2",
                    fontWeight: "bold",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
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

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Purchase Date
              </Typography>
              <Controller
                name="purchaseDate"
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

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Medicine MFD :
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

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                HSN Code
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="text"
                error={!!errors.hsnCode}
                helperText={errors.hsnCode?.message}
                {...register("hsnCode")}
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
          startIcon={<Save size={18} />}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting && <CircularProgress size={20} />}
          Update
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default MedEditDrawer;