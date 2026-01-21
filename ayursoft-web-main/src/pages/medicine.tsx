import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddMedicineDrawer from "../components/medicine/add-medicine";
import EditMedicineDialog from "../components/medicine/edit-medicine";

import { Box, Button, TextField, InputAdornment } from "@mui/material";
import { Search, PackagePlus, Settings } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import { useNavigate } from "react-router-dom";
import ApiManager from "../components/services/apimanager";
// import { ManufacturerFormType } from "../utils/validationSchemas";

interface MedicineWithManufacturer {
  _id: string;
  name: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  manufacturer?: {
    _id: string;
    name: string;
    address: string;
    contactNumber: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
  baseUnitType?: string;
  totalQuantityInAUnit?: number;
  unitType?: string;
}

interface EditMedicineFormType {
  id: string;
  name: string;
  manufacturer: string;
  unitType: string;
  baseUnitType: string;
  totalQuantityInAUnit: number;
}

function MedicineManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<MedicineWithManufacturer[]>([]);
  const [allRows, setAllRows] = useState<MedicineWithManufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(1);
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] =
    useState<EditMedicineFormType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Medicine Name",
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
      field: "unitType",
      headerName: "Main Unit Type",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "600",
            color: "#555",
            fontFamily: "Nunito, sans-serif",
            textTransform: "capitalize",
          }}
        >
          {params.row.unitType || "N/A"}
        </Box>
      ),
    },
    {
      field: "totalQuantityInAUnit",
      headerName: "Subunits in a Unit",
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
          {params.row.totalQuantityInAUnit || "N/A"}
        </Box>
      ),
    },
    {
      field: "manufacturer.name",
      headerName: "Manufacturer Name",
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
          {params.row.manufacturer?.name || "N/A"}
        </Box>
      ),
    },
    {
      field: "manufacturer.contactNumber",
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
          {params.row.manufacturer?.contactNumber || "N/A"}
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
        </Box>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await ApiManager.getMedicinesWithManufacturer();
        const medicineData = response?.data || [];
        console.log("Medicine API Response:", response);
        console.log("Medicine Data:", medicineData);
        if (medicineData.length > 0) {
          console.log("Sample Medicine Item:", medicineData[0]);
        }
        setRows(medicineData);
        setAllRows(medicineData);
      } catch (error) {
        console.error("Error fetching medicines with manufacturers:", error);
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
      const filtered = allRows.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(term.toLowerCase()) ||
          medicine.baseUnitType?.toLowerCase().includes(term.toLowerCase()) ||
          medicine.unitType?.toLowerCase().includes(term.toLowerCase())
      );
      setRows(filtered);
    }
  };

  const handleAdd = () => {
    setSelectedMedicine(null);
    setIsPurchaseDrawerOpen(true);
  };

  const handleEdit = (medicine: MedicineWithManufacturer) => {
    const medicineForm: EditMedicineFormType = {
      id: medicine._id,
      name: medicine.name || "",
      manufacturer: medicine.manufacturer?._id || "",
      unitType: medicine.unitType || "",
      baseUnitType: medicine.baseUnitType || "",
      totalQuantityInAUnit: medicine.totalQuantityInAUnit || 0,
    };
    setSelectedMedicine(medicineForm);
    setIsEditDialogOpen(true);
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <HeadingText name="Medicine" />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Settings size={20} />}
            sx={{ px: 2, fontFamily: "Nunito, sans-serif" }}
            onClick={() => navigate("/settings/units-management")}
          >
            Create Units
          </Button>
          <Button
            variant="outlined"
            startIcon={<PackagePlus size={20} />}
            sx={{ px: 2, fontFamily: "Nunito, sans-serif" }}
            onClick={handleAdd}
          >
            Add Medicine
          </Button>
        </Box>
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
        <AddMedicineDrawer
          open={isPurchaseDrawerOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsPurchaseDrawerOpen(false)}
        />
      )}

      {isEditDialogOpen && (
        <EditMedicineDialog
          open={isEditDialogOpen}
          recall={() => setCounter(counter + 1)}
          onClose={() => setIsEditDialogOpen(false)}
          medicine={selectedMedicine!}
        />
      )}
    </Box>
  );
}

export default MedicineManagement;
