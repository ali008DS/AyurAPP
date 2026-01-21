import {
  Grid,
  Typography,
  Box,
  TextField,
  Avatar,
  Skeleton,
  List,
  ListSubheader,
  CircularProgress,
  ListItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useEffect, useState } from "react";
import PatientSearchInput from "../../patient/PatientSearchInput";
import ApiManager from "../../services/apimanager";
import { usePrescription } from "../context/PrescriptionContext";
import ColoredSections from "./colored-section";
import dayjs from "dayjs";
import { Eye } from "lucide-react";

interface PatientDetails {
  opdId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  city: string;
  state: string;
  attendantName: string;
  documents: string[];
}

interface Props {
  patientId: string;
  prescriptionID: string;
  mode?: string;
}

export const PatientDetailsSection = ({ patientId, prescriptionID }: Props) => {
  const { prescriptionData, updatePrescriptionData } = usePrescription();
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [existingDocuments, setExistingDocuments] = useState<
    { name: string; url: string; originalName: string; createdAt: string }[]
  >([]);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );

  useEffect(() => {
    if (patientDetails?.opdId && !prescriptionData.opdId) {
      updatePrescriptionData({ opdId: patientDetails.opdId });
    }
    if (patientDetails?.documents && Array.isArray(patientDetails.documents)) {
      (async () => {
        try {
        const documentsList = await Promise.all(
          patientDetails?.documents.map(async (doc: any) => {
            const createdAt = doc.split("-")[0]; // Extract timestamp prefix
            const cleanName = doc.split("-").slice(1).join("-"); // Remove timestamp prefix
            const response = await ApiManager.getS3Url(doc);
            const url = response.metaData.signedUrl;
            return {
              name: cleanName,
              url,
              originalName: doc,
              createdAt: dayjs(parseInt(createdAt)).format("DD/MM/YYYY"),
            };
          })
        );
        setExistingDocuments(documentsList);
        setDocumentsLoading(false);
      } catch (error) {
        console.error("Error fetching document URLs:", error);
        setDocumentsLoading(false);
      }
      })();
    }

  }, [patientDetails]);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const effectivePatientId = patientId || prescriptionData.patient;
        if (!effectivePatientId) return;
        const response = await ApiManager.getPatientById(effectivePatientId);
        if (response?.data) {
          setPatientDetails(response.data);
          updatePrescriptionData({ patient: effectivePatientId });
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };
    const fetchPrescriptionDetails = async () => {
      try {
        const response = await ApiManager.getPrescriptionById(prescriptionID);
        if (response?.data) {
          // Include prescriptionType and createOn in the update when fetching prescription details
          updatePrescriptionData({
            vitals: response.data.vitals,
            prescriptionType: response.data.prescriptionType,
            createOn: response.data.createOn,
          });
          console.log(
            "Fetched prescription type in details:",
            response.data.prescriptionType
          );
        }
      } catch (error) {
        console.error("Error fetching prescription details:", error);
      }
    };

    fetchPatientDetails();
    fetchPrescriptionDetails();
  }, [patientId, prescriptionID, prescriptionData.patient]);

  // OPD search replaced by the shared PatientSearchInput component

  const calculateBMI = (weight: string | number, height: string | number) => {
    const w = parseFloat(weight as string);
    const h = parseFloat(height as string) / 100; // convert cm to m
    if (!w || !h) return "";
    const bmi = w / (h * h);
    return bmi ? bmi.toFixed(2) : "";
  };

  const LoadingSkeleton = () => (
    <Box>
      <Grid container spacing={1} alignItems="start">
        {/* Patient Information Skeleton */}
        <Grid item xs={5}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                flex: 1,
              }}
            >
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="70%" />
            </Box>
          </Box>
        </Grid>

        {/* Vitals Section Skeleton */}
        <Grid item xs={7}>
          <Grid container spacing={1} sx={{ p: 0.7 }}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={4} key={index}>
                <Skeleton variant="rectangular" height={40} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <>
      <ColoredSections
        title="Patient Details"
        backgroundColor="rgba(165, 216, 255, 0.2)"
      >
        {" "}
        {!patientDetails ? (
          <LoadingSkeleton />
        ) : (
          <Box>
            <Grid container spacing={1} alignItems="start">
              {/* Patient Information */}
              <Grid item xs={5}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#1677FF", fontWeight: 600, mt: 0.6 }}>
                    {patientDetails ? patientDetails.firstName.charAt(0) : "?"}
                  </Avatar>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography variant="h6" fontWeight={700} color="#222">
                      {patientDetails
                        ? `${patientDetails.firstName.toUpperCase()} ${patientDetails?.lastName.toUpperCase()}`
                        : "Loading..."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong>{" "}
                      {patientDetails ? patientDetails.phone : "Loading..."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Address:</strong>{" "}
                      {patientDetails ? patientDetails.address : "Loading..."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>City:</strong>{" "}
                      {patientDetails ? patientDetails.city : "Loading..."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>State:</strong>{" "}
                      {patientDetails ? patientDetails.state : "Loading..."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Prescription Type:</strong>{" "}
                      {prescriptionData.prescriptionType
                        ? prescriptionData.prescriptionType
                        : "OFFLINE"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Attendant name:</strong>{" "}
                      {patientDetails
                        ? patientDetails.attendantName
                        : "Loading..."}
                    </Typography>
                  </Box>
                  {/* List to show existing and newly uploaded documents */}
                </Box>
                  <List
                      sx={{
                        width: "auto",
                        bgcolor: "background.paper",
                        overflow: "auto",
                        maxHeight: 150,
                        borderRadius: "8px",
                        minHeight: 50, // Ensure there's always space for the loading indicator
                      }}
                      dense
                      subheader={
                        <ListSubheader
                          sx={{
                            alignItems: "center",
                            bgcolor: "#f9f9f9",
                            borderBottom: "1px solid #ddd",
                            py: 0.25,
                            fontSize: "0.8rem",
                            lineHeight: 1,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold" sx={{textDecoration:'underline'}} color="text.secondary">Uploaded Files</Typography>
                          {documentsLoading && (
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                          )}
                        </ListSubheader>
                      }
                    >
                      {documentsLoading ? (
                        // Show skeletons while loading
                        Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <ListItem
                              key={`skeleton-${index}`}
                              sx={{ borderBottom: "1px solid #eee" }}
                            >
                              <Skeleton
                                variant="text"
                                width="60%"
                                sx={{ fontSize: "0.8rem" }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  marginLeft: "auto",
                                }}
                              >
                                <Skeleton
                                  variant="text"
                                  width={"60px"}
                                  height={24}
                                />
                                <Skeleton
                                  variant="circular"
                                  width={24}
                                  height={24}
                                />
                              </Box>
                            </ListItem>
                          ))
                      ) : existingDocuments.length === 0 ? (
                        <ListItem>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              py: 1,
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            No documents uploaded
                          </Typography>
                        </ListItem>
                      ) : (
                        <>
                          {existingDocuments.map((doc, index) => {
                            return (
                              <ListItem
                                key={`existing-${index}`}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderBottom: "1px solid #eee",
                                  transition: "opacity 0.2s",
                                  "&:hover": {
                                    cursor: "pointer",
                                    backgroundColor: "#f5f5f5",
                                    transition: "background-color 0.2s ease",
                                  },
                                }}
                              >
                                <Tooltip
                                  title={
                                    doc.name +
                                    " (Uploaded on: " +
                                    doc.createdAt +
                                    ")"
                                  }
                                >
                                  <Typography
                                    sx={{
                                      width: "200px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {doc.name}
                                  </Typography>
                                </Tooltip>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    marginLeft: "0.5rem",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography variant="caption">{doc.createdAt}</Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => window.open(doc.url)}
                                  >
                                    <Eye size={16} />
                                  </IconButton>
                                </Box>
                              </ListItem>
                            );
                          })}
                        </>
                      )}
                  </List>
              </Grid>


              {/* Vitals Section */}
              <Grid item xs={7}>
                <Grid container spacing={1} sx={{ p: 0.7 }}>
                  {/* BP Systolic */}
                  <Grid item xs={4} key="bpSystolic">
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      label="BP Systolic"
                      value={prescriptionData.vitals.bpSystolic || ""}
                      onChange={(e) => {
                        const updatedVitals = {
                          ...prescriptionData.vitals,
                          bpSystolic: e.target.value,
                        };
                        updatePrescriptionData({ vitals: updatedVitals });
                      }}
                      InputProps={{
                        inputProps: {
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        },
                        endAdornment: (
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            mmHg
                          </Typography>
                        ),
                      }}
                      fullWidth
                      placeholder="Enter BP Systolic"
                    />
                  </Grid>
                  {/* BP Diastolic */}
                  <Grid item xs={4} key="bpDiastolic">
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      label="BP Diastolic"
                      value={prescriptionData.vitals.bpDiastolic || ""}
                      onChange={(e) => {
                        const updatedVitals = {
                          ...prescriptionData.vitals,
                          bpDiastolic: e.target.value,
                        };
                        updatePrescriptionData({ vitals: updatedVitals });
                      }}
                      InputProps={{
                        inputProps: {
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        },
                        endAdornment: (
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            mmHg
                          </Typography>
                        ),
                      }}
                      fullWidth
                      placeholder="Enter BP Diastolic"
                    />
                  </Grid>
                  {/* Other vitals */}
                  {[
                    { label: "Pulse", key: "pulse", unit: "bpm" },
                    { label: "Height", key: "height", unit: "cm" },
                    { label: "Weight", key: "weight", unit: "kg" },
                    { label: "BMI", key: "bmi", unit: "kg/m²" },
                    { label: "SPO2", key: "spo2", unit: "%" },
                    { label: "RBS", key: "rbs", unit: "mmol/L" },
                    { label: "Abd Girth", key: "abdGrith", unit: "cm" },
                  ].map((vital) => (
                    <Grid item xs={4} key={vital.key}>
                      {vital.key === "height" || vital.key === "weight" ? (
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          label={vital.label}
                          value={
                            prescriptionData.vitals[
                              vital.key as keyof typeof prescriptionData.vitals
                            ] || ""
                          }
                          onChange={(e) => {
                            const updatedVitals = {
                              ...prescriptionData.vitals,
                              [vital.key]: e.target.value,
                              bmi:
                                vital.key === "height"
                                  ? calculateBMI(
                                      prescriptionData.vitals.weight || "",
                                      e.target.value
                                    )
                                  : calculateBMI(
                                      e.target.value,
                                      prescriptionData.vitals.height || ""
                                    ),
                            };
                            updatePrescriptionData({ vitals: updatedVitals });
                          }}
                          InputProps={{
                            inputProps: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                            endAdornment: (
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                {vital.unit}
                              </Typography>
                            ),
                          }}
                          fullWidth
                          placeholder={`Enter ${vital.label}`}
                        />
                      ) : vital.key === "bmi" ? (
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          label={vital.label}
                          value={
                            prescriptionData.vitals[
                              vital.key as keyof typeof prescriptionData.vitals
                            ] || ""
                          }
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                {vital.unit}
                              </Typography>
                            ),
                          }}
                          fullWidth
                          placeholder="Auto-calculated"
                        />
                      ) : (
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          label={vital.label}
                          value={
                            prescriptionData.vitals[
                              vital.key as keyof typeof prescriptionData.vitals
                            ] || ""
                          }
                          onChange={(e) => {
                            const updatedVitals = {
                              ...prescriptionData.vitals,
                              [vital.key]: e.target.value,
                            };
                            updatePrescriptionData({ vitals: updatedVitals });
                          }}
                          InputProps={{
                            inputProps: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                            endAdornment: (
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                {vital.unit}
                              </Typography>
                            ),
                          }}
                          fullWidth
                          placeholder={`Enter ${vital.label}`}
                        />
                      )}
                    </Grid>
                  ))}
                  {[
                    { label: "CVS", key: "cvs", unit: "" },
                    { label: "CNS", key: "cns", unit: "" },
                  ].map((vital) => (
                    <Grid item xs={6} key={vital.key}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label={vital.label}
                        value={
                          prescriptionData.vitals[
                            vital.key as keyof typeof prescriptionData.vitals
                          ] || ""
                        }
                        onChange={(e) => {
                          const updatedVitals = {
                            ...prescriptionData.vitals,
                            [vital.key]: e.target.value,
                          };
                          updatePrescriptionData({ vitals: updatedVitals });
                        }}
                        InputProps={{
                          endAdornment: (
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              {vital.unit}
                            </Typography>
                          ),
                        }}
                        fullWidth
                        placeholder={`Enter ${vital.label}`}
                      />
                    </Grid>
                  ))}{" "}
                  {/* created at date update */}
                  <Grid item xs={6}>
                    <DateTimePicker
                      label="Created On"
                      value={
                        prescriptionData.createOn
                          ? dayjs(prescriptionData.createOn)
                          : dayjs(prescriptionData.createdAt)
                      }
                      onChange={(newValue) => {
                        const updatedData = {
                          ...prescriptionData,
                          createOn: newValue
                            ? newValue.toISOString()
                            : dayjs().toISOString(),
                        };
                        updatePrescriptionData(updatedData);
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          variant: "outlined",
                          placeholder: "Select date and time",
                        },
                      }}
                      format="DD/MM/YYYY hh:mm A"
                    />
                  </Grid>
                  <Grid item xs={12} md={6} key="opdId">
                    <PatientSearchInput
                      initialOpd={prescriptionData.opdId || ""}
                      value={patientDetails as any}
                      onPatientSelect={(patient) => {
                        if (patient) {
                          setPatientDetails(patient as any);
                          updatePrescriptionData({ patient: (patient as any)._id, opdId: (patient as any).opdId || '' });
                        } else {
                          setPatientDetails(null);
                          updatePrescriptionData({ patient: "", opdId: "" });
                        }
                      }}
                      label="OPD ID"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
      </ColoredSections>
    </>
  );
};

export default PatientDetailsSection;
