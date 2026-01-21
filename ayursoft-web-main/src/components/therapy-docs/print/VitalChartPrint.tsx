import { forwardRef, useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import ApiManager from "../../services/apimanager";

interface VitalChartPrintProps {
  therapyId: string;
}

interface VitalChartRow {
  date: string;
  time: string;
  weight: string;
  temp: string;
  bp: string;
  pulse: string;
  pain: string;
  therapy: string;
  patientFeedback: string;
  patientSign: string;
  therapistSign: string;
  doctorSign: string;
}

interface VitalChartData {
  rows: VitalChartRow[];
  patient?: any;
}

const VitalChartPrint = forwardRef<HTMLDivElement, VitalChartPrintProps>(
  ({ therapyId }, ref) => {
    const [data, setData] = useState<VitalChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await ApiManager.getVitalChartsByTherapyId(
            therapyId
          );
          if (response && response.data.length > 0) {
            setData(response.data[0]);
          }
        } catch (error) {
          console.error("Failed to fetch vital chart data:", error);
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

    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <Box ref={ref} sx={{ p: 4 }}>
          <Typography sx={{ textAlign: "center", color: "#666" }}>
            No vital chart data found
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
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 2,
            fontSize: "18px",
            color: "#666",
          }}
        >
          VITAL CHART
        </Typography>

        {/* Header Information */}
        <Box sx={{ mb: 2, fontSize: "11px" }}>
          <Typography sx={{ fontSize: "11px" }}>
            Patient Name: ............................ Gender: ............ DOA:
            ..................... UHID NO.: .......................
          </Typography>
        </Box>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            fontSize: "8px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                DATE
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                TIME
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                WEIGHT
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                TEMPERATURE
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                BLOOD
                <br />
                PRESSURE
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                PULSE
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                PAIN
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                PATIENT
                <br />
                FEEDBACK
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                PATIENT
                <br />
                SIGN
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                THERAPIST
                <br />
                SIGN
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                DOCTOR
                <br />
                SIGN
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.date ? dayjs(row.date).format("DD/MM/YYYY") : ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.time || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.weight || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.temp || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.bp || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.pulse || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.pain || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.patientFeedback || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.patientSign || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.therapistSign || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {row.doctorSign || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  }
);

VitalChartPrint.displayName = "VitalChartPrint";

export default VitalChartPrint;
