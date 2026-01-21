import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
  Box,
  Typography,
} from "@mui/material";
import ApiManager from "../../services/apimanager";
import { debounce } from "lodash";
import { useAppContext } from "../../../context/app-context";

interface AssignBedDialogProps {
  open: boolean;
  onClose: () => void;
  onAssignSuccess: () => void;
}

const AssignBedDialog: React.FC<AssignBedDialogProps> = ({
  open,
  onClose,
  onAssignSuccess,
}) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [beds, setBeds] = useState<any>({}); // Initialize as object
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedBed, setSelectedBed] = useState<any | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { setAlert } = useAppContext();
  const [assignBed, setAsssignBed] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBeds();
    }
    return () => {
      // Reset states when dialog closes
      setSelectedPatient(null);
      setSelectedBed(null);
      setInputValue("");
    };
  }, [open]);

  // Debounced search function that triggers as user types
  const debouncedSearch = React.useCallback(
    debounce((searchTerm) => {
      if (searchTerm.length >= 2) {
        fetchPatients(searchTerm);
      }
    }, 300),
    []
  );

  // Update search term and trigger debounced search
  const handleInputChange = (_: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const fetchPatients = async (
    search: string = "",
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setLoadingPatients(true);
      const response = await ApiManager.getPatients(page, limit, search);
      if (response.data?.status && Array.isArray(response.data.data)) {
        setPatients(response.data.data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchBeds = async () => {
    try {
      setLoadingBeds(true);
      const response = await ApiManager.getBed();
      if (Array.isArray(response.data)) {
        // Group beds by floor
        const bedsGrouped = response.data.reduce((acc: any, bed: any) => {
          const floor = bed.floor || "Unknown";
          if (!acc[floor]) acc[floor] = [];
          acc[floor].push({
            id: bed._id,
            bedId: bed.bedId,
            status: bed.status,
            type: bed.bedType,
            floor,
          });
          return acc;
        }, {});
        setBeds(bedsGrouped);
      } else {
        setBeds({});
      }
    } catch (error) {
      console.error("Error fetching beds:", error);
      setBeds({});
    } finally {
      setLoadingBeds(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPatient || !selectedBed) {
      setAlert({
        severity: "warning",
        message: "Please select both a patient and a bed.",
      });
      return;
    }

    setAsssignBed(true); // ⬅️ Start loading

    try {
      const payload = {
        bed: selectedBed.id,
        patient: selectedPatient._id,
      };
      const response = await ApiManager.assignBed(payload);

      if (response.status) {
        setAlert({
          severity: "success",
          message: "Bed assigned successfully!",
        });
        onAssignSuccess();
        onClose();
      } else {
        setAlert({
          severity: "error",
          message:
            response?.data?.message ||
            "Failed to assign bed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Error assigning bed:", error);
      setAlert({
        severity: "error",
        message:
          error?.response?.data?.message ||
          "Failed to assign bed. Please try again.",
      });
    } finally {
      setAsssignBed(false); // end loading
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Assign Bed
        {selectedPatient && (
          <Typography variant="subtitle1" color="primary">
            Patient: {selectedPatient.firstName} {selectedPatient.lastName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ my: 1 }}>
          {/* Patient search with autocomplete */}
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              id="patient-search"
              options={patients}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} (${
                  option.phone || "No Phone"
                })`
              }
              loading={loadingPatients}
              onInputChange={handleInputChange}
              onChange={(_, newValue) => {
                setSelectedPatient(newValue);
              }}
              inputValue={inputValue}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  fullWidth
                  variant="outlined"
                  helperText="Type at least 2 characters to search"
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
                      {option.firstName} {option.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.phone || "No Phone"} •{" "}
                      {option.email || "No Email"}
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
          </Box>

          {/* Bed selection area with autocomplete */}
          <Box>
            <Autocomplete
              id="bed-select"
              options={Object.entries(beds).flatMap(([floor, bedsArr]) =>
                (Array.isArray(bedsArr) ? bedsArr : []).map((bed: any) => ({
                  ...bed,
                  group: floor,
                }))
              )}
              groupBy={(option) => option.group}
              getOptionLabel={(option) =>
                `${option.bedId} (${option.type || "Standard"}) - ${
                  option.status
                }`
              }
              loading={loadingBeds}
              onChange={(_, value) => setSelectedBed(value)}
              getOptionDisabled={(option) => option.status === "occupied"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Bed"
                  fullWidth
                  variant="outlined"
                  helperText="Search or select an available bed"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingBeds ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
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
                      {option.bedId} ({option.type || "Standard"})
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        option.status === "occupied" ? "error" : "success.main"
                      }
                    >
                      {option.status.charAt(0).toUpperCase() +
                        option.status.slice(1)}
                      {option.group ? ` • Floor: ${option.group}` : ""}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText={
                loadingBeds ? "Loading beds..." : "No beds available"
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          color="primary"
          disabled={!selectedPatient || !selectedBed || assignBed}
          startIcon={
            assignBed ? <CircularProgress size={20}/> : null
          }
        >
          {assignBed ? "" : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignBedDialog;
