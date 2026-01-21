import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  IconButton,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { Plus, Trash2, Minus } from "lucide-react";
import ColoredSections from "./colored-section";
import { usePilesPrescription } from "../context/PilesPrescriptionContext";
import ApiManager from "../../services/apimanager";

export const CheckUpSection = () => {
  const { prescriptionData, updatePrescriptionData } = usePilesPrescription();
  const [centers, setCenters] = useState<{ _id: string; name: string }[]>([]);
  const [testsList, setTestsList] = useState<
    { _id: string; name: string; description: string; note: string; marketPrice?: number; discountedPrice?: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const centersData = await ApiManager.getDiagnosticCenters();
        setCenters(centersData.data);
        const testsData = await ApiManager.getTests();
        if (Array.isArray(testsData.data)) {
          setTestsList(
            testsData.data.map(
              (test: {
                _id: string;
                name: string;
                description: string;
                note: string;
                marketPrice?: number;
                discountedPrice?: number;
              }) => ({
                _id: test._id,
                name: test.name,
                description: test.description,
                note: test.note,
                marketPrice: test.marketPrice,
                discountedPrice: test.discountedPrice,
              })
            )
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddCenter = () => {
    const newTest = [
      ...prescriptionData.test,
      {
        center: "",
        test: [{ name: "", description: "", notes: "" }],
      },
    ];
    updatePrescriptionData({ test: newTest });
  };

  const handleRemoveCenter = (centerIndex: number) => {
    const newTest = prescriptionData.test.filter(
      (_, index) => index !== centerIndex
    );
    updatePrescriptionData({ test: newTest });
  };

  const handleAddTest = (centerIndex: number) => {
    const newTest = [...prescriptionData.test];
    newTest[centerIndex].test.push({ name: "", description: "", notes: "" });
    updatePrescriptionData({ test: newTest });
  };

  const handleRemoveTest = (centerIndex: number, testIndex: number) => {
    const newTest = [...prescriptionData.test];
    newTest[centerIndex].test = newTest[centerIndex].test.filter(
      (_, index) => index !== testIndex
    );
    updatePrescriptionData({ test: newTest });
  };

  const handleCenterChange = (centerIndex: number, value: string) => {
    const newTest = [...prescriptionData.test];
    // Store center ID instead of name
    newTest[centerIndex].center = value;
    updatePrescriptionData({ test: newTest });
  };

  const handleTestNameChange = (
    centerIndex: number,
    testIndex: number,
    value: string
  ) => {
    const newTest = [...prescriptionData.test];
    newTest[centerIndex].test[testIndex].name = value;

    const found = testsList.find((t) => t.name === value);
    newTest[centerIndex].test[testIndex].marketPrice = found
      ? found.marketPrice
      : undefined;
    newTest[centerIndex].test[testIndex].discountedPrice = found
      ? found.discountedPrice
      : undefined;
    if (value && !newTest[centerIndex].test[testIndex].description) {
      newTest[centerIndex].test[testIndex].description = "";
    }
    if (value && !newTest[centerIndex].test[testIndex].notes) {
      newTest[centerIndex].test[testIndex].notes = "";
    }
    updatePrescriptionData({ test: newTest });
  };

  const handleTestDescriptionChange = (
    centerIndex: number,
    testIndex: number,
    value: string
  ) => {
    const newTest = [...prescriptionData.test];
    newTest[centerIndex].test[testIndex].description = value;
    updatePrescriptionData({ test: newTest });
  };

  const handleTestNotesChange = (
    centerIndex: number,
    testIndex: number,
    value: string
  ) => {
    const newTest = [...prescriptionData.test];
    newTest[centerIndex].test[testIndex].notes = value;
    updatePrescriptionData({ test: newTest });
  };

  return (
    <ColoredSections
      title="Check Ups "
      backgroundColor="rgba(165, 216, 255, 0.2)"
    >
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          fullWidth
          startIcon={<Plus size={16} />}
          onClick={handleAddCenter}
          sx={{
            mb: 2,
            backgroundColor: "white",
            color: "#444",
            borderRadius: 2,
          }}
        >
          Add Diagnostics Center
        </Button>
        <Grid container spacing={2}>
          {prescriptionData.test.map((center, centerIndex) => (
            <Grid item xs={12} key={centerIndex}>
              <Box
                sx={{
                  px: 1.2,
                  pt: 1,
                  pb: 0.002,
                  backgroundColor: "white",
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <TextField
                    select
                    size="small"
                    label="Center Name"
                    value={center.center}
                    onChange={(e) =>
                      handleCenterChange(centerIndex, e.target.value)
                    }
                    sx={{ flex: 1, minWidth: 200 }}
                  >
                    {centers.map(({ _id, name }) => (
                      <MenuItem key={_id} value={_id}>
                        {name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveCenter(centerIndex)}
                    sx={{
                      color: "error",
                      border: "1px solid rgba(255, 54, 54, 0.2)",
                      borderRadius: 1.5,
                    }}
                  >
                    <Trash2 size={20} style={{ marginRight: 8 }} /> Remove
                    Center
                  </Button>
                </Box>
                {/* Tests List */}
                {center.test.map((test, testIndex) => (
                  <Grid
                    container
                    spacing={2}
                    key={testIndex}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Grid item xs={5.5}>
                      <Autocomplete
                        size="small"
                        freeSolo
                        options={testsList}
                        value={test.name}
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : option.name + " " + option.description
                        }
                        onChange={(_, newValue) => {
                          if (typeof newValue === "object" && newValue) {
                            // Case 1: User selected an item from dropdown
                            handleTestNameChange(
                              centerIndex,
                              testIndex,
                              newValue.name
                            );
                            handleTestDescriptionChange(
                              centerIndex,
                              testIndex,
                              newValue.description
                            );
                            handleTestNotesChange(
                              centerIndex,
                              testIndex,
                              newValue.note
                            );
                          } else if (typeof newValue === "string") {
                            // Case 2: User typed a value
                            handleTestNameChange(
                              centerIndex,
                              testIndex,
                              newValue
                            );
                            // Initialize description and notes as empty strings to make sure they're part of the API payload
                            handleTestDescriptionChange(
                              centerIndex,
                              testIndex,
                              ""
                            );
                            handleTestNotesChange(centerIndex, testIndex, "");
                          }
                        }}
                        // Also handle direct typing in the input field
                        onInputChange={(_, newInputValue) => {
                          if (newInputValue) {
                            handleTestNameChange(
                              centerIndex,
                              testIndex,
                              newInputValue
                            );
                            // Initialize description and notes as empty strings to make sure they're part of the API payload
                            handleTestDescriptionChange(
                              centerIndex,
                              testIndex,
                              ""
                            );
                            handleTestNotesChange(centerIndex, testIndex, "");
                          }
                        }}
                        isOptionEqualToValue={(option, value) =>
                          typeof value === "string"
                            ? option.name === value
                            : option.name === value.name
                        }
                        renderInput={(params) => {
                          // Find the selected test in testsList
                          const selectedTest = testsList.find(
                            (t) => t.name === test.name
                          );
                          return (
                            <Box>
                              <TextField
                                {...params}
                                label="Test Name"
                                size="small"
                                helperText={
                                  test.description
                                    ? "Description ► " + test.description
                                    : ""
                                }
                              />
                              {selectedTest && (
                                <Box sx={{ display: "flex", gap: 2, mt: 0.2 }}>
                                  <Box sx={{ fontSize: 11, color: "#888" }}>
                                    <b>Market Price:</b>{" "}
                                    {selectedTest.marketPrice !== undefined
                                      ? selectedTest.marketPrice
                                      : "-"}
                                  </Box>
                                  <Box sx={{ fontSize: 11, color: "#888" }}>
                                    <b>Discounted:</b>{" "}
                                    {selectedTest.discountedPrice !== undefined
                                      ? selectedTest.discountedPrice
                                      : "-"}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          );
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option._id}>
                            <div>
                              <div>{option.name}</div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#666",
                                  marginTop: 2,
                                }}
                              >
                                {option.description}
                              </div>
                            </div>
                          </li>
                        )}
                      />
                    </Grid>
                    <Grid item xs={5.2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Notes"
                        value={test.notes}
                        onChange={(e) =>
                          handleTestNotesChange(
                            centerIndex,
                            testIndex,
                            e.target.value
                          )
                        }
                        helperText={test.description ? " " : ""}
                      />
                    </Grid>
                    <Grid item xs={1.3} sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAddTest(centerIndex)}
                      >
                        <Plus size={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveTest(centerIndex, testIndex)}
                      >
                        <Minus size={20} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ColoredSections>
  );
};

export default CheckUpSection;
