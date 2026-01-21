import { forwardRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import ApiManager from "../../services/apimanager";

interface ProcedureCarePrintProps {
  procedureId: string;
}

interface ProcedureCareData {
  procedurePerform?: string;
  doctorName?: string;
  therapistName?: string;
  therapyDetails?: string;
  treatmentBenefits?: string;
  treatmentRisks?: string;
  treatmentAlternatives?: string;
  treatmentOutcome?: string;
  footerDoctorName?: string;
  date?: string;
  signature?: string;
}

const ProcedureCarePrint = forwardRef<HTMLDivElement, ProcedureCarePrintProps>(
  ({ procedureId }, ref) => {
    const [data, setData] = useState<ProcedureCareData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        if (!procedureId) return;

        try {
          setLoading(true);
          const response = await ApiManager.getProcedureCareById(procedureId);
          setData(response?.data ?? response);
        } catch (error) {
          console.error("Failed to fetch procedure care data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [procedureId]);

    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      try {
        return dayjs(dateString).format("DD/MM/YYYY");
      } catch {
        return dateString;
      }
    };

    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!data) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">No data found</Typography>
        </Box>
      );
    }

    return (
      <Box ref={ref}>
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 3,
            textDecoration: "underline",
          }}
        >
          PROCEDURE CARE PLAN
        </Typography>

        {/* Form Content */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            {/* Procedure Perform */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 1.5 }}>
                <Typography
                  sx={{
                    fontWeight: "600",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
                >
                  Procedure Perform (प्रक्रिया)
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    borderBottom: "1px dotted #000",
                    ml: 1,
                    fontSize: "13px",
                  }}
                >
                  {data.procedurePerform || ""}
                </Typography>
              </Box>
            </Grid>

            {/* Doctor Name */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 1.5 }}>
                <Typography
                  sx={{
                    fontWeight: "600",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
                >
                  Doctor Name (चिकित्सक नाम)
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    borderBottom: "1px dotted #000",
                    ml: 1,
                    fontSize: "13px",
                  }}
                >
                  {data.doctorName || ""}
                </Typography>
              </Box>
            </Grid>

            {/* Therapist Name */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: "600",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
                >
                  Therapist Name (सहायक नाम)
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    borderBottom: "1px dotted #000",
                    ml: 1,
                    fontSize: "13px",
                  }}
                >
                  {data.therapistName || ""}
                </Typography>
              </Box>
            </Grid>

            {/* Details of Therapy */}
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  mb: 1,
                }}
              >
                Details of Therapy:
              </Typography>
              <Box
                sx={{
                  minHeight: "60px",
                  border: "1px solid #ccc",
                  padding: "8px",
                  mb: 2,
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.therapyDetails || ""}
              </Box>
            </Grid>

            {/* Treatment Benefits */}
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  mb: 1,
                }}
              >
                Treatment Benefits
              </Typography>
              <Box
                sx={{
                  minHeight: "60px",
                  border: "1px solid #ccc",
                  padding: "8px",
                  mb: 2,
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.treatmentBenefits || ""}
              </Box>
            </Grid>

            {/* Treatment Risks */}
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  mb: 1,
                }}
              >
                Treatment Risks
              </Typography>
              <Box
                sx={{
                  minHeight: "60px",
                  border: "1px solid #ccc",
                  padding: "8px",
                  mb: 2,
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.treatmentRisks || ""}
              </Box>
            </Grid>

            {/* Treatment Alternatives */}
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  mb: 1,
                }}
              >
                Treatment Alternatives
              </Typography>
              <Box
                sx={{
                  minHeight: "60px",
                  border: "1px solid #ccc",
                  padding: "8px",
                  mb: 2,
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.treatmentAlternatives || ""}
              </Box>
            </Grid>

            {/* Treatment Outcome */}
            <Grid item xs={12}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  mb: 1,
                }}
              >
                Treatment Outcome
              </Typography>
              <Box
                sx={{
                  minHeight: "60px",
                  border: "1px solid #ccc",
                  padding: "8px",
                  mb: 3,
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.treatmentOutcome || ""}
              </Box>
            </Grid>

            {/* Footer Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 4,
                  gap: 4,
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "600",
                        fontSize: "13px",
                        minWidth: "150px",
                      }}
                    >
                      Doctor's Name (चिकित्सक नाम)
                    </Typography>
                    <Typography
                      sx={{
                        borderBottom: "1px dotted #000",
                        minWidth: "200px",
                        ml: 1,
                        fontSize: "12px",
                      }}
                    >
                      {data.footerDoctorName || ""}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "600",
                        fontSize: "13px",
                        minWidth: "150px",
                      }}
                    >
                      Date (दिनांक)
                    </Typography>
                    <Typography
                      sx={{
                        borderBottom: "1px dotted #000",
                        minWidth: "200px",
                        ml: 1,
                        fontSize: "12px",
                      }}
                    >
                      {formatDate(data.date)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "baseline" }}>
                    <Typography
                      sx={{
                        fontWeight: "600",
                        fontSize: "13px",
                        minWidth: "150px",
                      }}
                    >
                      Signature (हस्ताक्षर)
                    </Typography>
                    <Typography
                      sx={{
                        borderBottom: "1px dotted #000",
                        minWidth: "200px",
                        ml: 1,
                        fontSize: "12px",
                      }}
                    >
                      {data.signature || ""}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }
);

ProcedureCarePrint.displayName = "ProcedureCarePrint";

export default ProcedureCarePrint;
