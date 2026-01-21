import { Box, Grid2 as Grid, Autocomplete, TextField } from "@mui/material";
import ColoredSections from "./colored-section";
import { Control, Controller } from "react-hook-form";
import { CarePlanType } from "../../../utils/validationSchemas";

const formFields = {
  benefit: "Benefit",
  risk: "Risk",
  alternative: "Alternative",
  outcome: "Outcome",
  pathya: "Pathya",
  apathya: "Apathya",
  preventiveCare: "Preventive Care",
  curetetiveCare: "Curative Care",
  rehabilitativeCare: "Rehabilitative Care",
};

interface CarePlanGroup {
  _id: string;
  name: string;
  type: string;
}

interface CarePlanProps {
  control: Control<CarePlanType>;
  groups: CarePlanGroup[]; // <-- Pass groups from parent
}

// Build dropdown options from groups
const buildDropdownOptions = (groups: CarePlanGroup[]) => {
  const options: Record<string, string[]> = {};
  const typeMapping = {
    preventive: "preventiveCare",
    curative: "curetetiveCare",
    rehabilitative: "rehabilitativeCare",
  };
  groups.forEach((group) => {
    const mappedType =
      typeMapping[group.type as keyof typeof typeMapping] || group.type;
    if (!options[mappedType]) options[mappedType] = [];
    options[mappedType].push(group.name);
  });
  return options;
};

const CarePlan = ({ control, groups }: CarePlanProps) => {
  const dropdownOptions = buildDropdownOptions(groups);

  return (
    <ColoredSections
      title="Care Plan"
      backgroundColor="rgba(192, 168, 214, 0.2)"
    >
      <Box
        sx={{
          gap: 1,
          color: "#333",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={1}>
          {Object.entries(formFields).map(([key, label]) => (
            <Grid size={{ md: 6 }} key={key}>
              <Controller
                name={key as keyof CarePlanType}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    freeSolo
                    options={dropdownOptions[key] || []}
                    value={value || ""}
                    onChange={(_, newValue) => {
                      onChange(newValue || "");
                    }}
                    onInputChange={(_, newInputValue) => {
                      onChange(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        label={label}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </ColoredSections>
  );
};

export default CarePlan;
