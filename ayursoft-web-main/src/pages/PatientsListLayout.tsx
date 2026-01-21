import { useState } from "react";
import SearchPatients from "../components/PatientsList";
import PatientInfoCard from "../components/PatientInfoCard";
import { Patient } from "../types/patient";
import { Box, Typography } from "@mui/material";

function SearchLayout() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className={"flex flex-column h-screen overflow-hidden"}>
      <div className={"flex grow"}>
        <div className="non-selectable" style={{ width: "65%" }}>
          <SearchPatients onPatientSelect={setSelectedPatient} />
        </div>
        <div className="non-selectable" style={{ width: "35%" }}>
          {selectedPatient ? (
            <PatientInfoCard patient={selectedPatient} />
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                borderRadius: 4,
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="h5" color="#555">
                No Patient Selected
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchLayout;
