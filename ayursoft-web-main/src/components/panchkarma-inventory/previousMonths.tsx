import {
  Box,
  IconButton,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { Trash, Package } from "lucide-react";
import { useState, useEffect } from "react";
import ApiManager from "../services/apimanager";
import ConfirmationDialog from "../ui/confirmation-dialog";
import { useAppContext } from "../../context/app-context";

interface InventoryItem {
  utensilItem: { _id: string; name: string } | string;
  quantity: number;
}

interface InventoryData {
  _id: string;
  items: InventoryItem[];
  createdAt: string;
}

interface PreviousMonthsProps {}

export default function PreviousMonths({}: PreviousMonthsProps) {
  const { setAlert } = useAppContext();
  const [inventoryList, setInventoryList] = useState<InventoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null
  );

  const fetchInventory = async () => {
    try {
      const response = await ApiManager.getPanchkarmaInventory();
      if (response.data) {
        setInventoryList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiManager.deletePanchkarmaInventory(id);
      setAlert({ severity: "success", message: "Deleted successfully." });
      await fetchInventory();
    } catch (error) {
      setAlert({ severity: "error", message: "Delete failed." });
    }
  };

  const handleConfirmClose = (result: boolean) => {
    setConfirmDialogOpen(false);
    if (result && selectedInventoryId) {
      handleDelete(selectedInventoryId);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);
  return (
    <Box sx={{ mt: 2 }}>
      {loading ? (
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      ) : inventoryList.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {inventoryList.map((inventory) => (
            <Card
              key={inventory._id}
              sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
            >
              <Box
                sx={{
                  backgroundColor: "#fafafa",
                  borderBottom: "1px solid #e0e0e0",
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Package size={20} color="#3a3a3aff" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#212121", fontSize: 16 }}
                  >
                    Monthly Panchakarma Inventory
                  </Typography>
                  <Chip
                    label={`${inventory.items.length} Items`}
                    size="small"
                    sx={{
                      backgroundColor: "#e0e0e0",
                      fontFamily: "Nunito, sans-serif",
                      color: "#424242",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  />
                  <Chip
                    label={new Date(inventory.createdAt).toLocaleDateString()}
                    size="small"
                    sx={{
                      fontSize: 14,
                      fontFamily: "Nunito, sans-serif",
                      backgroundColor: "#e0e0e0",
                      color: "#424242",
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <IconButton
                  color="error"
                  onClick={() => {
                    setSelectedInventoryId(inventory._id);
                    setConfirmDialogOpen(true);
                  }}
                  size="small"
                >
                  <Trash size={20} />
                </IconButton>
              </Box>
              <CardContent sx={{ p: 2.5, backgroundColor: "#ffffff" }}>
                <Grid container spacing={2}>
                  {inventory.items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        sx={{
                          height: "100%",
                          backgroundColor: "#fafafa",
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                            borderColor: "#bdbdbd",
                            boxShadow: 1,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#212121",
                              textTransform: "capitalize",
                              mb: 1.5,
                            }}
                          >
                            {typeof item.utensilItem === "string"
                              ? item.utensilItem
                              : item.utensilItem.name}
                          </Typography>
                          <Divider sx={{ borderColor: "#e0e0e0" }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 1.5,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#757575",
                              }}
                            >
                              Quantity
                            </Typography>
                            <Chip
                              label={item.quantity}
                              size="small"
                              sx={{
                                fontFamily: "Nunito, sans-serif",
                                backgroundColor: "#424242",
                                color: "#ffffff",
                                fontWeight: 600,
                                fontSize: 16,
                                height: 24,
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography sx={{ mt: 2, textAlign: "center", color: "#999" }}>
          NO PREVIOUS MONTHS DATA AVAILABLE
        </Typography>
      )}

      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? This action is irreversible!"
        onClose={handleConfirmClose}
      />
    </Box>
  );
}
