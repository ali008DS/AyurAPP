import { forwardRef, useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Grid } from "@mui/material";
import dayjs from "dayjs";
import ApiManager from "../../services/apimanager";

interface DailyDietAssessmentPrintProps {
  therapyId: string;
}

interface DietMeal {
  advisedDiet: string;
  upparavaDietChanges: string;
  signOfDietitian: string;
  consultant: string;
  kitchen: string;
}

interface Assessment {
  name: string;
  date: string;
  doa: string;
  opd: string;
  ipd: string;
  uhidNo: string;
  wodOs: string;
  age: string;
  sex: string;
  consultantName: string;
  provisionalDiagnosis: string;
  confirmDiagnosis: string;
  earlyMorning: DietMeal;
  breakfast: DietMeal;
  lunch: DietMeal;
  afternoon: DietMeal;
  dinner: DietMeal;
  night: DietMeal;
}

interface DailyDietAssessmentData {
  assessments: Assessment[];
}

const DailyDietAssessmentPrint = forwardRef<
  HTMLDivElement,
  DailyDietAssessmentPrintProps
>(({ therapyId }, ref) => {
  const [data, setData] = useState<DailyDietAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiManager.getDailyDietAssessmentsByTherapyId(
          therapyId
        );
        if (response && response.data.length > 0) {
          setData(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch daily diet assessment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapyId]);

  if (loading) {
    return (
      <Box ref={ref} sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !data.assessments || data.assessments.length === 0) {
    return (
      <Box ref={ref} sx={{ p: 4 }}>
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          No daily diet assessment data found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        "@media print": {
          p: 2,
        },
      }}
    >
      {data.assessments.map((assessment, assessmentIndex) => (
        <Box
          key={assessmentIndex}
          sx={{
            mb: assessmentIndex < data.assessments.length - 1 ? 4 : 0,
            pageBreakAfter:
              assessmentIndex < data.assessments.length - 1 ? "always" : "auto",
          }}
        >
          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 2,
              fontSize: "16px",
              color: "#333",
            }}
          >
            DAILY DIET ASSESSMENT FORM
          </Typography>

          {/* Patient Information */}
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Typography sx={{ fontSize: "14px" }}>
                  Name (नाम):{" "}
                  {assessment.name || "............................"}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: "14px" }}>
                  Date: {" "}
                  {assessment.date
                    ? dayjs(assessment.date).format("DD/MM/YYYY")
                    : "............................"}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: "14px" }}>
                  DOA (भर्ती की तारीख):{" "}
                  {assessment.doa
                    ? dayjs(assessment.doa).format("DD/MM/YYYY")
                    : "...................."}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: "14px" }}>
                  OPD No: {assessment.opd || "....................."}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: "14px" }}>
                  IPD No: {assessment.ipd || "....................."}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: "14px" }}>
                  UHID No. {assessment.uhidNo || "....................."}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "14px" }}>
                  W/o d/o s/o(रिश्ता/पति):{" "}
                  {assessment.wodOs || "..........................."}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: "14px" }}>
                  Age (उम्र): {assessment.age || "....................."}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography sx={{ fontSize: "14px" }}>
                  Sex (लिंग): {assessment.sex || "....................."}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: "14px" }}>
                  Consultant Name (चिकित्सक नाम):{" "}
                  {assessment.consultantName || "............................"}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: "14px" }}>
                  Provisional Diagnosis(रोग निदान):{" "}
                  {assessment.provisionalDiagnosis ||
                    "............................"}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={1} sx={{ mt: 0.5, mb: 1 }}>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: "14px" }}>
                  Confirm Diagnosis (रोग विनिहय):{" "}
                  {assessment.confirmDiagnosis ||
                    "............................"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Diet Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 6px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    width: "15%",
                  }}
                ></th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 6px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    width: "25%",
                  }}
                >
                  Advised Diet
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 6px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    width: "20%",
                  }}
                >
                  Upadrava diet changes
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 6px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    width: "20%",
                  }}
                >
                  Signature of Dietitian or consultant
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 6px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    width: "20%",
                  }}
                >
                  Kitchen
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Early Morning Row */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Early morning
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.earlyMorning.advisedDiet}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.earlyMorning.upparavaDietChanges}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.earlyMorning.signOfDietitian}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.earlyMorning.kitchen}
                </td>
              </tr>

              {/* Breakfast Row */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Breakfast
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.breakfast.advisedDiet}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.breakfast.upparavaDietChanges}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.breakfast.signOfDietitian}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.breakfast.kitchen}
                </td>
              </tr>

              {/* Lunch Row */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Lunch
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.lunch.advisedDiet}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.lunch.upparavaDietChanges}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.lunch.signOfDietitian}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.lunch.kitchen}
                </td>
              </tr>

              {/* Afternoon Row */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Afternoon
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.afternoon.advisedDiet}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.afternoon.upparavaDietChanges}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.afternoon.signOfDietitian}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.afternoon.kitchen}
                </td>
              </tr>

              {/* Dinner Row */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Dinner
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.dinner.advisedDiet}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.dinner.upparavaDietChanges}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.dinner.signOfDietitian}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.dinner.kitchen}
                </td>
              </tr>

              {/* Night Row */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  Night
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.night.advisedDiet}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.night.upparavaDietChanges}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.night.signOfDietitian}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "20px 8px",
                    fontSize: "12px",
                  }}
                >
                  {assessment.night.kitchen}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
      ))}
    </Box>
  );
});

DailyDietAssessmentPrint.displayName = "DailyDietAssessmentPrint";

export default DailyDietAssessmentPrint;
