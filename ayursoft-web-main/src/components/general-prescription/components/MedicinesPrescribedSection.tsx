import {
  Grid,
  Box,
  TextField,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Autocomplete,
} from "@mui/material";
import { ListPlus, ListMinus, Plus } from "lucide-react";
import ShowMedicinesDialog from "./ShowMedicinesDialog";
import { useEffect, useState } from "react";
import { useGeneralPrescription } from "../context/GeneralPrescriptionContext";
import type { GeneralMedicine } from "../context/GeneralPrescriptionContext";
import type { StockOption } from "../../department-management/types";
import ColoredSections from "./colored-section";
import ApiManager from "../../services/apimanager";

const medicineTypes = [
  "TAB.",
  "CAP.",
  "SYP.",
  "INJ.",
  "OIL.",
  "POW.",
  "OINT.",
  "LEP.",
  "AVLEH.",
  "PASTE.",
  "KADHA.",
  "SPRAY.",
  "DROP.",
  "LINI.",
  "Resin",
  "Malt",
  "Kwath",
  "Patch",
  "Packet",
  "Pouch",
  "Jerry Can",
  "Liter"
];

const doses = [
  "1 - 0 - 1",
  "1 - 1 - 1",
  "0 - 1 - 1",
  "1 - 1 - 0",
  "0 - 1 - 0",
  "0 - 1 - 0",
  "1 - 0 - 0",
  "0 - 0 - 1",
  "2 - 0 - 2",
  "0 - 2 - 0",
  "0 - 0 - 0 - 1",
  "1 - 1 - 1 - 1",
];

interface RxGroup {
  _id: string;
  name: string;
  medicines: GeneralMedicine[];
}

interface MedicineOption {
  _id: string;
  name: string;
  totalQuantity: number;
}

const MedicinesPrescribedSection = () => {
  const { prescriptionData, updatePrescriptionData } = useGeneralPrescription();
  const [rxGroups, setRxGroups] = useState<RxGroup[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<StockOption[]>([]);
  const [whenHowOptions, setWhenHowOptions] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Ensure at least one medicine row exists
  const medicines =
    prescriptionData.medicines.length > 0
      ? prescriptionData.medicines
      : [{ type: "", name: "", dose: "", whenHow: "" }];

  const fetchRxGroups = async () => {
    try {
      const response = await ApiManager.getRxGroups();
      setRxGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch Rx groups:", error);
    }
  };

  useEffect(() => {
    fetchRxGroups();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await ApiManager.getStockMedicine();
        const stockList = response?.data || [];
        setAvailableMedicines(stockList.map((stock: any) => ({
          _id: stock._id,
          name: stock.medicine?.name || "",
          totalQuantity: stock.totalQuantity || 0,
          batchNumber: stock.batchNumber || "",
          unitType: stock.unitType || stock.medicine?.unitType || stock.medicine?.baseUnitType || "",
          totalQuantityInAUnit: stock.medicine?.totalQuantityInAUnit || 1,
          medicineId: stock.medicine?._id || stock.medicine,
        })) as StockOption[]);
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    const fetchWhenHowOptions = async () => {
      try {
        const response = await ApiManager.getWhenHow();
        setWhenHowOptions(response.data.map((option: any) => option.name));
      } catch (error) {
        console.error("Failed to fetch when/how options:", error);
      }
    };
    fetchWhenHowOptions();
  }, []);

  const handleMedicineChange =
    (index: number, field: keyof GeneralMedicine) =>
      (_: React.SyntheticEvent, newValue: MedicineOption | string | null) => {
        const updatedMedicines = [...medicines];
        const value = newValue
          ? typeof newValue === "string"
            ? newValue
            : newValue.name
          : "";
        updatedMedicines[index] = {
          ...updatedMedicines[index],
          [field]: value,
        };
        updatePrescriptionData({ medicines: updatedMedicines });
      };

  const handleMedicineInputChange =
    (index: number, field: keyof GeneralMedicine) =>
      (_: React.SyntheticEvent, newInputValue: string) => {
        const updatedMedicines = [...medicines];
        updatedMedicines[index] = {
          ...updatedMedicines[index],
          [field]: newInputValue,
        };
        updatePrescriptionData({ medicines: updatedMedicines });
      };

  const handleRemoveMedicine = (indexToRemove: number) => {
    updatePrescriptionData({
      medicines: medicines.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleAddMedicine = (afterIndex: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(afterIndex + 1, 0, {
      type: "",
      name: "",
      dose: "",
      whenHow: "",
    });
    updatePrescriptionData({ medicines: updatedMedicines });
  };

  const handleRxGroupSelect = (event: SelectChangeEvent) => {
    const selectedGroupId = event.target.value;
    const selectedGroup = rxGroups.find(
      (group) => group._id === selectedGroupId
    );
    if (selectedGroup) {
      updatePrescriptionData({
        medicines: [...medicines, ...selectedGroup.medicines],
      });
    }
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <ColoredSections
          title="Medicines Prescribed"
          backgroundColor="rgba(255, 165, 165, 0.2)"
        >
          <Box sx={{ borderRadius: 1 }}>
            {medicines.map((medicine, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                sx={{
                  mb: index !== medicines.length - 1 ? 2 : 0,
                }}
              >
                <Grid item xs={2}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={medicineTypes}
                    value={medicine.type}
                    onChange={handleMedicineChange(index, "type")}
                    onInputChange={handleMedicineInputChange(index, "type")}
                    renderInput={(params) => (
                      <TextField {...params} label="Type" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={availableMedicines}
                    value={
                      (medicine as any)?.stockItemId
                        ? availableMedicines.find((med: any) => med._id === (medicine as any).stockItemId) || null
                        : null
                    }
                    inputValue={medicine.name || ""}
                    onChange={(_: any, newValue: any | string | null) => {
                      if (!newValue) {
                        handleMedicineChange(index, "name")(_ as any, "");
                        return;
                      }
                      if (typeof newValue === "string") {
                        handleMedicineChange(index, "name")(_ as any, newValue);
                        return;
                      }
                      // Only save the medicine name, not the batch number
                      const updatedMedicines = [...medicines];
                      updatedMedicines[index] = {
                        ...updatedMedicines[index],
                        name: newValue.name,
                        // @ts-ignore
                        stockItemId: newValue._id,
                      } as any;
                      updatePrescriptionData({ medicines: updatedMedicines });
                    }}
                    onInputChange={handleMedicineInputChange(index, "name")}
                    getOptionLabel={(option) =>
                      typeof option === "string"
                        ? option
                        : `${option.name}${option.batchNumber ? ` • Batch: ${option.batchNumber}` : ""}`
                    }
                    renderOption={(props, option) => {
                      if (typeof option === "string") {
                        return (
                          <li {...props} key={option} style={{ padding: "6px 8px" }}>
                            <Box sx={{ fontWeight: 500 }}>{option}</Box>
                          </li>
                        );
                      }
                      const mainQty = Math.floor(option.totalQuantity / (option.totalQuantityInAUnit || 1));
                      return (
                        <li
                          {...props}
                          key={option._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "4px 6px",
                            gap: 6,
                            borderLeft: mainQty < 5 ? "2px solid #ff5252" : "none",
                          }}
                        >
                          <Box sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.82rem" }}>
                            <span>{option.name}</span>
                            {option.batchNumber ? <span style={{ marginLeft: 6, fontSize: 10, color: '#666' }}>{`B: ${option.batchNumber}`}</span> : null}
                          </Box>
                          <Box component="span" sx={{ borderRadius: '8px', fontSize: '0.6rem', padding: '0px 4px', fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: mainQty < 5 ? 'rgba(244, 67, 54, 0.9)' : mainQty < 15 ? 'rgba(255, 152, 0, 0.9)' : 'rgba(76, 175, 80, 0.9)', color: 'white', minWidth: 28, textAlign: 'center' }}>
                            {`${mainQty}`}
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Name" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={doses}
                    value={medicine.dose}
                    onChange={handleMedicineChange(index, "dose")}
                    onInputChange={handleMedicineInputChange(index, "dose")}
                    renderInput={(params) => (
                      <TextField {...params} label="Dose" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={whenHowOptions}
                    value={medicine.whenHow}
                    onChange={handleMedicineChange(index, "whenHow")}
                    onInputChange={handleMedicineInputChange(index, "whenHow")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="When & How"
                        placeholder="e.g., Twice a day"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid
                  item
                  xs={1}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    onClick={() => handleAddMedicine(index)}
                    color="info"
                    size="small"
                  >
                    <ListPlus size={20} />
                  </IconButton>
                  {medicines.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveMedicine(index)}
                      color="error"
                      size="small"
                    >
                      <ListMinus size={20} />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              {medicines.length > 1 && (
                <IconButton
                  onClick={() => setDialogOpen(true)}
                  sx={{
                    mr: 1,
                    backgroundColor: "white",
                    color: "#444",
                  }}
                >
                  <Plus size={20} />
                </IconButton>
              )}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Add Rx Group</InputLabel>
                <Select
                  label="Add Rx Group"
                  onChange={handleRxGroupSelect}
                  value=""
                >
                  {rxGroups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </ColoredSections>
      </Box>
      <ShowMedicinesDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        medicines={medicines}
        onGroupAdded={fetchRxGroups}
      />
    </>
  );
};

export default MedicinesPrescribedSection;
