import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { useForm, Controller } from "react-hook-form";
import { useAppContext } from "../../context/app-context";
import { usePatients } from "../../context/patients-context";
import apimanager from "../services/apimanager";
import { CircularProgress, FormControl, InputLabel, Menu, MenuItem, Select } from "@mui/material";
import { CloudUpload, Eye, Trash2, CheckCheck, Plus, X } from "lucide-react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import {
  TextField,
  Tooltip,
  IconButton,
  Grid,
  Skeleton,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListSubheader,
} from "@mui/material";
import { useDropzone } from "react-dropzone";

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | ''
  address: string;
  dob: string;
  city: string;
  state: string;
  status: string;
  documents: string[];
  uhId?: string;
  ipdId?: string;
  opdId?: string;
  notes: string[];
  attendantName?: string;
  relativeName?: string;
  relationship?: 'S/o' | 'D/o' | 'W/o' | 'H/o';
}

interface PatientsInfoTabProps {
  PatientInfo: Patient;
}

function PatientsInfoTab({ PatientInfo }: PatientsInfoTabProps) {
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [relationshipMenuAnchorEl, setRelationshipMenuAnchorEl] = useState<null | HTMLElement>(null);
  const openRelationshipMenu = Boolean(relationshipMenuAnchorEl);
  const [documentActionLoading, setDocumentActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const { setAlert } = useAppContext();
  const { fetchPatients } = usePatients();
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<
    { name: string; url: string; originalName: string; createdAt: string }[]
  >([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  // local-only state for status update via submit

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      dob: "",
      phone: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      uhId: "",
      ipdId: "",
      opdId: "",
      attendantName: "",
      relativeName: "",
      relationship: 'S/o', // Default value for relationship
      status: 'enquiry',
    },
  });

  // Single centralized data fetching function
  const fetchPatientData = useCallback(async () => {
    if (!PatientInfo?.id) return;

    setLoading(true);
    setDocumentsLoading(true);

    try {
      const response = await apimanager.getPatientById(
        PatientInfo.id.toString()
      );
      const patient = response.data;
      setPatientData(patient);
      console.log("Fetched patient data:", patient);
      reset({
        firstName: patient.firstName,
        lastName: patient?.lastName,
        dob: new Date(patient.dob).toISOString().split("T")[0],
        phone: patient.phone,
        gender: patient.gender || "",
        address: patient.address,
        city: patient.city,
        state: patient.state,
        uhId: patient.uhId || "",
        ipdId: patient.ipdId || "",
        opdId: patient.opdId || "",
        attendantName: patient.attendantName || "",
        relativeName: patient.relativeName || "",
        relationship: patient.relationship || 'S/o', // Default to 'S/o' if not provided
        status: patient.status || 'enquiry',
      });

      // Set notes from patient data
      setNotes(patient.notes || []);

      // Process documents
      if (patient.documents && Array.isArray(patient.documents)) {
        console.log("Documents:", patient.documents);
        const documentsList = await Promise.all(
          patient.documents.map(async (doc: any) => {
            const createdAt = doc.split("-")[0]; // Extract timestamp prefix
            const cleanName = doc.split("-").slice(1).join("-"); // Remove timestamp prefix
            const response = await apimanager.getS3Url(doc);
            const url = response.metaData.signedUrl;
            return { name: cleanName, url, originalName: doc, createdAt: dayjs(parseInt(createdAt)).format("DD/MM/YYYY") };
          })
        );
        setExistingDocuments(documentsList);
      } else {
        setExistingDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setAlert({
        message: "Error loading patient data",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDocumentsLoading(false);
    }
  }, [PatientInfo.id, reset, setAlert]);

  // Fetch data on component mount or when PatientInfo.id changes
  useEffect(() => {
    fetchPatientData();
  }, [PatientInfo.id, fetchPatientData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Upload new files if any
      const uploadedKeys =
        files.length > 0
          ? await Promise.all(
              files.map(async (file) => {
                const response = await apimanager.uploadToS3(file);
                return response.data.key;
              })
            )
          : [];

      // Combine existing document keys with new uploaded keys
      const existingKeys = patientData?.documents || [];
      const allDocuments = [...existingKeys, ...uploadedKeys];

      // Update patient with all data
      await apimanager.updatePatient(PatientInfo.id.toString(), {
        id: PatientInfo.id.toString(),
        ...data,
        documents: allDocuments,
      });

      // Refresh data after update
      await fetchPatients();
      setFiles([]); // Clear uploaded files after successful update
      await fetchPatientData(); // Refresh patient data and documents

      setAlert({
        message: "Patient updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error during file upload or patient update:", error);
      setAlert({
        message: "Error updating patient or uploading files",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (file: File | string, docId?: string) => {
    if (docId) {
      setDocumentActionLoading((prev) => ({ ...prev, [docId]: true }));
    }

    try {
      if (file instanceof File) {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      } else {
        window.open(file);
      }
    } finally {
      if (docId) {
        // Small delay to avoid UI flashing
        setTimeout(() => {
          setDocumentActionLoading((prev) => ({ ...prev, [docId]: false }));
        }, 300);
      }
    }
  };

  const handleDelete = async (originalName: string) => {
    const uniqueId = `delete-${originalName}`;
    setDocumentActionLoading((prev) => ({ ...prev, [uniqueId]: true }));

    try {
      await apimanager.deleteS3File(originalName);

      // Update local state for immediate UI feedback
      setExistingDocuments((prev) =>
        prev.filter((doc) => doc.originalName !== originalName)
      );

      // Update patient record to remove the document reference
      if (patientData) {
        const updatedDocuments = patientData.documents.filter(
          (doc) => doc !== originalName
        );

        await apimanager.updatePatient(PatientInfo.id.toString(), {
          id: PatientInfo.id.toString(),
          documents: updatedDocuments,
        });

        await fetchPatients();
      }

      setAlert({
        message: "Document deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      setAlert({
        message: "Error deleting document",
        severity: "error",
      });
    } finally {
      setDocumentActionLoading((prev) => ({ ...prev, [uniqueId]: false }));
    }
  };

  const handleAddNote = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newNote.trim()) {
      e.preventDefault();

      const updatedNotes = [...notes, newNote.trim()];
      setNotes(updatedNotes);
      setNewNote("");

      try {
        await apimanager.updatePatient(PatientInfo.id.toString(), {
          id: PatientInfo.id.toString(),
          notes: updatedNotes,
        });
        await fetchPatients();
        setAlert({
          message: "Note added successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Error updating patient notes:", error);
        setAlert({
          message: "Error adding note",
          severity: "error",
        });
      }
    }
  };

  const handleDeleteNote = async (noteToDelete: string) => {
    const updatedNotes = notes.filter((note) => note !== noteToDelete);
    setNotes(updatedNotes);

    try {
      await apimanager.updatePatient(PatientInfo.id.toString(), {
        id: PatientInfo.id.toString(),
        notes: updatedNotes,
      });
      await fetchPatients();
      setAlert({
        message: "Note deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      setAlert({
        message: "Error deleting note",
        severity: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          m: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
          width: "98%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mt: 0.75,
            width: "100%",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="First Name"
                    required
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Last Name"
                    required
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    size="small"
                    label="DOB"
                    type="date"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <Controller
              name='gender'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
  <InputLabel id="gender-label">Gender</InputLabel>
  <Select
    labelId="gender-label"
    id="gender"
    label="Gender"
    {...field}
  >
    <MenuItem value="" disabled sx={{
      display: 'none'
    }}>
            <em>None</em>
    </MenuItem>
    <MenuItem value='male'>Male</MenuItem>
    <MenuItem value='female'>Female</MenuItem>
  </Select>
</FormControl>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    size="small"
                    label="Phone"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    disabled={loading}
                    variant="outlined"
                    InputProps={{
                      // show submit loading indicator here instead of immediate status updating
                      endAdornment: loading ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : undefined,
                    }}
                    onChange={(e) => {
                      // Only update local form state; API update will happen on form submit
                      const newStatus = (e.target as HTMLInputElement).value;
                      field.onChange(newStatus);
                    }}
                  >
                    <MenuItem value="enquiry">Enquiry</MenuItem>
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Address"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="City"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="State"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name='relativeName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Relative"
                    disabled={loading}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              setRelationshipMenuAnchorEl(e.currentTarget);
                            }
                            }
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',

                          }}
                            >

                            {watch('relationship')}<KeyboardArrowDownIcon />
                            </Box>
                            <Menu
                            anchorEl={relationshipMenuAnchorEl}
                            open={openRelationshipMenu}
                            onClose={() => setRelationshipMenuAnchorEl(null)}
                            >
                              {['S/o', 'D/o', 'W/o', 'H/o'].map((rel) => (
                                <MenuItem
                                  key={rel}
                                  onClick={() => {
                                    setValue('relationship', rel);
                                    setRelationshipMenuAnchorEl(null);
                                  }}
                                >
                                  {rel}
                                </MenuItem>
                              ))}
                            </Menu>
                          </InputAdornment>
                        ),
                      }
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="uhId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="UH ID"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="ipdId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="IPD ID"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="opdId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="OPD ID"
                    disabled={loading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
        {/* Notes Section */}
        <Box sx={{ width: "100%", mt: 0.5 }}>
          {/* Add note input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Add a new note and press Enter"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleAddNote}
            sx={{ mb: 0.5 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Plus size={18} color="#666" />
                </InputAdornment>
              ),
            }}
          />

          {/* Notes display */}
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {notes &&
              notes.length > 0 &&
              notes.map((note, index) => (
                <Chip
                  key={index}
                  label={note}
                  onDelete={() => handleDeleteNote(note)}
                  deleteIcon={<X size={16} />}
                  sx={{
                    fontSize: "0.8rem",
                    backgroundColor: "#f0f7ff",
                    borderRadius: "4px",
                    "& .MuiChip-deleteIcon": {
                      color: "#5c6bc0",
                      "&:hover": {
                        color: "#ff5252",
                      },
                    },
                  }}
                />
              ))}
          </Box>
        </Box>

        {/* File upload area */}
        <Box
          {...getRootProps()}
          sx={{
            gap: 0.75,
            my: 0.3,
            width: "99%",
            height: "100px",
            border: "2px dashed #e0e0e0",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: isDragActive ? "#f0f8ff" : "#fff",
            opacity: loading ? 0.7 : 1,
            transition: "background-color 0.3s ease, opacity 0.3s ease",
            "&:hover": {
              backgroundColor: loading ? "#fff" : "#f0f8ff",
              border: loading ? "2px dashed #e0e0e0" : "2px dashed #75ADE4",
            },
          }}
        >
          <input {...getInputProps()} disabled={loading} />
          <CloudUpload color="#6F7377" />
          <Typography variant="body2" color="textSecondary">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : isDragActive
              ? "Drop the files here"
              : "Drag and drop files here, or click to select files"}
          </Typography>
        </Box>

        {/* List to show existing and newly uploaded documents */}
        <List
          sx={{
            width: "100%",
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
                justifyContent: "space-between",
              }}
            >
              <span>Uploaded Files</span>
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
                  <Box sx={{ display: "flex", gap: 1, marginLeft: "auto" }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>
                </ListItem>
              ))
          ) : existingDocuments.length === 0 && files.length === 0 ? (
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
                const deleteId = `delete-${doc.originalName}`;
                const viewId = `view-${doc.originalName}`;
                const isDeleteLoading = !!documentActionLoading[deleteId];
                const isViewLoading = !!documentActionLoading[viewId];

                return (
                  <ListItem
                    key={`existing-${index}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #eee",
                      opacity: isDeleteLoading ? 0.6 : 1,
                      transition: "opacity 0.2s",
                      "&:hover": {
                        cursor: "pointer",
                        backgroundColor: "#f5f5f5",
                        transition: "background-color 0.2s ease",
                      },
                    }}
                  >
                    <Tooltip title={doc.name + " (Uploaded on: " + doc.createdAt + ")"}>
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
                    <Box sx={{ display: "flex", gap: 1, marginLeft: "0.5rem" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(doc.url, viewId)}
                        disabled={isViewLoading || isDeleteLoading || loading}
                      >
                        {isViewLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(doc.originalName)}
                        disabled={isDeleteLoading || isViewLoading || loading}
                      >
                        {isDeleteLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
              {files.map((file, index) => {
                const fileId = `file-${index}`;
                const isViewLoading = !!documentActionLoading[fileId];

                return (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom:
                        index === files.length - 1 ? "none" : "1px solid #eee",
                      "&:hover": {
                        cursor: "pointer",
                        backgroundColor: "#f5f5f5",
                        transition: "background-color 0.2s ease",
                      },
                    }}
                  >
                    <Tooltip title={file.name}>
                      <Typography
                        sx={{
                          width: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "0.8rem",
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.7rem",
                        flexShrink: 0,
                        ml: 2,
                      }}
                    >
                      {(file.size / 1024).toFixed(2)} KB • {file.type || "N/A"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, marginLeft: "0.5rem" }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleView(file, fileId)}
                        disabled={isViewLoading || loading}
                      >
                        {isViewLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </>
          )}
        </List>

        <Button
          type="submit"
          variant="outlined"
          fullWidth
          size="medium"
          sx={{ ml: 1, borderRadius: "8px" }}
          startIcon={
            loading ? (
              <CircularProgress size={12} color="inherit" />
            ) : (
              <CheckCheck size="20px" />
            )
          }
          disabled={loading || documentsLoading}
        >
          Update
        </Button>
      </Box>
    </form>
  );
}

export default PatientsInfoTab;
