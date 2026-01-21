import { useState } from "react";
import { useSidebar } from "../context/sidebar-context";
import SampleSplitter from "../components/SampleSplitter";
import { useResizable } from "react-resizable-layout";
import { cn } from "../utils/cn";
import SearchPage from "../components/SearchPage";
import PatientInfoCard from "../components/PatientInfoCard";
import { Patient } from "../types/patient";
import { Typography, Box } from "@mui/material";

function SearchLayout() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { isCollapsed } = useSidebar();
  const sidebarWidth = isCollapsed ? 0 : 300;

  const {
    isDragging: isFileDragging,
    position: fileW,
    splitterProps: fileDragBarProps,
  } = useResizable({
    axis: "x",
    initial: Math.min(500, window.innerWidth - 450), // Smaller initial width to show right panel
    min: 300,  // Minimum 300px for list area
    max: window.innerWidth - 400, // Ensure at least 400px for details panel
  });

  return (
    <div className={"flex flex-column h-screen overflow-hidden"}>
      <div className={"flex grow"} style={{ flexDirection: "row" }}>
        <div
          className={cn(
            "shrink-0 non-selectable",
            isFileDragging && "dragging"
          )}
          style={{ width: Math.max(0, fileW - sidebarWidth) }}
        >
          <SearchPage onPatientSelect={setSelectedPatient} />
        </div>
        <SampleSplitter isDragging={isFileDragging} {...fileDragBarProps} />
        {!selectedPatient ? (
          <Typography className={"grow center-it non-selectable"}>
            No Patient Selected
          </Typography>
        ) : (
          <Box className="grow flex" sx={{ p: 1 }}>
            <PatientInfoCard patient={selectedPatient} />
          </Box>
        )}
      </div>
    </div>
  );
}

export default SearchLayout;
