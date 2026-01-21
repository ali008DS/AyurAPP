import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Autocomplete,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { X, Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
import { z } from "zod";
import ApiManager from "../services/apimanager";
import AddDistributorDialog from "../distributor/add-distributor";
import { useAppContext } from "../../context/app-context";
import { useNavigate } from "react-router-dom";

interface MedPurchaseDrawerProps {
  open: boolean;
  recall: () => void;
  onClose: () => void;
  editData?: any;
  isPanchakarma?: boolean;
}

interface Distributor {
  _id: string;
  name: string;
  gstNo: string;
}

interface Medicine {
  _id: string;
  name: string;
  hsnCode?: string;
}

interface MedicineWithManufacturer {
  _id: string;
  name: string;
  hsnCode?: string;
  baseUnitType: string;
  unitType: string;
  totalQuantityInAUnit: number;
  manufacturer: string;
}

interface MedicineRow {
  id: string;
  medicine: Medicine | null;
  medicineDetails: MedicineWithManufacturer | null;
  purchasedUnits: number;
  totalPurchasedUnit: number;
  pricePerMainUnit: number;
  pricePerUnit: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  discountPercentage: number;
  discountPrice: number;
  discount2Percentage: number;
  discount2Price: number;
  taxPercentage: number;
  hsnCode: string;
  batchNumber: string;
  manufacturingDate: Dayjs | null;
  expiryDate: Dayjs | null;
}

function MedPurchaseDrawer({
  open,
  onClose,
  recall,
  editData,
  isPanchakarma = false,
}: MedPurchaseDrawerProps) {
  const { setAlert } = useAppContext();
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [medicines, setMedicines] = useState<MedicineWithManufacturer[]>([]);
  const [selectedDistributor, setSelectedDistributor] =
    useState<Distributor | null>(null);
  const [openAddDistributor, setOpenAddDistributor] = useState(false);
  const distributorInputRef = useRef<HTMLInputElement | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Dayjs | null>(dayjs());
  const [rows, setRows] = useState<MedicineRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {}
  );
  const [discount3Amount, setDiscount3Amount] = useState<number>(0);
  const [discount3Percent, setDiscount3Percent] = useState<number>(0);

  useEffect(() => {
    if (open) {
      fetchDistributors();
      fetchMedicines();
      if (editData) {

        setSelectedDistributor(editData.distributor);
        setInvoiceNumber(editData.invoiceNumber);
        setPurchaseDate(dayjs(editData.purchaseDate));
        setDiscount3Amount(editData.discount3Amount || 0);
        setDiscount3Percent(editData.discount3Percent || 0);

        const medicineRows = editData.medicines.map((med: any) => {
          const totalQtyInUnit = med.medicine.totalQuantityInAUnit || 1;




          const actualTotalPurchasedUnit = med.totalPurchasedUnit * totalQtyInUnit;
          const purchasedUnits = med.totalPurchasedUnit;


          const pricePerSubUnit = med.purchasePrice / actualTotalPurchasedUnit;
          const pricePerMainUnit = pricePerSubUnit * totalQtyInUnit;


          const sellingPriceMainUnit = med.sellingPrice * totalQtyInUnit;
          const mrpMainUnit = med.mrp * totalQtyInUnit;

          return {
            id: Date.now().toString() + Math.random(),
            medicine: {
              _id: med.medicine._id,
              name: med.medicine.name,
              hsnCode: med.hsnCode,
            },
            medicineDetails: med.medicine,
            purchasedUnits: purchasedUnits,
            totalPurchasedUnit: actualTotalPurchasedUnit,
            pricePerMainUnit: pricePerMainUnit,
            pricePerUnit: pricePerSubUnit,
            purchasePrice: med.purchasePrice,
            sellingPrice: sellingPriceMainUnit,
            mrp: mrpMainUnit,
            discountPercentage: med.discountPercentage || 0,
            discountPrice: med.purchasePrice * ((med.discountPercentage || 0) / 100),
            discount2Percentage: med.discount2Percentage || 0,
            discount2Price: med.discount2Price || 0,
            taxPercentage: med.taxPercentage,
            hsnCode: med.hsnCode,
            batchNumber: med.batchNumber,
            manufacturingDate: med.manufacturingDate
              ? dayjs(med.manufacturingDate)
              : null,
            expiryDate: dayjs(med.expiryDate),
          };
        });
        setRows(medicineRows);
      } else {

        setSelectedDistributor(null);
        setInvoiceNumber("");
        setPurchaseDate(dayjs());
        setRows([]);
        setDiscount3Amount(0);
        setDiscount3Percent(0);
        addRow();
      }
    }
  }, [open, editData]);

  // Convert between percentage and amount based on subtotal
  useEffect(() => {
    const subtotal = rows.reduce((sum, row) => sum + calculateFinalPrice(row), 0);

    if (discount3Percent > 0 && subtotal > 0) {
      setDiscount3Amount((subtotal * discount3Percent) / 100);
    }
  }, [discount3Percent, rows]);

  useEffect(() => {
    if (open) {

      setTimeout(() => distributorInputRef.current?.focus(), 120);
    }
  }, [open]);

  const fetchDistributors = async () => {
    try {
      const response = await ApiManager.getDistributor();
      setDistributors(response?.data || []);
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await ApiManager.getMedicinesWithManufacturer();
      setMedicines(response?.data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now().toString(),
        medicine: null,
        medicineDetails: null,
        purchasedUnits: "" as any,
        totalPurchasedUnit: "" as any,
        pricePerMainUnit: "" as any,
        pricePerUnit: "" as any,
        purchasePrice: 0,
        sellingPrice: "" as any,
        mrp: "" as any,
        discountPercentage: "" as any,
        discountPrice: 0,
        discount2Percentage: "" as any,
        discount2Price: 0,
        taxPercentage: "" as any,
        hsnCode: "",
        batchNumber: "",
        manufacturingDate: null,
        expiryDate: null,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof MedicineRow, value: any) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[id]) {
        delete newErrors[id][field as string];
        if (Object.keys(newErrors[id]).length === 0) delete newErrors[id];
      }
      return newErrors;
    });
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          if (field === "medicine" && value) {
            updated.hsnCode = value.hsnCode || "";
            updated.medicine = {
              _id: value._id,
              name: value.name,
              hsnCode: value.hsnCode,
            };
            updated.medicineDetails = value;
          }

          if (field === "purchasedUnits") {
            const units = Number(value) || 0;
            const qtyPerUnit = updated.medicineDetails?.totalQuantityInAUnit || 1;
            updated.totalPurchasedUnit = units * qtyPerUnit;


            const mainPrice = Number(updated.pricePerMainUnit) || 0;
            updated.purchasePrice = mainPrice * units;


            updated.pricePerUnit = qtyPerUnit > 0 ? mainPrice / qtyPerUnit : 0;

            const discount = Number(updated.discountPercentage) || 0;
            updated.discountPrice = updated.purchasePrice * (discount / 100);
          }

          if (field === "totalPurchasedUnit") {
            const subUnits = Number(value) || 0;
            const qtyPerUnit = updated.medicineDetails?.totalQuantityInAUnit || 1;
            updated.purchasedUnits = qtyPerUnit > 0 ? subUnits / qtyPerUnit : 0;


            const mainPrice = Number(updated.pricePerMainUnit) || 0;
            updated.purchasePrice = mainPrice * updated.purchasedUnits;


            updated.pricePerUnit = qtyPerUnit > 0 ? mainPrice / qtyPerUnit : 0;

            const discount = Number(updated.discountPercentage) || 0;
            updated.discountPrice = updated.purchasePrice * (discount / 100);
          }

          if (field === "pricePerMainUnit") {
            const mainPrice = Number(value) || 0;
            const qtyPerUnit = updated.medicineDetails?.totalQuantityInAUnit || 1;

            updated.pricePerUnit = qtyPerUnit > 0 ? mainPrice / qtyPerUnit : 0;


            const units = Number(updated.purchasedUnits) || 0;
            updated.purchasePrice = mainPrice * units;
            const discount = Number(updated.discountPercentage) || 0;
            updated.discountPrice = updated.purchasePrice * (discount / 100);
          }

          if (field === "pricePerUnit") {
            const price = Number(value) || 0;
            const qtyPerUnit = updated.medicineDetails?.totalQuantityInAUnit || 1;

            updated.pricePerMainUnit = price * qtyPerUnit;


            const units = Number(updated.purchasedUnits) || 0;
            updated.purchasePrice = updated.pricePerMainUnit * units;
            const discount = Number(updated.discountPercentage) || 0;
            updated.discountPrice = updated.purchasePrice * (discount / 100);
          }
          if (field === "discountPercentage") {
            const discount = Number(value) || 0;
            updated.discountPrice = updated.purchasePrice * (discount / 100);
          }
          if (field === "discountPrice") {
            updated.discountPercentage = updated.purchasePrice > 0
              ? (value / updated.purchasePrice) * 100
              : 0;
          }

          if (field === "discount2Percentage") {
            const discount2 = Number(value) || 0;

            const afterDiscount1 = updated.purchasePrice * (1 - (Number(updated.discountPercentage) || 0) / 100);
            updated.discount2Price = afterDiscount1 * (discount2 / 100);
          }

          if (field === "discount2Price") {
            const afterDiscount1 = updated.purchasePrice * (1 - (Number(updated.discountPercentage) || 0) / 100);
            updated.discount2Percentage = afterDiscount1 > 0
              ? (value / afterDiscount1) * 100
              : 0;
          }
          return updated;
        }
        return row;
      })
    );
  };

  const calculateFinalPrice = (row: MedicineRow) => {
    const discount1 = Number(row.discountPercentage) || 0;
    const discount2 = Number(row.discount2Percentage) || 0;
    const tax = Number(row.taxPercentage) || 0;


    const afterDiscount1 = row.purchasePrice * (1 - discount1 / 100);

    const afterDiscount2 = afterDiscount1 * (1 - discount2 / 100);

    const afterTax = afterDiscount2 * (1 + tax / 100);

    return afterTax;
  };

  const calculateTotals = () => {
    const taxableAmount = rows.reduce((sum, row) => {
      const discount1 = Number(row.discountPercentage) || 0;
      const discount2 = Number(row.discount2Percentage) || 0;
      const afterDiscount1 = row.purchasePrice * (1 - discount1 / 100);
      const afterDiscount2 = afterDiscount1 * (1 - discount2 / 100);
      return sum + afterDiscount2;
    }, 0);
    const subtotalAmount = rows.reduce(
      (sum, row) => sum + calculateFinalPrice(row),
      0
    );

    // Calculate discount3 based on the actual amount (which should be in sync with percentage)
    const discount3Effective = discount3Amount || 0;
    const totalAmount = subtotalAmount - discount3Effective;
    return { totalAmount, taxableAmount, subtotalAmount, discount3Effective };
  };

  const handleSubmit = async () => {

    const validRows = rows.filter((row) => row.medicine !== null);

    if (!selectedDistributor) {
      setAlert({ severity: "error", message: "Please select a distributor" });
      return;
    }
    if (validRows.length === 0) {
      setAlert({
        severity: "error",
        message: "Please add at least one medicine",
      });
      return;
    }


    const medicineSchema = z.object({
      medicine: z.object({ _id: z.string() }),
      totalPurchasedUnit: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val !== "" && Number(val) > 0,
          "Quantity must be greater than 0"
        )
        .refine((val) => Number(val) >= 0, "Quantity cannot be negative"),
      pricePerUnit: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val !== "" && Number(val) > 0,
          "Purchase price must be greater than 0"
        )
        .refine((val) => Number(val) >= 0, "Purchase price cannot be negative"),
      mrp: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val !== "" && Number(val) > 0,
          "MRP must be greater than 0"
        )
        .refine((val) => Number(val) >= 0, "MRP cannot be negative"),
      sellingPrice: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val === "" || Number(val) >= 0,
          "Selling price cannot be negative"
        ),
      discountPercentage: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val === "" || (Number(val) >= 0 && Number(val) <= 100),
          "Discount must be between 0-100"
        )
        .refine(
          (val) => val === "" || Number(val) >= 0,
          "Discount cannot be negative"
        ),
      discount2Percentage: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val === "" || (Number(val) >= 0 && Number(val) <= 100),
          "Discount2 must be between 0-100"
        )
        .refine(
          (val) => val === "" || Number(val) >= 0,
          "Discount2 cannot be negative"
        ),
      taxPercentage: z
        .union([z.number(), z.string()])
        .refine(
          (val) => val === "" || Number(val) >= 0,
          "Tax cannot be negative"
        ),
      hsnCode: z.string().min(1, "HSN Code is required"),
      batchNumber: z.string().min(1, "Batch number is required"),
      manufacturingDate: z
        .any()
        .refine((val) => val !== null, "Manufacturing date is required"),
      expiryDate: z
        .any()
        .refine((val) => val !== null, "Expiry date is required"),
    });


    const newErrors: Record<string, Record<string, string>> = {};
    for (let i = 0; i < validRows.length; i++) {
      try {
        medicineSchema.parse(validRows[i]);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const rowErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) rowErrors[err.path[0] as string] = err.message;
          });
          newErrors[validRows[i].id] = rowErrors;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      const firstErrorMsg = Object.values(firstError)[0];
      setAlert({ severity: "error", message: firstErrorMsg });
      return;
    }

    const { totalAmount, taxableAmount } = calculateTotals();

    const payload = {
      invoiceNumber,
      medicines: validRows.map((row) => {
        const qtyPerUnit = row.medicineDetails?.totalQuantityInAUnit || 1;





        const adjustedQuantity = Number(row.totalPurchasedUnit) / qtyPerUnit;


        const adjustedMrp = Number(row.mrp) / qtyPerUnit;
        const adjustedSellingPrice = Number(row.sellingPrice) / qtyPerUnit;

        return {
          medicine: row.medicine!._id,
          totalPurchasedUnit: adjustedQuantity,
          pricePerUnit: Number(row.pricePerUnit),
          purchasePrice: row.purchasePrice,
          mrp: adjustedMrp,
          batchNumber: row.batchNumber.toLowerCase().trim(),
          sellingPrice: adjustedSellingPrice,
          hsnCode: row.hsnCode,
          manufacturingDate: row.manufacturingDate?.toISOString(),
          expiryDate: row.expiryDate?.toISOString(),
          discountPercentage: Number(row.discountPercentage) || 0,
          discountPrice: row.discountPrice,
          discount2Percentage: Number(row.discount2Percentage) || 0,
          discount2Price: row.discount2Price,
          taxPercentage: Number(row.taxPercentage) || 0,
        };
      }),
      distributor: selectedDistributor._id,
      totalAmount,
      purchaseDate: purchaseDate?.toISOString(),
      taxableAmount,
      discount3Percent: discount3Percent || 0,
      discount3Amount: discount3Amount || 0,
    };

    setLoading(true);
    try {
      if (editData) {
        if (isPanchakarma) {
          await ApiManager.patchPanchakarmaPurchase(editData._id, payload);
        } else {
          await ApiManager.patchPurchaseMedicine(editData._id, payload);
        }
        setAlert({
          severity: "success",
          message: "Purchase updated successfully",
        });
      } else {
        if (isPanchakarma) {
          await ApiManager.createPanchakarmaPurchase(payload);
        } else {
          await ApiManager.createPurchaseMedicine(payload);
        }
        setAlert({
          severity: "success",
          message: "Purchase created successfully",
        });
      }
      recall();
      onClose();
    } catch (error: any) {
      console.error("Error saving purchase:", error);
      setAlert({
        severity: "error",
        message: Array.isArray(error?.response?.data?.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message ||
          `Failed to ${editData ? "update" : "create"} purchase`,
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const isDisabled = !selectedDistributor;

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            height: "90vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        <Box
          sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" component="h2">
              {editData ? "Edit Medicine Purchase" : "Bulk Medicine Purchase"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                startIcon={<Plus size={14} />}
                onClick={addRow}
                variant="outlined"
                sx={{
                  borderStyle: "dashed",
                  borderColor: "grey.500",
                  color: "grey.700",
                }}
                disabled={isDisabled}
              >
                Add Row
              </Button>
              <Button
                startIcon={<Plus size={14} />}
                onClick={() => setOpenAddDistributor(true)}
                variant="outlined"
                sx={{
                  borderStyle: "dashed",
                  borderColor: "primary.main",
                  color: "primary.main",
                }}
              >
                Add Distributor
              </Button>
              <Button
                variant="outlined"
                onClick={handleSubmit}
                disabled={!selectedDistributor || loading}
                sx={{ borderStyle: "dashed" }}
              >
                {loading
                  ? "Saving..."
                  : editData
                    ? "Update Purchase"
                    : "Save Purchase"}
              </Button>
              <IconButton onClick={onClose}>
                <X size={24} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={distributors}
              getOptionLabel={(option) => `${option.name} (${option.gstNo})`}
              value={selectedDistributor}
              openOnFocus
              onChange={(_, value) => setSelectedDistributor(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={(node) => {
                    distributorInputRef.current = node;
                  }}
                  label="Select Distributor *"
                  size="small"
                />
              )}
            />
            <TextField
              label="Invoice Number"
              size="small"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              sx={{ width: 200 }}
              disabled={isDisabled}
            />
            <DatePicker
              label="Purchase Date"
              value={purchaseDate}
              onChange={(date) => setPurchaseDate(date)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small", disabled: isDisabled } }}
              disabled={isDisabled}
            />
          </Box>

          <TableContainer
            component={Paper}
            sx={{ flex: 1, overflow: "auto", mb: 2 }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 200 }}>Medicine *</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Unit Type</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Subunit Type</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    Subunit in a Unit *
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    Purchasing Units Quantity *
                  </TableCell>
                  <TableCell sx={{ minWidth: 250 }}>
                    Purchasing subunits Quantity *
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    Main Unit Purchase Price *
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    Sub Unit Purchase Price *
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    Total Purchase Price
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    Selling Price / Main Unit
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>MRP / Main Unit *</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Purchase Margin %</TableCell>
                  {/* company discount */}
                  <TableCell sx={{ minWidth: 100 }}>Discount1 %</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Discount1 Amount</TableCell>
                  {/* distributor discount */}
                  <TableCell sx={{ minWidth: 100 }}>Discount2 %</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Discount2 Amount</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Tax %</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Final Price</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>HSN Code *</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Batch No *</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Mfg Date *</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Expiry Date *</TableCell>
                  <TableCell sx={{ minWidth: 60 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Autocomplete
                        disabled={isDisabled}
                        options={[
                          { _id: "NEW_MEDICINE", name: "➕ Add New Medicine", unitType: "", baseUnitType: "", manufacturer: "", totalQuantityInAUnit: 0, hsnCode: "" } as MedicineWithManufacturer,
                          ...medicines
                        ]}
                        getOptionLabel={(option) => option.name}
                        getOptionDisabled={(option) =>
                          option._id !== "NEW_MEDICINE" && (
                            !option.unitType ||
                            !option.baseUnitType ||
                            !option.manufacturer ||
                            !option.totalQuantityInAUnit
                          )
                        }
                        value={
                          medicines.find((m) => m._id === row.medicine?._id) ||
                          null
                        }
                        onChange={(_, value) => {
                          if (value?._id === "NEW_MEDICINE") {
                            onClose();
                            navigate("/medicine");
                            return;
                          }
                          if (value) {
                            updateRow(row.id, "medicine", value);
                          } else {
                            updateRow(row.id, "medicine", null);
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                fontWeight: option._id === "NEW_MEDICINE" ? 600 : 400,
                                color: option._id === "NEW_MEDICINE" ? "primary.main" : "inherit",
                                borderBottom: option._id === "NEW_MEDICINE" ? "1px solid #eee" : "none",
                                pb: option._id === "NEW_MEDICINE" ? 1 : 0,
                              }}
                            >
                              <Typography variant="body1" sx={{ fontWeight: option._id === "NEW_MEDICINE" ? 600 : 400 }}>
                                {option.name}
                              </Typography>
                              {option._id !== "NEW_MEDICINE" && (
                                <Typography
                                  variant="caption"
                                  fontWeight="bold"
                                  color="text.secondary"
                                >
                                  {option.unitType} ({option.baseUnitType}){" "}
                                  {option.totalQuantityInAUnit}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} size="small" disabled={isDisabled} />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary">
                        {row.medicineDetails
                          ? row.medicineDetails.unitType.toUpperCase()
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary">
                        {row.medicineDetails
                          ? row.medicineDetails.baseUnitType.toUpperCase()
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary">
                        {row.medicineDetails
                          ? row.medicineDetails.totalQuantityInAUnit
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.purchasedUnits === 'number' ? row.purchasedUnits.toFixed(2) : row.purchasedUnits}
                        onChange={(e) =>
                          updateRow(row.id, "purchasedUnits", e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        disabled={isDisabled || !row.medicineDetails}
                        placeholder="Units"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.totalPurchasedUnit === 'number' ? row.totalPurchasedUnit.toFixed(2) : row.totalPurchasedUnit}
                        onChange={(e) =>
                          updateRow(row.id, "totalPurchasedUnit", e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        error={!!errors[row.id]?.totalPurchasedUnit}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.totalPurchasedUnit}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.pricePerMainUnit === 'number' ? row.pricePerMainUnit.toFixed(2) : row.pricePerMainUnit}
                        onChange={(e) =>
                          updateRow(row.id, "pricePerMainUnit", e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        disabled={isDisabled || !row.medicineDetails}
                        placeholder="Price/Unit"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.pricePerUnit === 'number' ? row.pricePerUnit.toFixed(6) : row.pricePerUnit}
                        onChange={(e) =>
                          updateRow(row.id, "pricePerUnit", e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.000001" }}
                        error={!!errors[row.id]?.pricePerUnit}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.pricePerUnit}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.purchasePrice === 'number' ? row.purchasePrice.toFixed(2) : row.purchasePrice}
                        disabled
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.sellingPrice === 'number' ? row.sellingPrice.toFixed(2) : row.sellingPrice}
                        onChange={(e) =>
                          updateRow(row.id, "sellingPrice", e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        error={!!errors[row.id]?.sellingPrice}
                        disabled={isDisabled || !row.medicineDetails}
                        helperText={errors[row.id]?.sellingPrice}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.mrp === 'number' ? row.mrp.toFixed(2) : row.mrp}
                        onChange={(e) => updateRow(row.id, "mrp", e.target.value)}
                        inputProps={{ min: 0, step: "0.01" }}
                        error={!!errors[row.id]?.mrp}
                        disabled={isDisabled || !row.medicineDetails}
                        helperText={errors[row.id]?.mrp}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={
                          Number(row.sellingPrice) > 0
                            ? (
                              ((Number(row.sellingPrice) - Number(row.pricePerMainUnit)) /
                                Number(row.sellingPrice)) *
                              100
                            ).toFixed(2)
                            : 0
                        }
                        disabled
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.discountPercentage === 'number' ? row.discountPercentage.toFixed(2) : row.discountPercentage}
                        onChange={(e) =>
                          updateRow(row.id, "discountPercentage", e.target.value)
                        }
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        error={!!errors[row.id]?.discountPercentage}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.discountPercentage}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.discountPrice === 'number' ? row.discountPrice.toFixed(2) : row.discountPrice}
                        onChange={(e) =>
                          updateRow(row.id, "discountPrice", +e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        disabled={isDisabled}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.discount2Percentage === 'number' ? row.discount2Percentage.toFixed(2) : row.discount2Percentage}
                        onChange={(e) =>
                          updateRow(row.id, "discount2Percentage", e.target.value)
                        }
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        error={!!errors[row.id]?.discount2Percentage}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.discount2Percentage}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.discount2Price === 'number' ? row.discount2Price.toFixed(2) : row.discount2Price}
                        onChange={(e) =>
                          updateRow(row.id, "discount2Price", +e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        disabled={isDisabled}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof row.taxPercentage === 'number' ? row.taxPercentage.toFixed(2) : row.taxPercentage}
                        onChange={(e) =>
                          updateRow(row.id, "taxPercentage", e.target.value)
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        error={!!errors[row.id]?.taxPercentage}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.taxPercentage}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={calculateFinalPrice(row).toFixed(2)}
                        disabled
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.hsnCode}
                        onChange={(e) =>
                          updateRow(row.id, "hsnCode", e.target.value)
                        }
                        error={!!errors[row.id]?.hsnCode}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.hsnCode}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.batchNumber}
                        onChange={(e) =>
                          updateRow(row.id, "batchNumber", e.target.value)
                        }
                        error={!!errors[row.id]?.batchNumber}
                        disabled={isDisabled}
                        helperText={errors[row.id]?.batchNumber}
                      />
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        value={row.manufacturingDate}
                        onChange={(date) =>
                          updateRow(row.id, "manufacturingDate", date)
                        }
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!errors[row.id]?.manufacturingDate,
                            helperText: errors[row.id]?.manufacturingDate,
                            disabled: isDisabled,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        value={row.expiryDate}
                        onChange={(date) => updateRow(row.id, "expiryDate", date)}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!errors[row.id]?.expiryDate,
                            helperText: errors[row.id]?.expiryDate,
                            disabled: isDisabled,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1 || isDisabled}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              <TextField
                label="Bill Discount (%)"
                type="number"
                size="small"
                value={discount3Percent || ''}
                onChange={(e) => {
                  const percent = Number(e.target.value) || 0;
                  setDiscount3Percent(percent);
                  setDiscount3Amount(0);
                }}
                inputProps={{ min: 0, max: 100, step: "0.01" }}
                disabled={isDisabled}
                sx={{ width: 260 }}
                helperText="Percentage discount on total bill"
              />
              <TextField
                label="Bill Discount Amount"
                type="number"
                size="small"
                value={discount3Amount || ''}
                onChange={(e) => {
                  const amount = Number(e.target.value) || 0;
                  setDiscount3Amount(amount);
                  // Clear percentage to avoid conflicts
                  setDiscount3Percent(0);
                }}
                inputProps={{ min: 0, step: "0.01" }}
                disabled={isDisabled}
                sx={{ width: 260 }}
                helperText="Overall discount amount on total bill"
              />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Taxable Amount: ₹{totals.taxableAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subtotal (with tax): ₹{totals.subtotalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bill Discount: -₹{(totals.discount3Effective || 0).toFixed(2)}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                Total Purchase Amount: ₹{totals.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <AddDistributorDialog
        open={openAddDistributor}
        onClose={() => setOpenAddDistributor(false)}
        recall={async () => {
          await fetchDistributors();
          setOpenAddDistributor(false);
        }}
      />
    </>
  );
}

export default MedPurchaseDrawer;
