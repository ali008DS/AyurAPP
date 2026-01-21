import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddUnitDialog from "../components/units/add-unit";
import EditUnitDialog, { UnitData } from "../components/units/edit-unit";

import { Box, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, PackagePlus } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

function UnitsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<UnitData[]>([]);
  const [allRows, setAllRows] = useState<UnitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Unit Name",
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "700",
            color: "#222",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.name || "N/A"}
        </Box>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "600",
            color: "#555",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.type === "unit" ? "Unit" : "Sub Unit"}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await ApiManager.getUnits();
        const unitsData = response?.data || [];
        setRows(unitsData);
        setAllRows(unitsData);
      } catch (error) {
        console.error("Error fetching units:", error);
        setAlert({
          severity: "error",
          message: "Failed to fetch units.",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [counter, setAlert]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term === "") {
      setRows(allRows);
    } else {
      const filtered = allRows.filter(
        (unit) =>
          unit.name.toLowerCase().includes(term.toLowerCase()) ||
          unit.type.toLowerCase().includes(term.toLowerCase())
      );
      setRows(filtered);
    }
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
  };

  const handleEdit = (unit: UnitData) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUnitToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (unitToDelete) {
      try {
        await ApiManager.deleteUnit(unitToDelete);
        setCounter(counter + 1);
        setAlert({
          severity: "success",
          message: "Unit deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting unit:", error);
        setAlert({
          severity: "error",
          message: "Failed to delete unit.",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  return (
    <Box
      sx={{
        px: 3,
        display: "flex",
        flexDirection: "column",
        height: "98%",
        maxWidth: "95%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => {
            navigate("/settings");
          }}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <HeadingText name="Units Management" />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}
          >
            <TextField
              size="small"
              placeholder="Search units..."
              value={searchTerm}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#666" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<PackagePlus size={20} />}
            sx={{ ml: 2, px: 2, fontFamily: "Nunito, sans-serif" }}
            onClick={handleAdd}
          >
            Add Unit
          </Button>
        </Box>
      </Box>

      <DataGrid
        loading={isLoading}
        rows={rows}
        getRowId={(row) => row._id}
        density="compact"
        columns={columns}
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 20 },
          },
        }}
        pageSizeOptions={[20, 50, 100]}
        sx={{
          minHeight: "70vh",
          border: 0,
          backgroundColor: "white",
          "& .MuiDataGrid-cell": {
            borderColor: "#f0f0f0",
          },
        }}
      />

      {isAddDialogOpen && (
        <AddUnitDialog
          open={isAddDialogOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsAddDialogOpen(false)}
        />
      )}

      {isEditDialogOpen && selectedUnit && (
        <EditUnitDialog
          open={isEditDialogOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsEditDialogOpen(false)}
          unit={selectedUnit}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          title="Delete Unit"
          message="Are you sure you want to delete this unit? This action cannot be undone."
          onClose={(confirmed) => {
            if (confirmed) {
              confirmDelete();
            } else {
              setIsDeleteDialogOpen(false);
              setUnitToDelete(null);
            }
          }}
        />
      )}
    </Box>
  );
}

export default UnitsManagement;
