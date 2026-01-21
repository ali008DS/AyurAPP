import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Save, Plus, Minus } from "lucide-react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";

interface Utensil {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

interface InventoryItem {
  utensilItem: string;
}

function RegRoomAssignment() {
  const { setAlert } = useAppContext();
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([{ utensilItem: "" }]);
  const [responsibleUser, setResponsibleUser] = useState<string>("");
  const [checkedUser, setCheckedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [inventoryId, setInventoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const [utensilsRes, usersRes, currentMonthRes] = await Promise.all([
          ApiManager.getUtensils("medicinePreparation"),
          ApiManager.getUsers(),
          ApiManager.getCurrentMonthMedicinePreparationInventory(),
        ]);
        setUtensils(utensilsRes.data || []);
        setUsers(usersRes.data || []);
        
        if (currentMonthRes.data && currentMonthRes.data.length > 0) {
          const inventory = currentMonthRes.data[0];
          setInventoryId(inventory._id);
          setItems(inventory.items.map((item: any) => ({ utensilItem: item.utensilItem })));
          setResponsibleUser(inventory.responsibleUser || "");
          setCheckedUser(inventory.checkedUser || "");
        }
      } catch (error) {
        setAlert({ severity: "error", message: "Failed to fetch data" });
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const addRow = () => setItems([...items, { utensilItem: "" }]);
  const removeRow = (index: number) =>
    setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index].utensilItem = value;
    setItems(updated);
  };
  const addAllUtensils = () =>
    setItems(utensils.map((u) => ({ utensilItem: u.name })));

  const handleSubmit = async () => {
    if (items.some((item) => !item.utensilItem)) {
      setAlert({ severity: "error", message: "Please select all utensils" });
      return;
    }
    try {
      setLoading(true);
      if (inventoryId) {
        await ApiManager.updateMedicinePreparationInventory(inventoryId, {
          items,
          responsibleUser: responsibleUser || undefined,
          checkedUser: checkedUser || undefined,
        });
        setAlert({ severity: "success", message: "Updated successfully" });
      } else {
        const response = await ApiManager.createMedicinePreparationInventory({
          items,
          responsibleUser: responsibleUser || undefined,
          checkedUser: checkedUser || undefined,
        });
        setInventoryId(response.data._id);
        setAlert({ severity: "success", message: "Created successfully" });
      }
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to save" });
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
        disabled={loading}
      >
        {inventoryId ? "Update Assignment" : "Create Assignment"}
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
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <FormControl size="small" fullWidth>
              <InputLabel>Responsible User</InputLabel>
              <Select
                value={responsibleUser}
                label="Responsible User"
                onChange={(e) => setResponsibleUser(e.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl size="small" fullWidth>
              <InputLabel>Checked By</InputLabel>
              <Select
                value={checkedUser}
                label="Checked By"
                onChange={(e) => setCheckedUser(e.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          variant="outlined"
          onClick={addAllUtensils}
          fullWidth
          sx={{
            mb: 2,
            fontWeight: "bold",
            border: "dashed 1px",
            backgroundColor: "#ffffffff",
          }}
        >
          Add All Utensils
        </Button>
        <Box sx={{ maxHeight: "calc(98vh - 430px)", overflowY: "auto" }}>
          {items.map((item, index) => (
            <Grid
              container
              spacing={2}
              key={index}
              sx={{ mt: index === 0 ? 0.2 : 0 }}
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
                  value={new Date().toLocaleDateString("en-GB")}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={8}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Utensil Item</InputLabel>
                  <Select
                    value={item.utensilItem}
                    label="Utensil Item"
                    onChange={(e) => updateItem(index, e.target.value)}
                  >
                    {utensils.map((utensil) => (
                      <MenuItem key={utensil._id} value={utensil.name}>
                        {utensil.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <IconButton
                    sx={{
                      background: "#ffffffff",
                      border: "1px solid #bebebeff",
                    }}
                    onClick={addRow}
                    size="small"
                  >
                    <Plus size={26} />
                  </IconButton>
                  {items.length > 1 && (
                    <IconButton
                      sx={{
                        background: "#ffffffff",
                        border: "1px solid #bebebeff",
                      }}
                      onClick={() => removeRow(index)}
                      size="small"
                    >
                      <Minus size={26} />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default RegRoomAssignment;
