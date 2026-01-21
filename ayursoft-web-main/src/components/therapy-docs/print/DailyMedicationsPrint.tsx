import { forwardRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import ApiManager from "../../services/apimanager";

interface DailyMedicationsPrintProps {
  therapyId: string;
}

interface MedicationData {
  nameOfDrug?: string;
  dose?: string;
  date?: string;
  timeM?: string | boolean;
  timeA?: string | boolean;
  timeE?: string | boolean;
  adr?: string;
  doctorAdvice?: string;
  nurseSignatureM?: string;
  nurseSignatureA?: string;
  nurseSignatureE?: string;
}

interface DailyMedicationsData {
  allergies?: string;
  consultant?: string;
  doa?: string;
  medications?: MedicationData[];
}

const DailyMedicationsPrint = forwardRef<
  HTMLDivElement,
  DailyMedicationsPrintProps
>(({ therapyId }, ref) => {
  const [data, setData] = useState<DailyMedicationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!therapyId) return;

      try {
        setLoading(true);
        const response = await ApiManager.getDailyMedicationsByTherapyId(
          therapyId
        );
        if (response && response.data && response.data.length > 0) {
          setData(response.data[0]);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Failed to fetch daily medications data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapyId]);

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

  // Ensure we have at least 10 rows for the table
  const medications = data.medications || [];
  const minRows = 15;
  const rowsToDisplay =
    medications.length >= minRows
      ? medications
      : [...medications, ...Array(minRows - medications.length).fill({})];

  return (
    <Box ref={ref}>
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 2,
          fontSize: "20px",
        }}
      >
        DAILY MEDICATION SCHEDULE
      </Typography>

      {/* Patient Information */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", mb: 0.5 }}>
          <Typography
            sx={{
              fontWeight: "600",
              fontSize: "14px",
              minWidth: "80px",
            }}
          >
            Allergies:
          </Typography>
          <Typography
            sx={{
              flex: 1,
              borderBottom: "1px dotted #000",
              ml: 1,
              fontSize: "13px",
            }}
          >
            {data.allergies || ""}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", flex: 1 }}>
            <Typography
              sx={{
                fontWeight: "600",
                fontSize: "14px",
                minWidth: "80px",
              }}
            >
              Consultant:
            </Typography>
            <Typography
              sx={{
                flex: 1,
                borderBottom: "1px dotted #000",
                ml: 1,
                fontSize: "13px",
              }}
            >
              {data.consultant || ""}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <Typography
              sx={{
                fontWeight: "600",
                fontSize: "14px",
                minWidth: "40px",
              }}
            >
              DOA:
            </Typography>
            <Typography
              sx={{
                borderBottom: "1px dotted #000",
                minWidth: "100px",
                ml: 1,
                fontSize: "13px",
              }}
            >
              {formatDate(data.doa)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Medications Table */}
      <TableContainer>
        <Table
          size="small"
          sx={{
            border: "1px solid #000",
            "& .MuiTableCell-root": {
              border: "1px solid #000",
              padding: "4px 6px",
              fontSize: "11px",
              lineHeight: 1.3,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "15%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                NAME OF DRUG
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "8%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                DOSE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "10%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                DATE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "15%",
                  backgroundColor: "#f5f5f5",
                  padding: "0 !important",
                }}
              >
                <Box>TIME</Box>
                <Box
                  sx={{
                    display: "flex",
                    borderTop: "1px solid #000",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      borderRight: "1px solid #000",
                      padding: "4px",
                      fontSize: "10px",
                    }}
                  >
                    M
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      borderRight: "1px solid #000",
                      padding: "4px",
                      fontSize: "10px",
                    }}
                  >
                    A
                  </Box>
                  <Box sx={{ flex: 1, padding: "4px", fontSize: "10px" }}>
                    E
                  </Box>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "10%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                ADR
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "12%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                DOCTOR ADVICE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "20%",
                  backgroundColor: "#f5f5f5",
                  padding: "0 !important",
                }}
              >
                <Box>NURSE SIGNATURE</Box>
                <Box
                  sx={{
                    display: "flex",
                    borderTop: "1px solid #000",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      borderRight: "1px solid #000",
                      padding: "4px",
                      fontSize: "10px",
                    }}
                  >
                    M
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      borderRight: "1px solid #000",
                      padding: "4px",
                      fontSize: "10px",
                    }}
                  >
                    A
                  </Box>
                  <Box sx={{ flex: 1, padding: "4px", fontSize: "10px" }}>
                    E
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsToDisplay.map((med: any, index: number) => (
              <TableRow key={index}>
                <TableCell sx={{ fontSize: "11px", minHeight: "25px" }}>
                  {med.nameOfDrug || ""}
                </TableCell>
                <TableCell sx={{ fontSize: "11px", textAlign: "center" }}>
                  {med.dose || ""}
                </TableCell>
                <TableCell sx={{ fontSize: "11px", textAlign: "center" }}>
                  {med.date ? formatDate(med.date) : ""}
                </TableCell>
                <TableCell sx={{ padding: "0 !important" }}>
                  <Box sx={{ display: "flex" }}>
                    <Box
                      sx={{
                        flex: 1,
                        borderRight: "1px solid #000",
                        padding: "4px",
                        textAlign: "center",
                        fontSize: "11px",
                        minHeight: "25px",
                      }}
                    >
                      {med.timeM === "true" || med.timeM === true ? "✓" : med.timeM === "false" || med.timeM === false ? "✗" : ""}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        borderRight: "1px solid #000",
                        padding: "4px",
                        textAlign: "center",
                        fontSize: "11px",
                      }}
                    >
                      {med.timeA === "true" || med.timeA === true ? "✓" : med.timeA === "false" || med.timeA === false ? "✗" : ""}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: "11px",
                      }}
                    >
                      {med.timeE === "true" || med.timeE === true ? "✓" : med.timeE === "false" || med.timeE === false ? "✗" : ""}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: "11px" }}>{med.adr || ""}</TableCell>
                <TableCell sx={{ fontSize: "11px" }}>
                  {med.doctorAdvice || ""}
                </TableCell>
                <TableCell sx={{ padding: "0 !important" }}>
                  <Box sx={{ display: "flex" }}>
                    <Box
                      sx={{
                        flex: 1,
                        borderRight: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        minHeight: "25px",
                      }}
                    >
                      {med.nurseSignatureM || ""}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        borderRight: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                      }}
                    >
                      {med.nurseSignatureA || ""}
                    </Box>
                    <Box sx={{ flex: 1, padding: "4px", fontSize: "10px" }}>
                      {med.nurseSignatureE || ""}
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

DailyMedicationsPrint.displayName = "DailyMedicationsPrint";

export default DailyMedicationsPrint;
