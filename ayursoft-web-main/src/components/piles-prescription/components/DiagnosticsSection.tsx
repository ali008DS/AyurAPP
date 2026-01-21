import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  InputAdornment,
} from "@mui/material";
import ColoredSections from "../../ui/colored-section";
import { usePilesPrescription } from "../context/PilesPrescriptionContext";
import ApiManager from "../../services/apimanager";

export const DiagnosticsSection = () => {
  const { prescriptionData, updatePrescriptionData } = usePilesPrescription();
  const [complaints, setComplaints] = useState<string[]>([]);
  const [generalExams, setGeneralExams] = useState<string[]>([]);
  const [diagnosis, setDiagnoses] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const complaintsData = await ApiManager.getComplaints();
        setComplaints(complaintsData.data.map((item: any) => item.name) || []);

        const generalExamData = await ApiManager.getGeneralExamination();
        setGeneralExams(
          generalExamData.data.map((item: any) => item.name) || []
        );

        const diagnosisData = await ApiManager.getComplaints();
        setDiagnoses(diagnosisData.data.map((item: any) => item.name) || []);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleDiagnosticDetailsChange = (
    field: keyof typeof prescriptionData.diagnosticDetails,
    value: any
  ) => {
    console.log(
      `Updating diagnosticDetails.${field} with value:`, value
    ,prescriptionData.diagnosticDetails);
    updatePrescriptionData({
      diagnosticDetails: {
        ...prescriptionData.diagnosticDetails,
        [field]: value,
      },
    });
  };

  // Updated to handle all fields as multi-selection
  const handleCheckboxChange =
    (field: keyof typeof prescriptionData.diagnosticDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      // For all fields, maintain array format for API consistency
      const currentValues = Array.isArray(prescriptionData.diagnosticDetails[field])
        ? [...prescriptionData.diagnosticDetails[field] as string[]]
        : prescriptionData.diagnosticDetails[field]
          ? [prescriptionData.diagnosticDetails[field] as string]
          : [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value) // Remove if selected
        : [...currentValues, value]; // Add if not selected

      handleDiagnosticDetailsChange(field, updatedValues);
    };

  const handleTextChange =
    (field: keyof typeof prescriptionData.diagnosticDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleDiagnosticDetailsChange(field, event.target.value);
    };

  const handleBowlClick = (value:string, type:"bowl"|"digestive") => {
    const currentHabits = prescriptionData.diagnosticDetails[type === "bowl" ? "bowelHabits" : "digestiveDisorders"] || [];
    const updatedHabits = currentHabits.includes(value)
      ? currentHabits.filter((habit) => habit !== value)
      : [...currentHabits, value];

    handleDiagnosticDetailsChange(type === "bowl" ? "bowelHabits" : "digestiveDisorders", updatedHabits);
  }

  // Helper function to check if a value is selected - updated for arrays
  const isValueSelected = (field: keyof typeof prescriptionData.diagnosticDetails, value: string) => {
    const values = prescriptionData.diagnosticDetails[field];

    // Always check as array since we're converting all to multi-select
    if (Array.isArray(values)) {
      return values.includes(value);
    } else if (typeof values === 'string') {
      return values === value;
    }
    return false;
  };

  return (
    <>
      <ColoredSections
        title="Diagnostics Details"
        backgroundColor="rgba(255, 255, 0, 0.2)"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            color: "#333",
            borderRadius: 2,
          }}
        >
          {/* First row - standard diagnostic fields */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Autocomplete
                freeSolo
                options={complaints}
                value={prescriptionData.complaint || ""}
                onChange={(_, newValue) => {
                  updatePrescriptionData({
                    complaint: newValue || "",
                  });
                }}
                onInputChange={(_, newInputValue) => {
                  updatePrescriptionData({
                    complaint: newInputValue || "",
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Complaints"
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ bgcolor: "rgba(255, 255, 0, 0.1)" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                freeSolo
                options={generalExams}
                value={prescriptionData.generalExamination || ""}
                onChange={(_, newValue) => {
                  updatePrescriptionData({
                    generalExamination: newValue || "",
                  });
                }}
                onInputChange={(_, newInputValue) => {
                  updatePrescriptionData({
                    generalExamination: newInputValue || "",
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="General Examination"
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ bgcolor: "rgba(255, 255, 0, 0.1)" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                freeSolo
                options={diagnosis}
                value={prescriptionData.diagnosis || ""}
                onChange={(_, newValue) => {
                  updatePrescriptionData({
                    diagnosis: newValue || "",
                  });
                }}
                onInputChange={(_, newInputValue) => {
                  updatePrescriptionData({
                    diagnosis: newInputValue || "",
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Diagnosis"
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ bgcolor: "rgba(255, 255, 0, 0.1)" }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Pain related fields */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Pain intensity</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="0"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painIntensity", "0")}
                        onChange={handleCheckboxChange("painIntensity")}
                      />
                    }
                    label="0"
                  />
                  <FormControlLabel
                    value="1"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painIntensity", "1")}
                        onChange={handleCheckboxChange("painIntensity")}
                      />
                    }
                    label="1"
                  />
                  <FormControlLabel
                    value="2"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painIntensity", "2")}
                        onChange={handleCheckboxChange("painIntensity")}
                      />
                    }
                    label="2"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Pain type?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Tenderness"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painType", "Tenderness")}
                        onChange={handleCheckboxChange("painType")}
                      />
                    }
                    label="Tenderness"
                  />
                  <FormControlLabel
                    value="All day"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painType", "All day")}
                        onChange={handleCheckboxChange("painType")}
                      />
                    }
                    label="All day"
                  />
                  <FormControlLabel
                    value="cant sit"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painType", "cant sit")}
                        onChange={handleCheckboxChange("painType")}
                      />
                    }
                    label="cant sit"
                  />
                  <FormControlLabel
                    value="pricking cutting"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painType", "pricking cutting")}
                        onChange={handleCheckboxChange("painType")}
                      />
                    }
                    label="pricking cutting"
                  />
                  <FormControlLabel
                    value="throbbing"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painType", "throbbing")}
                        onChange={handleCheckboxChange("painType")}
                      />
                    }
                    label="throbbing"
                  />
                  <FormControlLabel
                    value="pulsating"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("painType", "pulsating")}
                        onChange={handleCheckboxChange("painType")}
                      />
                    }
                    label="pulsating"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Bleeding intensity?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="0"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingIntensity", "0")}
                        onChange={handleCheckboxChange("bleedingIntensity")}
                      />
                    }
                    label="0"
                  />
                  <FormControlLabel
                    value="1"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingIntensity", "1")}
                        onChange={handleCheckboxChange("bleedingIntensity")}
                      />
                    }
                    label="1"
                  />
                  <FormControlLabel
                    value="2"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingIntensity", "2")}
                        onChange={handleCheckboxChange("bleedingIntensity")}
                      />
                    }
                    label="2"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* Bleeding type and other symptoms */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Bleeding type?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Profuse"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingType", "Profuse")}
                        onChange={handleCheckboxChange("bleedingType")}
                      />
                    }
                    label="Profuse"
                  />
                  <FormControlLabel
                    value="Jet"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingType", "Jet")}
                        onChange={handleCheckboxChange("bleedingType")}
                      />
                    }
                    label="Jet"
                  />
                  <FormControlLabel
                    value="Drops"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingType", "Drops")}
                        onChange={handleCheckboxChange("bleedingType")}
                      />
                    }
                    label="Drops"
                  />
                  <FormControlLabel
                    value="Strain"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("bleedingType", "Strain")}
                        onChange={handleCheckboxChange("bleedingType")}
                      />
                    }
                    label="Strain"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Burning?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="0"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("burning", "0")}
                        onChange={handleCheckboxChange("burning")}
                      />
                    }
                    label="0"
                  />
                  <FormControlLabel
                    value="1"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("burning", "1")}
                        onChange={handleCheckboxChange("burning")}
                      />
                    }
                    label="1"
                  />
                  <FormControlLabel
                    value="2"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("burning", "2")}
                        onChange={handleCheckboxChange("burning")}
                      />
                    }
                    label="2"
                  />
                </FormGroup>
              </FormControl>
            </Grid>

            {/* Itching condition */}
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Itching?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="0"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("itching", "0")}
                        onChange={handleCheckboxChange("itching")}
                      />
                    }
                    label="0"
                  />
                  <FormControlLabel
                    value="1"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("itching", "1")}
                        onChange={handleCheckboxChange("itching")}
                      />
                    }
                    label="1"
                  />
                  <FormControlLabel
                    value="2"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("itching", "2")}
                        onChange={handleCheckboxChange("itching")}
                      />
                    }
                    label="2"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* Pain duration and other metrics */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Pain duration"
                value={prescriptionData.diagnosticDetails.painDuration}
                onChange={handleTextChange("painDuration")}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      minutes/hours
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Anal verge Bulging/Swelling?
                </FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="0"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("analBulgingSwelling", "0")}
                        onChange={handleCheckboxChange("analBulgingSwelling")}
                      />
                    }
                    label="0"
                  />
                  <FormControlLabel
                    value="1"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("analBulgingSwelling", "1")}
                        onChange={handleCheckboxChange("analBulgingSwelling")}
                      />
                    }
                    label="1"
                  />
                  <FormControlLabel
                    value="2"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("analBulgingSwelling", "2")}
                        onChange={handleCheckboxChange("analBulgingSwelling")}
                      />
                    }
                    label="2"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Discharge?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="0"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("discharge", "0")}
                        onChange={handleCheckboxChange("discharge")}
                      />
                    }
                    label="0"
                  />
                  <FormControlLabel
                    value="1"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("discharge", "1")}
                        onChange={handleCheckboxChange("discharge")}
                      />
                    }
                    label="1"
                  />
                  <FormControlLabel
                    value="2"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("discharge", "2")}
                        onChange={handleCheckboxChange("discharge")}
                      />
                    }
                    label="2"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* Discharge type and bowel habits */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Discharge type?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Pus"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("dischargeType", "Pus")}
                        onChange={handleCheckboxChange("dischargeType")}
                      />
                    }
                    label="Pus"
                  />
                  <FormControlLabel
                    value="Mucus"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("dischargeType", "Mucus")}
                        onChange={handleCheckboxChange("dischargeType")}
                      />
                    }
                    label="Mucus"
                  />
                  <FormControlLabel
                    value="Blood"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("dischargeType", "Blood")}
                        onChange={handleCheckboxChange("dischargeType")}
                      />
                    }
                    label="Blood"
                  />
                  <FormControlLabel
                    value="Oozing"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("dischargeType", "Oozing")}
                        onChange={handleCheckboxChange("dischargeType")}
                      />
                    }
                    label="Oozing"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Bowel Habits</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.bowelHabits?.includes("constipation") || false}
                        onClick={()=>handleBowlClick("constipation","bowl")}
                        size="small"
                      />
                    }
                    label="Constipation"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.bowelHabits?.includes("hardStool") || false}
                        onClick={()=>handleBowlClick("hardStool","bowl")}
                        size="small"
                      />
                    }
                    label="Hard Stool"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Sitting Time"
                value={prescriptionData.diagnosticDetails.sittingTime}
                onChange={handleTextChange("sittingTime")}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      minutes/hours
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Mucus and Diarrhea */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Mucus in Stool?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Yes"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("mucusInStool", "Yes")}
                        onChange={handleCheckboxChange("mucusInStool")}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value="No"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("mucusInStool", "No")}
                        onChange={handleCheckboxChange("mucusInStool")}
                      />
                    }
                    label="No"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Diarrhea?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Yes"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("diarrhea", "Yes")}
                        onChange={handleCheckboxChange("diarrhea")}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value="No"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("diarrhea", "No")}
                        onChange={handleCheckboxChange("diarrhea")}
                      />
                    }
                    label="No"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Fecal Urge after Meal?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Yes"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("fecalUrgeAfterMeal", "Yes")}
                        onChange={handleCheckboxChange("fecalUrgeAfterMeal")}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value="No"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("fecalUrgeAfterMeal", "No")}
                        onChange={handleCheckboxChange("fecalUrgeAfterMeal")}
                      />
                    }
                    label="No"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* Fecal Urge and Flatulence */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Fecal Urge without Meal?
                </FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Yes"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("fecalUrgeWithoutMeal", "Yes")}
                        onChange={handleCheckboxChange("fecalUrgeWithoutMeal")}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value="No"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("fecalUrgeWithoutMeal", "No")}
                        onChange={handleCheckboxChange("fecalUrgeWithoutMeal")}
                      />
                    }
                    label="No"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Fecal/Flatulence Incontinence?
                </FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    value="Yes"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("fecalFlatulenceIncontinence", "Yes")}
                        onChange={handleCheckboxChange("fecalFlatulenceIncontinence")}
                      />
                    }
                    label="Yes"
                  />
                  <FormControlLabel
                    value="No"
                    control={
                      <Checkbox
                        size="small"
                        checked={isValueSelected("fecalFlatulenceIncontinence", "No")}
                        onChange={handleCheckboxChange("fecalFlatulenceIncontinence")}
                      />
                    }
                    label="No"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Digestive Disorders?</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.digestiveDisorders?.includes("indigestion") || false}
                        onClick={()=>handleBowlClick("indigestion","digestive")}
                        size="small"
                      />
                    }
                    label="Indigestion"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.digestiveDisorders?.includes("anorexia") || false}
                        onClick={()=>handleBowlClick("anorexia","digestive")}
                        size="small"
                      />
                    }
                    label="Anorexia"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.digestiveDisorders?.includes("bloating") || false}
                        onClick={()=>handleBowlClick("bloating","digestive")}
                        size="small"
                      />
                    }
                    label="Bloating"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.digestiveDisorders?.includes("gas") || false}
                        onClick={()=>handleBowlClick("gas","digestive")}
                        size="small"
                      />
                    }
                    label="Gas"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionData?.diagnosticDetails.digestiveDisorders?.includes("acidity") || false}
                        onClick={()=>handleBowlClick("acidity","digestive")}
                        size="small"
                      />
                    }
                    label="Acidity"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* Other symptoms and previous history */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Other symptoms?"
                value={prescriptionData.diagnosticDetails.otherSymptoms}
                onChange={handleTextChange("otherSymptoms")}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Previous history?"
                value={prescriptionData.diagnosticDetails.previousHistory}
                onChange={handleTextChange("previousHistory")}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </ColoredSections>
    </>
  );
};

export default DiagnosticsSection;
