import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Autocomplete,
    IconButton,
    Button,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Plus, Trash2, Save } from "lucide-react";
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
    unitType: string;
    baseUnitType: string;
    totalQuantityInAUnit: number;
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

interface SpreadsheetRow {
    id: string; // Temporary ID for new rows
    patient: Patient | null;
    medicine: StockItem | null;
    batchNumber: string;
    quantity: number | string;
    isNew: boolean;
    isSaving?: boolean;
}

interface SpreadsheetTableProps {
    onSuccess?: () => void;
}

const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({ onSuccess }) => {
    const { setAlert } = useAppContext();
    const [rows, setRows] = useState<SpreadsheetRow[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [stock, setStock] = useState<StockItem[]>([]);
    const [loadingStock, setLoadingStock] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const nextIdRef = useRef(1);

    useEffect(() => {
        fetchStock();
        addNewRow();
    }, []);

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

    const addNewRow = () => {
        const newRow: SpreadsheetRow = {
            id: `new-${nextIdRef.current++}`,
            patient: null,
            medicine: null,
            batchNumber: "",
            quantity: 1,
            isNew: true,
        };
        setRows((prev) => [...prev, newRow]);
    };

    const updateRow = (id: string, field: keyof SpreadsheetRow, value: any) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    };

    const removeRow = (id: string) => {
        if (rows.length === 1) {
            setAlert({
                severity: "warning",
                message: "At least one row is required",
            });
            return;
        }
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const saveRow = async (row: SpreadsheetRow) => {
        if (!row.patient) {
            setAlert({ severity: "error", message: "Please select a patient" });
            return;
        }

        if (!row.medicine || !Number(row.quantity) || !row.batchNumber.trim()) {
            setAlert({
                severity: "error",
                message: "Please fill in all medicine details",
            });
            return;
        }

        try {
            // Mark row as saving
            setRows((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, isSaving: true } : r))
            );

            const medicineId =
                (row.medicine as any).medicine?._id || (row.medicine as any)._id;

            const payload = {
                medicine: medicineId,
                quantity: Number(row.quantity),
                batchNumber: row.batchNumber,
                patient: row.patient._id,
            };

            await ApiManager.createMedicineRoomEntry(payload);

            setAlert({
                severity: "success",
                message: "Entry saved successfully",
            });

            // Remove the saved row and add a new empty one
            setRows((prev) => prev.filter((r) => r.id !== row.id));
            addNewRow();
            onSuccess?.();
        } catch (error) {
            setAlert({ severity: "error", message: "Failed to save entry" });
            // Remove saving state
            setRows((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, isSaving: false } : r))
            );
        }
    };

    if (loadingStock) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 300,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                    Panchakarma Medicine Use - Spreadsheet Entry
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Plus size={16} />}
                    onClick={addNewRow}
                    sx={{ borderStyle: "dashed" }}
                >
                    Add Row
                </Button>
            </Box>

            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                    maxWidth: "99%",
                    maxHeight: 400,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#888',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: '#555',
                        },
                    },
                }}
            >
                <Table size="small" stickyHeader sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell sx={{ fontWeight: 600, width: "5%" }}>S.No</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: "25%" }}>Patient</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: "30%" }}>Medicine</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: "15%" }}>Batch Number</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: "10%" }}>Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: "15%", textAlign: "center" }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                sx={{
                                    "&:hover": { backgroundColor: "#fafafa" },
                                    opacity: row.isSaving ? 0.6 : 1,
                                }}
                            >
                                {/* S.No */}
                                <TableCell>{index + 1}</TableCell>

                                {/* Patient */}
                                <TableCell>
                                    <Autocomplete
                                        size="small"
                                        options={patients}
                                        loading={loadingPatients}
                                        value={row.patient}
                                        onChange={(_, newValue) => updateRow(row.id, "patient", newValue)}
                                        onInputChange={(_, value) => searchPatients(value)}
                                        getOptionLabel={(option) =>
                                            `${option.firstName} ${option.lastName}${option.uhId ? ` • ${option.uhId}` : ""
                                            }`
                                        }
                                        filterOptions={(x) => x}
                                        autoHighlight
                                        disabled={row.isSaving}
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
                                                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                                            {option.phone}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </li>
                                        )}
                                        noOptionsText="Type to search patients"
                                    />
                                </TableCell>

                                {/* Medicine */}
                                <TableCell>
                                    <Autocomplete
                                        size="small"
                                        options={stock}
                                        value={row.medicine}
                                        onChange={(_, newValue) => {
                                            updateRow(row.id, "medicine", newValue);
                                            updateRow(row.id, "batchNumber", newValue?.batchNumber || "");
                                        }}
                                        getOptionLabel={(option) =>
                                            `${option.medicine.name} (${option.batchNumber})`
                                        }
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                        disabled={row.isSaving}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Select medicine..." />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Typography sx={{ fontSize: 14 }}>
                                                        {option.medicine.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                                        Batch: {option.batchNumber} • Available: {option.totalQuantity}{" "}
                                                        {option.unitType}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                        Expiry: {new Date(option.expiryDate).toLocaleDateString()} • Mfg:{" "}
                                                        {new Date(option.manufacturingDate).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </li>
                                        )}
                                    />
                                </TableCell>

                                {/* Batch Number */}
                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={row.batchNumber}
                                        onChange={(e) => updateRow(row.id, "batchNumber", e.target.value)}
                                        placeholder="Batch number..."
                                        fullWidth
                                        disabled
                                    />
                                </TableCell>

                                {/* Quantity */}
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateRow(row.id, "quantity", val === "" ? "" : Number(val));
                                        }}
                                        inputProps={{ min: 1, step: 1 }}
                                        fullWidth
                                        disabled={row.isSaving}
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => saveRow(row)}
                                            disabled={row.isSaving}
                                            title="Save entry"
                                        >
                                            {row.isSaving ? <CircularProgress size={16} /> : <Save size={16} />}
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeRow(row.id)}
                                            disabled={row.isSaving || rows.length === 1}
                                            title="Remove row"
                                        >
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    <strong>Tip:</strong> Fill in patient, medicine, and quantity for each row, then click
                    the save icon to submit. Add more rows using the "Add Row" button.
                </Typography>
            </Box>
        </Box>
    );
};

export default SpreadsheetTable;
