import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MedPurchaseDrawer from "../components/medicine-management/med-purchase-drawer";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  PackagePlus,
  IndianRupee,
  Eye,
} from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import ApiManager from "../components/services/apimanager";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/app-context";

interface PanchakarmaSale {
  _id: string;
  invoiceNumber: string;
  status: string;
  patient?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  };
  saleDate: string;
  medicines: {
    medicine: {
      _id: string;
      name: string;
    };
    quantity?: number;
    totalQuantityInAUnit?: number;
    batchNumber?: string;
    register?: string;
    totalUnit?: number;
    sellingUnitType?: string;
    pricePerUnit?: number;
    totalPrice?: number;
    saleDate?: string;
  }[];
  therapies?: {
    therapy: string;
    price: number;
  }[];
  discount: number;
  totalAmount: number;
  paidAmount?: number;
  isWavedOff?: boolean;
  createdBy?: string;
  paymentType?: string;
  patientType?: string;
  nonPatientName?: string;
  nonPatientPhone?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function PanchakarmaSaleHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<PanchakarmaSale[]>([]);
  const [allRows, setAllRows] = useState<PanchakarmaSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(1);
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const router = useNavigate();
  const { setAlert } = useAppContext();

  const columns: GridColDef[] = [
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: 13,
            fontWeight: "700",
            color: "#222",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          {params.row.invoiceNumber}
        </Box>
      ),
    },
    {
      field: "patient",
      headerName: "Patient",
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
          {params.row.patient
            ? `${params.row.patient.firstName} ${params.row.patient.lastName}`
            : "No Patient"}
        </Box>
      ),
    },
    {
      field: "medicines",
      headerName: "Items",
      flex: 2,
      renderCell: (params) => {
        const medicines = params.row.medicines || [];
        const therapies = params.row.therapies || [];
        const totalItems = medicines.length + therapies.length;

        return (
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "600",
              color: "#666",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            {medicines.length > 0 && (
              <span>
                {medicines.map((med: any, index: number) => (
                  <span key={`med-${index}`}>
                    {med.medicine.name}
                    {index < medicines.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            )}
            {medicines.length > 0 && therapies.length > 0 && <span> + </span>}
            {therapies.length > 0 && <span>{therapies.length} Therapy(ies)</span>}
            {totalItems === 0 && <span>No items</span>}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => {
        const isWavedOff = params.row.isWavedOff;
        const status = params.value;

        let displayStatus = status;
        let color = "#ff9800"; // default orange for pending

        if (isWavedOff) {
          displayStatus = "Waved Off";
          color = "#9c27b0"; // purple for waved off
        } else if (status === "paid") {
          color = "#4caf50"; // green for paid
        }

        return (
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "600",
              color: color,
              fontFamily: "Nunito, sans-serif",
              textTransform: "capitalize",
            }}
          >
            {displayStatus}
          </Box>
        );
      },
    },
    {
      field: "saleDate",
      headerName: "Sale Date",
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
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
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
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Nunito, sans-serif",

            display: "flex",
          }}
        >
          <IndianRupee size={13} color="#444" />
          {params.value.toFixed(2)}
        </Box>
      ),
    },
    {
      field: "pendingAmount",
      headerName: "Pending Amount",
      flex: 1,
      renderCell: (params) => {
        const totalAmount = params.row.totalAmount || 0;
        const paidAmount = params.row.paidAmount || 0;
        const pendingAmount = totalAmount - paidAmount;
        return (
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "bold",
              color: pendingAmount > 0 ? "#d32f2f" : "#4caf50",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Nunito, sans-serif",
              display: "flex",
            }}
          >
            <IndianRupee size={13} color={pendingAmount > 0 ? "#d32f2f" : "#4caf50"} />
            {pendingAmount.toFixed(2)}
          </Box>
        );
      },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      flex: 1,
      renderCell: (params) => {
        const user = params.row.user;
        return (
          <Box
            sx={{
              fontSize: 13,
              fontWeight: "600",
              color: "#888",
              textTransform: "capitalize",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            {user
              ? `${user.firstName} ${user.lastName}`
              : params.row.createdBy || "-"}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => router(`/panchakarma-sale-view/${params.row._id}`)}
                sx={{ color: "primary.main" }}
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await ApiManager.getPanchakarmaSales();
        const salesData = data?.data || [];
        // Reverse the data order to show newest first
        const reversedData = [...salesData].reverse();
        setRows(reversedData);
        setAllRows(reversedData);
      } catch (error) {
        console.error("Error fetching panchakarma sales:", error);
        setAlert({
          severity: "error",
          message: "Failed to load panchakarma sales",
        });
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
        (sale) =>
          sale.invoiceNumber.toLowerCase().includes(term.toLowerCase()) ||
          sale.medicines.some((med) =>
            med.medicine.name.toLowerCase().includes(term.toLowerCase())
          ) ||
          (sale.patient &&
            `${sale.patient.firstName} ${sale.patient.lastName}`
              .toLowerCase()
              .includes(term.toLowerCase()))
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
      <HeadingText name="Panchakarma Sale History" />

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
              placeholder="Search sales..."
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
            onClick={() => router("/panchakarma-sale")}
          >
            Create New Sale
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

      <MedPurchaseDrawer
        open={isPurchaseDrawerOpen}
        recall={() => setCounter(counter + 1)}
        onClose={() => setIsPurchaseDrawerOpen(false)}
      />
    </Box>
  );
}

export default PanchakarmaSaleHistory;
