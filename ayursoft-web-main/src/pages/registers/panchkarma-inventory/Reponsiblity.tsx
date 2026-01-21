import { Box, Tabs, Tab } from "@mui/material";
import HeadingText from "../../../components/ui/HeadingText";
import { useState } from "react";
import CurrentMonth from "../../../components/panchkarma-inventory/currentMonth";
import PreviousMonths from "../../../components/panchkarma-inventory/previousMonths";

function PanchkarmaResponsibility() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ px: 3 }}>
      <HeadingText name="Panchakarma Inventory" />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab
            label="Current Month"
            sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
          />
          <Tab
            label="Previous Months"
            sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {tabValue === 0 && <CurrentMonth />}
      {tabValue === 1 && <PreviousMonths />}
    </Box>
  );
}

export default PanchkarmaResponsibility;
