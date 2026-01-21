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
import { useNavigate, useParams } from "react-router-dom";

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

function MedicineSaleEdit() {
  const { id } = useParams<{ id: string }>();
  const { setAlert, websiteIdentity } = useAppContext();
  const router = useNavigate();
  const [stockMedicines, setStockMedicines] = useState<StockItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientPage] = useState<number>(1);
  const patientLimit = 50;
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  const form = useForm<MedicineSaleType>({
    resolver: zodResolver(MedicineSaleSchema),
    defaultValues: {
      medicines: [
        {
          medicine: "",
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
      saleDate: dayjs().toISOString(),
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

  // Load existing sale data
  useEffect(() => {
    const fetchSaleData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await ApiManager.getSaleMedicineById(id);
        const saleData = response?.data || response;

        console.log("Sale data loaded:", saleData);
        setInvoiceNumber(saleData.invoiceNumber || "");

        // Fetch stock medicines first to get batch numbers
        const stockData = await ApiManager.getStockMedicine();
        const stockMedicinesList = stockData?.data || [];

        // Populate form with existing data
        form.reset({
          status: saleData.status || "paid",
          patientType:
            saleData.patientType ||
            (saleData.patient ? "patient" : "nonPatient"),
          patient: saleData.patient?._id || null,
          nonPatientName: saleData.nonPatientName || "",
          nonPatientPhone: saleData.nonPatientPhone || "",
          saleDate: saleData.saleDate || dayjs().toISOString(),
          discount: saleData.discount || 0,
          totalAmount: saleData.totalAmount || 0,
          bank: saleData.bank?._id || saleData.bank || "",
          paymentType: saleData.paymentType || "cash",
          paidAmount: saleData.paidAmount || 0,
          medicines: saleData.medicines.map((med: any) => {
            // Find the stock medicine to get the batch number
            const stockMed =
              stockMedicinesList.find((sm: any) => sm._id === med.stockItemId) ||
              stockMedicinesList.find(
                (sm: any) => sm.medicine._id === (med.medicine._id || med.medicine)
              );
            const batchNumber =
              med.batchNumber || stockMed?.batchNumber || "N/A";
            console.log(
              "Medicine:",
              med.medicine.name,
              "Price:",
              med.price,
              "Batch:",
              batchNumber
            );

            return {
              medicine: med.medicine._id || med.medicine,
              stockItemId: med.stockItemId || stockMed?._id || "",
              sellingUnitType: med.sellingUnitType || "",
              totalUnit: med.totalUnit || 1,
              totalQuantityInAUnit: med.totalQuantityInAUnit || 1,
              price: med.price || 0,
              totalPrice: med.totalPrice || 0,
              batchNumber: batchNumber,
            };
          }),
        });

        // Set selected patient if exists
        if (saleData.patient) {
          setSelectedPatient(saleData.patient);
          setInputValue(
            `${saleData.patient.firstName} ${saleData.patient.lastName}`
          );
        }
      } catch (error) {
        console.error("Error fetching sale data:", error);
        setAlert({
          severity: "error",
          message: "Failed to load sale data.",
        });
        router("/medicine-sale-history");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleData();
  }, [id]);

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
  }, []);

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
    if (!id) return;

    const processedData = {
      ...data,
      totalAmount: calculateGrandTotal(),
      paymentType: data.paymentType,
      bank: data.paymentType === "online" ? data.bank || "" : undefined,
      paidAmount: data.paidAmount || 0,
      medicines: (data.medicines || []).map((medicine) => ({
        medicine: medicine.medicine,
        register: medicine.stockItemId,
        quantity: medicine.totalQuantityInAUnit,
        batchNumber: medicine.batchNumber,
        saleDate: data.saleDate || new Date().toISOString(),
        totalPrice: medicine.totalPrice ?? 0,
        sellingUnitType: medicine.sellingUnitType,
        totalUnit: medicine.totalUnit,
        price: medicine.price,
      })),
    };

    console.log("Submitting data:", JSON.stringify(processedData, null, 2));
    console.log("Medicines being sent:", processedData.medicines);

    try {
      await ApiManager.patchSaleMedicine(id, processedData);

      setAlert({
        severity: "success",
        message: "Medicine sale invoice updated successfully!",
      });

      router(`/medicine-sale-view/${id}`);
    } catch (error: any) {
      console.error("Error updating medicine sale:", error);
      setAlert({
        severity: "error",
        message: error?.message || "Failed to update medicine sale invoice.",
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
      stockItemId: "",
      medicine: "",
      sellingUnitType: "",
      totalUnit: 1,
      totalQuantityInAUnit: 1,
      price: 0,
      totalPrice: 0,
      batchNumber: "",
    });
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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      <HeadingText name="Edit Medicine Sale" />
      {/* Invoice Header */}
      <Box
        sx={{
          mx: 1,
          mb: 8,
        }}
      >
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Invoice Number"
              size="small"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
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
                ListboxProps={{
                  sx: {
                    "& li": { py: 0.5 },
                  },
                }}
                sx={{
                  "& .MuiAutocomplete-option": { fontSize: "12px" },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Patient"
                    fullWidth
                    size="small"
                    variant="outlined"
                    error={!!errors.patient}
                    helperText={
                      errors.patient?.message ||
                      "Type at least 2 characters to search (name, phone, UH ID, OPD/ID)"
                    }
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
          <Typography fontWeight="bold" mb={2} color="#333">
            Detail
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "WhiteSmoke" }}>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="5%">
                    #
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }}>
                    Medicine Name
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="15%">
                    Selling Unit Type
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="10%">
                    Total Units
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="10%">
                    Qty in Unit
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="10%">
                    Price
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="8%">
                    Total Price
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="5%">
                    Batch No.
                  </TableCell>
                  <TableCell sx={{ color: "#666", px: 3, py: 1 }} width="1%">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell align="left" sx={{ px: 3 }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        slotProps={{ paper: { style: { width: "100%" } } }}
                        options={stockMedicines}
                        getOptionLabel={(option) =>
                          `${option.medicine.name}${option.batchNumber ? ` • Batch: ${option.batchNumber}` : ""}${option.totalQuantity ? ` • ${option.totalQuantity} ${option.unitType || ""}` : ""}`
                        }
                        isOptionEqualToValue={(option: any, value: any) =>
                          (option?._id || option?.id) === (value?._id || value?.id)
                        }
                        filterOptions={(options, state) => {
                          const q = (state.inputValue || "").trim().toLowerCase();
                          if (!q) return options;
                          const matches = options.filter((opt: any) => {
                            const name = (opt.medicine?.name || "").toLowerCase();
                            const batch = (opt.batchNumber || "").toLowerCase();
                            const unit = (opt.unitType || "").toLowerCase();
                            return (
                              name.includes(q) ||
                              batch.includes(q) ||
                              unit.includes(q)
                            );
                          });
                          matches.sort((a: any, b: any) => {
                            const nameA = (a.medicine?.name || "").toLowerCase();
                            const nameB = (b.medicine?.name || "").toLowerCase();
                            const batchA = (a.batchNumber || "").toLowerCase();
                            const batchB = (b.batchNumber || "").toLowerCase();
                            const scoreA = nameA.startsWith(q) ? 0 : nameA.includes(q) ? 1 : batchA.startsWith(q) ? 2 : batchA.includes(q) ? 3 : 4;
                            const scoreB = nameB.startsWith(q) ? 0 : nameB.includes(q) ? 1 : batchB.startsWith(q) ? 2 : batchB.includes(q) ? 3 : 4;
                            return scoreA - scoreB;
                          });
                          return matches;
                        }}
                        groupBy={(option: any) => option.medicine?.name || ""}
                        value={
                          stockMedicines.find(
                            (sm) => sm._id === watchedMedicines?.[index]?.stockItemId
                          ) || null
                        }
                        onChange={(_, newValue) => {
                          if (newValue) {
                            if (newValue.totalQuantity <= 0) {
                              setAlert({
                                severity: "error",
                                message: `Medicine "${newValue.medicine.name}" is out of stock.`,
                              });
                              return;
                            }
                            form.setValue(`medicines.${index}.medicine`, newValue.medicine._id);
                            form.setValue(`medicines.${index}.stockItemId`, newValue._id);
                            form.setValue(
                              `medicines.${index}.price`,
                              newValue.sellingPrice
                            );
                            form.setValue(
                              `medicines.${index}.batchNumber`,
                              newValue.batchNumber
                            );
                          } else {
                            form.setValue(`medicines.${index}.medicine`, "");
                            form.setValue(`medicines.${index}.stockItemId`, "");
                            form.setValue(`medicines.${index}.price`, 0);
                            form.setValue(`medicines.${index}.batchNumber`, "");
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                              }}
                            >
                              <Typography variant="body1">
                                {option.medicine.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight="bold"
                                color="text.secondary"
                              >
                                Batch:{" "}
                                {option.batchNumber?.toUpperCase() ||
                                  "No Batch"}{" "}
                                • {option.totalQuantity || "No Quantity"}{" "}
                                {option.unitType || "No Unit"}
                              </Typography>
                            </Box>
                          </li>
                        )}
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
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          {...form.register(
                            `medicines.${index}.sellingUnitType`
                          )}
                          value={
                            watchedMedicines?.[index]?.sellingUnitType || ""
                          }
                          error={!!errors.medicines?.[index]?.sellingUnitType}
                          onChange={(e) => {
                            form.setValue(
                              `medicines.${index}.sellingUnitType`,
                              e.target.value
                            );
                            const selectedUnitType = sellingUnitTypes.find(
                              (type) => type.value === e.target.value
                            );
                            if (selectedUnitType) {
                              form.setValue(
                                `medicines.${index}.totalQuantityInAUnit`,
                                selectedUnitType.quantity
                              );
                            }
                          }}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            <em>Select Unit</em>
                          </MenuItem>
                          {sellingUnitTypes.map((type) => (
                            <MenuItem
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                              key={type.value}
                              value={type.value}
                            >
                              <Typography sx={{ display: "inline" }}>
                                {type.label}
                              </Typography>
                              <Typography
                                sx={{ display: "inline" }}
                                variant="body2"
                                color="text.secondary"
                              >
                                {type.quantity ? ` {1 * ${type.quantity}}` : ""}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.medicines?.[index]?.sellingUnitType && (
                          <FormHelperText>
                            {errors.medicines[index].sellingUnitType.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        {...form.register(`medicines.${index}.totalUnit`, {
                          valueAsNumber: true,
                          validate: (value) => {
                            const selectedMedId =
                              watchedMedicines?.[index]?.medicine;
                            const selectedStockItemId =
                              watchedMedicines?.[index]?.stockItemId;
                            const selectedUnitType =
                              watchedMedicines?.[index]?.sellingUnitType;
                            const stockMed =
                              stockMedicines.find((sm) => sm._id === selectedStockItemId) ||
                              stockMedicines.find((sm) => sm.medicine._id === selectedMedId);
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
                            const numValue = Number(value) || 0;
                            if (numValue > maxUnits) {
                              return `Cannot exceed max units (${maxUnits} ${selectedUnitType || ""
                                }) for available stock (${remainingQty} ${stockMed ? stockMed.unitType : ""
                                })`;
                            }
                            if (numValue < 1) {
                              return "Must be at least 1";
                            }
                            return true;
                          },
                        })}
                        fullWidth
                        size="small"
                        type="number"
                        variant="outlined"
                        error={!!errors.medicines?.[index]?.totalUnit}
                        helperText={
                          errors.medicines?.[index]?.totalUnit?.message
                        }
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        {...form.register(
                          `medicines.${index}.totalQuantityInAUnit`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        fullWidth
                        size="small"
                        type="number"
                        variant="outlined"
                        disabled
                        error={
                          !!errors.medicines?.[index]?.totalQuantityInAUnit
                        }
                        helperText={
                          errors.medicines?.[index]?.totalQuantityInAUnit
                            ?.message
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        {...form.register(`medicines.${index}.price`, {
                          valueAsNumber: true,
                        })}
                        fullWidth
                        size="small"
                        type="number"
                        variant="outlined"
                        inputProps={{ step: "0.01" }}
                        error={!!errors.medicines?.[index]?.price}
                        helperText={errors.medicines?.[index]?.price?.message}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>
                      <Typography variant="body2" fontWeight="medium">
                        ₹
                        {(watchedMedicines?.[index]?.totalPrice || 0).toFixed(
                          2
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {watchedMedicines?.[
                          index
                        ]?.batchNumber?.toUpperCase() || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
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
              bgcolor: "rgba(25, 118, 210, 0.05)",
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
                  <TextField
                    {...form.register("paidAmount", { valueAsNumber: true })}
                    fullWidth
                    label="Paid Amount"
                    type="number"
                    size="small"
                    variant="outlined"
                    error={!!errors.paidAmount}
                    helperText={errors.paidAmount?.message}
                    inputProps={{ min: 0, step: "0.01" }}
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
              onClick={() => router("/medicine-sale-history")}
              sx={{
                minWidth: 200,
                bgcolor: "rgba(220, 220, 220, 0.2)",
                border: "1px dashed #aaa",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              disabled={isSubmitting}
              color="primary"
              onClick={handleSubmit}
              sx={{
                minWidth: 200,
                bgcolor: "rgba(40, 147, 255, 0.1)",
                border: "1px dashed",
              }}
            >
              {isSubmitting && (
                <CircularProgress sx={{ position: "absolute" }} size={20} />
              )}
              Update Medicine Sale Invoice
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MedicineSaleEdit;
