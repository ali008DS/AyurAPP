import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Tab,
  Tabs,
} from "@mui/material";
import { PackagePlus, Search, Plus, Minus, Edit } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import ApiManager from "../components/services/apimanager";
import MedOpenDrawer from "../components/panchakarma-stock/open-stock-model";
import StockAdjustmentModal, { StockAdjustType } from "../components/panchakarma-stock/stock-adjustment-modal";
import EditStockModal from "../components/panchakarma-stock/edit-stock-modal";

// Define the type for the API response
interface StockMedicine {
  _id: string;
  medicine: {
    _id: string;
    name: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
    baseUnitType: string;
    totalQuantityInAUnit: number;
    unitType: string; // This is the main unit type (e.g., "strip", "bottle", "box")
  };
  __v: number;
  createdAt: string;
  totalQuantity: number;
  unitType: string; // This is the subunit type at stock level
  updatedAt: string;
  batchNumber?: string;
  expiryDate?: string;
  sellingPrice?: number;
  manufacturingDate?: string;
}

// Define the type for stock adjustments
interface StockAdjustment {
  _id: string;
  medicine: string | { _id: string; name: string };
  batchNumber: string;
  adjustmentDate: string;
  totalQuantity: number;
  adjustType: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function PanchakarmaStock() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<StockMedicine[]>([]);
  const [allRows, setAllRows] = useState<StockMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenStockDrawerOpen, setIsOpenStockDrawerOpen] = useState(false);
  const [counter, setCounter] = useState(1);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] =
    useState(false);
  const [selectedMedicineForAdjustment, setSelectedMedicineForAdjustment] =
    useState<StockMedicine | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustType>(
    StockAdjustType.ADD
  );
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [selectedStockForEdit, setSelectedStockForEdit] =
    useState<StockMedicine | null>(null);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(
    []
  );
  const [allStockAdjustments, setAllStockAdjustments] = useState<StockAdjustment[]>(
    []
  );
  const [isAdjustmentsLoading, setIsAdjustmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      // fetch panchakarma-specific stock entries
      const data = await ApiManager.getPanchakarmaStock();
      const medicineData = data?.data || [];
      setRows(medicineData);
      setAllRows(medicineData);
      setIsLoading(false);
    })();
  }, [counter]);

  useEffect(() => {
    const fetchStockAdjustments = async () => {
      setIsAdjustmentsLoading(true);
      try {
        // use panchakarma-specific adjustments endpoint
        const adjustmentsData = (await ApiManager.getPanchakarmaStockAdjustments()) || [];
        setStockAdjustments(adjustmentsData);
        setAllStockAdjustments(adjustmentsData);
      } catch (error) {
        console.error("Error fetching panchakarma stock adjustments:", error);
      } finally {
        setIsAdjustmentsLoading(false);
      }
    };

    fetchStockAdjustments();
  }, [counter]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Medicine Name",
      flex: 2,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "700",
            color: "#222",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.medicine.name}
        </Box>
      ),
    },
    {
      field: "totalQuantity",
      headerName: "Total Quantity",
      flex: 1,
      renderCell: (params) => {
        const totalQuantityInAUnit =
          params.row.medicine.totalQuantityInAUnit || 1;
        const mainUnitQuantity = params.value / totalQuantityInAUnit;
        return (
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            {mainUnitQuantity}
          </Box>
        );
      },
    },
    {
      field: "baseUnitType",
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
          {params.row.medicine.unitType || "-"}
        </Box>
      ),
    },
    {
      field: "sellingPrice",
      headerName: "Selling Price",
      flex: 1,
      renderCell: (params) => {
        const pricePerSubUnit = params.value || 0;
        const totalQuantityInAUnit = params.row.medicine.totalQuantityInAUnit || 1;
        const pricePerMainUnit = pricePerSubUnit * totalQuantityInAUnit;
        return (
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "600",
              color: "#555",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            ₹{pricePerMainUnit.toFixed(2)}
          </Box>
        );
      },
    },
    {
      field: "batchNumber",
      headerName: "Batch Number",
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
          {params.value?.toUpperCase()}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
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
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </Box>
      ),
    },
    {
      field: "expiryDate",
      headerName: "Expiry Date",
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
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </Box>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
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
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            height: "100%",
          }}
        >
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<Plus size={16} />}
            onClick={() =>
              handleStockAdjustment(params.row, StockAdjustType.ADD)
            }
          >
            Add
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Minus size={16} />}
            onClick={() =>
              handleStockAdjustment(params.row, StockAdjustType.REDUCE)
            }
          >
            Reduce
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Edit size={16} />}
            onClick={() => handleEditStock(params.row)}
          >
            Edit
          </Button>
        </Box>
      ),
    },
  ];

  const adjustmentColumns: GridColDef[] = [
    {
      field: "medicine",
      headerName: "Medicine ID",
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
          {typeof params.value === "object"
            ? params.value?.name || "-"
            : params.value?._id || "-"}
        </Box>
      ),
    },
    {
      field: "batchNumber",
      headerName: "Batch Number",
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
          {params.value?.toUpperCase()}
        </Box>
      ),
    },
    {
      field: "adjustmentDate",
      headerName: "Adjustment Date",
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
          {new Date(params.value).toLocaleDateString("en-GB")}
        </Box>
      ),
    },
    {
      field: "totalQuantity",
      headerName: "Quantity",
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
          {params.value}
        </Box>
      ),
    },
    {
      field: "adjustType",
      headerName: "Adjust Type",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "600",
            color:
              params.value === "add"
                ? "#4caf50"
                : params.value === "reduce"
                ? "#f44336"
                : "#ff9800",
            fontFamily: "Nunito, sans-serif",
            textTransform: "capitalize",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "reason",
      headerName: "Reason",
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
          {params.value || "-"}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
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
          {new Date(params.value).toLocaleDateString("en-GB")}
        </Box>
      ),
    },
  ];

  const handleStockAdjustment = (
    medicine: StockMedicine,
    type: StockAdjustType
  ) => {
    setSelectedMedicineForAdjustment(medicine);
    setAdjustmentType(type);
    setIsStockAdjustmentModalOpen(true);
  };

  const handleEditStock = (stock: StockMedicine) => {
    setSelectedStockForEdit(stock);
    setIsEditStockModalOpen(true);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    // Filter stocks data
    if (term === "") {
      setRows(allRows);
    } else {
      const filtered = allRows.filter(
        (medicine) =>
          medicine.medicine.name.toLowerCase().includes(term.toLowerCase()) ||
          medicine.unitType.toLowerCase().includes(term.toLowerCase())
      );
      setRows(filtered);
    }

    // Filter stock adjustments
    if (term === "") {
      setStockAdjustments(allStockAdjustments);
    } else {
      const filteredAdjustments = allStockAdjustments.filter(
        (adjustment) =>
          adjustment.batchNumber?.toLowerCase().includes(term.toLowerCase()) ||
          adjustment.adjustType?.toLowerCase().includes(term.toLowerCase()) ||
          adjustment.reason?.toLowerCase().includes(term.toLowerCase()) ||
          (typeof adjustment.medicine === "object" &&
            adjustment.medicine?.name?.toLowerCase().includes(term.toLowerCase()))
      );
      setStockAdjustments(filteredAdjustments);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
      <HeadingText name="Panchakarma Stock" />

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexGrow: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Search medicines..."
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
            <Button
              variant="outlined"
              startIcon={<PackagePlus size={20} />}
              sx={{
                ml: 1,
                minWidth: 150,
                fontFamily: "Nunito, sans-serif",
              }}
              onClick={() => setIsOpenStockDrawerOpen(true)}
            >
              Open Stock
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="medicine stock tabs"
          sx={{
            "& .MuiTab-root": {
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              textTransform: "none",
            },
          }}
        >
          <Tab label="Stocks Data" />
          <Tab label={`Stock Adjustment History (${stockAdjustments.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <DataGrid
          rows={rows}
          loading={isLoading}
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
            borderRight: 0,
            borderLeft: 0,
            borderBottom: 0,
            backgroundColor: "white",
            "& .MuiDataGrid-cell": {
              borderColor: "#f0f0f0",
            },
          }}
        />
      )}

      {activeTab === 1 && (
        <DataGrid
          rows={stockAdjustments}
          loading={isAdjustmentsLoading}
          getRowId={(row) => row._id}
          density="compact"
          columns={adjustmentColumns}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          sx={{
            minHeight: "70vh",
            borderRight: 0,
            borderLeft: 0,
            borderBottom: 0,
            backgroundColor: "white",
            "& .MuiDataGrid-cell": {
              borderColor: "#f0f0f0",
            },
          }}
        />
      )}

      <MedOpenDrawer
        open={isOpenStockDrawerOpen}
        recall={() => setCounter(counter + 1)}
        onClose={() => setIsOpenStockDrawerOpen(false)}
      />
      <StockAdjustmentModal
        open={isStockAdjustmentModalOpen}
        onClose={() => {
          setIsStockAdjustmentModalOpen(false);
          setSelectedMedicineForAdjustment(null);
        }}
        selectedMedicine={selectedMedicineForAdjustment || undefined}
        adjustType={adjustmentType}
        onSuccess={() => setCounter(counter + 1)}
        isPanchakarma
      />
      <EditStockModal
        open={isEditStockModalOpen}
        onClose={() => {
          setIsEditStockModalOpen(false);
          setSelectedStockForEdit(null);
        }}
        selectedStock={selectedStockForEdit || undefined}
        onSuccess={() => setCounter(counter + 1)}
        isPanchakarma
      />
    </Box>
  );
}

export default PanchakarmaStock;
