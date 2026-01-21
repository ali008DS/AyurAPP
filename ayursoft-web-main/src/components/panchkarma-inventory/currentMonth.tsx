import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Save } from "lucide-react";
import IOSSwitch from "../ui/ios-switch";
import { useState, useEffect } from "react";
import ApiManager from "../services/apimanager";
import apimanager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface CurrentMonthItem {
  _id?: string;
  utensilItem: string;
  quantity: number;
  responsibilty?: string | { _id: string; firstName: string; lastName: string };
  checkedBy?: string | { _id: string; firstName: string; lastName: string };
}

export default function CurrentMonth() {
  const [currentMonthData, setCurrentMonthData] = useState<{
    _id: string;
    items: CurrentMonthItem[];
    createdAt: string;
    responsibleUser?: string | { _id: string; firstName: string; lastName: string };
    checkedUser?: string | { _id: string; firstName: string; lastName: string };
  } | null>(null);
  const [items, setItems] = useState<CurrentMonthItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { setAlert } = useAppContext();

  const fetchCurrentMonthData = async () => {
    try {
      setFetchLoading(true);
      const response = await ApiManager.getCurrentMonthPanchkarmaInventory();
      if (response.data && response.data.length > 0) {
        setCurrentMonthData({
          _id: response.data[0]._id,
          items: response.data[0].items,
          createdAt: response.data[0].createdAt,
          responsibleUser: response.data[0].responsibleUser,
          checkedUser: response.data[0].checkedUser,
        });
      }
    } catch (error: any) {
      setAlert({
        severity: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch current month data",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentMonthData();
  }, []);

  useEffect(() => {
    if (currentMonthData?.items && currentMonthData.items.length > 0) {
      const mappedItems: CurrentMonthItem[] = currentMonthData.items.map(
        (item: any) => ({
          _id: item._id,
          utensilItem:
            typeof item.utensilItem === "string"
              ? item.utensilItem
              : item.utensilItem?.name || "",
          quantity: item.quantity,
          responsibilty: item.responsibilty,
          checkedBy: item.checkedBy,
        })
      );
      setItems(mappedItems);
    }
  }, [currentMonthData]);

  const updateItem = (
    index: number,
    field: keyof CurrentMonthItem,
    value: any
  ) => {
    const updatedItems = [...items];
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser.id || currentUser._id || "";

    if (field === "responsibilty") {
      const responsibleUserId =
        typeof currentMonthData?.responsibleUser === "object"
          ? currentMonthData.responsibleUser._id
          : currentMonthData?.responsibleUser;
      if (responsibleUserId !== currentUserId) {
        return;
      }

      if (value === true && !updatedItems[index].responsibilty) {
        updatedItems[index] = {
          ...updatedItems[index],
          responsibilty: currentUserId,
        };
      } else if (value === false) {
        updatedItems[index] = {
          ...updatedItems[index],
          responsibilty: undefined,
        };
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const submitData: any = {
        items: items.map((item) => {
          const itemData: any = {
            ...(item._id && { _id: item._id }),
            utensilItem: item.utensilItem,
            quantity: item.quantity,
            // Convert to boolean - true if assigned, false otherwise
            responsibilty: !!item.responsibilty,
            checkedBy: !!item.checkedBy,
          };
          return itemData;
        }),
      };

      await apimanager.updatePanchkarmaInventory(
        currentMonthData!._id,
        submitData
      );
      setAlert({
        severity: "success",
        message: "Register updated successfully",
      });
      fetchCurrentMonthData();
    } catch (error: any) {
      setAlert({
        severity: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save register",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentMonthData) {
    return (
      <Box sx={{ mt: 2, textAlign: "center", p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Monthly-Register has not been created
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        fullWidth
        size="large"
        variant="outlined"
        startIcon={
          loading ? <CircularProgress size={22} /> : <Save size={22} />
        }
        sx={{ border: "dashed 1px", mb: 2 }}
        onClick={handleSubmit}
        color="warning"
        disabled={loading}
      >
        Update Register
      </Button>
      <Box
        sx={{
          backgroundColor: "rgba(176, 212, 255, 0.2)",
          borderRadius: 3,
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#666" }}>
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}{" "}
          Register
        </Typography>
        <Box sx={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
          {items.map((item, index) => (
            <Grid
              container
              spacing={2}
              key={index}
              sx={{
                mt: index === 0 ? 0.2 : 0,
                alignItems: "center",
              }}
            >
              <Grid item xs={1}>
                <TextField
                  size="small"
                  label="S.No"
                  value={index + 1}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  size="small"
                  label="Date"
                  value={new Date().toLocaleDateString()}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={2.5}>
                <TextField
                  size="small"
                  label="Utensil Item"
                  value={item.utensilItem}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={1.5}>
                <TextField
                  size="small"
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", +e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid
                item
                xs={2.3}
                sx={{
                  "& .MuiInputBase-input": {
                    cursor: (() => {
                      const currentUser = JSON.parse(
                        localStorage.getItem("user") || "{}"
                      );
                      const currentUserId =
                        currentUser.id || currentUser._id || "";
                      const responsibleUserId =
                        typeof currentMonthData?.responsibleUser === "object"
                          ? currentMonthData.responsibleUser._id
                          : currentMonthData?.responsibleUser;
                      return responsibleUserId !== currentUserId
                        ? "not-allowed"
                        : "default";
                    })(),
                  },
                }}
              >
                <TextField
                  size="small"
                  label="Responsibility"
                  fullWidth
                  error={!item.responsibilty}
                  value={
                    item.responsibilty
                      ? typeof item.responsibilty === "object"
                        ? `${item.responsibilty.firstName} ${item.responsibilty.lastName}`
                        : "Assigned"
                      : currentMonthData?.responsibleUser
                      ? typeof currentMonthData.responsibleUser === "object"
                        ? `${currentMonthData.responsibleUser.firstName.toUpperCase()} ${currentMonthData.responsibleUser.lastName.toUpperCase()}`
                        : "Not Assigned"
                      : "Not Assigned"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: item.responsibilty ? "green" : "red",
                        borderWidth: 1,
                      },
                      "&:hover fieldset": {
                        borderColor: item.responsibilty ? "green" : "red",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: item.responsibilty ? "green" : "red",
                      },
                    },
                  }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IOSSwitch
                          checked={!!item.responsibilty}
                          onChange={(e) => {
                            const currentUser = JSON.parse(
                              localStorage.getItem("user") || "{}"
                            );
                            const currentUserId =
                              currentUser.id || currentUser._id || "";
                            const responsibleUserId =
                              typeof currentMonthData?.responsibleUser ===
                              "object"
                                ? currentMonthData.responsibleUser._id
                                : currentMonthData?.responsibleUser;
                            if (responsibleUserId === currentUserId) {
                              updateItem(
                                index,
                                "responsibilty",
                                e.target.checked
                              );
                            }
                          }}
                          disabled={(() => {
                            const currentUser = JSON.parse(
                              localStorage.getItem("user") || "{}"
                            );
                            const currentUserId =
                              currentUser.id || currentUser._id || "";
                            const responsibleUserId =
                              typeof currentMonthData?.responsibleUser ===
                              "object"
                                ? currentMonthData.responsibleUser._id
                                : currentMonthData?.responsibleUser;
                            return responsibleUserId !== currentUserId;
                          })()}
                          sx={{
                            cursor: (() => {
                              const currentUser = JSON.parse(
                                localStorage.getItem("user") || "{}"
                              );
                              const currentUserId =
                                currentUser.id || currentUser._id || "";
                              const responsibleUserId =
                                typeof currentMonthData?.responsibleUser ===
                                "object"
                                  ? currentMonthData.responsibleUser._id
                                  : currentMonthData?.responsibleUser;
                              return responsibleUserId !== currentUserId
                                ? "not-allowed"
                                : "pointer";
                            })(),
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={2.5}>
                <TextField
                  size="small"
                  label="Checked By"
                  fullWidth
                  error={!item.checkedBy}
                  value={
                    item.checkedBy
                      ? typeof item.checkedBy === "object"
                        ? `${item.checkedBy.firstName} ${item.checkedBy.lastName}`
                        : "Checked"
                      : currentMonthData?.checkedUser
                      ? typeof currentMonthData.checkedUser === "object"
                        ? `${currentMonthData.checkedUser.firstName.toUpperCase()} ${currentMonthData.checkedUser.lastName.toUpperCase()}`
                        : "Pending..."
                      : "Pending..."
                  }
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
