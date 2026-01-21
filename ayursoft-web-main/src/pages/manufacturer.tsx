import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddManufacturerDrawer from "../components/manufacturer/add-manufacturer";
import EditManufacturerDialog from "../components/manufacturer/edit-manufacturer";

import { Box, Button, TextField, InputAdornment } from "@mui/material";
import { Search, PackagePlus } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";

import { ManufacturerFormType } from "../utils/validationSchemas";

interface ManufacturerData {
  _id: string;
  name: string;
  agencyName: string;
  mrName: string;
  contactNumber: string;
}

function MedicinePurchase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<ManufacturerData[]>([]);
  const [allRows, setAllRows] = useState<ManufacturerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(1);
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<ManufacturerFormType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [manufacturerToDelete, setManufacturerToDelete] = useState<
    string | null
  >(null);
  const { setAlert } = useAppContext();

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Manufacturer Name",
      flex: 1.2,
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
      field: "agencyName",
      headerName: "Agency Name",
      flex: 1.2,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "600",
            color: "#555",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.agencyName || "N/A"}
        </Box>
      ),
    },
    {
      field: "mrName",
      headerName: "MR Name",
      flex: 1.2,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "600",
            color: "#555",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.mrName || "N/A"}
        </Box>
      ),
    },
    {
      field: "contactNumber",
      headerName: "Contact Number",
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
          {params.row.contactNumber || "N/A"}
        </Box>
      ),
    },
    {
      field: "secondaryNumber",
      headerName: "Secondary Number",
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
          {params.row.secondaryNumber || "N/A"}
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
        const response = await ApiManager.getManufacturer();
        const manufacturerData = response?.data || [];
        setRows(manufacturerData);
        setAllRows(manufacturerData);
      } catch (error) {
        console.error("Error fetching manufacturers:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [counter]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await ApiManager.getManufacturer();
        const manufacturerData = response?.data || [];
        setManufacturers(manufacturerData);
      } catch (error) {
        console.error("Error fetching manufacturers:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [counter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term === "") {
      setRows(allRows);
    } else {
      const filtered = manufacturers.filter(
        (manufacturer) =>
          manufacturer.name.toLowerCase().includes(term.toLowerCase()) ||
          manufacturer.agencyName.toLowerCase().includes(term.toLowerCase()) ||
          manufacturer.mrName.toLowerCase().includes(term.toLowerCase()) ||
          manufacturer.contactNumber.toLowerCase().includes(term.toLowerCase())
      );
      setRows(filtered);
    }
  };

  const handleAdd = () => {
    setSelectedManufacturer(null);
    setIsPurchaseDrawerOpen(true);
  };

  const handleEdit = (manufacturer: any) => {
    // Convert the data from API to the required form format
    const manufacturerForm: ManufacturerFormType = {
      id: manufacturer._id,
      name: manufacturer.name,
      agencyName: manufacturer.agencyName,
      mrName: manufacturer.mrName,
      contactNumber: manufacturer.contactNumber,
      secondaryNumber: manufacturer.secondaryNumber,
    };
    setSelectedManufacturer(manufacturerForm);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setManufacturerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (manufacturerToDelete) {
      try {
        await ApiManager.deleteManufacturer(manufacturerToDelete);
        setCounter(counter + 1);
        setAlert({
          severity: "success",
          message: "Manufacturer deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting manufacturer:", error);
        setAlert({
          severity: "error",
          message: "Failed to delete manufacturer.",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setManufacturerToDelete(null);
  };

  return (
    <Box
      sx={{
        px: 3,
        display: "flex",
        flexDirection: "column",
        height: "98%",
      }}
    >
      <HeadingText name="Manufacturer" />

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
              placeholder="Search manufacturers..."
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
            Add Manufacturer
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

      {isPurchaseDrawerOpen && (
        <AddManufacturerDrawer
          open={isPurchaseDrawerOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsPurchaseDrawerOpen(false)}
          manufacturer={selectedManufacturer}
        />
      )}

      {isEditDialogOpen && (
        <EditManufacturerDialog
          open={isEditDialogOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsEditDialogOpen(false)}
          manufacturer={selectedManufacturer!}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          title="Delete Manufacturer"
          message="Are you sure you want to delete this manufacturer? This action cannot be undone."
          onClose={(confirmed) => {
            if (confirmed) {
              confirmDelete();
            } else {
              setIsDeleteDialogOpen(false);
              setManufacturerToDelete(null);
            }
          }}
        />
      )}
    </Box>
  );
}

export default MedicinePurchase;
