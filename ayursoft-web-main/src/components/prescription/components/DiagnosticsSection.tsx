import { Grid, Box, TextField, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import ApiManager from "../../../components/services/apimanager";
import { usePrescription } from "../context/PrescriptionContext";
import ColoredSections from "./colored-section";

export const DiagnosticsSection = () => {
  const { prescriptionData, updatePrescriptionData } = usePrescription();
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

  const handleChange =
    (field: keyof typeof prescriptionData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updatePrescriptionData({
        [field]: event.target.value,
      });
    };

  return (
    <>
      <ColoredSections
        title="Diagnostics"
        backgroundColor="rgba(178, 242, 187, 0.2)"
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            color: "#333",
            borderRadius: 2,
          }}
        >
          <Grid item xs={12}>
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
                    console.log("new input value", newInputValue);
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
              <Grid item xs={4}>
                <TextField
                  value={prescriptionData.rt}
                  onChange={handleChange("rt")}
                  fullWidth
                  size="small"
                  label="RT"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  value={prescriptionData.lt}
                  onChange={handleChange("lt")}
                  fullWidth
                  size="small"
                  label="LT"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  value={prescriptionData.both}
                  onChange={handleChange("both")}
                  fullWidth
                  size="small"
                  label="Both"
                />
              </Grid>
            </Grid>
          </Grid>

          <Box
            sx={{ borderRadius: 2, height: 132 }}
            component="img"
            src="/slr.jpg"
          />
        </Box>
      </ColoredSections>
    </>
  );
};

export default DiagnosticsSection;
