import { forwardRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, Typography, CircularProgress } from "@mui/material";
import ApiManager from "../../services/apimanager";

interface TherapistNotesPrintProps {
  therapyId: string;
}

interface TherapistNoteRow {
  date: string;
  time: string;
  bp: string;
  pulse: string;
  temp: string;
  pain: string;
}

interface TherapistNotesData {
  rows: TherapistNoteRow[];
}

const TherapistNotesPrint = forwardRef<
  HTMLDivElement,
  TherapistNotesPrintProps
>(({ therapyId }, ref) => {
  const [data, setData] = useState<TherapistNotesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiManager.getTherapistNotesByTherapyId(
          therapyId
        );
        if (response && response.data.length > 0) {
          setData(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch therapist notes data:", error);
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
          No therapist notes data found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
          fontSize: "18px",
          color: "#666",
          textDecoration: "underline",
        }}
      >
        THERAPIST NOTES
      </Typography>

      {/* Rows */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {data.rows?.map((row, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              pb: 2,
              borderBottom:
                index < data.rows.length - 1 ? "1px solid #e0e0e0" : "none",
            }}
          >
            {/* DATE */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                  mr: 1,
                }}
              >
                DATE:
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {row.date ? dayjs(row.date).format("DD/MM/YYYY") : ""}
              </Typography>
            </Box>

            {/* TIME */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                  mr: 1,
                }}
              >
                TIME:
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {row.time || ""}
              </Typography>
            </Box>

            {/* B.P. */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                  mr: 1,
                }}
              >
                B.P.:
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>{row.bp || ""}</Typography>
            </Box>

            {/* PULSE */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                  mr: 1,
                }}
              >
                PULSE:
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {row.pulse || ""}
              </Typography>
            </Box>

            {/* TEMP */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                  mr: 1,
                }}
              >
                TEMP.:
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {row.temp || ""}
              </Typography>
            </Box>

            {/* PAIN */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#666",
                  mr: 1,
                }}
              >
                PAIN:
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {row.pain || ""}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
});

TherapistNotesPrint.displayName = "TherapistNotesPrint";

export default TherapistNotesPrint;
