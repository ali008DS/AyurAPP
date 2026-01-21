import { forwardRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, Typography, CircularProgress } from "@mui/material";
import ApiManager from "../../services/apimanager";

interface PainScoringChartPrintProps {
  therapyId: string;
}

interface PainScoringRow {
  time: string;
  date: string;
  checkedBy: string;
  painScoring: string;
}

interface PainScoringData {
  uhidNo: string;
  ipdNo: string;
  opdNo: string;
  name: string;
  age: string;
  sex: string;
  consultant: string;
  dateOfAdmission: string;
  beforeTreatment: PainScoringRow[];
  afterTreatment: PainScoringRow[];
}

const PainScoringChartPrint = forwardRef<
  HTMLDivElement,
  PainScoringChartPrintProps
>(({ therapyId }, ref) => {
  const [data, setData] = useState<PainScoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiManager.getPainScoringsByTherapyId(therapyId);
        if (response && response.data.length > 0) {
          setData(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch pain scoring data:", error);
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

  if (!data) {
    return (
      <Box ref={ref} sx={{ p: 4 }}>
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          No pain scoring data found
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
        PAIN SCORING CHART
      </Typography>

      {/* Header Information */}
      <Box sx={{ mb: 3, fontSize: "18px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: "18px" }}>
            UHID No.: {data.uhidNo || "............................"}
          </Typography>
          <Typography sx={{ fontSize: "18px" }}>
            IPD No:{data.ipdNo || "............................"}
          </Typography>
          <Typography sx={{ fontSize: "18px" }}>
            OPD No.:{data.opdNo || "............................"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: "18px", flex: 1 }}>
            Name: {data.name || "............................"}
          </Typography>
          <Typography sx={{ fontSize: "18px", ml: 4 }}>
            Age:{data.age || "..............."}
          </Typography>
          <Typography sx={{ fontSize: "18px", ml: 4 }}>
            Sex: {data.sex || "..............."}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "18px" }}>
            Consultant: {data.consultant || "............................"}
          </Typography>
          <Typography sx={{ fontSize: "18px" }}>
            Date of admission:{" "}
            {data.dateOfAdmission
              ? dayjs(data.dateOfAdmission).format("DD/MM/YYYY")
              : "............................"}
          </Typography>
        </Box>
      </Box>

      {/* Tables Section */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Before Treatment Table */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 1,
              fontSize: "14px",
            }}
          >
            BEFORE TREATMENT
          </Typography>
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
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  S. NO.
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  TIME
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  DATE
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  CHECKED BY
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  PAIN SCORING
                </th>
              </tr>
            </thead>
            <tbody>
              {data.beforeTreatment && data.beforeTreatment.length > 0 ? (
                data.beforeTreatment.map((row, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.time || ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.date ? dayjs(row.date).format("DD/MM/YYYY") : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.checkedBy || ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.painScoring || ""}
                    </td>
                  </tr>
                ))
              ) : (
                <></>
              )}
              {/* Add empty rows to match the template */}
              {Array.from({
                length: Math.max(0, 15 - (data.beforeTreatment?.length || 0)),
              }).map((_, index) => (
                <tr key={`empty-before-${index}`}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      height: "20px",
                    }}
                  >
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* After Treatment Table */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 1,
              fontSize: "14px",
            }}
          >
            AFTER TREATMENT
          </Typography>
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
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  S. NO.
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  TIME
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  DATE
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  CHECKED BY
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  PAIN SCORING
                </th>
              </tr>
            </thead>
            <tbody>
              {data.afterTreatment && data.afterTreatment.length > 0 ? (
                data.afterTreatment.map((row, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.time || ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.date ? new Date(row.date).toLocaleDateString() : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.checkedBy || ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {row.painScoring || ""}
                    </td>
                  </tr>
                ))
              ) : (
                <></>
              )}
              {/* Add empty rows to match the template */}
              {Array.from({
                length: Math.max(0, 15 - (data.afterTreatment?.length || 0)),
              }).map((_, index) => (
                <tr key={`empty-after-${index}`}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      height: "20px",
                    }}
                  >
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px" }}>
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
});

PainScoringChartPrint.displayName = "PainScoringChartPrint";

export default PainScoringChartPrint;
