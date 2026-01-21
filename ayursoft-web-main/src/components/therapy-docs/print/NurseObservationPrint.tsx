import { useEffect, useState, forwardRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ApiManager from "../../services/apimanager";

interface NurseObservationPrintProps {
  therapyId: string;
}

interface Treatment {
  date?: string;
  treatmentMedicine?: string;
  dose?: string;
  time?: string;
  instructions?: string;
  doctorName?: string;
  nurseSign?: string;
}

interface NurseObservationData {
  _id: string;
  therapy: string;
  patient: string;
  patientName?: string;
  diagnosis?: string;
  uhidNo?: string;
  opdNo?: string;
  ipdNo?: string;
  roomBedNo?: string;
  treatments: Treatment[];
}

const NurseObservationPrint = forwardRef<
  HTMLDivElement,
  NurseObservationPrintProps
>(({ therapyId }, ref) => {
  const [data, setData] = useState<NurseObservationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiManager.getNurseObservationsByTherapyId(
          therapyId
        );
        if (response?.data?.length > 0) {
          setData(response.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch nurse observation data:", error);
        setData([]);
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

  if (!data || data.length === 0) {
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
          NURSE OBSERVATION FORM
        </Typography>
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: "Nunito, sans-serif" }} ref={ref}>
      {data.map((patientData, patientIndex) => (
        <Box
          key={patientData._id || patientIndex}
          sx={{
            mb:
              patientIndex < data.length - 1 ? 6 : 0,
            pageBreakAfter:
              patientIndex < data.length - 1 ? "always" : "auto",
          }}
        >
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
            Nurse Observation Form
          </Typography>

          {/* Patient Information Section */}
          <Box
            sx={{
              mb: 2,
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              },
              "& th, & td": {
                padding: "6px 8px",
                textAlign: "left",
              },
              "& th": {
                fontWeight: "bold",
                minWidth: "120px",
              },
            }}
          >
            <table>
              <tbody>
                <tr>
                  <th>Patient Name</th>
                  <td>: {patientData.patientName || ""}</td>
                  <th>Diagnosis</th>
                  <td>: {patientData.diagnosis || ""}</td>
                </tr>
                <tr>
                  <th>UHID No.</th>
                  <td>: {patientData.uhidNo || ""}</td>
                  <th>OPD No.</th>
                  <td>: {patientData.opdNo || ""}</td>
                </tr>
                <tr>
                  <th>IPD No.</th>
                  <td>: {patientData.ipdNo || ""}</td>
                  <th>Room No./Bed No.</th>
                  <td>: {patientData.roomBedNo || ""}</td>
                </tr>
              </tbody>
            </table>
          </Box>

          {/* Treatment Table */}
          <Box
            sx={{
              border: "1px solid #333",
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              },
              "& th, & td": {
                border: "1px solid #333",
                padding: "4px 8px",
                textAlign: "center",
                verticalAlign: "middle",
              },
              "& th": {
                fontWeight: "bold",
                backgroundColor: "#f5f5f5",
                fontSize: "12px",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                minWidth: "40px",
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
                      minWidth: "80px",
                    }}
                  >
                    DATE
                  </th>
                  <th
                    style={{
                      minWidth: "45px",
                      writingMode: "horizontal-tb",
                      transform: "none",
                    }}
                  >
                    TREATMENT / MEDICINE
                  </th>
                  <th
                    style={{
                      minWidth: "35px",
                      writingMode: "horizontal-tb",
                      transform: "none",
                    }}
                  >
                    DOSE
                  </th>
                  <th
                    style={{
                      writingMode: "horizontal-tb",
                      transform: "none",
                      minWidth: "60px",
                    }}
                  >
                    TIME
                  </th>
                  <th
                    style={{
                      writingMode: "horizontal-tb",
                      transform: "none",
                      minWidth: "60px",
                    }}
                  >
                    INSTRUCTIONS
                  </th>
                  <th
                    style={{
                      writingMode: "horizontal-tb",
                      transform: "none",
                      minWidth: "100px",
                    }}
                  >
                    DOCTOR'S NAME
                  </th>
                  <th
                    style={{
                      writingMode: "horizontal-tb",
                      transform: "none",
                      minWidth: "100px",
                    }}
                  >
                    NURSE SIGN
                  </th>
                </tr>
              </thead>
              <tbody>
                {patientData.treatments &&
                patientData.treatments.length > 0 ? (
                  patientData.treatments.map((treatment, index) => (
                    <tr key={index}>
                      <td style={{ fontSize: "12px" }}>
                        {treatment.date
                          ? new Date(treatment.date).toLocaleDateString("en-GB")
                          : ""}
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          textAlign: "left",
                        }}
                      >
                        {treatment.treatmentMedicine || ""}
                      </td>
                      <td style={{ fontSize: "12px" }}>{treatment.dose || ""}</td>
                      <td style={{ fontSize: "12px" }}>{treatment.time || ""}</td>
                      <td
                        style={{
                          fontSize: "12px",
                          textAlign: "left",
                          paddingLeft: "10px",
                        }}
                      >
                        {treatment.instructions || ""}
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {treatment.doctorName || ""}
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {treatment.nurseSign || ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No treatments recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>
      ))}
    </Box>
  );
});

NurseObservationPrint.displayName = "NurseObservationPrint";

export default NurseObservationPrint;
