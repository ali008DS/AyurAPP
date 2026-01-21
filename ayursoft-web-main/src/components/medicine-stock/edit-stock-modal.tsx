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
import { Edit } from "lucide-react";
import { z } from "zod";
import { useAppContext } from "../../context/app-context";
import ApiManager from "../services/apimanager";

// Zod schema for validation
const editStockSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  totalQuantity: z.number().min(0, "Total quantity must be non-negative"),
  unitType: z.string().min(1, "Unit type is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  sellingPrice: z.string().refine(
    (val) => val === "" || (Number(val) >= 0 && !isNaN(Number(val))),
    "Selling price must be non-negative"
  ),
  manufacturingDate: z.string().min(1, "Manufacturing date is required"),
});

export type EditStockDto = z.infer<typeof editStockSchema>;

interface EditStockModalProps {
  open: boolean;
  onClose: () => void;
  selectedStock?: {
    _id: string;
    medicine: {
      _id: string;
      name: string;
      totalQuantityInAUnit: number;
    };
    totalQuantity: number;
    unitType: string;
    expiryDate?: string;
    batchNumber?: string;
    sellingPrice?: number;
    manufacturingDate?: string;
  };
  onSuccess?: () => void;
  isPanchakarma?: boolean;
}

const EditStockModal: React.FC<EditStockModalProps> = ({
  open,
  onClose,
  selectedStock,
  onSuccess,
  isPanchakarma = false,
}) => {
  const { setAlert } = useAppContext();

  const [formData, setFormData] = useState<EditStockDto>({
    medicineName: "",
    totalQuantity: 0,
    unitType: "",
    expiryDate: "",
    batchNumber: "",
    sellingPrice: "",
    manufacturingDate: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (selectedStock) {
      // Convert price from per subunit to per main unit for display
      // Example: 0.74 per ml × 270 ml per bottle = 200 per bottle
      const pricePerMainUnit = (selectedStock.sellingPrice || 0) * (selectedStock.medicine.totalQuantityInAUnit || 1);

      setFormData({
        medicineName: selectedStock.medicine.name,
        totalQuantity: selectedStock.totalQuantity,
        unitType: selectedStock.unitType,
        expiryDate: selectedStock.expiryDate ? new Date(selectedStock.expiryDate).toISOString().slice(0, 16) : "",
        batchNumber: selectedStock.batchNumber || "",
        sellingPrice: pricePerMainUnit.toFixed(2),
        manufacturingDate: selectedStock.manufacturingDate ? new Date(selectedStock.manufacturingDate).toISOString().slice(0, 16) : "",
      });
    }
  }, [selectedStock]);

  const handleInputChange = (field: keyof EditStockDto, value: any) => {
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
      editStockSchema.parse(formData);
      setErrors({});
      return true;
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
    if (validateForm() && selectedStock) {
      try {
        // Update medicine name if changed
        if (formData.medicineName !== selectedStock.medicine.name) {
          await ApiManager.updateMedicine(selectedStock.medicine._id, { name: formData.medicineName });
        }

        // Convert price from per main unit back to per subunit for storage
        // Example: 200 per bottle ÷ 270 ml per bottle = 0.74 per ml
        const pricePerSubunit = (formData.sellingPrice === "" ? 0 : Number(formData.sellingPrice)) / (selectedStock.medicine.totalQuantityInAUnit || 1);

        const updateData = {
          medicine: selectedStock.medicine._id,
          totalQuantity: formData.totalQuantity,
          unitType: formData.unitType,
          expiryDate: new Date(formData.expiryDate).toISOString(),
          batchNumber: formData.batchNumber,
          sellingPrice: pricePerSubunit,
          manufacturingDate: new Date(formData.manufacturingDate).toISOString(),
        };

        if (isPanchakarma) {
          await ApiManager.patchPanchakarmaStock(selectedStock._id, updateData);
        } else {
          await ApiManager.patchStock(selectedStock._id, updateData);
        }

        // Show success alert
        setAlert({
          severity: "success",
          message: "Stock updated successfully!",
        });

        // Call success callback to reload data
        onSuccess?.();

        // Reset form and close modal
        handleClose();
      } catch (error) {
        console.error("Error updating stock:", error);
        setAlert({
          severity: "error",
          message: "Failed to update stock. Please try again.",
        });
      }
    }
  };

  const handleClose = () => {
    setFormData({
      medicineName: "",
      totalQuantity: 0,
      unitType: "",
      expiryDate: "",
      batchNumber: "",
      sellingPrice: "",
      manufacturingDate: "",
    });
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
          <Edit size={24} color="#2196f3" />
          <Typography
            variant="h6"
            sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
          >
            Edit Stock
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {selectedStock && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Medicine Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Name:</strong> {selectedStock.medicine.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Stock:</strong> {selectedStock.totalQuantity}{" "}
              {selectedStock.unitType}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Medicine Name and Batch Number in same row */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Medicine Name"
              value={formData.medicineName}
              onChange={(e) => handleInputChange("medicineName", e.target.value)}
              error={!!errors.medicineName}
              helperText={errors.medicineName}
              fullWidth
              disabled
              size="small"
            />
            <TextField
              label="Batch Number"
              value={formData.batchNumber}
              onChange={(e) => handleInputChange("batchNumber", e.target.value)}
              error={!!errors.batchNumber}
              helperText={errors.batchNumber}
              fullWidth
              size="small"
            />
          </Box>

          {/* Total Quantity and Unit Type in same row */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Total Quantity"
              type="number"
              value={formData.totalQuantity}
              disabled
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Subunite Type</InputLabel>
              <Select
                value={formData.unitType}
                label="Subunit Type"
                disabled
                onChange={(e) =>
                  handleInputChange("unitType", e.target.value)
                }
                error={!!errors.unitType}
              >
                <MenuItem value="tablet">Tablet</MenuItem>
                <MenuItem value="capsule">Capsule</MenuItem>
                <MenuItem value="syrup">Syrup</MenuItem>
                <MenuItem value="injection">Injection</MenuItem>
                <MenuItem value="cream">Cream</MenuItem>
                <MenuItem value="ointment">Ointment</MenuItem>
                <MenuItem value="powder">Powder</MenuItem>
                <MenuItem value="sachet">Sachet</MenuItem>
              </Select>
              {errors.unitType && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.unitType}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Selling Price */}
          <TextField
            label="Selling Price per Main Unit"
            type="number"
            value={formData.sellingPrice}
            onChange={(e) =>
              handleInputChange("sellingPrice", e.target.value)
            }
            error={!!errors.sellingPrice}
            helperText={errors.sellingPrice}
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* Manufacturing Date and Expiry Date in same row */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Manufacturing Date"
              type="datetime-local"
              value={formData.manufacturingDate}
              onChange={(e) => handleInputChange("manufacturingDate", e.target.value)}
              error={!!errors.manufacturingDate}
              helperText={errors.manufacturingDate}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Expiry Date"
              type="datetime-local"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
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
          variant="contained"
          color="primary"
          sx={{ fontFamily: "Nunito, sans-serif" }}
        >
          Update Stock
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStockModal;