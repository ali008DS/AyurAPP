import {
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  Tooltip,
  Button,
  CircularProgress,
} from "@mui/material";
import HeadingText from "../../ui/HeadingText";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, Eye, Trash2, Phone, Mail, MapPin, Edit } from "lucide-react";
import PaletteIcon from "@mui/icons-material/Palette";
import { useAppContext } from "../../../context/app-context";
import ApiManager from "../../services/apimanager";
import { getTenantData } from "../../../utils/tenant";

function WebsiteSettings() {
  const navigate = useNavigate();
  const { websiteIdentity, updateWebsiteIdentity, themeColor, updateThemeColor } = useAppContext();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(websiteIdentity.logo);
  const [clinicName, setClinicName] = useState(websiteIdentity.clinicName);
  const [address, setAddress] = useState(websiteIdentity.address || "");
  const [phoneNumber, setPhoneNumber] = useState(websiteIdentity.phoneNumber || "");
  const [email, setEmail] = useState(websiteIdentity.email || "");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [appInfoId, setAppInfoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Prescription layout images state
  const [headerPreview, setHeaderPreview] = useState<string | null>(websiteIdentity.prescriptionHeader);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(websiteIdentity.prescriptionBackground);
  const [footerPreview, setFooterPreview] = useState<string | null>(websiteIdentity.prescriptionFooter);
  const [logoKey, setLogoKey] = useState<string | null>(null);
  const [headerKey, setHeaderKey] = useState<string | null>(null);
  const [backgroundKey, setBackgroundKey] = useState<string | null>(null);
  const [footerKey, setFooterKey] = useState<string | null>(null);

  // Load existing app info on mount
  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const tenantData = getTenantData();
        if (!tenantData?._id) {
          console.error("No tenant ID found");
          setIsLoading(false);
          return;
        }

        const response = await ApiManager.getAppInfoByTenant(tenantData._id);
        console.log("Loaded app info:", response);

        if (response.status && response.data) {
          const appInfo = response.data;

          // Set the app info ID for updates
          setAppInfoId(appInfo._id || appInfo.id);

          // Set form fields
          if (appInfo.name) setClinicName(appInfo.name);
          if (appInfo.address) setAddress(appInfo.address);
          if (appInfo.phone) setPhoneNumber(appInfo.phone);
          if (appInfo.email) setEmail(appInfo.email);

          // Set image keys and previews from the enhanced response
          // The API now returns both keys and signed URLs via imageUrls
          if (appInfo.logo) {
            setLogoKey(appInfo.logo);
            if (appInfo.imageUrls?.logo) {
              setLogoPreview(appInfo.imageUrls.logo);
            }
          }

          if (appInfo.prescriptionHeader) {
            setHeaderKey(appInfo.prescriptionHeader);
            if (appInfo.imageUrls?.prescriptionHeader) {
              setHeaderPreview(appInfo.imageUrls.prescriptionHeader);
            }
          }

          if (appInfo.prescriptionBackground) {
            setBackgroundKey(appInfo.prescriptionBackground);
            if (appInfo.imageUrls?.prescriptionBackground) {
              setBackgroundPreview(appInfo.imageUrls.prescriptionBackground);
            }
          }

          if (appInfo.prescriptionFooter) {
            setFooterKey(appInfo.prescriptionFooter);
            if (appInfo.imageUrls?.prescriptionFooter) {
              setFooterPreview(appInfo.imageUrls.prescriptionFooter);
            }
          }
        }
      } catch (error) {
        console.error("Error loading app info:", error);
        // If 404, it means no app-info exists yet, which is fine
      } finally {
        setIsLoading(false);
      }
    };

    loadAppInfo();
  }, []);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>({});

  // Validation function
  const validateSettings = () => {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    } = {};

    // Validate clinic name
    if (!clinicName || clinicName.trim() === "") {
      errors.name = "Clinic name is required";
    }

    // Validate email if provided
    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Invalid email format";
      }
    }

    // Validate phone if provided
    if (phoneNumber && phoneNumber.trim() !== "") {
      const phoneRegex = /^[\d\s\-+()]*$/;
      if (!phoneRegex.test(phoneNumber)) {
        errors.phone = "Invalid phone number format";
      }
    }

    setValidationErrors(errors);

    // Return validated data if no errors
    if (Object.keys(errors).length > 0) {
      return null;
    }

    return {
      name: clinicName,
      address: address || undefined,
      phone: phoneNumber || undefined,
      email: email || undefined,
    };
  };

  // Manual save handler
  const handleUpdateSettings = async () => {
    const validatedData = validateSettings();
    if (!validatedData) {
      // Don't save if validation fails
      return;
    }

    setIsSaving(true);

    try {
      const tenantData = getTenantData();
      const tenantId = tenantData?._id;

      if (!tenantId) {
        console.error("Tenant ID not found");
        return;
      }

      const data = {
        ...validatedData,
        logo: logoKey || undefined,
        prescriptionHeader: headerKey || undefined,
        prescriptionBackground: backgroundKey || undefined,
        prescriptionFooter: footerKey || undefined,
        colorTheme: themeColor || undefined,
        description: undefined, // Can add description field if needed
        tenantId,
      };

      console.log("Saving data:", data, appInfoId);

      let response;
      if (appInfoId) {
        response = await ApiManager.updateAppInfo(appInfoId, data);
      } else {
        response = await ApiManager.createAppInfo(data);
        if (response.status === 201) {
          setAppInfoId(response.data.id);
        }
      }

      if (response.status === 200 || response.status === 201) {
        console.log("Settings saved successfully");
        // You could add a success notification here
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      // You could add an error notification here
    } finally {
      setIsSaving(false);
    }
  };  // Update context immediately for real-time UI changes
  useEffect(() => {
    updateWebsiteIdentity({
      clinicName,

      logo: logoPreview,
      address,
      phoneNumber,
      email,
      prescriptionHeader: headerPreview,
      prescriptionBackground: backgroundPreview,
      prescriptionFooter: footerPreview
    });
  }, [clinicName, logoPreview, address, phoneNumber, email, headerPreview, backgroundPreview, footerPreview]);

  // Upload to S3 and get key + signed URL
  const uploadImageToS3 = async (file: File): Promise<{ key: string; signedUrl: string } | null> => {
    try {
      const response = await ApiManager.uploadToS3(file);
      if (response?.data?.key) {
        const urlResponse = await ApiManager.getS3Url(response.data.key);
        return {
          key: response.data.key,
          signedUrl: urlResponse.metaData.signedUrl
        };
      }
      return null;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "image/png" || file.type === "image/jpeg") {
        setLogoFile(file);
        // Show local preview while uploading
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to S3 and update preview/key
        const result = await uploadImageToS3(file);
        if (result) {
          setLogoPreview(result.signedUrl);
          setLogoKey(result.key);
        }
      }
    }
  }, []);

  const onDropHeader = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "image/png" || file.type === "image/jpeg") {
        // Show local preview while uploading
        const reader = new FileReader();
        reader.onloadend = () => {
          setHeaderPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to S3 and update preview/key
        const result = await uploadImageToS3(file);
        if (result) {
          setHeaderPreview(result.signedUrl);
          setHeaderKey(result.key);
        }
      }
    }
  }, []);

  const onDropBackground = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "image/png" || file.type === "image/jpeg") {
        // Show local preview while uploading
        const reader = new FileReader();
        reader.onloadend = () => {
          setBackgroundPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to S3 and update preview/key
        const result = await uploadImageToS3(file);
        if (result) {
          setBackgroundPreview(result.signedUrl);
          setBackgroundKey(result.key);
        }
      }
    }
  }, []);

  const onDropFooter = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "image/png" || file.type === "image/jpeg") {
        // Show local preview while uploading
        const reader = new FileReader();
        reader.onloadend = () => {
          setFooterPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to S3 and update preview/key
        const result = await uploadImageToS3(file);
        if (result) {
          setFooterPreview(result.signedUrl);
          setFooterKey(result.key);
        }
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const { getRootProps: getHeaderRootProps, getInputProps: getHeaderInputProps, isDragActive: isHeaderDragActive } = useDropzone({
    onDrop: onDropHeader,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const { getRootProps: getBackgroundRootProps, getInputProps: getBackgroundInputProps, isDragActive: isBackgroundDragActive } = useDropzone({
    onDrop: onDropBackground,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const { getRootProps: getFooterRootProps, getInputProps: getFooterInputProps, isDragActive: isFooterDragActive } = useDropzone({
    onDrop: onDropFooter,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const handleView = () => {
    if (logoPreview) {
      window.open(logoPreview, "_blank");
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, pb: 6, height: "100%", overflowY: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => {
              navigate("/settings");
            }}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <HeadingText name="Website Settings" />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Logo Upload Section */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Website Logo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your clinic/website logo. Recommended size: 200x200 pixels.
            </Typography>

            {/* Drag and Drop Area */}
            <Box
              {...getRootProps()}
              sx={{
                gap: 0.75,
                my: 0.3,
                width: "100%",
                height: "100px",
                border: "2px dashed #e0e0e0",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: isDragActive ? "#f0f8ff" : "#fff",
                transition: "background-color 0.3s ease, opacity 0.3s ease",
                "&:hover": {
                  backgroundColor: "#f0f8ff",
                  border: "2px dashed #75ADE4",
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload color="#6F7377" />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                {logoFile
                  ? `Selected: ${logoFile.name}`
                  : isDragActive
                    ? "Drop the logo here"
                    : "Drag and drop logo here, or click to select"}
              </Typography>
            </Box>

            {/* List to show uploaded logo */}
            {logoPreview && (
              <List
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  overflow: "auto",
                  maxHeight: 150,
                  borderRadius: "8px",
                  mt: 1,
                  minHeight: 50,
                }}
                dense
              >
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    "&:hover": {
                      cursor: "pointer",
                      backgroundColor: "#f5f5f5",
                      transition: "background-color 0.2s ease",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </Box>
                    <Tooltip title={logoFile?.name || "Current Logo"}>
                      <Typography
                        sx={{
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "0.8rem",
                        }}
                      >
                        {logoFile?.name || "Current Logo"}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, marginLeft: "0.5rem" }}>
                    <IconButton size="small" onClick={handleView}>
                      <Eye size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={handleRemoveLogo}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </ListItem>
              </List>
            )}
          </CardContent>
        </Card>

        {/* Website Identity Section */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Website Identity
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Clinic Name"
                variant="outlined"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Rayshree"
                error={!!validationErrors.name}
                helperText={validationErrors.name || "Required field"}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Contact Information
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit size={16} />}
                onClick={() => setIsEditingContact(!isEditingContact)}
                sx={{ textTransform: "none" }}
              >
                {isEditingContact ? "Done" : "Change"}
              </Button>
            </Box>

            {isEditingContact ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Address"
                  variant="outlined"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Main Street, City, State - 123456"
                  multiline
                  rows={2}
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone || "Format: digits, spaces, +, -, () allowed"}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@clinic.com"
                  type="email"
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                />
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <MapPin size={20} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Address
                    </Typography>
                    <Typography variant="body1" sx={{ color: address ? "#333" : "#999" }}>
                      {address || "Not set"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Phone size={20} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" sx={{ color: phoneNumber ? "#333" : "#999" }}>
                      {phoneNumber || "Not set"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Mail size={20} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ color: email ? "#333" : "#999" }}>
                      {email || "Not set"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings Section */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PaletteIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Theme Settings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a primary color for the application theme. All buttons and highlights will use this color.
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                type="color"
                label="Primary Color"
                variant="outlined"
                size="small"
                value={themeColor}
                onChange={(e) => updateThemeColor(e.target.value)}
                sx={{ width: 100, "& .MuiInputBase-input": { height: 40, p: 0.5, cursor: 'pointer' } }}
              />
              <TextField
                variant="outlined"
                label="Hex Code"
                size="small"
                value={themeColor.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                    updateThemeColor(val);
                  }
                }}
                placeholder="#1976D2"
                inputProps={{ maxLength: 7 }}
              />
            </Box>
          </CardContent>

        </Card>

        {/* Prescription Layout Section */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Prescription Layout
            </Typography>

            {/* Header Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: "#444" }}>
                Header Image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your prescription header image (JPG/PNG only). Recommended size: 800x150 pixels.
              </Typography>
              {headerPreview ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "#fafafa" }}>
                  <img src={headerPreview} alt="Header Preview" style={{ maxWidth: 200, maxHeight: 60, objectFit: "contain", borderRadius: 4 }} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => window.open(headerPreview, "_blank")}><Eye size={16} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => setHeaderPreview(null)}><Trash2 size={16} /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ) : (
                <Box
                  {...getHeaderRootProps()}
                  sx={{
                    gap: 0.75,
                    width: "100%",
                    height: "80px",
                    border: "2px dashed #e0e0e0",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    backgroundColor: isHeaderDragActive ? "#f0f8ff" : "#fff",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f8ff",
                      border: "2px dashed #75ADE4",
                    },
                  }}
                >
                  <input {...getHeaderInputProps()} />
                  <CloudUpload color="#6F7377" size={20} />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Drag and drop header image, or click to select
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Background Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: "#444" }}>
                Background Image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your prescription background image (JPG/PNG only). Recommended size: 800x1000 pixels.
              </Typography>
              {backgroundPreview ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "#fafafa" }}>
                  <img src={backgroundPreview} alt="Background Preview" style={{ maxWidth: 200, maxHeight: 100, objectFit: "contain", borderRadius: 4 }} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => window.open(backgroundPreview, "_blank")}><Eye size={16} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => setBackgroundPreview(null)}><Trash2 size={16} /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ) : (
                <Box
                  {...getBackgroundRootProps()}
                  sx={{
                    gap: 0.75,
                    width: "100%",
                    height: "80px",
                    border: "2px dashed #e0e0e0",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    backgroundColor: isBackgroundDragActive ? "#f0f8ff" : "#fff",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f8ff",
                      border: "2px dashed #75ADE4",
                    },
                  }}
                >
                  <input {...getBackgroundInputProps()} />
                  <CloudUpload color="#6F7377" size={20} />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Drag and drop background image, or click to select
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: "#444" }}>
                Footer Image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your prescription footer image (JPG/PNG only). Recommended size: 800x100 pixels.
              </Typography>
              {footerPreview ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "#fafafa" }}>
                  <img src={footerPreview} alt="Footer Preview" style={{ maxWidth: 200, maxHeight: 50, objectFit: "contain", borderRadius: 4 }} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => window.open(footerPreview, "_blank")}><Eye size={16} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => setFooterPreview(null)}><Trash2 size={16} /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ) : (
                <Box
                  {...getFooterRootProps()}
                  sx={{
                    gap: 0.75,
                    width: "100%",
                    height: "80px",
                    border: "2px dashed #e0e0e0",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    backgroundColor: isFooterDragActive ? "#f0f8ff" : "#fff",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f8ff",
                      border: "2px dashed #75ADE4",
                    },
                  }}
                >
                  <input {...getFooterInputProps()} />
                  <CloudUpload color="#6F7377" size={20} />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Drag and drop footer image, or click to select
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Update Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateSettings}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {isSaving ? 'Updating...' : 'Update Settings'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default WebsiteSettings;
