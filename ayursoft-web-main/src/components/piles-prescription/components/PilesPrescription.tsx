import React, { useState, useEffect } from "react";
import { Grid, Box, Button, CircularProgress } from "@mui/material";
import {
  PilesPrescriptionProvider,
  usePilesPrescription,
  validateVitals,
} from "../context/PilesPrescriptionContext";
import PatientDetailsSection from "./PatientDetailsSection";
import DiagnosticsSection from "./DiagnosticsSection";
import MedicinesPrescribedSection from "../components/MedicinesPrescribedSection";
import CheckUpSection from "./CheckUpSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import ReceiptsTab from "../../prescription/components/ReceiptsTab"; // Import ReceiptsTab from prescription component
import { useAppContext } from "../../../context/app-context";
import apimanager from "../../services/apimanager";
import PanchakarmaSection from "./PanchakarmaSection";
import CarePlan from "./CarePlan";
import { carePlanSchema, CarePlanType } from "../../../utils/validationSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiManager from "../../services/apimanager";

interface Props {
  prescriptionID: string;
  patientId: string;
  mode: string;
}

interface CarePlanGroup {
  _id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

const PilesPrescriptionForm = ({ prescriptionID, patientId, mode }: Props) => {
  console.log("PilesPrescriptionForm -> mode", mode);
  const { prescriptionData, updatePrescriptionData } = usePilesPrescription();
  const { control, getValues, reset } = useForm<CarePlanType>({
    resolver: zodResolver(carePlanSchema),
    defaultValues: {
      prescriptionId: prescriptionID || "",
      benefit: "",
      risk: "",
      alternative: "",
      outcome: "",
      pathya: "",
      apathya: "",
      preventiveCare: "",
      curetetiveCare: "",
      rehabilitativeCare: "",
    },
  });
  const { setAlert } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [_, setVitalsErrors] = useState<string[]>([]);
  const [carePlanGroups, setCarePlanGroups] = useState<CarePlanGroup[]>([]);
  // Local storage draft key (scoped to patient or prescription for uniqueness)
  const draftKey = `piles-prescription-draft-${patientId || prescriptionID || "default"}`;

  const handleSaveDraft = () => {
    try {
      // Exclude status from draft - it should be determined by the completion flow, not the draft
      const { status, ...prescriptionDataWithoutStatus } = prescriptionData as any;
      // Save both prescriptionData (includes panchakarma) and carePlan form values
      const draftData = {
        prescriptionData: prescriptionDataWithoutStatus,
        carePlan: getValues(),
      };
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
      // Load prescriptionData (includes panchakarma), but exclude status
      if (data.prescriptionData) {
        const { status, ...draftDataWithoutStatus } = data.prescriptionData;
        updatePrescriptionData(draftDataWithoutStatus);
      } else {
        // Backward compatibility: if old draft format (flat prescriptionData)
        const { status, ...draftDataWithoutStatus } = data;
        updatePrescriptionData(draftDataWithoutStatus);
      }
      // Load carePlan form values
      if (data.carePlan) {
        reset(data.carePlan);
      }
      setAlert({ severity: "success", message: "Draft loaded from local storage." });
    } catch (error: any) {
      console.error("Error loading draft:", error);
      setAlert({ severity: "error", message: error?.message || "Failed to load draft." });
    }
  };

  // Function to fetch/refresh prescription data from server
  const fetchPrescriptionDetails = async () => {
    if (!prescriptionID) return;
    setLoading(true);
    try {
      const response = await apimanager.getPilesPrescriptionById(
        prescriptionID
      );
      if (response?.data) {
        updatePrescriptionData(response.data);
      }
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      setAlert({
        severity: "error",
        message: "Failed to load prescription details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchLatestPrescription = async () => {
      setLoading(true);
      try {
        const response = await apimanager.getPilesPatientsLatestPrescription(
          patientId
        );
        if (isMounted && response.data) {
          // Remove only specific properties we don't want to copy over
          const {
            user,
            paymentStatus,
            status,
            _id,
            createdAt,
            updatedAt,
            department,
            ...restData
          } = response.data;

          console.log(
            "updated data -----------------------------------",
            restData
          );

          // Keep prescriptionType if it exists in the data
          updatePrescriptionData({
            ...restData,
            nextVisit: new Date().toISOString(),
          });

          console.log(
            "Prepopulated with latest prescription data with type:",
            restData.prescriptionType
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching latest prescription:", error);
        setLoading(false);
      }
    };

    const fetchCarePlan = async () => {
      try {
        const data = await ApiManager.getCarePlanByPres(prescriptionID);
        console.log("Fetched care plan data:", data);
        reset(data.data);
      } catch (error) {
        console.error("Error fetching care plan data:", error);
      }
    };

    // Fetch care plan groups for dropdowns
    const fetchCarePlanGroups = async () => {
      try {
        const response = await ApiManager.getCarePlanGroups();
        if (isMounted) {
          setCarePlanGroups(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Error fetching care plan groups:", error);
      }
    };

    if (mode === "edit") {
      fetchPrescriptionDetails();
      fetchCarePlan();
    } else if (mode === "create" && patientId) {
      fetchLatestPrescription();
    }

    fetchCarePlanGroups();

    return () => {
      isMounted = false;
    };
  }, [mode, prescriptionID, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate vitals before submitting only for offline prescriptions
    if (prescriptionData.prescriptionType === "offline") {
      const errors = validateVitals(prescriptionData.vitals);
      if (errors.length > 0) {
        setVitalsErrors(errors);
        setAlert({
          severity: "error",
          message: `Please fix the following errors: \n${errors.join("\n")}`,
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
    setLoading(true);
    setAlert({ severity: "", message: "" });

    try {
      const { user, paymentStatus, ...rest } = prescriptionData;
      const updatedPrescriptionData = {
        ...rest,
        status: "completed",
      };
      console.log("updatedPrescriptionData", updatedPrescriptionData);

      // Use PATCH (update) API for both create and edit modes
      await apimanager.updatePilesPrescription(
        prescriptionID,
        updatedPrescriptionData
      );

      if (patientId) {
        await apimanager.updatePatient(patientId, {
          status: "patient",
        });
      }

      await ApiManager.createCarePlan(getValues());

      // Refresh data from server after update
      await fetchPrescriptionDetails();

      setAlert({
        severity: "success",
        message: "Piles Prescription & Patient saved successfully!",
      });
    } catch (error) {
      setAlert({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while saving",
      });
      console.error("Form submission error:", error);
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
          xs={8}
          sx={{ overflowY: "auto", maxHeight: "100vh" }}
        >
          <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            {" "}
            <PatientDetailsSection
              patientId={patientId}
              prescriptionID={prescriptionID}
            />
            <DiagnosticsSection />
            <PanchakarmaSection />
            <MedicinesPrescribedSection />
            <CheckUpSection />
            <AdditionalDetailsSection />
            <CarePlan control={control} groups={carePlanGroups} />
            <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", gap: 2, alignItems: 'center' }}>
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
                size="small"
                disabled={loading}
                sx={{ minWidth: 260 }}
              >
                {loading ? "Saving..." : "Complete Prescription"}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={4}>
          <ReceiptsTab
            key={prescriptionData.patient || patientId}
            presType="piles"
            patientId={prescriptionData.patient || patientId}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const PilesPrescription = (props: Props) => {
  return (
    <PilesPrescriptionProvider>
      <PilesPrescriptionForm {...props} />
    </PilesPrescriptionProvider>
  );
};

export default PilesPrescription;
