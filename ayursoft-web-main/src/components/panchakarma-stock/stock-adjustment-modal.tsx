import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Plus, Minus } from "lucide-react";
import { z } from "zod";
import { useAppContext } from "../../context/app-context";
import ApiManager from "../services/apimanager";

export enum StockAdjustType {
  ADD = "add",
  REDUCE = "reduce",
}

// Zod schema for validation
const stockAdjustmentSchema = z.object({
  medicine: z.string().min(1, "Medicine is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  adjustmentDate: z.date(),
  totalQuantity: z.string().refine(
    (val) => val === "" || (Number(val) > 0 && !isNaN(Number(val))),
    "Adjustment quantity must be greater than 0"
  ),
  adjustType: z.nativeEnum(StockAdjustType),
  reason: z.string().optional(),
});

export type CreateAdjustStockDto = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  selectedMedicine?: {
    _id: string;
    medicine: {
      _id: string;
      name: string;
      unitType?: string;
      totalQuantityInAUnit?: number;
    };
    batchNumber?: string;
    totalQuantity: number;
    unitType: string;
  };
  adjustType?: StockAdjustType;
  onSuccess?: () => void;
  isPanchakarma?: boolean;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  open,
  onClose,
  selectedMedicine,
  adjustType,
  onSuccess,
  isPanchakarma,
}) => {
  const { setAlert } = useAppContext();

  const [formData, setFormData] = useState<CreateAdjustStockDto>({
    medicine: "",
    batchNumber: "",
    adjustmentDate: new Date(),
    totalQuantity: "",
    adjustType: StockAdjustType.ADD,
    reason: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mainUnits, setMainUnits] = useState<string>(""); // For display (main units)

  useEffect(() => {
    if (selectedMedicine && adjustType) {
      setFormData({
        medicine: selectedMedicine.medicine._id,
        batchNumber: selectedMedicine.batchNumber || "",
        adjustmentDate: new Date(),
        totalQuantity: "", // Start with empty for adjustment quantity
        adjustType: adjustType,
        reason: "",
      });
      setMainUnits("");
    }
  }, [selectedMedicine, adjustType]);

  const handleInputChange = (field: keyof CreateAdjustStockDto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      // Basic Zod validation
      stockAdjustmentSchema.parse(formData);

      // Additional business logic validation
      const newErrors: { [key: string]: string } = {};

      const qty = formData.totalQuantity === "" ? 0 : Number(formData.totalQuantity);

      // For reduce type, check if adjustment quantity doesn't exceed current stock
      if (
        formData.adjustType === StockAdjustType.REDUCE &&
        selectedMedicine &&
        qty > selectedMedicine.totalQuantity
      ) {
        newErrors.totalQuantity =
          "Adjustment quantity cannot exceed current stock";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const adjustmentData = {
          medicine: formData.medicine,
          batchNumber: formData.batchNumber,
          adjustmentDate: formData.adjustmentDate.toISOString(),
          totalQuantity: formData.totalQuantity === "" ? 0 : Number(formData.totalQuantity),
          adjustType: formData.adjustType,
          reason: formData.reason || "",
        };

        if (isPanchakarma) {
          // For panchakarma flows, use dedicated adjust-stock endpoint
          await ApiManager.createPanchakarmaStockAdjustment(adjustmentData);
        } else {
          await ApiManager.adjustStock(adjustmentData);
        }

        // Show success alert
        setAlert({
          severity: "success",
          message: "Stock adjustment completed successfully!",
        });

        // Call success callback to reload data
        onSuccess?.();

        // Reset form and close modal
        handleClose();
      } catch (error) {
        console.error("Error adjusting stock:", error);
        setAlert({
          severity: "error",
          message: "Failed to adjust stock. Please try again.",
        });
      }
    }
  };

  const handleClose = () => {
    setFormData({
      medicine: "",
      batchNumber: "",
      adjustmentDate: new Date(),
      totalQuantity: "", // Reset to empty string for adjustment quantity
      adjustType: StockAdjustType.ADD,
      reason: "",
    });
    setMainUnits("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {adjustType === StockAdjustType.ADD ? (
            <Plus size={24} color="#4caf50" />
          ) : (
            <Minus size={24} color="#f44336" />
          )}
          <Typography
            variant="h6"
            sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
          >
            {adjustType === StockAdjustType.ADD ? "Add Stock" : "Reduce Stock"}
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {selectedMedicine && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Medicine Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Name:</strong> {selectedMedicine.medicine.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Stock:</strong>{" "}
              {(() => {
                const subUnitsPerMainUnit = selectedMedicine.medicine.totalQuantityInAUnit || 1;
                const mainUnitsStock = selectedMedicine.totalQuantity / subUnitsPerMainUnit;
                const mainUnitType = selectedMedicine.medicine.unitType || "";
                return `${mainUnitsStock.toFixed(2)} ${mainUnitType} (${selectedMedicine.totalQuantity} ${selectedMedicine.unitType})`;
              })()}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Batch Number and Adjustment Date in same row */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Batch Number"
              value={formData.batchNumber}
              onChange={(e) => handleInputChange("batchNumber", e.target.value)}
              error={!!errors.batchNumber}
              helperText={errors.batchNumber}
              fullWidth
              disabled
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Adjustment Type</InputLabel>
              <Select
                value={formData.adjustType}
                label="Adjustment Type"
                onChange={(e) =>
                  handleInputChange("adjustType", e.target.value)
                }
                disabled
              >
                <MenuItem value={StockAdjustType.ADD}>Add Stock</MenuItem>
                <MenuItem value={StockAdjustType.REDUCE}>Reduce Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Main Units and Sub Units in same row */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label={`Adjustment Quantity (${selectedMedicine?.medicine.unitType || "Main Units"})`}
              type="number"
              value={mainUnits}
              onChange={(e) => {
                const value = e.target.value;
                setMainUnits(value);

                const subUnitsPerMainUnit = selectedMedicine?.medicine.totalQuantityInAUnit || 1;
                const calculatedSubUnits = value === "" ? 0 : Number(value) * subUnitsPerMainUnit;
                handleInputChange("totalQuantity", calculatedSubUnits.toString());
              }}
              error={!!errors.totalQuantity}
              helperText={errors.totalQuantity}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: "0.01" }}
            />
            <TextField
              label="Adjustment Date"
              type="datetime-local"
              value={formData.adjustmentDate.toISOString().slice(0, 16)}
              onChange={(e) =>
                handleInputChange("adjustmentDate", new Date(e.target.value))
              }
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <TextField
            label="Reason"
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
            error={!!errors.reason}
            helperText={errors.reason}
            fullWidth
            multiline
            rows={3}
            placeholder="Enter the reason for stock adjustment..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ fontFamily: "Nunito, sans-serif" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          color={adjustType === StockAdjustType.ADD ? "success" : "error"}
        >
          {adjustType === StockAdjustType.ADD ? "Add Stock" : "Reduce Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockAdjustmentModal;
