import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddDistributorDrawer from "../components/distributor/add-distributor";
import EditDistributorDialog from "../components/distributor/edit-distributor";

import { Box, Button, TextField, InputAdornment } from "@mui/material";
import { Search, PackagePlus } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";

import { DistributorFormType } from "../utils/validationSchemas";

interface DistributorData {
  _id: string;
  name: string;
  gstNo: string;
  primaryContactNo: string;
  secondaryContactNo?: string;
  address: string;
}

function DistributorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<DistributorData[]>([]);
  const [allRows, setAllRows] = useState<DistributorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(1);
  const [isDistributorDrawerOpen, setIsDistributorDrawerOpen] = useState(false);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedDistributor, setSelectedDistributor] =
    useState<DistributorFormType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [distributorToDelete, setDistributorToDelete] = useState<string | null>(
    null
  );
  const { setAlert } = useAppContext();

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Distributor Name",
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
      field: "gstNo",
      headerName: "GST Number",
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
          {params.row.gstNo || "N/A"}
        </Box>
      ),
    },
    {
      field: "primaryContactNo",
      headerName: "Primary Contact",
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
          {params.row.primaryContactNo || "N/A"}
        </Box>
      ),
    },
    {
      field: "secondaryContactNo",
      headerName: "Secondary Contact",
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
          {params.row.secondaryContactNo || "N/A"}
        </Box>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "600",
            color: "#555",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.address || "N/A"}
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
        const response = await ApiManager.getDistributor();
        const distributorData = response?.data || [];
        setRows(distributorData);
        setAllRows(distributorData);
      } catch (error) {
        console.error("Error fetching distributors:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [counter]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await ApiManager.getDistributor();
        const distributorData = response?.data || [];
        setDistributors(distributorData);
      } catch (error) {
        console.error("Error fetching distributors:", error);
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
      const filtered = distributors.filter(
        (distributor) =>
          distributor.name.toLowerCase().includes(term.toLowerCase()) ||
          distributor.gstNo.toLowerCase().includes(term.toLowerCase()) ||
          distributor.primaryContactNo
            .toLowerCase()
            .includes(term.toLowerCase()) ||
          (distributor.secondaryContactNo &&
            distributor.secondaryContactNo
              .toLowerCase()
              .includes(term.toLowerCase())) ||
          distributor.address.toLowerCase().includes(term.toLowerCase())
      );
      setRows(filtered);
    }
  };

  const handleAdd = () => {
    setSelectedDistributor(null);
    setIsDistributorDrawerOpen(true);
  };

  const handleEdit = (distributor: DistributorData) => {
    // Convert the data from API to the required form format
    const distributorForm: DistributorFormType = {
      id: distributor._id,
      name: distributor.name,
      gstNo: distributor.gstNo,
      primaryContactNo: distributor.primaryContactNo,
      secondaryContactNo: distributor.secondaryContactNo,
      address: distributor.address,
    };
    setSelectedDistributor(distributorForm);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDistributorToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (distributorToDelete) {
      try {
        await ApiManager.deleteDistributor(distributorToDelete);
        setCounter(counter + 1);
        setAlert({
          severity: "success",
          message: "Distributor deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting distributor:", error);
        setAlert({
          severity: "error",
          message: "Failed to delete distributor.",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setDistributorToDelete(null);
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
      <HeadingText name="Distributor" />

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
              placeholder="Search distributors..."
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
            Add Distributor
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

      {isDistributorDrawerOpen && (
        <AddDistributorDrawer
          open={isDistributorDrawerOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsDistributorDrawerOpen(false)}
          distributor={selectedDistributor}
        />
      )}

      {isEditDialogOpen && (
        <EditDistributorDialog
          open={isEditDialogOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsEditDialogOpen(false)}
          distributor={selectedDistributor!}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          title="Delete Distributor"
          message="Are you sure you want to delete this distributor? This action cannot be undone."
          onClose={(confirmed) => {
            if (confirmed) {
              confirmDelete();
            } else {
              setIsDeleteDialogOpen(false);
              setDistributorToDelete(null);
            }
          }}
        />
      )}
    </Box>
  );
}

export default DistributorPage;
