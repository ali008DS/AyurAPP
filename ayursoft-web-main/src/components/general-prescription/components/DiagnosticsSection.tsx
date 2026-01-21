import { Grid, TextField, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import ApiManager from "../../services/apimanager";
import { useGeneralPrescription } from "../context/GeneralPrescriptionContext";
import ColoredSections from "./colored-section";

const DiagnosticsSection = () => {
  const { prescriptionData, updatePrescriptionData } = useGeneralPrescription();
  const [complaints, setComplaints] = useState<string[]>([]);
  const [generalExams, setGeneralExams] = useState<string[]>([]);
  const [diagnosis, setDiagnoses] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const complaintsData = await ApiManager.getComplaints();
        setComplaints(complaintsData.data.map((item: any) => item.name) || []);

        const generalExamData = await ApiManager.getGeneralExamination();
        setGeneralExams(
          generalExamData.data.map((item: any) => item.name) || []
        );

        const diagnosisData = await ApiManager.getComplaints();
        setDiagnoses(diagnosisData.data.map((item: any) => item.name) || []);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  return (
    <ColoredSections
      title="Diagnostics"
      backgroundColor="rgba(178, 242, 187, 0.2)"
    >
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Autocomplete
            freeSolo
            options={complaints}
            value={prescriptionData.complaint || ""}
            onChange={(_, newValue) => {
              updatePrescriptionData({
                complaint: newValue || "",
              });
            }}
            onInputChange={(_, newInputValue) => {
              updatePrescriptionData({
                complaint: newInputValue,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Complaints"
                size="small"
                fullWidth
                multiline
                rows={3}
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            freeSolo
            options={generalExams}
            value={prescriptionData.generalExamination || ""}
            onChange={(_, newValue) => {
              updatePrescriptionData({
                generalExamination: newValue || "",
              });
            }}
            onInputChange={(_, newInputValue) => {
              updatePrescriptionData({
                generalExamination: newInputValue,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="General Examination"
                size="small"
                fullWidth
                multiline
                rows={3}
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            freeSolo
            options={diagnosis}
            value={prescriptionData.diagnosis || ""}
            onChange={(_, newValue) => {
              updatePrescriptionData({
                diagnosis: newValue || "",
              });
            }}
            onInputChange={(_, newInputValue) => {
              updatePrescriptionData({
                diagnosis: newInputValue,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Diagnosis"
                size="small"
                fullWidth
                multiline
                rows={3}
              />
            )}
          />
        </Grid>
      </Grid>
    </ColoredSections>
  );
};

export default DiagnosticsSection;
