import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Plus, Trash2 } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import dayjs, { Dayjs } from "dayjs";
import ApiManager from "../components/services/apimanager";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicineSaleSchema,
  MedicineSaleType,
} from "../utils/validationSchemas";
import { useAppContext } from "../context/app-context";
import { StockItem } from "../components/department-management/types";
import { useNavigate } from "react-router-dom";

const sellingUnitTypes = [
  { label: "Ointment", value: "ointment-1", quantity: 1 },
  { label: "Avleh", value: "avleh-1", quantity: 1 },
  { label: "Oil", value: "oil-1", quantity: 1 },
  { label: "Tablet", value: "tablet-1", quantity: 1 },
  { label: "Syrup", value: "syrup-1", quantity: 1 },
  { label: "Capsule", value: "capsule-1", quantity: 1 },
  { label: "Injection", value: "injection-1", quantity: 1 },
  { label: "Strip", value: "strip-10", quantity: 10 },
  { label: "Strip", value: "strip-15", quantity: 15 },
  { label: "Bottle", value: "bottle-1", quantity: 1 },
  { label: "Bottle", value: "bottle-10", quantity: 10 },
  { label: "Bottle", value: "bottle-30", quantity: 30 },
  { label: "Bottle", value: "bottle-60", quantity: 60 },
  { label: "Bottle", value: "bottle-100", quantity: 100 },
  { label: "Bottle", value: "bottle-1000", quantity: 1000 },
  { label: "Box", value: "box-10", quantity: 10 },
  { label: "Box", value: "box-30", quantity: 30 },
  { label: "Box", value: "box-100", quantity: 100 },
  { label: "Jar", value: "jar-4000", quantity: 4000 },
  { label: "Jar", value: "jar-5000", quantity: 5000 },
  { label: "Jar", value: "jar-6000", quantity: 6000 },
];

// Group quantities by type
const unitTypeGroups = sellingUnitTypes.reduce((acc, item) => {
  if (!acc[item.label]) acc[item.label] = [];
  acc[item.label].push(item.quantity);
  return acc;
}, {} as Record<string, number[]>);

const uniqueTypes = Object.keys(unitTypeGroups);

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  age: string;
  address?: string;
  city?: string;
  state?: string;
}

function MedicineSale() {
  const { setAlert, websiteIdentity } = useAppContext();
  const router = useNavigate();
  const theme = useTheme();
  const [stockMedicines, setStockMedicines] = useState<StockItem[]>([]);
  // Replace patient-search state + handlers with debounced server search (use same API as SearchPage)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientPage] = useState<number>(1);
  const patientLimit = 50;
  const [counter, setCounter] = useState(1);
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<string[]>([]);

  const form = useForm<MedicineSaleType>({
    resolver: zodResolver(MedicineSaleSchema),
    defaultValues: {
      medicines: [
        {
          medicine: "",
          stockItemId: "",
          totalUnit: 1,
          totalQuantityInAUnit: 1,
          totalPrice: 0,
        },
      ],
      status: "paid",
      patientType: "patient",
      patient: null,
      nonPatientName: "",
      nonPatientPhone: "",
      saleDate: dayjs().toISOString(), // Set today's date as default
      discount: 0,
      totalAmount: 0,
      bank: "",
      paymentType: "cash",
      paidAmount: 0,
    },
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  // Log form errors for debugging
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  // Fetch stock medicines on component mount
  useEffect(() => {
    const fetchStockMedicines = async () => {
      try {
        const data = await ApiManager.getStockMedicine();
        const medicineData = data?.data || [];
        setStockMedicines(medicineData);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchStockMedicines();

    const fetchBanks = async () => {
      try {
        const resp = await ApiManager.getBankDetails();
        const bankData = resp?.data?.data ?? resp?.data ?? [];
        setBanks(Array.isArray(bankData) ? bankData : []);
      } catch (err) {
        console.error("Error fetching banks:", err);
        setBanks([]);
      }
    };

    fetchBanks();
  }, [counter]);

  // debounce input
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedInputValue(inputValue.trim()),
      400
    );
    return () => clearTimeout(timer);
  }, [inputValue]);

  // fetch patients using the same API/behaviour as SearchPage
  useEffect(() => {
    if (!debouncedInputValue || debouncedInputValue.length < 2) {
      setPatients([]);
      setLoadingPatients(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingPatients(true);
      try {
        const resp = await ApiManager.getPatients(
          patientPage,
          patientLimit,
          debouncedInputValue
        );
        const rows = resp?.data?.data ?? [];
        if (!cancelled) setPatients(rows);
      } catch (err) {
        console.error("Error fetching patients:", err);
        if (!cancelled) setPatients([]);
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedInputValue, patientPage]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  const watchedMedicines = useWatch({
    control: form.control,
    name: "medicines",
  });
  const watchedDiscount = useWatch({
    control: form.control,
    name: "discount",
  });

  const watchedStatus = useWatch({
    control: form.control,
    name: "status",
  });
  const watchedSaleDate = useWatch({
    control: form.control,
    name: "saleDate",
  });
  const watchedPaymentType = useWatch({
    control: form.control,
    name: "paymentType",
  });
  const watchedPatientType = useWatch({
    control: form.control,
    name: "patientType",
  });
  const watchedPaidAmount = useWatch({
    control: form.control,
    name: "paidAmount",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const processedData = {
      ...data,
      totalAmount: calculateGrandTotal(),
      paymentType: data.paymentType,
      bank: data.paymentType === "online" ? data.bank || "" : undefined,
      paidAmount: data.paidAmount || 0,
      medicines: (data.medicines || []).map((medicine) => ({
        medicine: medicine.medicine,
        register: medicine.stockItemId,
        sellingUnitType: medicine.sellingUnitType,
        totalUnit: medicine.totalUnit || 0,
        totalQuantityInAUnit: medicine.totalQuantityInAUnit || 1,
        price: medicine.price || 0,
        totalPrice: medicine.totalPrice ?? 0,
        batchNumber: medicine.batchNumber,
      })),
    };

    try {
      const response = await ApiManager.createSaleMedicine(processedData);
      // API may return created object under response.data.data or response.data
      const created = response?.data?.data ?? response?.data ?? null;
      const saleId = created?._id ?? created?.id ?? null;

      setAlert({
        severity: "success",
        message: "Medicine sale invoice created successfully!",
      });

      if (saleId) {
        // navigate to the view page for the newly created sale
        router(`/medicine-sale-view/${saleId}`);
        return;
      }

      // Fallback: try to find the created sale by invoiceNumber or by date+amount
      try {
        const listResp = await ApiManager.getSaleMedicine();
        const list = listResp?.data || [];
        const match = list.find(
          (s: any) =>
            s.totalAmount === processedData.totalAmount &&
            new Date(s.saleDate).toISOString() === processedData.saleDate
        );
        if (match && match._id) {
          router(`/medicine-sale-view/${match._id}`);
          return;
        }
      } catch (e) {
        console.error("Fallback fetch failed:", e);
      }

      // fallback behavior if no id returned or match found
      form.reset();
      setCounter(counter + 1); // Increment counter to refetch data
      setSelectedPatient(null);
      setInputValue("");
    } catch (error: any) {
      console.error("Error submitting medicine sale:", error);
      setAlert({
        severity: "error",
        message: error?.message || "Failed to create medicine sale invoice.",
      });
    }
  });
  const calculateSubTotal = () => {
    return (watchedMedicines || []).reduce(
      (total, item) => total + (item.totalPrice || 0),
      0
    );
  };

  const calculateDiscount = () => {
    return (calculateSubTotal() * (watchedDiscount || 0)) / 100;
  };

  const calculateGrandTotal = () => {
    return calculateSubTotal() - calculateDiscount();
  };

  const addItem = () => {
    append({
      medicine: "",
      stockItemId: "",
      sellingUnitType: "",
      totalUnit: 1,
      totalQuantityInAUnit: 1,
      price: 0,
      totalPrice: 0,
      batchNumber: "",
    });
    setSelectedTypes([...selectedTypes, ""]);
    setSelectedQuantities([...selectedQuantities, ""]);
  };

  // Calculate totalPrice for each medicine when pricePerUnit or totalUnit changes
  useEffect(() => {
    (watchedMedicines || []).forEach((medicine, index) => {
      // Total sub-units = totalUnit × totalQuantityInAUnit
      const totalSubUnits = (medicine.totalUnit || 0) * (medicine.totalQuantityInAUnit || 1);
      // Total price = price per sub-unit × total sub-units
      const totalPrice = (medicine.price || 0) * totalSubUnits;
      if (medicine.totalPrice !== totalPrice) {
        form.setValue(`medicines.${index}.totalPrice`, totalPrice);
      }
    });
  }, [watchedMedicines, form]);

  // Update totalAmount when discount or medicines change
  useEffect(() => {
    const total = calculateGrandTotal();
    form.setValue("totalAmount", total);
  }, [watchedMedicines, watchedDiscount, form]);

  // Update status based on remaining amount when paid amount changes
  useEffect(() => {
    const grandTotal = calculateGrandTotal();
    const paidAmount = watchedPaidAmount || 0;
    const remainingAmount = grandTotal - paidAmount;

    if (remainingAmount > 0) {
      form.setValue("status", "pending");
    } else {
      form.setValue("status", "paid");
    }
  }, [watchedPaidAmount, watchedMedicines, watchedDiscount, form]);

  return (
    <Box
      className="custom-scrollbar"
      sx={{
        minHeight: "100vh",
        px: 3,
        maxHeight: "100vh",
        overflow: "auto",
      }}
    >
      <HeadingText name="Medicine Sale" />
      {/* Invoice Header */}
      <Box
        sx={{
          mx: 1,
          mb: 8,
        }}
      >
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" error={!!errors.status}>
              <InputLabel>Status</InputLabel>
              <Select
                {...form.register("status")}
                label="Status"
                value={watchedStatus || "paid"}
                disabled
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Sale Date"
              value={watchedSaleDate ? dayjs(watchedSaleDate) : null}
              onChange={(newValue: Dayjs | null) => {
                form.setValue(
                  "saleDate",
                  newValue ? newValue.toISOString() : ""
                );
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors.saleDate,
                  helperText: errors.saleDate?.message,
                },
              }}
              format="DD/MM/YYYY"
              views={["year", "month", "day"]}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" error={!!errors.patientType}>
              <InputLabel>Patient Type</InputLabel>
              <Select
                {...form.register("patientType")}
                label="Patient Type"
                value={watchedPatientType || "patient"}
                onChange={(e) => {
                  form.setValue(
                    "patientType",
                    e.target.value as "patient" | "nonPatient"
                  );
                  if (e.target.value === "patient") {
                    form.setValue("nonPatientName", "");
                    form.setValue("nonPatientPhone", "");
                  } else {
                    form.setValue("patient", null);
                    setSelectedPatient(null);
                    setInputValue("");
                  }
                }}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="nonPatient">Non Patient</MenuItem>
              </Select>
              {errors.patientType && (
                <FormHelperText>{errors.patientType.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            {watchedPatientType === "patient" ? (
              <Autocomplete
                id="patient-search"
                options={patients}
                value={selectedPatient}
                isOptionEqualToValue={(option, value) =>
                  option?._id === value?._id
                }
                getOptionLabel={(option: any) =>
                  option
                    ? `${option.firstName || ""} ${option.lastName || ""} ${option.uhId
                      ? `(${option.uhId})`
                      : `(${option.phone || "No Phone"})`
                      }`.trim()
                    : ""
                }
                filterOptions={(options, state) => {
                  const q = (state.inputValue || "").trim().toLowerCase();
                  if (!q) return options;
                  return options.filter((o: any) => {
                    const fields = [
                      o.firstName,
                      o.lastName,
                      `${o.firstName || ""} ${o.lastName || ""}`,
                      o.phone,
                      o.email,
                      o.uhId,
                      o.opdId,
                      o.ipdId,
                      o.address,
                      o.city,
                      o.state,
                    ];
                    return fields.some((f) =>
                      f ? f.toString().toLowerCase().includes(q) : false
                    );
                  });
                }}
                loading={loadingPatients}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) =>
                  setInputValue(newInputValue)
                }
                onChange={(_, newValue) => {
                  setSelectedPatient(newValue);
                  form.setValue("patient", newValue ? newValue._id : null);
                }}
                // make dropdown option text smaller
                ListboxProps={{
                  sx: {
                    "& li": { py: 0.5 }, // tighter vertical padding
                  },
                }}
                sx={{
                  "& .MuiAutocomplete-option": { fontSize: "12px" }, // smaller option text
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Patient"
                    fullWidth
                    size="small"
                    variant="outlined"
                    error={!!errors.patient}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingPatients ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option: any) => (
                  <li {...props}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, lineHeight: 1.1 }}>
                        {option.firstName} {option.lastName}{" "}
                        {option.uhId ? `• UHID-RAH :${option.uhId}` : ""}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: "text.secondary" }}
                      >
                        {option.phone || "No Phone"}{" "}
                        {option.city ? `• ${option.city}` : ""}{" "}
                        {option.state ? `• ${option.state}` : ""}
                      </Typography>
                    </Box>
                  </li>
                )}
                noOptionsText={
                  inputValue.length < 2
                    ? "Type at least 2 characters to search"
                    : "No patients found"
                }
              />
            ) : (
              <>
                <TextField
                  {...form.register("nonPatientName")}
                  fullWidth
                  label="Name"
                  size="small"
                  variant="outlined"
                  error={!!errors.nonPatientName}
                  helperText={errors.nonPatientName?.message}
                  sx={{ mb: 1 }}
                />
                <TextField
                  {...form.register("nonPatientPhone")}
                  fullWidth
                  label="Phone"
                  size="small"
                  variant="outlined"
                  error={!!errors.nonPatientPhone}
                  helperText={errors.nonPatientPhone?.message}
                />
              </>
            )}
          </Grid>
        </Grid>
        {/* From and To */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              square={false}
              sx={{ p: 2, height: "80%" }}
            >
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                From:
              </Typography>
              <Typography variant="body1" fontWeight="semiBold">
                {websiteIdentity.clinicName} {websiteIdentity.description}
              </Typography>
              {websiteIdentity.address && (
                <Typography variant="body2">
                  {websiteIdentity.address}
                </Typography>
              )}
              {websiteIdentity.phoneNumber && (
                <Typography variant="body2">{websiteIdentity.phoneNumber}</Typography>
              )}
              {websiteIdentity.email && (
                <Typography variant="body2">{websiteIdentity.email}</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: "80%" }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  To:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {watchedPatientType === "patient" ? (
                  selectedPatient ? (
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPatient.phone || "No Phone"} •{" "}
                        {selectedPatient.email || "No Email"}
                      </Typography>
                      {selectedPatient.address && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {selectedPatient.address}
                          {selectedPatient.city && `, ${selectedPatient.city}`}
                          {selectedPatient.state &&
                            `, ${selectedPatient.state}`}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    "No patient selected"
                  )
                ) : (
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {form.watch("nonPatientName") || "No Name"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {form.watch("nonPatientPhone") || "No Phone"}
                    </Typography>
                  </Box>
                )}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        {/* Invoice Details */}
        <Box mb={4} mt={1}>
          <Typography fontWeight="bold" mb={1} color="#333" fontSize="0.875rem">
            Detail
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "WhiteSmoke" }}>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="3%">
                    #
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }}>
                    Medicine Name
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="10%">
                    Type
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="6%">
                    Total Units
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="6%">
                    Sub Units
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="8%">
                    Total Price
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="8%">
                    Batch No.
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 1, py: 0.5, fontSize: "0.65rem", fontWeight: 600 }} width="5%">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell align="left" sx={{ px: 1, py: 0.5, fontSize: "0.65rem" }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ px: 1, py: 0.5 }}>
                      <Autocomplete
                        slotProps={{ paper: { style: { width: "100%" } } }}
                        options={[
                          { _id: "NEW_MEDICINE", medicine: { _id: "", name: "➕ Add New Medicine", unitType: "", totalQuantityInAUnit: 0 }, totalQuantity: 1, batchNumber: "", sellingPrice: 0 } as StockItem,
                          ...stockMedicines.slice().filter((med: any) => {
                            const baseQty = med.totalQuantity || 0;
                            const subUnitsPerMainUnit = med.medicine?.totalQuantityInAUnit || 1;
                            const mainUnits = Math.floor(baseQty / subUnitsPerMainUnit);
                            return mainUnits > 0;
                          }).sort((a: any, b: any) => {
                            const nameA = (a.medicine?.name || "").toLowerCase();
                            const nameB = (b.medicine?.name || "").toLowerCase();
                            const batchA = (a.batchNumber || "").toLowerCase();
                            const batchB = (b.batchNumber || "").toLowerCase();

                            // First compare by name alphabetically
                            if (nameA !== nameB) {
                              return nameA.localeCompare(nameB);
                            }

                            // If same name, sort by batch number
                            return batchA.localeCompare(batchB);
                          })
                        ]}
                        getOptionLabel={(option) => {
                          if (option._id === "NEW_MEDICINE") {
                            return option.medicine.name;
                          }
                          const baseQty = option.totalQuantity || 0;
                          const subUnitsPerMainUnit = option.medicine?.totalQuantityInAUnit || 1;
                          const mainUnits = Math.floor(baseQty / subUnitsPerMainUnit);
                          const mainUnitType = option.medicine?.unitType || "";
                          return `${option.medicine.name}${option.batchNumber ? ` • Batch: ${option.batchNumber}` : ""} • ${mainUnits} ${mainUnitType}`;
                        }}
                        isOptionEqualToValue={(option: any, value: any) =>
                          (option?._id || option?.id) === (value?._id || value?.id)
                        }
                        filterOptions={(options, state) => {
                          const q = (state.inputValue || "").trim().toLowerCase();
                          // Always keep "Add New Medicine" at the top
                          const newMedicineOption = options.find((opt: any) => opt._id === "NEW_MEDICINE");
                          const otherOptions = options.filter((opt: any) => opt._id !== "NEW_MEDICINE");

                          if (!q) {
                            return newMedicineOption ? [newMedicineOption, ...otherOptions] : otherOptions;
                          }
                          const matches = otherOptions.filter((opt: any) => {
                            const name = (opt.medicine?.name || "").toLowerCase();
                            const batch = (opt.batchNumber || "").toLowerCase();
                            const unit = (opt.unitType || "").toLowerCase();
                            return (
                              name.includes(q) ||
                              batch.includes(q) ||
                              unit.includes(q)
                            );
                          });
                          // sort by medicine name first (alphabetically), then by batch
                          matches.sort((a: any, b: any) => {
                            const nameA = (a.medicine?.name || "").toLowerCase();
                            const nameB = (b.medicine?.name || "").toLowerCase();
                            const batchA = (a.batchNumber || "").toLowerCase();
                            const batchB = (b.batchNumber || "").toLowerCase();

                            // First compare by name alphabetically
                            if (nameA !== nameB) {
                              return nameA.localeCompare(nameB);
                            }

                            // If same name, sort by batch number
                            return batchA.localeCompare(batchB);
                          });
                          return newMedicineOption ? [newMedicineOption, ...matches] : matches;
                        }}
                        value={
                          stockMedicines.find(
                            (sm) => sm._id === watchedMedicines?.[index]?.stockItemId
                          ) || null
                        }
                        onChange={(_, newValue) => {
                          if (newValue?._id === "NEW_MEDICINE") {
                            router("/medicine");
                            return;
                          }
                          if (newValue) {
                            if (newValue.totalQuantity <= 0) {
                              setAlert({
                                severity: "error",
                                message: `Medicine "${newValue.medicine.name}" is out of stock.`,
                              });
                              return;
                            }
                            form.setValue(
                              `medicines.${index}.medicine`,
                              newValue.medicine._id
                            );
                            form.setValue(
                              `medicines.${index}.stockItemId`,
                              newValue._id
                            );
                            form.setValue(
                              `medicines.${index}.price`,
                              newValue.sellingPrice
                            );
                            form.setValue(
                              `medicines.${index}.batchNumber`,
                              newValue.batchNumber
                            );

                            // Auto-fill Type and Sub Units from medicine data
                            const medicineUnitType =
                              newValue.medicine.unitType || "";
                            const medicineQuantity =
                              newValue.medicine.totalQuantityInAUnit || 1;

                            // Capitalize first letter for Type field
                            const typeValue =
                              medicineUnitType.charAt(0).toUpperCase() +
                              medicineUnitType.slice(1);

                            // Update state arrays for Type and Sub Units
                            const newTypes = [...selectedTypes];
                            newTypes[index] = typeValue;
                            setSelectedTypes(newTypes);

                            const newQuantities = [...selectedQuantities];
                            newQuantities[index] = medicineQuantity.toString();
                            setSelectedQuantities(newQuantities);

                            // Update form values
                            const sellingUnitTypeValue = `${medicineUnitType.toLowerCase()}-${medicineQuantity}`;
                            form.setValue(
                              `medicines.${index}.sellingUnitType`,
                              sellingUnitTypeValue
                            );
                            form.setValue(
                              `medicines.${index}.totalQuantityInAUnit`,
                              medicineQuantity
                            );
                          } else {
                            form.setValue(`medicines.${index}.medicine`, "");
                            form.setValue(`medicines.${index}.stockItemId`, "");
                            form.setValue(`medicines.${index}.price`, 0);
                          }
                        }}
                        renderOption={(props, option) => {
                          if (option._id === "NEW_MEDICINE") {
                            return (
                              <li {...props}>
                                <Typography sx={{ fontSize: "0.75rem", lineHeight: 1.4, fontWeight: 600, color: "primary.main", borderBottom: "1px solid #eee", pb: 0.5, width: "100%" }}>
                                  {option.medicine.name}
                                </Typography>
                              </li>
                            );
                          }
                          const baseQty = option.totalQuantity || 0;
                          const subUnitsPerMainUnit = option.medicine?.totalQuantityInAUnit || 1;
                          const mainUnits = Math.floor(baseQty / subUnitsPerMainUnit);
                          const mainUnitType = option.medicine?.unitType || "";
                          return (
                            <li {...props}>
                              <Typography sx={{ fontSize: "0.75rem", lineHeight: 1.4 }}>
                                {option.medicine.name} • Batch: {option.batchNumber?.toUpperCase() || "N/A"} • {mainUnits} {mainUnitType}
                              </Typography>
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            placeholder="Select medicine"
                            variant="outlined"
                            error={!!errors.medicines?.[index]?.medicine}
                            helperText={
                              errors.medicines?.[index]?.medicine?.message
                            }
                            sx={{
                              "& .MuiInputBase-root": { minHeight: "30px" },
                              "& .MuiInputBase-input": { fontSize: "0.65rem", py: "4px" }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 1, py: 0.5 }}>
                      <Autocomplete
                        options={uniqueTypes}
                        value={selectedTypes[index] || ""}
                        onChange={(_, newValue) => {
                          const newTypes = [...selectedTypes];
                          newTypes[index] = newValue || "";
                          setSelectedTypes(newTypes);

                          // Auto-select first quantity option when type is selected
                          const firstQuantity = newValue
                            ? (unitTypeGroups[newValue] || [])[0]?.toString() ||
                            ""
                            : "";
                          const newQuantities = [...selectedQuantities];
                          newQuantities[index] = firstQuantity;
                          setSelectedQuantities(newQuantities);

                          // Update form values
                          if (newValue && firstQuantity) {
                            const value = `${newValue.toLowerCase()}-${firstQuantity}`;
                            const quantity = parseInt(firstQuantity) || 1;
                            form.setValue(
                              `medicines.${index}.sellingUnitType`,
                              value
                            );
                            form.setValue(
                              `medicines.${index}.totalQuantityInAUnit`,
                              quantity
                            );
                          } else {
                            form.setValue(
                              `medicines.${index}.sellingUnitType`,
                              ""
                            );
                            form.setValue(
                              `medicines.${index}.totalQuantityInAUnit`,
                              1
                            );
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Type"
                            sx={{
                              "& .MuiInputBase-root": { minHeight: "30px" },
                              "& .MuiInputBase-input": { fontSize: "0.65rem", py: "4px" }
                            }}
                          />
                        )}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ px: 1, py: 0.5 }}>
                      <Controller
                        name={`medicines.${index}.totalUnit`}
                        control={form.control}
                        rules={{
                          validate: (value) => {
                            // Treat empty, null, or undefined as 0
                            const numValue = value === null || value === undefined || value === 0 ? 0 : parseFloat(value.toString());

                            const selectedMedId =
                              watchedMedicines?.[index]?.medicine;
                            const selectedStockItemId =
                              watchedMedicines?.[index]?.stockItemId;
                            const selectedUnitType =
                              watchedMedicines?.[index]?.sellingUnitType;
                            const stockMed = stockMedicines.find(
                              (sm) => sm._id === selectedStockItemId
                            ) || stockMedicines.find((sm) => sm.medicine._id === selectedMedId);
                            const unitObj = sellingUnitTypes.find(
                              (type) => type.value === selectedUnitType
                            );
                            const unitQuantity = unitObj ? unitObj.quantity : 1;
                            const remainingQty = stockMed
                              ? stockMed.totalQuantity
                              : 0;
                            const maxUnits =
                              unitQuantity > 0
                                ? Math.floor(remainingQty / unitQuantity)
                                : 0;
                            if (numValue > maxUnits) {
                              return `Cannot exceed max units (${maxUnits} ${selectedUnitType || ""
                                }) for available stock (${remainingQty} ${stockMed ? stockMed.unitType : ""
                                })`;
                            }
                            if (numValue < 0) {
                              return "Cannot be negative";
                            }
                            return true;
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="number"
                            variant="outlined"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{
                              "& .MuiInputBase-root": { minHeight: "30px" },
                              "& .MuiInputBase-input": { fontSize: "0.65rem" }
                            }}
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              // Allow empty string
                              if (inputValue === "") {
                                field.onChange(0);
                                const newQuantities = [...selectedQuantities];
                                newQuantities[index] = "";
                                setSelectedQuantities(newQuantities);
                                return;
                              }

                              let totalUnitValue = parseFloat(inputValue) || 0;

                              // Get available stock for validation
                              const selectedStockItemId = watchedMedicines?.[index]?.stockItemId;
                              const stockMed = stockMedicines.find((sm) => sm._id === selectedStockItemId);
                              const maxAvailableSubUnits = stockMed?.totalQuantity || 0;
                              const subUnitsPerUnit = watchedMedicines?.[index]?.totalQuantityInAUnit || 1;

                              // Calculate sub units from total units
                              const calculatedSubUnits = totalUnitValue * subUnitsPerUnit;

                              // Limit to available stock
                              if (calculatedSubUnits > maxAvailableSubUnits) {
                                const maxAllowedUnits = Math.floor(maxAvailableSubUnits / subUnitsPerUnit * 100) / 100;
                                totalUnitValue = maxAllowedUnits;
                                setAlert({
                                  severity: "warning",
                                  message: `Cannot exceed available stock of ${maxAvailableSubUnits} ${stockMed?.unitType || "units"}. Maximum ${maxAllowedUnits} units allowed.`,
                                });
                              }

                              // Round to 2 decimal places
                              const roundedValue = Math.round(totalUnitValue * 100) / 100;
                              field.onChange(roundedValue);

                              // Update Sub Units based on Total Units
                              const finalCalculatedSubUnits = Math.round(roundedValue * subUnitsPerUnit * 100) / 100;

                              const newQuantities = [...selectedQuantities];
                              newQuantities[index] =
                                roundedValue === 0 ? "" : finalCalculatedSubUnits.toString();
                              setSelectedQuantities(newQuantities);
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 1, py: 0.5 }}>
                      <TextField
                        value={selectedQuantities[index] || ""}
                        onChange={(e) => {
                          const subUnitsValue = e.target.value;

                          // Get available stock for validation
                          const selectedStockItemId = watchedMedicines?.[index]?.stockItemId;
                          const stockMed = stockMedicines.find((sm) => sm._id === selectedStockItemId);
                          const maxAvailableSubUnits = stockMed?.totalQuantity || 0;

                          // Parse the input value
                          let subUnitsNum = parseFloat(subUnitsValue) || 0;

                          // Limit to available stock
                          if (subUnitsNum > maxAvailableSubUnits) {
                            subUnitsNum = maxAvailableSubUnits;
                            setAlert({
                              severity: "warning",
                              message: `Cannot exceed available stock of ${maxAvailableSubUnits} - ${stockMed?.unitType || "units"}`,
                            });
                          }

                          // Round to 2 decimal places
                          subUnitsNum = Math.round(subUnitsNum * 100) / 100;

                          const newQuantities = [...selectedQuantities];
                          newQuantities[index] = subUnitsNum > 0 ? subUnitsNum.toString() : "";
                          setSelectedQuantities(newQuantities);

                          const subUnitsPerUnit =
                            watchedMedicines?.[index]?.totalQuantityInAUnit ||
                            1;

                          // Update Total Units based on Sub Units, rounded to 2 decimal places
                          const calculatedTotalUnits =
                            subUnitsNum / subUnitsPerUnit;
                          const roundedTotalUnits = Math.round(calculatedTotalUnits * 100) / 100;
                          form.setValue(
                            `medicines.${index}.totalUnit`,
                            roundedTotalUnits === 0 ? 0 : roundedTotalUnits
                          );

                          // Update form values for sellingUnitType
                          const currentType = selectedTypes[index] || "";
                          if (currentType && subUnitsNum > 0) {
                            const value = `${currentType.toLowerCase()}-${Math.floor(
                              subUnitsPerUnit
                            )}`;
                            form.setValue(
                              `medicines.${index}.sellingUnitType`,
                              value
                            );
                          } else {
                            form.setValue(
                              `medicines.${index}.sellingUnitType`,
                              ""
                            );
                          }
                        }}
                        fullWidth
                        size="small"
                        type="number"
                        variant="outlined"
                        placeholder="Sub Units"
                        inputProps={{
                          min: 0,
                          step: 0.01,
                          max: stockMedicines.find((sm) => sm._id === watchedMedicines?.[index]?.stockItemId)?.totalQuantity || 0
                        }}
                        sx={{
                          "& .MuiInputBase-root": { minHeight: "28px" },
                          "& .MuiInputBase-input": { fontSize: "0.65rem" }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ px: 1, py: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium" fontSize="0.75rem">
                        ₹
                        {(watchedMedicines?.[index]?.totalPrice || 0).toFixed(
                          2
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="left" sx={{ px: 1, py: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium" fontSize="0.75rem">
                        {watchedMedicines?.[
                          index
                        ]?.batchNumber?.toUpperCase() || ""}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 1, py: 0.5 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          remove(index);
                          setSelectedTypes(
                            selectedTypes.filter((_, i) => i !== index)
                          );
                          setSelectedQuantities(
                            selectedQuantities.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {errors.medicines &&
            typeof errors.medicines === "object" &&
            "message" in errors.medicines && (
              <Typography variant="body2" color="error" sx={{ mt: 1, ml: 2 }}>
                {errors.medicines.message}
              </Typography>
            )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={addItem}
            sx={{
              mt: 2,
              textTransform: "none",
              minWidth: 200,
              border: "1px dashed",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            Add Item
          </Button>
          {/* Totals */}
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={6}>
              {/* 2x2 Grid for form fields */}
              <Grid container spacing={2}>
                {/* Discount */}
                <Grid item xs={6}>
                  <TextField
                    {...form.register("discount", { valueAsNumber: true })}
                    fullWidth
                    label="Discount(%)"
                    type="number"
                    size="small"
                    variant="outlined"
                    error={!!errors.discount}
                    helperText={errors.discount?.message}
                  />
                </Grid>

                {/* Payment Type */}
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      {...form.register("paymentType")}
                      label="Payment Type"
                      value={watchedPaymentType || "cash"}
                      onChange={(e) => {
                        form.setValue(
                          "paymentType",
                          e.target.value as "cash" | "online"
                        );
                        if (e.target.value === "cash") {
                          form.setValue("bank", "");
                        }
                      }}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Bank selection field - only show if paymentType is online */}
                {watchedPaymentType === "online" && (
                  <Grid item xs={6}>
                    <Controller
                      name="bank"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          options={banks || []}
                          getOptionLabel={(option: any) =>
                            option?.name ||
                            option?.bankName ||
                            option?.holderName ||
                            ""
                          }
                          value={
                            banks?.find(
                              (b: any) => (b?._id || b?.id) === field.value
                            ) ?? null
                          }
                          onChange={(_, newValue: any) => {
                            field.onChange(
                              newValue ? newValue._id || newValue.id : ""
                            );
                          }}
                          isOptionEqualToValue={(option: any, value: any) =>
                            (option?._id || option?.id) ===
                            (value?._id || value?.id)
                          }
                          renderOption={(props, option: any) => (
                            <li {...props}>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography variant="body2" fontWeight="medium">
                                  {option?.name ||
                                    option?.bankName ||
                                    "Unknown Bank"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {option?.accountNumber
                                    ? `A/C: ${option.accountNumber}`
                                    : ""}
                                  {option?.holderName
                                    ? ` • ${option.holderName}`
                                    : ""}
                                </Typography>
                              </Box>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Bank"
                              size="small"
                              error={!!fieldState.error}
                              helperText={
                                fieldState.error?.message ||
                                "Select bank for online payment"
                              }
                              placeholder={
                                banks?.length
                                  ? "Select bank account"
                                  : "No banks available"
                              }
                              fullWidth
                            />
                          )}
                          noOptionsText="No banks available"
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Paid Amount */}
                <Grid item xs={6}>
                  <Controller
                    name="paidAmount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Paid Amount"
                        type="number"
                        size="small"
                        variant="outlined"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        inputProps={{ min: 0, step: "0.01" }}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string, treat as 0
                          if (value === "") {
                            field.onChange(0);
                          } else {
                            field.onChange(parseFloat(value) || 0);
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ pl: { md: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Sub Total:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="text.secondary"
                  >
                    ₹ {calculateSubTotal().toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Discount:
                  </Typography>
                  <Typography variant="body2" color="success.light">
                    ₹ {calculateDiscount().toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    Grand Total:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹ {calculateGrandTotal().toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    Paid Amount:
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    ₹ {(form.watch("paidAmount") || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    Remaining Amount:
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    ₹{" "}
                    {(
                      calculateGrandTotal() - (form.watch("paidAmount") || 0)
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        {/* Currency and Actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "flex-end",
            alignItems: { xs: "flex-end", md: "center" },
            mt: 4,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => form.reset()}
              sx={{
                minWidth: 200,
                bgcolor: "rgba(220, 220, 220, 0.2)",
                border: "1px dashed #aaa",
              }}
            >
              Reset Form
            </Button>
            <Button
              variant="outlined"
              disabled={isSubmitting}
              color="primary"
              onClick={handleSubmit}
              sx={{
                minWidth: 200,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: "1px dashed",
              }}
            >
              {isSubmitting && (
                <CircularProgress sx={{ position: "absolute" }} size={20} />
              )}
              Create Medicine Sale Invoice
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MedicineSale;
