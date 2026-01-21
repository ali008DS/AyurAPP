import { forwardRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, Typography, CircularProgress } from "@mui/material";
import ApiManager from "../../services/apimanager";

interface ProgressNotesPrintProps {
  therapyId: string;
}

interface ProgressNoteRow {
  date: string;
  time: string;
  bp: string;
  pulse: string;
  temp: string;
  pain: string;
}

interface ProgressNotesData {
  rows: ProgressNoteRow[];
}

const ProgressNotesPrint = forwardRef<HTMLDivElement, ProgressNotesPrintProps>(
  ({ therapyId }, ref) => {
    const [data, setData] = useState<ProgressNotesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        if (!therapyId) return;

        try {
          setLoading(true);
          const response = await ApiManager.getProgressNotesByTherapyId(
            therapyId
          );
          if (response && response.data && response.data.length > 0) {
            setData(response.data[0]);
          } else {
            setData(null);
          }
        } catch (error) {
          console.error("Failed to fetch progress notes data:", error);
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

    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">No progress notes data found</Typography>
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
            mb: 4,
            fontSize: "20px",
            textDecoration: "underline",
          }}
        >
          PROGRESS NOTES
        </Typography>

        {/* Rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {data.rows.map((row, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                pb: 2,
                borderBottom:
                  index < data.rows.length - 1 ? "1px solid #ddd" : "none",
              }}
            >
              {/* DATE */}
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  DATE:
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {formatDate(row.date)}
                </Typography>
              </Box>

              {/* TIME */}
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 120 }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  TIME:
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {row.time || ""}
                </Typography>
              </Box>

              {/* B.P. */}
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 120 }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  B.P.:
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {row.bp || ""}
                </Typography>
              </Box>

              {/* PULSE */}
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 120 }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  PULSE:
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {row.pulse || ""}
                </Typography>
              </Box>

              {/* TEMP */}
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 120 }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  TEMP.:
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {row.temp || ""}
                </Typography>
              </Box>

              {/* PAIN */}
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 120 }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    mr: 1,
                  }}
                >
                  PAIN:
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  {row.pain || ""}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
);

ProgressNotesPrint.displayName = "ProgressNotesPrint";

export default ProgressNotesPrint;
