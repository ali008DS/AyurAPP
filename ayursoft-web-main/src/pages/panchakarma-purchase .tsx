import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MedPurchaseDrawer from "../components/medicine-management/med-purchase-drawer-new";
import PurchaseViewDialog from "../components/medicine-management/purchase-view-dialog";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Search, PackagePlus, IndianRupee, Eye, Pencil } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import ApiManager from "../components/services/apimanager";

interface Medicine {
  _id: string;
  name: string;
  baseUnitType: string;
  manufacturer: string;
  totalQuantityInAUnit: number;
  unitType: string;
}

interface PurchaseMedicineItem {
  medicine: Medicine;
  totalPurchasedUnit: number;
  purchasePrice: number;
  mrp: number;
  batchNumber: string;
  sellingPrice: number;
  hsnCode: string;
  manufacturingDate: string;
  expiryDate: string;
  discountPercentage: number;
  taxPercentage: number;
}

interface Distributor {
  _id: string;
  name: string;
  gstNo: string;
  primaryContactNo: string;
  secondaryContactNo: string;
  address: string;
  deletedAt: string | null;
  __v: number;
}

interface PurchaseRecord {
  _id: string;
  invoiceNumber: string;
  medicines: PurchaseMedicineItem[];
  distributor: Distributor;
  totalAmount: number;
  purchaseDate: string;
  taxableAmount: number;
  createdAt: string;
  updatedAt: string;
}

function PanchakarmaPurchase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<PurchaseRecord[]>([]);
  const [allRows, setAllRows] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(1);
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(
    null
  );
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseRecord | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const columns: GridColDef[] = [
    {
      field: "invoiceNumber",
      headerName: "Invoice #",
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ fontSize: 13, fontWeight: "700", color: "#222" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "purchaseDate",
      headerName: "Purchase Date",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ fontSize: 13, fontWeight: "600", color: "#555" }}>
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </Box>
      ),
    },
    {
      field: "distributor",
      headerName: "Distributor",
      flex: 1.2,
      // @ts-ignore
      valueGetter: (value) => value?.name || "—",
      renderCell: (params) => (
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Box sx={{ fontWeight: "bold", mb: 1 }}>
                {params.row.distributor.name}
              </Box>
              <Box sx={{ fontSize: 12, mb: 0.5 }}>
                GST: {params.row.distributor.gstNo}
              </Box>
              <Box sx={{ fontSize: 12, mb: 0.5 }}>
                Primary: {params.row.distributor.primaryContactNo}
              </Box>
              <Box sx={{ fontSize: 12, mb: 0.5 }}>
                Secondary: {params.row.distributor.secondaryContactNo}
              </Box>
              <Box sx={{ fontSize: 12 }}>
                Address: {params.row.distributor.address}
              </Box>
            </Box>
          }
          arrow
          placement="top"
        >
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {params.row.distributor.name}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "medicineCount",
      headerName: "Medicines",
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ fontSize: 13, fontWeight: "600", color: "#666" }}>
          {params.row.medicines.length} items
        </Box>
      ),
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "bold",
            color: "#444",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IndianRupee size={13} color="#444" />
          {params.value.toFixed(2)}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            sx={{ color: "#007bff" }}
            onClick={() => {
              setViewingPurchase(params.row);
              setIsViewDialogOpen(true);
            }}
          >
            <Eye size={16} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: "#f57c00" }}
            onClick={() => {
              setEditingPurchase(params.row);
              setIsPurchaseDrawerOpen(true);
            }}
          >
            <Pencil size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      // use panchakarma purchases API
      const data = await ApiManager.getPanchakarmaPurchases();
      const medicineData = data?.data || [];
      setRows(medicineData);
      setAllRows(medicineData);
      setIsLoading(false);
    })();
  }, [counter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term === "") {
      setRows(allRows);
    } else {
      const filtered = allRows.filter(
        (purchase) =>
          purchase.invoiceNumber.toLowerCase().includes(term.toLowerCase()) ||
          purchase.medicines.some((m) =>
            m.medicine.name.toLowerCase().includes(term.toLowerCase())
          )
      );
      setRows(filtered);
    }
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
      <HeadingText name="Panchakarma Purchase" />

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
          </Box>
          <Button
            variant="outlined"
            startIcon={<PackagePlus size={20} />}
            sx={{ ml: 2, px: 2, fontFamily: "Nunito, sans-serif" }}
            onClick={() => setIsPurchaseDrawerOpen(true)}
          >
            Purchase Medicine
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
        pageSizeOptions={[5, 10, 20]}
        sx={{
          minHeight: "70vh",
          border: 0,
          backgroundColor: "white",
          "& .MuiDataGrid-columnHeaders": {
            fontFamily: "Nunito, sans-serif",
          },
          fontFamily: "Nunito, sans-serif",
          "& .MuiDataGrid-cell": {
            borderColor: "#f0f0f0",
          },
        }}
      />
      <MedPurchaseDrawer
        open={isPurchaseDrawerOpen}
        recall={() => setCounter(counter + 1)}
        onClose={() => {
          setIsPurchaseDrawerOpen(false);
          setEditingPurchase(null);
        }}
        editData={editingPurchase}
        isPanchakarma
      />
      <PurchaseViewDialog
        open={isViewDialogOpen}
        purchase={viewingPurchase}
        onClose={() => {
          setIsViewDialogOpen(false);
          setViewingPurchase(null);
        }}
      />
    </Box>
  );
}

export default PanchakarmaPurchase;
