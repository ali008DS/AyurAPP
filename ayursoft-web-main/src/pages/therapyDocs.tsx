import { useParams, useLocation } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
} from "@mui/material";
import { ArrowRight, Printer } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import PrintDialog from "../components/therapy-docs/PrintDialog";
// DATA
import reportCards, { getPrintConfig } from "../data/therapyDocs";

function TherapyDocs() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const patient = location.state?.patient;
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printConfig, setPrintConfig] = useState<{
    component: React.ReactNode;
    title: string;
    documentTitle: string;
    orientation?: "portrait" | "landscape";
  } | null>(null);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(null);
  }, []);

  const handleClosePrintDialog = useCallback(() => {
    setPrintDialogOpen(false);
    setPrintConfig(null);
  }, []);

  const handleCardClick = useCallback((cardId: string) => {
    setOpenDialog(cardId);
  }, []);

  const handlePrint = useCallback(
    async (e: React.MouseEvent, cardId: string) => {
      e.stopPropagation();

      if (!id) {
        console.warn("No therapy ID available");
        return;
      }

      try {
        const config = await getPrintConfig(cardId, id);

        if (config) {
          setPrintConfig(config);
          setPrintDialogOpen(true);
        }
      } catch (error) {
        console.error("Failed to prepare print dialog:", error);
      }
    },
    [id]
  );

  const activeCard = useMemo(
    () => reportCards.find((card) => card.id === openDialog),
    [openDialog]
  );

  return (
    <Box sx={{ height: "100%", overflow: "auto", px: 4, mb: 4 }}>
      <HeadingText name="Therapy Documentation" />

      <Grid container spacing={3}>
        {reportCards.map((card) => {
          const Icon = card.icon;

          return (
            <Grid item xs={12} md={4} key={card.id}>
              <Card
                onClick={() => handleCardClick(card.id)}
                sx={{
                  cursor: "pointer",
                  border: "none",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    "& .decorative-circle": {
                      transform: "scale(1.5)",
                    },
                    "& .icon-container": {
                      transform: "scale(1.05)",
                    },
                    "& .arrow-icon": {
                      transform: "translateX(4px)",
                    },
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    background: card.bgGradient,
                    position: "relative",
                    height: 180,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    className="decorative-circle"
                    sx={{
                      position: "absolute",
                      top: -64,
                      right: -64,
                      width: 128,
                      height: 128,
                      bgcolor: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "50%",
                      transition: "transform 0.3s ease",
                    }}
                  />

                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Avatar
                        className="icon-container"
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#fff",
                          mb: 2,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Icon size={24} color={card.color} />
                      </Avatar>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#1a1a1a",
                          mb: 1,
                          lineHeight: 1.3,
                          fontSize: "0.95rem",
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          mb: 3,
                          lineHeight: 1.5,
                          fontSize: "0.85rem",
                        }}
                      >
                        {card.description}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: "auto",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: card.color,
                          }}
                        >
                          Open Doc
                        </Typography>
                        <ArrowRight
                          className="arrow-icon"
                          size={16}
                          color={card.color}
                          style={{
                            marginLeft: "4px",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </Box>
                      <Box
                        onClick={(e) => handlePrint(e, card.id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          border: `dashed 1px ${card.color}`,
                          borderRadius: "50%",
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#fff",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <Printer size={16} color={card.color} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {activeCard && (
        <activeCard.component
          open={true}
          onClose={handleCloseDialog}
          data={{ therapy: id, patient: patient }}
        />
      )}

      {printConfig && (
        <PrintDialog
          open={printDialogOpen}
          onClose={handleClosePrintDialog}
          title={printConfig.title}
          documentTitle={printConfig.documentTitle}
          orientation={printConfig.orientation}
        >
          {printConfig.component}
        </PrintDialog>
      )}
    </Box>
  );
}

export default TherapyDocs;
