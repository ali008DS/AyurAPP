import  { useState, useRef } from "react";
import { Box, Typography, IconButton, Paper, Grid } from "@mui/material";
import { Pill, Printer, Eye } from "lucide-react";

const ipdData = ({ ipdData }: { ipdData: any[] }) => {
  const [_, setSelectedCard] = useState<number | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the card in the right column
  const handleCardClick = (id: number) => {
    setSelectedCard(id);
    const cardElement = document.getElementById(`card-${id}`);
    if (cardElement && historyRef.current) {
      historyRef.current.scrollTo({
        top: cardElement.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box display="flex" flexDirection="row" sx={{ height: "100%" }}>
      {/* Left History Column (Updated to match IPDTab style) */}
      <Box
        sx={{
          width: "25%",
          overflowY: "auto",
          maxHeight: "100vh",
          padding: "0.4rem",
          backgroundColor: "#f9f9f9",
          borderRight: "1px solid lightgray",
        }}
      >
        <Typography variant="h6" sx={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Patient History
        </Typography>
        {/* Timeline (Similar to IPD History in IPDTab) */}
        {ipdData.map((patient) => (
          <Box
            key={patient.id}
            sx={{
              backgroundColor: "white",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "0.5rem",
              outline: "1px solid #257dd4",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#eaf2fb",
              },
              cursor: "pointer",
            }}
            onClick={() => handleCardClick(patient.id)}
          >
            <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 750 }}>
              Date: {patient.date}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.6rem" }}>
              Patient: {patient.name}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.6rem" }}>
              Prescription No: {patient.prescriptionNo}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Right Column with Dynamic Two Columns */}
      <Box
        ref={historyRef}
        sx={{
          width: "75%",
          overflowY: "auto",
          maxHeight: "100vh",
          padding: "0.5rem",
        }}
      >
        {ipdData.map((patient) => {
          const fields = [
            { label: "Date", value: patient.date },
            { label: "Patient ID", value: patient.id },
            { label: "Name", value: patient.name },
            { label: "Doctor's Note", value: patient.doctorNote },
            { label: "Prescription No", value: patient.prescriptionNo },
            { label: "Last Visit", value: patient.lastVisit },
            { label: "Next Visit", value: patient.nextVisit },
            { label: "Age", value: patient.patientAge },
          ];

          const columns = Math.ceil(fields.length / 2);

          return (
            <Paper
              id={`card-${patient.id}`}
              key={patient.id}
              sx={{
                backgroundColor: "white",
                padding: "0.5rem", // Adjusted padding to be more consistent
                marginBottom: "0.7rem",
                borderRadius: "0.5rem", // Smaller border radius to match Vitals tab
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Lighter shadow to match Vitals tab
                border: "1px solid #257dd4", // Blue border like Vitals tab
                transition: "box-shadow 0.3s",
                "&:hover": {
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Slightly darker shadow on hover
                },
              }}
            >
              {/* Top-right Icon Buttons */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
            <Typography>
              <strong>Date: </strong> {patient.date}
            </Typography>
            <Box sx={{display: "flex", marginBottom: "1rem",}}>
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
                      <Typography
                        variant="body1"
                        sx={{ fontSize: "0.7rem", color: "black",}}
                      >
                        <strong>{field.label}:</strong> {field.value}
                      </Typography>
                    </Box>
                  ))}
                </Grid>

                {/* Second Column */}
                <Grid item xs={12} sm={6}>
                  {fields.slice(columns).map((field, index) => (
                    <Box key={index} sx={{ marginBottom: "0.3rem",}}>
                      <Typography
                        variant="body1"
                        sx={{ fontSize: "0.7rem", color: "black", whiteSpace: "normal" }}
                      >
                        <strong>{field.label}:</strong> {field.value}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default ipdData;