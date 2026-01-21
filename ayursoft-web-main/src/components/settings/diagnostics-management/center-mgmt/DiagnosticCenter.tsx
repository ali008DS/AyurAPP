import { Box, Button, ButtonGroup, IconButton } from "@mui/material";
import HeadingText from "../../../ui/HeadingText";
import { useState, useEffect } from "react";
import CreateCenterDialog from "./create-dignostics-center-dialog";
import EditCenterDialog from "./edit-dignostics-center-dialog";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Trash, Plus } from "lucide-react";
import ApiManager from "../../../services/apimanager";
import ConfirmationDialog from "../../../ui/confirmation-dialog";
import { useAppContext } from "../../../../context/app-context";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

function DiagnosticCenter() {
  const { setAlert } = useAppContext();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenEditDialog = (center: any) => {
    setSelectedCenter(center);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedCenter(null);
    setEditDialogOpen(false);
  };

  const fetchCenters = async () => {
    try {
      const response = await ApiManager.getDiagnosticCenters();
      const centersWithId = response.data.map((center: any) => ({
        ...center,
        id: center._id,
      }));
      setCenters(centersWithId);
    } catch (error) {
      console.error("Failed to fetch diagnostic centers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 150, flex: 1 },
    { field: "contactName", headerName: "Contact Name", width: 150 },
    { field: "contactPhone", headerName: "Contact Phone", width: 250 },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <ButtonGroup
          variant="text"
          aria-label="Loading button group"
          sx={{ mt: 0.7 }}
        >
          <Button
            onClick={() => handleOpenEditDialog(params.row)}
            size="small"
            color="primary"
            sx={{
              backgroundColor: "rgba(0, 128, 255, 0.1)",
            }}
          >
            <Edit size={16} />
          </Button>
          <Button
            onClick={() => {
              setSelectedCenter(params.row);
              setConfirmDialogOpen(true);
            }}
            size="small"
            color="error"
            sx={{
              backgroundColor: "rgba(255, 0, 0, 0.1)",
            }}
          >
            <Trash size={16} />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await ApiManager.deleteDiagnosticCenter(id);
      console.log("Deleted center with id:", id);
      setAlert({
        severity: "success",
        message: "Diagnostic center deleted successfully.",
      });
      fetchCenters();
    } catch (error) {
      console.error("Failed to delete diagnostic center", error);
      setAlert({
        severity: "error",
        message: "Failed to delete diagnostic center.",
      });
    }
  };

  const handleConfirmClose = (result: boolean) => {
    setConfirmDialogOpen(false);
    if (result && selectedCenter) {
      handleDelete(selectedCenter.id);
    }
    setSelectedCenter(null);
  };

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => {
            navigate("/settings");
          }}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <HeadingText name="Diagnostic Center Management" />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpenDialog}
          sx={{ ml: 5 }}
          startIcon={<Plus />}
        >
          Create Center
        </Button>
      </Box>
      <CreateCenterDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={fetchCenters}
      />
      <EditCenterDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onSuccess={fetchCenters}
        center={selectedCenter}
      />
      <Box sx={{ height: 400, width: "100%", mt: 2 }}>
        <DataGrid
          autoHeight
          density="compact"
          rows={centers}
          columns={columns}
          loading={loading}
          pageSizeOptions={[20, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pagination
          sx={{ border: 0 }}
        />
      </Box>
      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this diagnostic center?"
        onClose={handleConfirmClose}
      />
    </Box>
  );
}

export default DiagnosticCenter;
