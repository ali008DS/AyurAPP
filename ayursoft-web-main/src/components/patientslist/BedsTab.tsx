import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface BedsTabProps {
  patientId: string;
}

const BedsTab: React.FC<BedsTabProps> = ({ patientId }) => {
  const [beds, setBeds] = useState<any[]>([]);
  const [occupancies, setOccupancies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningBedId, setAssigningBedId] = useState<string | null>(null);
  const [assignedBed, setAssignedBed] = useState<any | null>(null);
  const { setAlert } = useAppContext();

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await ApiManager.getBed();
      const bedsData = response.data.map((bed: any) => ({
        id: bed._id,
        bedId: bed.bedId,
        type: bed.bedType,
        status: bed.status,
        floor: bed.floor || "Unknown",
        patient: bed.patient || null,
      }));
      setBeds(bedsData);

      const found = bedsData.find(
        (bed: any) =>
          bed.patient &&
          (bed.patient._id === patientId || bed.patient === patientId)
      );
      setAssignedBed(found || null);

      const occs = await ApiManager.getOccupiedBeds();
      setOccupancies(occs?.data || []);
    } catch (err) {
      console.error("Error fetching beds:", err);
      setError("Failed to load bed information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, [patientId]);

  const handleAssignBed = async (bedMongoId: string) => {
    setAssigningBedId(bedMongoId);
    try {
      const payload = {
        bed: bedMongoId,
        patient: patientId,
      };

      const response = await ApiManager.assignBed(payload);

      if (response.status) {
        fetchBeds();
        console.log("Bed assigned successfully!");
        setAlert({
          severity: "success",
          message: response.message || "Bed assigned successfully!",
        });
      } else {
        setAlert({
          severity: "error",
          message:
            response.message || "Failed to assign bed. please try again.",
        });
        console.log(
          response.message || "Failed to assign bed. Please try again."
        );
      }
    } catch (error) {
      console.error("Error assigning bed:", error);
      setAlert({
        severity: "error",
        message: "Failed to assign bed. Please try again",
      });
    } finally {
      setAssigningBedId(null);
    }
  };

  const handleReleaseBed = async (bedMongoId: string) => {
    setAssigningBedId(bedMongoId);
    try {
      const occ = occupancies.find((o) => o.bed === bedMongoId);
      if (!occ || !occ._id) {
        setAlert({
          severity: "error",
          message: "No occupancy found for this bed.",
        });
        setAssigningBedId(null);
        return;
      }
      const response = await ApiManager.releaseBedOccupancy(occ._id);
      if (response.status) {
        fetchBeds();
        setAlert({
          severity: "success",
          message: response.data.message || "Bed released successfully!",
        });
      } else {
        setAlert({
          severity: "error",
          message:
            response.data.message || "Failed to release bed. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        severity: "error",
        message: "Failed to release bed. Please try again.",
      });
    } finally {
      setAssigningBedId(null);
    }
  };

  const groupedBeds: Record<string, any[]> = {};
  beds.forEach((bed) => {
    const floor = bed.floor || "Unknown";
    if (!groupedBeds[floor]) groupedBeds[floor] = [];
    groupedBeds[floor].push(bed);
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", color: "red" }}>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  }

  if (beds.length === 0) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body1">
          No bed information available for this patient.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ overflowY: "auto", maxHeight: "95vh" }}>
        {Object.keys(groupedBeds).map((floor) => (
          <Box key={floor} sx={{ mb: 3, p: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              {floor === "Unknown" ? "Unknown Floor" : `${floor}`}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bed ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedBeds[floor].map((bed, index) => {
                  const isAssignedToCurrent =
                    assignedBed && assignedBed.id === bed.id;
                  const isOccupiedByOther =
                    bed.status === "occupied" && !isAssignedToCurrent;
                  const isUnoccupied = bed.status !== "occupied";
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        height: "30px",
                        background: isAssignedToCurrent
                          ? "#e6f7ff"
                          : isOccupiedByOther
                          ? "#f5f5f5"
                          : undefined,
                        opacity: isOccupiedByOther ? 0.5 : 1,
                        fontWeight: isAssignedToCurrent ? "bold" : undefined,
                      }}
                    >
                      <TableCell>{bed.bedId || "N/A"}</TableCell>
                      <TableCell>{bed.type || "N/A"}</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor:
                            bed.status === "occupied"
                              ? "#fff4f9ff"
                              : "#f4fff4ff",
                          color:
                            bed.status === "occupied"
                              ? "#ff0000ff"
                              : "#000000ff",
                        }}
                      >
                        {bed.status || "N/A"}
                      </TableCell>
                      <TableCell>
                        {isAssignedToCurrent ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleReleaseBed(bed.id)}
                            disabled={assigningBedId === bed.id}
                          >
                            {assigningBedId === bed.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              "Release"
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleAssignBed(bed.id)}
                            disabled={
                              isOccupiedByOther ||
                              (!!assignedBed && isUnoccupied) ||
                              assigningBedId === bed.id
                            }
                          >
                            {assigningBedId === bed.id ? (
                              <CircularProgress size={18} />
                            ) : isOccupiedByOther ? (
                              "Occupied"
                            ) : (
                              "Assign"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        ))}
        <Box sx={{ minHeight: "10vh" }} />
      </Box>
    </Box>
  );
};

export default BedsTab;
