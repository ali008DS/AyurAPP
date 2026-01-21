import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import BedsAddDialog from "./beds-add-dialog";
import BedsEditDialog from "./beds-edit-dialog";
import AssignBedDialog from "./AssignBedDialog";
import ApiManager from "../../services/apimanager";
import {
  Bed,
  BedOccupancy,
  FloorType,
} from "../../department-management/types";

const BedBox = ({
  bed,
  onEdit,
  onRelease,
  patient,
}: {
  bed: Bed;
  onEdit: () => void;
  onRelease: () => void;
  patient?: any;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        width: 245,
        height: 80,
        borderRadius: 2,
        bgcolor: bed.patient ? "red" : "white",
        border: "2px solid",
        borderColor: "grey.400",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        fontSize: "1rem",
        color: bed.patient ? "white" : "black",
        p: 2,
        position: "relative",
      }}
      title={`${bed.bedType} - ${bed.floor}`}
    >
      <IconButton
        size="small"
        sx={{ position: "absolute", top: 4, right: 4 }}
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 80, maxWidth: 120, p: 0.5 },
        }}
        MenuListProps={{
          dense: true,
          sx: { py: 0 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit();
          }}
          sx={{ fontSize: "0.85rem", minHeight: 28, py: 0.5 }}
          dense
        >
          Edit
        </MenuItem>
        {bed.patient && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onRelease();
            }}
            sx={{ fontSize: "0.85rem", minHeight: 28, py: 0.5 }}
            dense
          >
            Release
          </MenuItem>
        )}
      </Menu>
      {bed.patient && patient ? (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            mt: 0.5,
            gap: 1,
          }}
        >
          {/* left side */}
          <Box sx={{ flex: 1, pr: 1, textAlign: "left", maxWidth: "25%" }}>
            <Typography sx={{ textTransform: "capitalize" }}>
              {bed.bedType}
            </Typography>
            <Typography
              style={{
                fontSize: "0.9rem",
                display: "block",
                marginTop: "0.2rem",
              }}
            >
              {bed.patient ? "Occupied" : "Available"}
            </Typography>
            <Typography
              style={{
                fontSize: "0.7rem",
                display: "block",
                marginTop: "0.2rem",
              }}
            >
              {bed.bedId}
            </Typography>
          </Box>
          {/* divider */}
          <Box sx={{ width: "1px", bgcolor: "#fff", height: "100%" }} />
          {/* right side */}
          <Box
            sx={{
              flex: 1,
              pl: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5,
            }}
          >
            <Typography sx={{ fontSize: "1rem", color: "#fff" }}>
              {patient?.firstName && patient?.lastName
                ? `${patient.firstName} ${patient.lastName}`
                : "-"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Phone: {patient?.phone || "-"}
            </Typography>
            {/* <Box sx={{ fontSize: '0.7rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              UH ID: {patient?.uhId || '-'}
            </Box> */}
            {/* <Box sx={{ fontSize: '0.7rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              IPD ID: {patient?.ipdId || '-'}
            </Box> */}
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              OPD ID: {patient?.opdId || "-"}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: "left", width: "100%" }}>
          <Typography sx={{ fontWeight: "bold", textTransform: "capitalize" }}>
            {bed.bedType}
          </Typography>
          <Typography
            sx={{ fontSize: "0.9rem", display: "block", marginTop: "0.2rem" }}
          >
            {bed.patient ? "Occupied" : "Available"}
          </Typography>
          <Typography
            sx={{ fontSize: "0.7rem", display: "block", marginTop: "0.2rem" }}
          >
            ID: {bed.bedId}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const BedsBooking = () => {
  const [bedsData, setBedsData] = useState<Bed[]>([]);
  const [occupancies, setOccupancies] = useState<BedOccupancy[]>([]); // Store bed occupancies
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any | null>(null);

  // Fetch beds from API
  const fetchBeds = async () => {
    const apiData = await ApiManager.getBed();
    if (apiData.status && Array.isArray(apiData.data)) {
      const grouped: Record<string, any[]> = {};
      apiData.data.forEach((bed: any) => {
        const floor = bed.floor || "Unknown";
        if (!grouped[floor]) grouped[floor] = [];
        grouped[floor].push(bed);
      });
      setBedsData(apiData?.data || []);
    }
    // Fetch occupancies using ApiManager method
    const occs = await ApiManager.getOccupiedBeds();
    setOccupancies(occs?.data || []);
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  // Add Bed
  const handleAddBed = () => setAddOpen(true);
  const handleAddBedSuccess = async (newBed: any) => {
    await ApiManager.createBed(newBed);
    setAddOpen(false);
    fetchBeds();
  };

  // Edit Bed
  const handleEditBed = (bed: Bed) => {
    setSelectedBed(bed);
    setEditOpen(true);
  };
  const handleEditBedSuccess = async () => {
    setEditOpen(false);
    setSelectedBed(null);
    fetchBeds();
  };

  // Release Bed
  const handleReleaseBed = async (bed: string) => {
    console.log("Releasing bed:", bed, occupancies);
    const occ = occupancies.find((o) => o.bed === bed);
    if (occ && occ._id) {
      await ApiManager.releaseBedOccupancy(occ._id);
      fetchBeds();
    } else {
      alert("No occupancy found for this bed.");
    }
  };

  // Delete Bed
  /*
  const handleDeleteBed = async (bed: any) => {
    // Implement delete API if available, then:
    // await ApiManager.deleteBed(bed._id);
    fetchBeds();
  };
  */

  return (
    <Box sx={{ p: 3, maxHeight: "100vh" }} className="custom-scrollbar">
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
          Beds Booking
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddBed}
        >
          Add Bed
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAssignOpen(true)}
          sx={{ ml: 2 }}
        >
          Assign Bed
        </Button>
      </Box>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50", mt: 3 }}>
        <Typography
          sx={{ fontWeight: "bold", textTransform: "capitalize" }}
          variant="subtitle1"
          gutterBottom
        >
          Floor 0
        </Typography>
        <Box
          className="custom-scrollbar"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1,
          }}
        >
          {bedsData
            .filter((bed) => bed.floor === FloorType.FLOOR_0)
            .map((bed) => {
              return (
                <BedBox
                  key={bed.bedId}
                  bed={bed}
                  onEdit={() => handleEditBed(bed)}
                  onRelease={() => handleReleaseBed(bed._id)}
                  patient={bed?.patient}
                  // onDelete={() => handleDeleteBed(bed)}
                />
              );
            })}
        </Box>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50", mt: 3 }}>
        <Typography
          sx={{ fontWeight: "bold", textTransform: "capitalize" }}
          variant="subtitle1"
          gutterBottom
        >
          Floor 1
        </Typography>
        <Box
          className="custom-scrollbar"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1,
          }}
        >
          {bedsData
            .filter((bed) => bed.floor === FloorType.FLOOR_1)
            .map((bed) => {
              return (
                <BedBox
                  key={bed.bedId}
                  bed={bed}
                  onEdit={() => handleEditBed(bed)}
                  onRelease={() => handleReleaseBed(bed._id)}
                  patient={bed?.patient}
                  // onDelete={() => handleDeleteBed(bed)}
                />
              );
            })}
        </Box>
      </Paper>
      <Box sx={{ mt: 3, p: 2 }} />
      <BedsAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleAddBedSuccess}
      />
      <BedsEditDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedBed(null);
        }}
        onSuccess={handleEditBedSuccess}
        bed={selectedBed}
      />
      <AssignBedDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onAssignSuccess={fetchBeds}
      />
    </Box>
  );
};

export default BedsBooking;
