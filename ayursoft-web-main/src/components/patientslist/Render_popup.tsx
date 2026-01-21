import { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import { Pencil, Printer, Eye, X } from "lucide-react"; // Importing the X icon

const CardRender = ({ opdData }: { opdData: any[] }) => {
  const [_, setSelectedCard] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to handle dialog open/close
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

  // Open dialog on pencil icon click
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Box>
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
          <Typography
            variant="h6"
            sx={{ fontSize: "0.9rem", marginBottom: "1rem" }}
          >
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
              <Typography
                variant="body2"
                sx={{ fontSize: "0.8rem", fontWeight: 750 }}
              >
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

        {/* Right Column */}
        <Box
          ref={historyRef}
          sx={{
            width: "75%",
            overflowY: "auto",
            maxHeight: "100vh",
            padding: "0.5rem",
          }}
        >
          {opdData.map((patient) => (
            <Box
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>
                  <strong>Date: </strong> {patient.date}
                </Typography>
                <Box sx={{ display: "flex", marginBottom: "1rem" }}>
                  <IconButton
                    sx={{
                      padding: "4px",
                      backgroundColor: "#eaf2fb",
                      outline: "1px solid #257dd4",
                      "&:hover": { backgroundColor: "#DFEFFF" },
                      margin: "0.2rem",
                    }}
                    onClick={handleDialogOpen} // Trigger dialog
                  >
                    <Pencil size={"0.8rem"} />
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
            </Box>
          ))}

          {/* Dialog Popup with Close Button */}
          <Dialog
            open={isDialogOpen}
            onClose={handleDialogClose}
            fullWidth
            maxWidth="md"
            sx={{
              "& .MuiDialog-paper": {
                borderRadius: "1rem", // Rounded corners
                padding: "0.5rem", //outer padding of the popup
                overflow: "hidden", // Hide scrolling
              },
            }}
          >
            <DialogContent sx={{ overflow: "hidden", padding: "0" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                }}
              >
                <Typography variant="subtitle1">Patient Details</Typography>
                <IconButton
                  onClick={handleDialogClose}
                  sx={{
                    // padding: "6px",
                    backgroundColor: "#eaf2fb",
                    // outline: "1px solid #257dd4",
                    "&:hover": { backgroundColor: "#DFEFFF" },
                  }}
                >
                  <X size={"0.8rem"} />
                </IconButton>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default CardRender;
