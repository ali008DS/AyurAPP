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
  // Divider,
  // Box,
} from "@mui/material";
import { BookmarkPlus } from "lucide-react";
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

interface MedPurchaseDrawerProps {
  open: boolean;
  onClose: () => void;
  recall: () => void; // Function to recall the parent component
}

export interface Medicine {
  _id: string;
  name: string;
  __v: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  manufacturer: string; // ID reference to manufacturer
  baseUnitType: UnitTypeBase;
  totalQuantityInAUnit: number;
  unitType: UnitType;
}

function MedPurchaseDrawer({ open, onClose, recall }: MedPurchaseDrawerProps) {
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
    defaultValues: {
      medicine: "",
      totalPurchasedUnit: 0,
      pricePerUnit: 0,
      totalPrice: 0,
      mrp: 0,
      batchNumber: "",
      taxType: undefined,
      cgst: 0,
      sgst: 0,
      igst: 0,
      sellingPrice: 0,
      discount: 0,
      hsnCode: "",
      purchaseDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      expiryDate: dayjs().add(1, "year").format("YYYY-MM-DDTHH:mm:ss"),
      manufacturingDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    },
    resolver: zodResolver(PurchaseEntrySchema),
  });

  const onSubmit = async (data: PurchaseEntryType) => {
    try {
      // Calculate tax percentage for API submission
      const taxType = data.taxType;
      let taxPercentage = 0;

      if (taxType === "central") {
        taxPercentage = data.igst || 0;
      } else if (taxType === "state") {
        taxPercentage = (data.cgst || 0) + (data.sgst || 0);
      }

      // Prepare data for API
      const apiData = {
        ...data,
        taxPercentage, // Add calculated tax percentage for backend
        taxableAmount, // Add taxable amount for backend
      };

      await ApiManager.createPurchaseMedicine(apiData);
      console.log("Submitting medicine details:", apiData);
      setAlert({
        severity: "success",
        message: "Medicine purchase entry created successfully!",
      });
    } catch (error: any) {
      console.error("Error submitting medicine details:", error);
      const errorMessage: string = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message ||
          "Failed to create medicine purchase entry.";
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

  useEffect(() => {
    const fetchMedicines = async () => {
      const response = await ApiManager.getMedicines();
      setMedicines(response.data);
    };
    fetchMedicines();
  }, []);

  // Reset tax fields when tax type changes
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

  return (
    <BootstrapDialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Purchase Medicine
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
                value={selectedMedicine?.unitType || ""}
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
                value={selectedMedicine?.baseUnitType || ""}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                sdfghjkl;ljhygtfrdsfghjik
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={selectedMedicine?.totalQuantityInAUnit || ""}
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
                    value={watch("taxType") || ""}
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
                Purchase Percentage
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                value={(
                  100 - ((watch("pricePerUnit") || 0) / (watch("mrp") || 1)) *
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
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          disabled={isSubmitting}
          color="primary"
          startIcon={<BookmarkPlus size={18} />}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting && <CircularProgress size={20} />}
          Save
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default MedPurchaseDrawer;
