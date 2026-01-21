import React, { useEffect, useState } from "react";
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
  InputAdornment,
} from "@mui/material";
import { ListPlus, ListMinus, Plus } from "lucide-react";
import ColoredSections from "./colored-section";
import { usePilesPrescription } from "../context/PilesPrescriptionContext";
import type {  Panchakarma } from "../context/PilesPrescriptionContext";
import ApiManager from "../../services/apimanager";
import { ShowPanchakarmasDialog } from "./ShowPanchakarmasDialog";



interface PanchakarmaGroup {
  _id: string;
  name: string;
  panchakarmas: Panchakarma[];
}

export const PanchakarmaSection = () => {
  const { prescriptionData, updatePrescriptionData } = usePilesPrescription();
  const [panchakarmaGroups, setPanchakarmaGroups] = useState<PanchakarmaGroup[]>([]);
  const [availablePanchakarmas, setAvailablePanchakarmas] = useState<string[]>([]);
  const [oilOptions, setOils] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPanchakarmaGroups = async () => {
    try {
      const response = await ApiManager.getPanchakarmaGroups();
      setPanchakarmaGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch Rx groups:", error);
    }
  };

  useEffect(() => {
    fetchPanchakarmaGroups();
  }, []);

  useEffect(() => {
    const fetchPanchakarmas = async () => {
      try {
        const response = await ApiManager.getTherapies();
        setAvailablePanchakarmas(response.data.map((item: { name: string }) => item.name));
        console.log("mapped panchakarmas:", response.data);
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      }
    };
    fetchPanchakarmas();
  }, []);

  useEffect(() => {
    const fetchOils = async () => {
      try {
        const response = await ApiManager.getOils();
        setOils(response.data.map((option: { name: string }) => option.name));
        console.log("mapped oils:", response.data);
      } catch (error) {
        console.error("Failed to fetch oils:", error);
      }
    };
    fetchOils();
  }, []);

  const handlePanchakarmaChange =
    (index: number, field: keyof Panchakarma) =>
    (_: React.SyntheticEvent, newValue: string | null) => {
      const updatedMedicines = [...prescriptionData.panchakarma];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: newValue || "",
      };
      updatePrescriptionData({ panchakarma: updatedMedicines });
    };

  const handlePanchakarmaInputChange =
    (index: number, field: keyof Panchakarma) =>
    (_: React.SyntheticEvent, newInputValue: string) => {
      const updatedMedicines = [...prescriptionData.panchakarma];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: newInputValue,
      };
      updatePrescriptionData({ panchakarma: updatedMedicines });
    };

  const handleRemovePanchakarma = (indexToRemove: number) => {
    updatePrescriptionData({
      panchakarma: prescriptionData.panchakarma.filter(
        (_, index) => index !== indexToRemove
      ),
    });
  };

  const handleAddPanchakarma = (afterIndex: number) => {
    const updatedPanchakarmas = [...prescriptionData.panchakarma];
    updatedPanchakarmas.splice(afterIndex + 1, 0, {
      therapy: "",
      oil: "",
      quantity: "",
      duration: "",
      days: "",
    });
    updatePrescriptionData({ panchakarma: updatedPanchakarmas });
  };

  const handlePanchakarmaGroupSelect = (event: SelectChangeEvent) => {
    const selectedGroupId = event.target.value;
    const selectedGroup = panchakarmaGroups.find(
      (group) => group._id === selectedGroupId
    );
    if (selectedGroup) {
      updatePrescriptionData({
        panchakarma: [...prescriptionData.panchakarma, ...selectedGroup.panchakarmas],
      });
    }
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        {" "}
        <ColoredSections
          title="Panchakarma"
          backgroundColor="rgba(175, 255, 165, 0.2)"
        >
          <Box sx={{ borderRadius: 1 }}>
            {prescriptionData.panchakarma.map((panchakarma, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                sx={{
                  mb: index !== prescriptionData.panchakarma.length - 1 ? 2 : 0,
                }}
              >
                <Grid item xs={3}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={availablePanchakarmas}
                    value={panchakarma.therapy}
                    onChange={handlePanchakarmaChange(index, 'therapy')}
                    onInputChange={handlePanchakarmaInputChange(index, 'therapy')}
                    renderInput={(params) => (
                      <TextField {...params} label="Therapy" fullWidth />
                    )}
                  />
                </Grid>
                {/* <Grid item xs={2}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={doses}
                    value={medicine.dose}
                    onChange={handlePanchakarmaChange(index, "dose")}
                    onInputChange={handlePanchakarmaInputChange(index, "dose")}
                    renderInput={(params) => (
                      <TextField {...params} label="Dose" fullWidth />
                    )}
                  />
                </Grid> */}
                <Grid item xs={2.5}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={oilOptions}
                    value={panchakarma.oil}
                    onChange={handlePanchakarmaChange(index, 'oil')}
                    onInputChange={handlePanchakarmaInputChange(index, 'oil')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Oil"
                        // placeholder="e.g., Twice a day"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label="Quantity"
                    value={panchakarma.quantity}
                    onChange={(e) =>
                      handlePanchakarmaChange(index, 'quantity')(e, e.target.value)
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label="Time"
                    value={panchakarma.duration}
                    onChange={(e) =>
                      handlePanchakarmaChange(index, 'duration')(e, e.target.value)
                    }
                    fullWidth
                    slotProps={{
                      input: { type: 'number',
                        endAdornment: <InputAdornment position='end'>mins</InputAdornment>
                       },
                    }}
                  />
                </Grid>
                <Grid item xs={1.5}>
                  <TextField
                    size="small"
                    label="Days"
                    type="number"
                    value={panchakarma.days}
                    onChange={(e) =>
                      handlePanchakarmaChange(index, 'days')(e, e.target.value)
                    }
                    fullWidth
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
                    onClick={() => handleAddPanchakarma(index)}
                    color="info"
                    size="small"
                  >
                    <ListPlus size={20} />
                  </IconButton>
                  {prescriptionData.panchakarma.length > 1 && (
                    <IconButton
                      onClick={() => handleRemovePanchakarma(index)}
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
              <IconButton
                disabled={prescriptionData.panchakarma.length === 1}
                onClick={() => setDialogOpen(true)}
                sx={{
                  mr: 1,
                  backgroundColor: "white",
                  color: "#444",
                }}
              >
                <Plus size={20} />
              </IconButton>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Add Group</InputLabel>
                <Select
                  label="Add Group"
                  onChange={handlePanchakarmaGroupSelect}
                  value=""
                >
                  {panchakarmaGroups.map((group) => (
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
      <ShowPanchakarmasDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        panchakarmas={prescriptionData.panchakarma}
        onGroupAdded={fetchPanchakarmaGroups}
      />
    </>
  );
};
export default PanchakarmaSection;
