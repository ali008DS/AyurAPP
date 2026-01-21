import { useState, useRef } from "react";
import {
  Box, Typography, IconButton, Paper, Grid, Dialog, DialogContent, DialogTitle, TextField, Button
} from "@mui/material";
import { Pencil, Printer, Eye } from "lucide-react";

// Assuming the header and footer images are no longer needed
// Remove the import statements for images
// import headerImage from "../rayshree-foot/header.jpeg";
// import footerImage from "../rayshree-foot/footer.jpeg";

// Define the types for opdData and selectedCard
interface MedicineDetail {
  medicineName: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate: string;
  instructions: string;
}

interface Patient {
  id: number;
  name: string;
  prescriptionNo: string;
  lastVisit: string;
  nextVisit: string;
  patientAge: number;
  doctorNote: string;
  medicineDetails: MedicineDetail[];
  date: string;
}

interface CardRenderProps {
  opdData: Patient[];
}

const CardRender = ({ opdData }: CardRenderProps) => {
  const [selectedCard, setSelectedCard] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the card in the right column
  const handleCardClick = (id: number) => {
    setSelectedCard(opdData.find((patient) => patient.id === id) || null);
    const cardElement = document.getElementById(`card-${id}`);
    if (cardElement && historyRef.current) {
      historyRef.current.scrollTo({
        top: cardElement.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleDialogOpen = (patient: Patient) => {
    setSelectedCard(patient);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCard(null);
  };

  const handleFieldChange = (field: string, value: string) => {
    setSelectedCard((prev: Patient | null) => {
      if (prev) {
        return {
          ...prev,
          [field]: value,
        };
      }
      return prev;
    });
  };

  const handleSave = () => {
    console.log("Updated Patient Data:", selectedCard);
    // Add save logic here, such as updating the state or making an API call
    setIsDialogOpen(false);
  };

  return (
    <Box display="flex" flexDirection="row" sx={{ height: "100%" }}>
      {/* Left History Column */}
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
        {opdData.map((patient) => (
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

      {/* Right Column with Dynamic Cards */}
      <Box
        ref={historyRef}
        sx={{
          width: "75%",
          overflowY: "auto",
          maxHeight: "100vh",
          padding: "0.5rem",
        }}
      >
        {opdData.map((patient) => {
          const fields = [
            { label: "Patient ID", value: patient.id },
            { label: "Name", value: patient.name },
            { label: "Prescription No", value: patient.prescriptionNo },
            { label: "Last Visit", value: patient.lastVisit },
            { label: "Next Visit", value: patient.nextVisit },
            { label: "Age", value: patient.patientAge },
            { label: "Doctor's Note", value: patient.doctorNote },
          ];

          return (
            <Paper
              id={`card-${patient.id}`}
              key={patient.id}
              sx={{
                backgroundColor: "white",
                padding: "0.5rem",
                marginBottom: "0.7rem",
                borderRadius: "0.5rem",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                border: "1px solid #257dd4",
                transition: "box-shadow 0.3s",
                "&:hover": {
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>
                  <strong>Date: </strong> {patient.date}
                </Typography>
                <Box sx={{ display: "flex", marginBottom: "1rem" }}>
                  <IconButton
                    sx={{
                      backgroundColor: "#eaf2fb",
                      outline: "1px solid #257dd4",
                      "&:hover": { backgroundColor: "#DFEFFF" },
                      margin: "0.2rem",
                    }}
                    onClick={() => handleDialogOpen(patient)}
                  >
                    <Pencil size={"0.8rem"} />
                  </IconButton>
                  <IconButton
                    sx={{
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

              <Grid container spacing={2}>
                {fields.slice(0, Math.ceil(fields.length / 3)).map((field, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ marginBottom: "0" }}>
                      <Typography variant="body1" sx={{ fontSize: "0.7rem", color: "black" }}>
                        <strong>{field.label}:</strong> {field.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
                {fields.slice(Math.ceil(fields.length / 3), Math.ceil(fields.length * 2 / 3)).map((field, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ marginBottom: "0rem" }}>
                      <Typography variant="body1" sx={{ fontSize: "0.7rem", color: "black" }}>
                        <strong>{field.label}:</strong> {field.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
                {fields.slice(Math.ceil(fields.length * 2 / 3)).map((field, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ paddingBottom: "0rem" }}>
                      <Typography variant="body1" sx={{ fontSize: "0.7rem", color: "black" }}>
                        <strong>{field.label}:</strong> {field.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography sx={{ paddingTop: "1rem" }}>
                <strong>Medicines:</strong>
                <ul>
                  {patient.medicineDetails.map((medicine, index) => (
                    <li key={index}>
                      <strong>Medicine Name:</strong> {medicine.medicineName} <br />
                      <strong>Dose:</strong> {medicine.dose} <br />
                      <strong>Frequency:</strong> {medicine.frequency} <br />
                      <strong>Start Date:</strong> {medicine.startDate} <br />
                      <strong>End Date:</strong> {medicine.endDate} <br />
                      <strong>Instructions:</strong> {medicine.instructions} <br />
                    </li>
                  ))}
                </ul>
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Dialog for Editing Patient Details */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Patient Details</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="1rem">
            <TextField
              label="Name"
              value={selectedCard?.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Doctor's Note"
              value={selectedCard?.doctorNote || ""}
              onChange={(e) => handleFieldChange("doctorNote", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Next Visit"
              value={selectedCard?.nextVisit || ""}
              onChange={(e) => handleFieldChange("nextVisit", e.target.value)}
              fullWidth
              size="small"
            />
            <Box display="flex" justifyContent="flex-end" gap="1rem">
              <Button variant="outlined" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CardRender;