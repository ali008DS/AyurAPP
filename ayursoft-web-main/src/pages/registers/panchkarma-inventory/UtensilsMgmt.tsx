import { Box, Button, IconButton, Tabs, Tab } from "@mui/material";
import HeadingText from "../../../components/ui/HeadingText";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Trash, FilePenLine, FilePlus } from "lucide-react";
import ApiManager from "../../../components/services/apimanager";
import ConfirmationDialog from "../../../components/ui/confirmation-dialog";
import { useAppContext } from "../../../context/app-context";
import UtensilDialog from "../../../components/registers/UtensilDialog";
import PanchkarmaAssignment from "../../../components/registers/panchkarmaAssignment";

interface Utensil {
  _id: string;
  name: string;
  utensilType: string;
}

function UtensilPanchkarmaInventory() {
  const { setAlert } = useAppContext();
  const [tabValue, setTabValue] = useState(0);
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUtensilId, setSelectedUtensilId] = useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  });

  const fetchUtensils = async () => {
    try {
      const response = await ApiManager.getUtensils("panchkarmaInventory");
      const utensilsWithId = response.data.map((utensil: any) => ({
        ...utensil,
        id: utensil._id,
      }));
      setUtensils(utensilsWithId);
    } catch (error) {
      console.error("Failed to fetch utensils", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtensils();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Utensil Name",
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            textTransform: "capitalize",
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "700",
            color: "#222",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box display="flex" gap={2} sx={{ mt: 0.5 }}>
          <IconButton
            onClick={() => handleEdit(params.row)}
            size="small"
            sx={{
              backgroundColor: "#ffffffff",
              color: "#FAAD14",
              width: 28,
              height: 28,
            }}
          >
            <FilePenLine size={16} />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedUtensilId(params.row.id);
              setConfirmDialogOpen(true);
            }}
            size="small"
            sx={{
              backgroundColor: "#ffffffff",
              color: "#CF1322",
              width: 28,
              height: 28,
            }}
          >
            <Trash size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (utensil: Utensil) => {
    setEditMode(true);
    setSelectedUtensilId(utensil._id);
    setFormData({ name: utensil.name });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditMode(false);
    setSelectedUtensilId(null);
    setFormData({ name: "" });
    setDialogOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        utensilType: "panchkarmaInventory",
      };

      if (editMode && selectedUtensilId) {
        await ApiManager.updateUtensil(selectedUtensilId, payload);
        setAlert({ severity: "success", message: "Updated successfully." });
      } else {
        await ApiManager.createUtensil(payload);
        setAlert({ severity: "success", message: "Created successfully." });
      }
      setDialogOpen(false);
      fetchUtensils();
    } catch (error) {
      console.error("Failed to save", error);
      setAlert({ severity: "error", message: "Failed to save." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiManager.deleteUtensil(id);
      setAlert({ severity: "success", message: "Deleted successfully." });
      fetchUtensils();
    } catch (error) {
      console.error("Failed to delete", error);
      setAlert({ severity: "error", message: "Failed to delete." });
    }
  };

  const handleConfirmClose = (result: boolean) => {
    setConfirmDialogOpen(false);
    if (result && selectedUtensilId) {
      handleDelete(selectedUtensilId);
    }
  };

  const renderUtensilsGrid = () => (
    <DataGrid
      disableColumnMenu
      disableRowSelectionOnClick
      density="compact"
      rows={utensils}
      columns={columns}
      loading={loading}
          pageSizeOptions={[20, 50, 100]}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pagination
      sx={{
        border: 0,
        "& .MuiDataGrid-columnHeaders": {
          fontFamily: "Nunito, sans-serif",
        },
        "& .MuiDataGrid-cell:focus": { outline: "none" },
      }}
    />
  );

  return (
    <Box sx={{ px: 3 }}>
      <HeadingText name="Panchkarma Inventory Management" />
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab
          label="Utensils CRUD"
          sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
        />
        <Tab
          label="Panchkarma Assignment"
          sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
        />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilePlus size={16} />}
              onClick={handleCreate}
              fullWidth
              sx={{ fontWeight: "bold", border: "dashed 1px" }}
            >
              Add Utensil
            </Button>
          </Box>
          <Box
            sx={{
              height: 600,
              overflow: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            {renderUtensilsGrid()}
          </Box>
          <UtensilDialog
            open={dialogOpen}
            editMode={editMode}
            formData={formData}
            onClose={() => setDialogOpen(false)}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
          />
          <ConfirmationDialog
            open={confirmDialogOpen}
            title="Delete Utensil"
            message="Are you sure you want to delete this utensil? This action is irreversible!"
            onClose={handleConfirmClose}
          />
        </Box>
      )}

      {tabValue === 1 && <PanchkarmaAssignment />}
    </Box>
  );
}

export default UtensilPanchkarmaInventory;
