import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, Typography, CircularProgress } from "@mui/material";
import ApiManager from "../../services/apimanager";

interface DailyVitalFeedbackPrintProps {
  therapyId: string;
}

interface VitalRow {
  date?: string;
  time?: string;
  weight?: string;
  temp?: string;
  bp?: string;
  pulse?: string;
  pain?: string;
  therapy?: string;
  patientFeedback?: string;
  patientSign?: string;
  therapistSign?: string;
  doctorSign?: string;
}

interface VitalData {
  _id: string;
  therapy: string;
  patient: string;
  rows: VitalRow[];
}

const DailyVitalFeedbackPrint = ({
  therapyId,
}: DailyVitalFeedbackPrintProps) => {
  const [data, setData] = useState<VitalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiManager.getDailyVitalFeedbacksByTherapyId(
          therapyId
        );
        if (response?.data?.length > 0) {
          setData(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch daily vital feedback data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapyId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <Box>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 3,
            textDecoration: "underline",
          }}
        >
          DAILY VITAL PAIN SCORING & DAILY FEEDBACK FORM
        </Typography>
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 3,
          textDecoration: "underline",
          fontSize: "16px",
        }}
      >
        DAILY VITAL PAIN SCORING & DAILY FEEDBACK FORM
      </Typography>

      <Box
        sx={{
          border: "1px solid #000",
          "& table": {
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "9px",
          },
          "& th, & td": {
            border: "1px solid #000",
            padding: "4px 2px",
            textAlign: "center",
            verticalAlign: "middle",
            minHeight: "30px",
          },
          "& th": {
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            fontSize: "8px",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            minWidth: "25px",
            padding: "8px 4px",
          },
          "& td": {
            minHeight: "40px",
            padding: "6px 4px",
          },
        }}
      >
        <table>
          <thead>
            <tr>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Date
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Time
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Weight
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Temp.
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                B.P.
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Pulse
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Pain
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Therapy
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Patient Feedback
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Patient Sign.
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Therapist Sign.
              </th>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  transform: "none",
                  fontSize: "12px",
                }}
              >
                Doctor Sign.
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index}>
                <td style={{ fontSize: "10px" }}>
                  {row.date
                    ? dayjs(row.date).format("DD/MM/YYYY")
                    : ""}
                </td>
                <td style={{ fontSize: "10px" }}>{row.time || ""}</td>
                <td style={{ fontSize: "10px" }}>{row.weight || ""}</td>
                <td style={{ fontSize: "10px" }}>{row.temp || ""}</td>
                <td style={{ fontSize: "10px" }}>{row.bp || ""}</td>
                <td style={{ fontSize: "10px" }}>{row.pulse || ""}</td>
                <td style={{ fontSize: "10px" }}>{row.pain || ""}</td>
                <td style={{ minWidth: "60px", fontSize: "10px" }}>
                  {row.therapy || ""}
                </td>
                <td
                  style={{
                    minWidth: "80px",
                    fontSize: "10px",
                    textAlign: "center",
                    paddingLeft: "4px",
                  }}
                >
                  {row.patientFeedback || ""}
                </td>
                <td style={{ textAlign: "center", fontSize: "10px" }}>
                  {row.patientSign || ""}
                </td>
                <td style={{ textAlign: "center", fontSize: "10px" }}>
                  {row.therapistSign || ""}
                </td>
                <td style={{ textAlign: "center", fontSize: "10px" }}>
                  {row.doctorSign || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

DailyVitalFeedbackPrint.displayName = "DailyVitalFeedbackPrint";

export default DailyVitalFeedbackPrint;
