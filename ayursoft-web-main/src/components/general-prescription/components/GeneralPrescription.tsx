import { useEffect, useState } from "react";
import { Grid, Box, Button, CircularProgress } from "@mui/material";
import {
  GeneralPrescriptionProvider,
  useGeneralPrescription,
  validateGeneralVitals,
} from "../context/GeneralPrescriptionContext";
import { useAppContext } from "../../../context/app-context";
import PatientDetailsSection from "./PatientDetailsSection";
import DiagnosticsSection from "./DiagnosticsSection";
import MedicinesPrescribedSection from "./MedicinesPrescribedSection";
import CheckUpSection from "./CheckUpSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import apimanager from "../../services/apimanager";
import ReceiptsTab from "./ReceiptsTab";

interface Props {
  prescriptionID: string;
  patientId: string;
  mode: "create" | "edit";
}

const GeneralPrescriptionForm = ({ prescriptionID, patientId, mode }: Props) => {
  const { prescriptionData, updatePrescriptionData } = useGeneralPrescription();
  const { setAlert } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [, setVitalsErrors] = useState<string[]>([]);

  // Local storage draft key (scoped to patient or prescription for uniqueness)
  const draftKey = `general-prescription-draft-${patientId || prescriptionID || "default"}`;

  const handleSaveDraft = () => {
    try {
      // Exclude status from draft - it should be determined by the completion flow, not the draft
      const { status, ...draftData } = prescriptionData as any;
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setAlert({ severity: "success", message: "Draft saved to local storage." });
    } catch (error: any) {
      console.error("Error saving draft:", error);
      setAlert({ severity: "error", message: error?.message || "Failed to save draft." });
    }
  };

  const handleLoadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) {
        setAlert({ severity: "warning", message: "No saved draft found in local storage." });
        return;
      }
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") {
        setAlert({ severity: "error", message: "Saved draft is invalid." });
        return;
      }
      // Exclude status when loading draft - preserve the current prescription's status
      const { status, ...draftDataWithoutStatus } = data;
      updatePrescriptionData(draftDataWithoutStatus);
      setAlert({ severity: "success", message: "Draft loaded from local storage." });
    } catch (error: any) {
      console.error("Error loading draft:", error);
      setAlert({ severity: "error", message: error?.message || "Failed to load draft." });
    }
  };

  // Function to load/refresh prescription data from server
  const loadPrescriptionData = async () => {
    if (!prescriptionID) {
      console.warn("No prescription ID provided");
      return;
    }

    setLoading(true);
    try {
      const response = await apimanager.getGeneralPrescriptionById(
        prescriptionID
      );
      if (response?.data) {
        const { department, user, _id, __v, updatedAt, ...restData } =
          response.data;

        // Extract department ID if department is an object
        const departmentId =
          typeof department === "object" && department?._id
            ? department._id
            : department;

        updatePrescriptionData({
          ...restData,
          department: departmentId,
        });
      }
    } catch (error) {
      console.error("Error loading prescription:", error);
      setAlert({
        severity: "error",
        message: "Failed to load prescription data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "edit" || (mode === "create" && prescriptionID)) {
      loadPrescriptionData();
    }
  }, [prescriptionID, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (prescriptionData.prescriptionType === "offline") {
      const errors = validateGeneralVitals(prescriptionData.vitals);
      if (errors.length > 0) {
        setVitalsErrors(errors);
        setAlert({
          severity: "error",
          message: `Please fix the following errors:\n${errors.join("\n")}`,
        });
        return;
      } else {
        setVitalsErrors([]);
      }
    }

    if (
      !prescriptionData.internalNote ||
      prescriptionData.internalNote.trim() === ""
    ) {
      setAlert({
        severity: "error",
        message: "Internal note is required.",
      });
      return;
    }

    // Validate required fields for API
    if (
      !prescriptionData.department ||
      prescriptionData.department.trim() === ""
    ) {
      setAlert({
        severity: "error",
        message:
          "Department is required. Please ensure the prescription was created with a department assigned.",
      });
      return;
    }

    if (!prescriptionData.paymentStatus) {
      setAlert({
        severity: "error",
        message:
          "Payment status is required. Please ensure the prescription was created with a payment status.",
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === "create" && prescriptionID) {
        // If prescriptionId is provided in create mode, update the existing prescription
        await apimanager.updateGeneralPrescription(
          prescriptionID,
          {
            ...prescriptionData,
            status: "completed",
          }
        );
        // Refresh data from server after update
        await loadPrescriptionData();
        setAlert({
          severity: "success",
          message: "General prescription created successfully.",
        });
      } else if (mode === "create") {
        // Create new prescription
        await apimanager.createGeneralPrescription({
          ...prescriptionData,
          patient: prescriptionData.patient || patientId,
          status: "completed",
        });
        setAlert({
          severity: "success",
          message: "General prescription created successfully.",
        });
      } else {
        // Edit mode
        await apimanager.updateGeneralPrescription(
          prescriptionID,
          prescriptionData
        );
        // Refresh data from server after update
        await loadPrescriptionData();
        setAlert({
          severity: "success",
          message: "General prescription updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      setAlert({
        severity: "error",
        message: "Failed to save prescription. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1}>
        <Grid
          item
          className="custom-scrollbar"
          xs={12}
          md={8}
          sx={{ overflowY: "auto", maxHeight: "100vh" }}
        >
          <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <PatientDetailsSection
              patientId={patientId || ""}
              prescriptionID={prescriptionID}
            />
            <DiagnosticsSection />
            <MedicinesPrescribedSection />
            <CheckUpSection />
            <AdditionalDetailsSection />

            <Box sx={{ mt: 1, display: "flex", flexDirection: { xs: 'column', md: 'row' }, justifyContent: "space-between", gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={handleLoadDraft}
                  disabled={loading}
                >
                  Load Draft
                </Button>
              </Box>
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ minWidth: 260, width: { xs: '100%', md: 'auto' } }}
              >
                {mode === "edit"
                  ? "Update General Prescription"
                  : "Create General Prescription"}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <ReceiptsTab
            key={prescriptionData.patient || patientId}
            patientId={prescriptionData.patient || patientId}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const GeneralPrescription = (props: Props) => {
  return (
    <GeneralPrescriptionProvider>
      <GeneralPrescriptionForm {...props} />
    </GeneralPrescriptionProvider>
  );
};

export default GeneralPrescription;
