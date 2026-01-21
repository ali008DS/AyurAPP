import { useState, useMemo, useEffect } from "react";
import {
  TextField,
  Box,
  IconButton,
  Typography,
  Snackbar,
  CircularProgress,
  MenuItem,
} from "@mui/material";

import { FileDown } from "lucide-react";
import HeadingText from "./ui/HeadingText";
import AddPatientDialog from "./AddPatientDialog";
import * as XLSX from "xlsx";
import { PatientsProps } from "../types/patient";
import ApiManager from "./services/apimanager";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CustomLightTable from "./CustomLightTable";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";

// Improved export function with better error handling
const handleExport = (patients: any[]) => {
  if (!patients || patients.length === 0) {
    console.error("No patient data available for export.");
    return;
  }

  try {
    // Prepare rows for export with user details and internal notes in columns
    const exportRows: any[] = [];

    patients.forEach((patient) => {
      // Safety check for valid patient data
      if (!patient) return;

      // Create base row with user details
      const baseRow: any = {
        FullName:
          `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
          "Unknown",
        Phone: patient.phone || "",
        Address: patient.address || "",
        City: patient.city || "",
        State: patient.state || "",
        UHID: patient.uhId || "",
        OPDID: patient.opdId || "",
        IPDID: patient.ipdId || "",
        PatientID: patient.patientId || "",
        Date: patient.createdAt
          ? dayjs(patient.createdAt).format("DD/MM/YYYY")
          : "",
      };

      // Add internal notes in columns
      if (
        Array.isArray(patient.internalNote) &&
        patient.internalNote.length > 0
      ) {
        patient.internalNote.forEach((note: string, index: number) => {
          baseRow[`InternalNote_${index + 1}`] = note;
        });
      }

      // Add row to export
      exportRows.push(baseRow);
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PatientsPrescriptions");
    XLSX.writeFile(workbook, "patients_prescriptions.xlsx");
  } catch (error) {
    console.error("Failed to export data:", error);
    // You could show a user-friendly error message here
  }
};

function SearchPatients({ onPatientSelect }: PatientsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchField] = useState("internalNote"); // Default to internalNote
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchType, setSearchType] = useState("piles"); // Default to piles
  const [internalNoteOptions, setInternalNoteOptions] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const minStartDate = dayjs("2023-01-01");
  const maxEndDate = dayjs();

  // Fetch internal note options on component mount
  useEffect(() => {
    const fetchInternalNotes = async () => {
      try {
        const response = await ApiManager.getCarePlanGroups("internalNote");
        const notes =
          Array.isArray(response.data) && response.data.length > 0
            ? response.data.map((note: any) => note.name)
            : [];
        setInternalNoteOptions(notes);
      } catch (error) {
        console.error("Error fetching internal notes:", error);
      }
    };
    fetchInternalNotes();
  }, []);

  // Remove dropdown for searchField and hardcode internalNote
  const handleSearch = () => {
    if (!searchTerm.trim() && !startDate && !endDate) {
      setSearchResults([]);
      return;
    }
    setHasSearched(true);
    setLoadingSearch(true);
    const fetch = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm.trim()) {
          queryParams.append("internalNote", searchTerm); // Only add if searchTerm exists
        }
        if (startDate) {
          const formattedStartDate = dayjs(startDate, "DD/MM/YYYY").toISOString();
          queryParams.append("startDate", formattedStartDate);
        }
        if (endDate) {
          const endDateTime = dayjs(endDate, "DD/MM/YYYY").endOf('day').toISOString();
          queryParams.append("endDate", endDateTime);
        }
        let response;
        if (searchType === "piles") {
          response = await ApiManager.searchPilesPrescriptionsWithParams(
            queryParams
          );
        } else {
          response = await ApiManager.searchSpinePrescriptionsWithParams(
            queryParams
          );
        }
        if (!response || !response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid response format");
        }
        const responseData = response.data;
        const rowsMap = new Map<string, any>();
        for (const item of responseData) {
          if (!item || !item.patient) continue;
          const patient = item.patient;
          const prescriptions = Array.isArray(item.prescriptions)
            ? item.prescriptions
            : [];
          const uniqueKey = (
            patient.patientId ||
            patient._id ||
            patient.phone ||
            ""
          ).toString();
          if (!uniqueKey) continue;
          if (!rowsMap.has(uniqueKey)) {
            rowsMap.set(uniqueKey, {
              id: uniqueKey,
              firstName: patient.firstName || "",
              lastName: patient.lastName || "",
              phone: patient.phone || "",
              address: patient.address || "",
              city: patient.city || "",
              state: patient.state || "",
              uhId: patient.uhId || "",
              opdId: patient.opdId || "",
              ipdId: patient.ipdId || "",
              patientId: patient.patientId || "",
              // Initialize arrays for prescription data
              internalNote: [],
              createdAt:
                prescriptions.length > 0 ? prescriptions[0].createdAt : "",
            });
          }
          const patientRecord = rowsMap.get(uniqueKey);
          for (const prescription of prescriptions) {
            if (!prescription) continue;
            if (prescription.internalNote)
              patientRecord.internalNote.push(prescription.internalNote);
            if (
              prescription.createdAt &&
              (!patientRecord.createdAt ||
                new Date(prescription.createdAt) >
                new Date(patientRecord.createdAt))
            ) {
              patientRecord.createdAt = prescription.createdAt;
            }
          }
        }
        const rows = Array.from(rowsMap.values());
        setSearchResults(rows);
      } catch (e) {
        console.error("Search error:", e);
        setErrorMsg("Error searching prescriptions. Please try again.");
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    };
    fetch();
  };

  // Find max prescription count for dynamic columns with safety checks
  const maxPrescriptions = useMemo(() => {
    let max = 0;
    for (const row of searchResults) {
      if (!row) continue;
      const arr = row[searchField];
      if (Array.isArray(arr)) {
        max = Math.max(max, arr.length);
      }
    }
    return max;
  }, [searchResults, searchField]);

  // Improved column definitions with better error handling
  const columns = useMemo(() => {
    const baseColumns = [
      { field: "fullName", headerName: "Full Name" },
      { field: "phone", headerName: "Phone" },
      { field: "address", headerName: "Address" },
      { field: "createdAt", headerName: "Date" },
      { field: "ids", headerName: "IDs" },
    ];
    const dynamicColumns = Array.from({ length: maxPrescriptions }, (_, i) => ({
      field: `${searchField}_${i + 1}`,
      headerName: `${searchField === "internalNote"
        ? "Internal Note "
        : searchField.charAt(0).toUpperCase() + searchField.slice(1)
        } ${i + 1}`,
    }));
    return [...baseColumns, ...dynamicColumns];
  }, [onPatientSelect, searchField, maxPrescriptions]);

  return (
    <Box
      className="custom-scrollbar"
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Box sx={{ px: "24px" }}>
          <HeadingText name="Search Prescription" />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              mb: 1,
              width: "100%", // Make the Box take full width
            }}
          >
            <Autocomplete
              freeSolo
              options={internalNoteOptions}
              value={searchTerm}
              onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
              sx={{ flex: 1 }} // Make the Autocomplete take all available width
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="outlined-required"
                  label="Search"
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: "#fff",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        borderWidth: "1px",
                      },
                    },
                  }}
                  placeholder="Type or select internal note"
                />
              )}
            />
            <IconButton
              color="primary"
              onClick={handleSearch}
              edge="end"
              size="small"
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => handleExport(searchResults)}
              disabled={searchResults.length === 0}
              title={
                searchResults.length === 0
                  ? "No data to export"
                  : "Export to Excel"
              }
            >
              <FileDown size="24" />
            </IconButton>
          </Box>
          {/* <Box sx={{ width: "16px" }} /> */}
          {/* <Box sx={{ width: "16px" }} /> */}
          <Box sx={{ display: "flex", gap: 2, my: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate ? dayjs(startDate, "DD/MM/YYYY") : null}
              onChange={(date) => {
                setStartDate(date ? date.format("DD/MM/YYYY") : "");
              }}
              format="DD/MM/YYYY"
              minDate={minStartDate}
              maxDate={maxEndDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="End Date"
              value={endDate ? dayjs(endDate, "DD/MM/YYYY") : null}
              onChange={(date) => {
                setEndDate(date ? date.format("DD/MM/YYYY") : "");
              }}
              format="DD/MM/YYYY"
              minDate={minStartDate}
              maxDate={maxEndDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <TextField
              select
              label="Search Type"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="piles">Piles</MenuItem>
              <MenuItem value="spine">Spine</MenuItem>
            </TextField>
          </Box>
          <AddPatientDialog
            open={open}
            onClose={() => setOpen(false)}
            onPatientAdded={() => { }}
          />
          {/* Only show table if search has been performed */}
          {hasSearched ? (
            <Box sx={{ height: "80vh", width: "162vh", overflowX: "auto" }}>
              {loadingSearch ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              ) : searchResults.length > 0 ? (
                <CustomLightTable
                  columns={columns}
                  rows={searchResults}
                  searchField={searchField}
                  maxPrescriptions={maxPrescriptions}
                // Removed rowCount and onRowCountChange
                />
              ) : (
                <Box sx={{ mt: 4, py: 2, textAlign: "center", color: "#888" }}>
                  <Typography variant="subtitle1">
                    No results found{searchTerm ? ` for "${searchTerm}"` : ''}{(startDate || endDate) ? ` in the selected date range` : ''}.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 4, py: 2, textAlign: "start", color: "#888" }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Enter a search term or select a date range to find prescriptions.
              </Typography>
            </Box>
          )}
          <Snackbar
            open={!!errorMsg}
            autoHideDuration={5000}
            onClose={() => setErrorMsg(null)}
            message={errorMsg}
          />
        </Box>
      </Box>
      <Box sx={{ height: 18 }} />
    </Box>
  );
}

export default SearchPatients;
