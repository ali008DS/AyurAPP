import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Autocomplete,
  CircularProgress,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  // Plus,
  Trash2,
  Save,
  X
} from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  uhId?: string;
  phone?: string;
}

interface Medicine {
  _id: string;
  name: string;
  unitType?: string;
  baseUnitType?: string;
  totalQuantityInAUnit?: number;
}

interface StockItem {
  _id: string;
  batchNumber: string;
  medicine: Medicine;
  expiryDate: string;
  manufacturingDate: string;
  totalQuantity: number;
  unitType: string;
  sellingPrice?: number;
}

interface MedicineEntry {
  medicine: StockItem | null;
  quantity: number | string;
  batchNumber: string;
  stockId?: string;
}

interface EditMedicineRoomProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  entry: {
    _id: string;
    patient: Patient;
    usageDate?: string;
    medicines: Array<{
      medicine: Medicine | any;
      quantity: number;
      batchNumber: string;
    }>;
  };
}

const EditMedicineRoom: React.FC<EditMedicineRoomProps> = ({
  open,
  onClose,
  onSuccess,
  entry,
}) => {
  const { setAlert } = useAppContext();
  const [patient, setPatient] = useState<Patient | null>(entry.patient);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [medicineRows, setMedicineRows] = useState<MedicineEntry[]>([]);
  const [usageDate, setUsageDate] = useState<Dayjs>(entry.usageDate ? dayjs(entry.usageDate) : dayjs());
  const [loading, setLoading] = useState(false);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStock();
      setPatient(entry.patient);
    }
    // eslint-disable-next-line
  }, [open, entry]);

  useEffect(() => {
    if (stock.length > 0 && open) {
      setMedicineRows(
        entry.medicines.map((m) => {
          // Handle both cases: medicine as object or as ID string
          const medicineId = typeof m.medicine === 'string' ? m.medicine : m.medicine._id;
          const stockItem = stock.find(
            (s) => s.medicine._id === medicineId && s.batchNumber === m.batchNumber
          );
          return {
            medicine: stockItem || null,
            quantity: m.quantity,
            batchNumber: m.batchNumber,
            stockId: stockItem?._id,
          };
        })
      );
    }
    // eslint-disable-next-line
  }, [stock, open]);

  const fetchStock = async () => {
    try {
      setLoadingStock(true);
      const response = await ApiManager.getPanchakarmaStock();
      setStock(response?.data || []);
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to load stock items" });
    } finally {
      setLoadingStock(false);
    }
  };

  const searchPatients = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setPatients([]);
      return;
    }
    try {
      setLoadingPatients(true);
      const response = await ApiManager.getPatients(1, 50, searchTerm);
      setPatients(response.data?.data || []);
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to search patients" });
    } finally {
      setLoadingPatients(false);
    }
  };

  // const addMedicineRow = () => {
  //   setMedicineRows([...medicineRows, { medicine: null, quantity: 1, batchNumber: "" }]);
  // };

  const removeMedicineRow = (index: number) => {
    if (medicineRows.length === 1) {
      setAlert({
        severity: "warning",
        message: "At least one medicine is required",
      });
      return;
    }
    setMedicineRows(medicineRows.filter((_, i) => i !== index));
  };

  const updateMedicineRow = (
    index: number,
    field: keyof MedicineEntry,
    value: any
  ) => {
    const updated = [...medicineRows];
    updated[index] = { ...updated[index], [field]: value };
    setMedicineRows(updated);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!patient) {
        setAlert({ severity: "error", message: "Please select a patient" });
        return;
      }
      const validMedicines = medicineRows.filter(
        (med) => med.medicine && Number(med.quantity) > 0 && med.batchNumber.trim()
      );
      if (validMedicines.length === 0) {
        setAlert({
          severity: "error",
          message: "Please add at least one valid medicine with batch number",
        });
        return;
      }
      const payload = {
        patient: patient._id,
        usageDate: usageDate.toISOString(),
        medicines: validMedicines.map((med) => ({
          medicine: med.medicine!.medicine._id,
          quantity: Number(med.quantity),
          batchNumber: med.batchNumber.trim(),
        })),
      };
      await ApiManager.patchMedicineRoom(entry._id, payload);
      setAlert({
        severity: "success",
        message: "Medicine room entry updated successfully",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to update data" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPatient(entry.patient);
      setMedicineRows(
        entry.medicines.map((m) => {
          const stockItem = stock.find(
            (s) => s.medicine._id === (m.medicine._id || m.medicine) && s.batchNumber === m.batchNumber
          );
          return {
            medicine: stockItem || null,
            quantity: m.quantity,
            batchNumber: m.batchNumber,
            stockId: stockItem?._id,
          };
        })
      );
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Edit Medicine Room Entry
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loadingStock ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Usage Date"
                  value={usageDate}
                  onChange={(newValue) => setUsageDate(newValue || dayjs())}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                  format="DD/MM/YYYY"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Autocomplete
                  size="small"
                  options={patients}
                  loading={loadingPatients}
                  value={patient}
                  onChange={(_, newValue) => setPatient(newValue)}
                  onInputChange={(_, value) => searchPatients(value)}
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}${option.uhId ? ` • ${option.uhId}` : ""
                    }`
                  }
                  filterOptions={(x) => x}
                  autoHighlight
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search patient..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingPatients && <CircularProgress size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: 14 }}>
                          {option.firstName} {option.lastName}
                          {option.uhId && (
                            <span style={{ color: "#1976d2", marginLeft: 8 }}>
                              • UHID: {option.uhId}
                            </span>
                          )}
                        </Typography>
                        {option.phone && (
                          <Typography
                            sx={{ fontSize: 12, color: "text.secondary" }}
                          >
                            {option.phone}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                  noOptionsText="plz search !"
                  sx={{ minWidth: 280 }}
                />
              </Grid>
            </Grid>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxWidth: "99%" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Panchakarma Medicine
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Batch Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicineRows.map((medEntry, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <Autocomplete
                          size="small"
                          options={stock}
                          value={medEntry.medicine}
                          onChange={(_, newValue) => {
                            // Update medicine and batch together to avoid race conditions
                            const updated = [...medicineRows];
                            updated[index] = {
                              ...updated[index],
                              medicine: newValue,
                              batchNumber: newValue?.batchNumber || "",
                              stockId: newValue?._id,
                            };
                            setMedicineRows(updated);
                          }}
                          getOptionLabel={(option) =>
                            typeof option === "string"
                              ? option
                              : `${option?.medicine?.name || ""} (${option?.batchNumber || ""})`
                          }
                          isOptionEqualToValue={(option, value) => {
                            if (!value) return false;
                            return option._id === value._id;
                          }}
                          noOptionsText="No stock available"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select medicine..."
                            />
                          )}
                          renderOption={(props, option) => (
                            <li {...props}>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography sx={{ fontSize: 14 }}>
                                  {option.medicine.name}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: 12, color: "text.secondary" }}
                                >
                                  Batch: {option.batchNumber} • Available: {option.totalQuantity} {option.unitType}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: 11, color: "text.secondary" }}
                                >
                                  Expiry: {new Date(option.expiryDate).toLocaleDateString()} • Mfg: {new Date(option.manufacturingDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </li>
                          )}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <TextField
                          size="small"
                          value={medEntry.batchNumber}
                          onChange={(e) => {
                            updateMedicineRow(index, "batchNumber", e.target.value);
                          }}
                          placeholder="Batch number..."
                          sx={{ width: '100%' }}
                          disabled
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={medEntry.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateMedicineRow(
                              index,
                              "quantity",
                              val === "" ? "" : Number(val)
                            );
                          }}
                          inputProps={{ min: 1, step: 1 }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeMedicineRow(index)}
                          disabled={medicineRows.length === 1}
                          title="Remove medicine"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={addMedicineRow}
                sx={{ borderStyle: "dashed" }}
              >
                Add Medicine
              </Button>
            </Box> */}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Button onClick={handleClose} disabled={loading} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditMedicineRoom;