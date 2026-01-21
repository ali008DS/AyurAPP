import { Grid, Box, TextField } from "@mui/material";
import ColoredSections from "./colored-section";
import { usePrescription } from "../context/PrescriptionContext";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import ApiManager from "../../services/apimanager";
import { DatePicker } from "@mui/x-date-pickers";

export const AdditionalDetailsSection = () => {
  const { prescriptionData, updatePrescriptionData } = usePrescription();
  const [internalNotesOptions, setInternalNotesOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchInternalNotes = async () => {
      try {
        const response = await ApiManager.getCarePlanGroups("internalNote");
        const notes = Array.isArray(response.data)
          ? response.data.map((note: any) => note.name)
          : [];
        setInternalNotesOptions(notes);
      } catch (error) {
        setInternalNotesOptions([]);
      }
    };
    fetchInternalNotes();
  }, []);

  const handleChange =
    (field: keyof typeof prescriptionData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updatePrescriptionData({
        [field]: event.target.value,
      });
    };

  return (
    <>
      <ColoredSections
        title="Additional Details"
        backgroundColor="rgba(224, 223, 255, 0.2)"
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            color: "#333",

            borderRadius: 2,
          }}
        >
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <TextField
                  value={prescriptionData.dietAndExercise}
                  onChange={handleChange("dietAndExercise")}
                  fullWidth
                  size="small"
                  label="Diet And Exercise"
                  placeholder="e.g., keto diet"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  value={prescriptionData.advice}
                  onChange={handleChange("advice")}
                  fullWidth
                  size="small"
                  label="Advice"
                  placeholder="e.g., drink lots of water"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Next Visit (Days)"
                  type="number"
                  defaultValue="10"
                  onChange={(event) => {
                    const days = parseInt(event.target.value) || 0;
                    const nextVisitDate = dayjs().add(days, "day");
                    updatePrescriptionData({
                      nextVisit: nextVisitDate.toISOString(),
                    });
                  }}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0 }}
                  placeholder="e.g., 10"
                />
              </Grid>
              <Grid item xs={2}>
                <DatePicker
                  label="Next Visit Date"
                  format="DD/MM/YYYY"
                  value={
                    prescriptionData.nextVisit
                      ? dayjs(prescriptionData.nextVisit)
                      : null
                  }
                  slotProps={{
                    textField:{
                      size: "small",
                    }
                  }}
                  onChange={(event) => updatePrescriptionData({nextVisit: event?.toISOString()})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  value={prescriptionData.menstrualHistory}
                  onChange={handleChange("menstrualHistory")}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Menstrual History"
                  placeholder="e.g., regular cycles"
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={internalNotesOptions}
                  value={prescriptionData.internalNote || ""}
                  onChange={(_, newValue) => {
                    updatePrescriptionData({ internalNote: newValue || "" });
                  }}
                  onInputChange={(_, newInputValue) => {
                    updatePrescriptionData({ internalNote: newInputValue });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      rows={2}
                      label="Internal Notes"
                      placeholder="Select or type internal note"
                    />
                  )}
                  freeSolo
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </ColoredSections>
    </>
  );
};

export default AdditionalDetailsSection;
