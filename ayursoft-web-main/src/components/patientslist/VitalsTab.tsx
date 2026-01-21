import  { useState } from "react"; // Import React and useState
import { Box, Typography, Grid, IconButton } from "@mui/material";
import { Pill, Printer, Eye } from "lucide-react"; // Import the new icons

// Example vitals data
const vitalsData = {
  id: 1,
  date: "2024-12-01",
  doctor: "Dr. John Doe",
  systolicBP: "120 mmHg",
  diastolicBP: "80 mmHg",
  pulse: "72 bpm",
  height: "165 cm",
  weight: "68 kg",
  bmi: "24.98 kg/m²",
  spo2: "98%",
  rbs: "5.6 mmol/L",
  abdGirth: "85 cm",
};

// Example history (can be extended with more items)
const vitalsHistory = [vitalsData];

const VitalsTab = () => {
  const [selectedVitals, setSelectedVitals] = useState(vitalsData);

  const fields = [
    { label: "BP (Systolic)", value: selectedVitals.systolicBP },
    { label: "BP (Diastolic)", value: selectedVitals.diastolicBP },
    { label: "Pulse", value: selectedVitals.pulse },
    { label: "Height", value: selectedVitals.height },
    { label: "Weight", value: selectedVitals.weight },
    { label: "BMI", value: selectedVitals.bmi },
    { label: "SPO2", value: selectedVitals.spo2 },
    { label: "RBS", value: selectedVitals.rbs },
    { label: "Abd Girth", value: selectedVitals.abdGirth },
  ];

  const columns = Math.ceil(fields.length / 2); // Split fields dynamically into two columns

  return (
    <Grid container spacing={2}>
      {/* Left Timeline Column */}
      <Grid item xs={3}>
        <Box
          sx={{
            height: "100vh", // Extends to 100% height
            overflowY: "hidden", // Hide vertical scrollbar
            borderRight: "1px solid lightgray",
            padding: "0.4rem",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
            Vitals History
          </Typography>
          {/* Timeline */}
          {vitalsHistory.map((vital, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: "white",
              padding: "0.5rem",
              marginBottom: "45rem",
              borderRadius: "0.5rem",
              outline: "1px solid #257dd4",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#eaf2fb",
              },
            }}
              onClick={() => setSelectedVitals(vital)}
            >
              <Typography variant="body2" sx={{fontSize:"0.8rem", fontWeight: 750 }}>
                Date: {vital.date}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.6rem" }}>
                abdGrith: {vital.abdGirth}
              </Typography>
              <Typography variant="body2" sx={{fontSize: "0.6rem" }}>
                Pulse: {vital.pulse}
              </Typography>
            </Box>
          ))}
        </Box>
      </Grid>

      {/* Right Detailed View Column */}
      <Grid item xs={9}>
        <Box
          sx={{
            padding: "1rem",
            backgroundColor: "white",
            border: "1px solid #257dd4",
            borderRadius: "1rem",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <Typography>
              <strong>Doctor:</strong> {selectedVitals.doctor}
            </Typography>
            <Box>
              <IconButton
                sx={{
                  padding: "4px",
                  backgroundColor: "#eaf2fb",
                  outline: "1px solid #257dd4",
                  "&:hover": { backgroundColor: "#DFEFFF" },
                  margin: "0.2rem",
                }}
              >
                <Pill size={"0.8rem"} />
              </IconButton>
              <IconButton
                sx={{
                  padding: "4px",
                  backgroundColor: "#eaf2fb",
                  outline: "1px solid #257dd4",
                  "&:hover": { backgroundColor: "#DFEFFF" },
                  margin: "0.2rem",
                }}
              >
                <Printer size={"0.8rem"} />
              </IconButton>
              <IconButton
                sx={{
                  padding: "4px",
                  backgroundColor: "#eaf2fb",
                  outline: "1px solid #257dd4",
                  "&:hover": { backgroundColor: "#DFEFFF" },
                  margin: "0.2rem",
                }}
              >
                <Eye size={"0.8rem"} />
              </IconButton>
            </Box>
          </Box>

          {/* Grid Layout for Dynamic Two Columns */}
          <Grid container spacing={2}>
            {/* First Column */}
            <Grid item xs={12} sm={6}>
              {fields.slice(0, columns).map((field, index) => (
                <Box key={index} sx={{ marginBottom: "0.3rem" }}>
                  <Typography variant="body1" sx={{ fontSize: "0.7rem", color: "black", whiteSpace: "normal" }}>
                    <strong>{field.label}:</strong> {field.value}
                  </Typography>
                </Box>
              ))}
            </Grid>

            {/* Second Column */}
            <Grid item xs={12} sm={6}>
              {fields.slice(columns).map((field, index) => (
                <Box key={index} sx={{ marginBottom: "0.3rem" }}>
                  <Typography variant="body1" sx={{ fontSize: "0.7rem", color: "black", whiteSpace: "normal" }}>
                    <strong>{field.label}:</strong> {field.value}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default VitalsTab;