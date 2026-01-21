import React, { useEffect, useRef } from "react";
import {
  Grid,
  Box,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Autocomplete,
  InputAdornment,
  Button,
} from "@mui/material";
import { ListPlus, ListMinus, Plus } from "lucide-react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import ColoredSections from "./colored-section";
import ApiManager from "../../services/apimanager";
import { ShowPanchakarmasDialog } from "./ShowPanchakarmasDialog";
import { Panchakarma, usePrescription } from "../context/PrescriptionContext";

interface PanchakarmaGroup {
  _id: string;
  name: string;
  panchakarmas: Panchakarma[];
}

interface FormValues {
  panchakarma: Panchakarma[];
}

export const PanchakarmaSection = () => {
  const { prescriptionData, updatePrescriptionData } = usePrescription();
  const [panchakarmaGroups, setPanchakarmaGroups] = React.useState<
    PanchakarmaGroup[]
  >([]);
  const [availablePanchakarmas, setAvailablePanchakarmas] = React.useState<
    string[]
  >([]);
  const [oilOptions, setOils] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [updateCounter, setUpdateCounter] = React.useState(0);

  // Ref to track when updates are coming from this form (to prevent reset on internal updates)
  const isInternalUpdate = useRef(false);

  const { control, watch, reset } = useForm<FormValues>({
    defaultValues: {
      panchakarma: prescriptionData.panchakarma,
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "panchakarma",
  });

  // Sync form with prescriptionData when draft is loaded (but not for internal updates)
  useEffect(() => {
    // Skip if this update originated from the form itself
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (
      prescriptionData.panchakarma &&
      prescriptionData.panchakarma.length > 0
    ) {
      reset({ panchakarma: prescriptionData.panchakarma });
    }
  }, [prescriptionData.panchakarma, reset]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [panchakarmaGroupsRes, therapiesRes, oilsRes] = await Promise.all(
          [
            ApiManager.getPanchakarmaGroups(),
            ApiManager.getTherapies(),
            ApiManager.getOils(),
          ]
        );

        setPanchakarmaGroups(panchakarmaGroupsRes.data);
        setAvailablePanchakarmas(
          therapiesRes.data.map((item: { name: string }) => item.name)
        );
        setOils(oilsRes.data.map((option: { name: string }) => option.name));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddPanchakarma = (afterIndex: number) => {
    insert(afterIndex + 1, {
      therapy: "",
      oil: "",
      quantity: "",
      duration: "",
      days: "",
    });
  };

  const handlePanchakarmaGroupSelect = (event: SelectChangeEvent) => {
    const selectedGroupId = event.target.value;
    const selectedGroup = panchakarmaGroups.find(
      (group) => group._id === selectedGroupId
    );
    if (selectedGroup) {
      selectedGroup.panchakarmas.forEach((panchakarma) => {
        append(panchakarma);
      });
      // Store the selected group ID in context for draft restore
      updatePrescriptionData({ selectedPanchakarmaGroupId: selectedGroupId });
      setUpdateCounter((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (updateCounter > 0) {
      // Mark this as an internal update so the sync useEffect doesn't reset the form
      isInternalUpdate.current = true;
      updatePrescriptionData({
        panchakarma: watch("panchakarma").filter(
          (item: Panchakarma) =>
            item.therapy ||
            item.oil ||
            item.quantity ||
            item.duration ||
            item.days
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateCounter]);

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <ColoredSections
          title="Panchakarma"
          backgroundColor="rgba(165, 249, 255, 0.2)"
        >
          {fields.length === 0 && (
            <Button
              variant="text"
              fullWidth
              startIcon={<Plus size={16} />}
              onClick={() => handleAddPanchakarma(-1)}
              sx={{
                mb: 2,
                backgroundColor: "white",
                color: "#444",
                borderRadius: 2,
              }}
            >
              Add Panchakarma
            </Button>
          )}
          <Box sx={{ borderRadius: 1 }}>
            {fields.map((field, index) => (
              <Grid
                container
                spacing={2}
                key={field.id}
                sx={{
                  mb: index !== fields.length - 1 ? 2 : 0,
                }}
              >
                <Grid item xs={3}>
                  <Controller
                    name={`panchakarma.${index}.therapy`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={availablePanchakarmas}
                        value={value}
                        onChange={(_, newValue) => {
                          onChange(newValue || "");
                          setUpdateCounter((prev) => prev + 1);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Therapy" fullWidth />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2.5}>
                  <Controller
                    name={`panchakarma.${index}.oil`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={oilOptions}
                        value={value}
                        onChange={(_, newValue) => {
                          onChange(newValue);
                          setUpdateCounter((prev) => prev + 1);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Oil" fullWidth />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Controller
                    name={`panchakarma.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Quantity"
                        fullWidth
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        onBlur={() => {
                          setUpdateCounter((prev) => prev + 1);
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Controller
                    name={`panchakarma.${index}.duration`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Time"
                        fullWidth
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">mins</InputAdornment>
                          ),
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        onBlur={() => {
                          setUpdateCounter((prev) => prev + 1);
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={1.5}>
                  <Controller
                    name={`panchakarma.${index}.days`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Days"
                        type="number"
                        fullWidth
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        onBlur={() => {
                          setUpdateCounter((prev) => prev + 1);
                        }}
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
                    onClick={() => handleAddPanchakarma(index)}
                    color="info"
                    size="small"
                  >
                    <ListPlus size={20} />
                  </IconButton>
                  {fields.length > 0 && (
                    <IconButton
                      onClick={() => {
                        remove(index);
                        setUpdateCounter((prev) => prev + 1);
                      }}
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
                disabled={fields.length === 1}
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
                  value={prescriptionData.selectedPanchakarmaGroupId || ""}
                  native
                >
                  <option value="" />
                  {panchakarmaGroups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
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
        panchakarmas={watch("panchakarma")}
        onGroupAdded={async () => {
          try {
            const response = await ApiManager.getPanchakarmaGroups();
            setPanchakarmaGroups(response.data);
          } catch (error) {
            console.error("Failed to fetch Rx groups:", error);
          }
        }}
      />
    </>
  );
};

export default PanchakarmaSection;
