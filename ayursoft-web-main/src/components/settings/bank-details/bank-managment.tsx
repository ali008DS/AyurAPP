import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import { useAppContext } from "../../../context/app-context";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiManager from "../../services/apimanager";
import CreateBankDialog from "./edit-dialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeadingText from "../../ui/HeadingText";
import ConfirmationDialog from "../../ui/confirmation-dialog";
import { Trash2, Pencil, Plus } from "lucide-react";

interface BankDetailPayload {
  _id?: string;
  name?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  address?: string;
  branchName?: string;
  holderName?: string;
  bankName?: string;
  bankAccount?: string;
  type?: string;
  [key: string]: any;
}

export default function BankManagement() {
  const [groups, setGroups] = useState<BankDetailPayload[]>([]);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<BankDetailPayload | null>(
    null
  );
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await ApiManager.getBankDetails();

      const groupsData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setGroups(groupsData as BankDetailPayload[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTest = async (confirmed: boolean) => {
    const idToDelete = deleteTestId;
    setDeleteTestId(null);
    if (confirmed && idToDelete) {
      setLoading(true);
      try {
        await ApiManager.deleteBankDetail(idToDelete);
        await loadData();
        setAlert({
          severity: "success",
          message: "Bank detail deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting bank detail:", error);
        setAlert({
          severity: "error",
          message: "Failed to delete bank detail. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateBankDetail = async (data: any) => {
    setLoading(true);
    try {
      const payload =
        typeof data === "string"
          ? { name: data, type: "bankDetails" }
          : { ...(data || {}), type: (data && data.type) || "bankDetails" };

      await ApiManager.addBankDetail(payload);
      await loadData();
      setAlert({
        severity: "success",
        message: "Bank detail created successfully",
      });
    } catch (error) {
      console.error("Error creating bank detail:", error);
      setAlert({
        severity: "error",
        message: "Failed to create bank detail. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => navigate("/settings")} sx={{ ml: 3, mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <HeadingText name="Bank Details" />
        <Button
          variant="contained"
          startIcon={<Plus />}
          sx={{ ml: "auto", mr: 3 }}
          onClick={() => setCreateTestOpen(true)}
        >
          Add Bank Detail
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          className="custom-scrollbar"
          sx={{
            minHeight: "100vh",
            px: 3,
            maxHeight: "100vh",
            overflow: "auto",
          }}
        >
          <Box sx={{ py: 2, borderBottom: "1px solid #eee" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Bank Details</Typography>
            </Box>

            {/* Bank details table */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Account Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>IFSC</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: 120 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups && groups.length > 0 ? (
                    groups.map((g) => (
                      <TableRow key={g._id} hover>
                        <TableCell>{g.name}</TableCell>
                        <TableCell>
                          {g.accountNumber ?? g.bankAccount ?? "-"}
                        </TableCell>
                        <TableCell>{g.ifscCode ?? "-"}</TableCell>
                        <TableCell>{g.branch ?? g.branchName ?? "-"}</TableCell>
                        <TableCell sx={{ maxWidth: 300, whiteSpace: "normal" }}>
                          {g.address ?? "-"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingData(g);
                                  setCreateTestOpen(true);
                                }}
                                color="primary"
                              >
                                <Pencil size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteTestId(g._id ?? null)}
                                color="error"
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No bank details found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ minHeight: "200px" }}></Box>
        </Box>
      )}
      <CreateBankDialog
        open={createTestOpen}
        onClose={() => {
          setCreateTestOpen(false);
          setEditingData(null);
        }}
        onSuccess={(created: any) => {
          if (created && created._id) {
            setCreateTestOpen(false);
            setEditingData(null);

            loadData();
            setAlert({
              severity: "success",
              message: editingData
                ? "Bank detail updated successfully"
                : "Bank detail created successfully",
            });
            return;
          }

          handleCreateBankDetail(created);
          setCreateTestOpen(false);
        }}
        initialData={editingData ?? undefined}
      />
      <ConfirmationDialog
        open={!!deleteTestId}
        title="Delete Bank Detail"
        message="Are you sure you want to delete this bank detail? This action cannot be undone."
        onClose={handleDeleteTest}
      />
    </Box>
  );
}
