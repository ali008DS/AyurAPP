import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Save, Download } from "lucide-react";
import IOSSwitch from "../../../components/ui/ios-switch";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ApiManager from "../../../components/services/apimanager";
import apimanager from "../../../components/services/apimanager";
import { useAppContext } from "../../../context/app-context";
import HeadingText from "../../../components/ui/HeadingText";

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface CurrentMonthItem {
  _id?: string;
  utensilItem: string;
  quantity: number;
  responsibilty?: string | { _id: string; firstName: string; lastName: string };
  checkedBy?: string | { _id: string; firstName: string; lastName: string };
}

function RegRoomCheckedBy() {
  const [currentMonthData, setCurrentMonthData] = useState<{
    _id: string;
    items: CurrentMonthItem[];
    createdAt: string;
    responsibleUser?:
      | string
      | { _id: string; firstName: string; lastName: string };
    checkedUser?: string | { _id: string; firstName: string; lastName: string };
  } | null>(null);
  const [items, setItems] = useState<CurrentMonthItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { setAlert } = useAppContext();

  const fetchCurrentMonthData = async () => {
    try {
      setFetchLoading(true);
      const response =
        await ApiManager.getCurrentMonthMedicinePreparationInventory();
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

    if (field === "checkedBy") {
      // Only allow toggle if current user is the checkedUser
      const checkedUserId =
        typeof currentMonthData?.checkedUser === "object"
          ? currentMonthData.checkedUser._id
          : currentMonthData?.checkedUser;
      if (checkedUserId !== currentUserId) {
        return; // Don't allow toggle
      }

      if (value === true && !updatedItems[index].checkedBy) {
        updatedItems[index] = {
          ...updatedItems[index],
          checkedBy: currentUserId,
        };
      } else if (value === false) {
        updatedItems[index] = {
          ...updatedItems[index],
          checkedBy: undefined,
        };
      }
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
            checkedBy: !!item.checkedBy,
          };
          if (item.responsibilty) {
            itemData.responsibilty =
              typeof item.responsibilty === "object"
                ? item.responsibilty._id
                : item.responsibilty;
          }
          return itemData;
        }),
      };

      await apimanager.updateMedicinePreparationInventory(
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
      <Box
        sx={{
          m: 2,
          textAlign: "center",
        }}
      >
        <HeadingText name="Panchkarma Checked By" />
        <CircularProgress />
      </Box>
    );
  }

  if (!currentMonthData) {
    return (
      <Box sx={{ m: 2 }}>
        <HeadingText name="Panchkarma Checked By" />

        <Box
          sx={{
            m: 2,
            p: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 152, 0, 0.1)",
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" color="warning.main">
            Report not created for this month
          </Typography>
        </Box>
      </Box>
    );
  }

  const getResponsiblePersonName = (item: CurrentMonthItem): string => {
    // If item has responsibility assigned and it's an object
    if (item.responsibilty && typeof item.responsibilty === "object") {
      return `${item.responsibilty.firstName} ${item.responsibilty.lastName}`;
    }
    // Fall back to month-level responsible user
    if (currentMonthData?.responsibleUser && typeof currentMonthData.responsibleUser === "object") {
      return `${currentMonthData.responsibleUser.firstName} ${currentMonthData.responsibleUser.lastName}`;
    }
    return "Not Assigned";
  };

  const getCheckedByPersonName = (item: CurrentMonthItem): string => {
    // If item has checkedBy and it's an object
    if (item.checkedBy && typeof item.checkedBy === "object") {
      return `${item.checkedBy.firstName} ${item.checkedBy.lastName}`;
    }
    // Fall back to month-level checked user
    if (currentMonthData?.checkedUser && typeof currentMonthData.checkedUser === "object") {
      return `${currentMonthData.checkedUser.firstName} ${currentMonthData.checkedUser.lastName}`;
    }
    return "Pending";
  };

  const handleDownloadExcel = () => {
    try {
      console.log("Starting PDF generation...");
      console.log("Items:", items);

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Medicine Preparation Checked By Register", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.text(
        new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        105,
        22,
        { align: "center" }
      );

      // Prepare table data
      const tableData = items.map((item, index) => [
        (index + 1).toString(),
        new Date().toLocaleDateString(),
        item.utensilItem || "",
        item.quantity ? item.quantity.toString() : "0",
        item.responsibilty ? getResponsiblePersonName(item) : "",
        item.checkedBy ? getCheckedByPersonName(item) : "",
      ]);

      console.log("Table data:", tableData);

      // Generate table
      autoTable(doc, {
        startY: 28,
        head: [["S.No", "Date", "Utensil Item", "Quantity", "Responsible Person", "Checked By Person"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 20 },
          4: { cellWidth: 40 },
          5: { cellWidth: 40 },
        },
      });

      console.log("Saving PDF...");
      doc.save("medicine-preparation-checked-by.pdf");
      console.log("PDF saved successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setAlert({
        severity: "error",
        message: "Failed to generate PDF",
      });
    }
  };

  return (
    <Box sx={{ m: 2 }}>
      <HeadingText name="Panchkarma Checked By" />
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={
            loading ? <CircularProgress size={22} /> : <Save size={22} />
          }
          sx={{ border: "dashed 1px" }}
          onClick={handleSubmit}
          color="warning"
          disabled={loading}
        >
          Update Register
        </Button>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<Download size={22} />}
          sx={{ border: "dashed 1px" }}
          onClick={handleDownloadExcel}
          color="success"
        >
          Download PDF
        </Button>
      </Box>
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
          Register - Checked By
        </Typography>

        <Box sx={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
          {items.map((item, index) => (
            <Grid
              container
              spacing={2}
              key={index}
              sx={{
                mt: index === 0 ? 1 : 0,
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
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={2.5}>
                <TextField
                  size="small"
                  label="Responsibility"
                  fullWidth
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
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid
                item
                xs={2.4}
                sx={{
                  "& .MuiInputBase-input": {
                    cursor: (() => {
                      const currentUser = JSON.parse(
                        localStorage.getItem("user") || "{}"
                      );
                      const currentUserId =
                        currentUser.id || currentUser._id || "";
                      const checkedUserId =
                        typeof currentMonthData?.checkedUser === "object"
                          ? currentMonthData.checkedUser._id
                          : currentMonthData?.checkedUser;
                      return checkedUserId !== currentUserId
                        ? "not-allowed"
                        : "default";
                    })(),
                  },
                }}
              >
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
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IOSSwitch
                          checked={!!item.checkedBy}
                          onChange={(e) => {
                            const currentUser = JSON.parse(
                              localStorage.getItem("user") || "{}"
                            );
                            const currentUserId =
                              currentUser.id || currentUser._id || "";
                            const checkedUserId =
                              typeof currentMonthData?.checkedUser === "object"
                                ? currentMonthData.checkedUser._id
                                : currentMonthData?.checkedUser;
                            if (checkedUserId === currentUserId) {
                              updateItem(index, "checkedBy", e.target.checked);
                            }
                          }}
                          disabled={(() => {
                            const currentUser = JSON.parse(
                              localStorage.getItem("user") || "{}"
                            );
                            const currentUserId =
                              currentUser.id || currentUser._id || "";
                            const checkedUserId =
                              typeof currentMonthData?.checkedUser === "object"
                                ? currentMonthData.checkedUser._id
                                : currentMonthData?.checkedUser;
                            return checkedUserId !== currentUserId;
                          })()}
                          sx={{
                            cursor: (() => {
                              const currentUser = JSON.parse(
                                localStorage.getItem("user") || "{}"
                              );
                              const currentUserId =
                                currentUser.id || currentUser._id || "";
                              const checkedUserId =
                                typeof currentMonthData?.checkedUser === "object"
                                  ? currentMonthData.checkedUser._id
                                  : currentMonthData?.checkedUser;
                              return checkedUserId !== currentUserId
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
            </Grid>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default RegRoomCheckedBy;
