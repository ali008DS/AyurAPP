import { CardContent, Typography, Box } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { Patient } from "../types/patient";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import * as React from "react";
import {
  Text,
  ReceiptIndianRupee,
  BriefcaseMedical,
  CircleUser,
  Bed,
} from "lucide-react";
import PatientsInfoTab from "./patientslist/PatientsInfoTab";
import ReceiptsTab from "./patientslist/ReceiptsTab";
import OpdTab from "./patientslist/OpdTab";
import BedsTab from "./patientslist/BedsTab";
// import IpdTab from "./patientslist/IpdTab";
// import VitalsTab from "./patientslist/VitalsTab";

interface PatientInfoCardProps {
  patient: Patient | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

function TabPanel(props: TabPanelProps) {
  console.log("TabPanel", props);
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `horizontal-tabpanel-${index}`,
  };
}

function PatientInfoCard({ patient }: PatientInfoCardProps) {
  const [value, setValue] = React.useState(1);
  const [key, setKey] = React.useState(0);
  const theme = useTheme();

  React.useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [patient]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!patient) return null;

  const patientWithStringId = { ...patient, id: String(patient.id) };

  return (
    <Box
      sx={{
        width: "100%",
        height: "96%",
        borderRadius: "1.5rem",
        marginY: 0.75,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
      }}
    >
      <CardContent
        className="non-selectable"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxwidth: "20%",
          p: "8px !important", // Override default padding
          "&:last-child": {
            pb: "8px",
          },
        }}
      >
        {/* Upper bar */}
        <Box
          sx={{
            height: "50px",
            display: "flex",
            // alignItems: "top", // Fix alignment
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "top",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: "background.paper",
                display: "flex",
                height: "fit-content",
                overflow: "hidden",
                flexDirection: "column",
                alignItems: "space-between",
                paddingRight: "0",
                alignSelf: "bottom",
              }}
            >
              <Tabs
                TabIndicatorProps={{
                  style: { display: "none" },
                }}
                orientation="horizontal"
                value={value}
                onChange={handleChange}
                sx={{
                  borderColor: "divider",
                  marginRight: "0.4rem",
                  minWidth: "40px",
                  "& .MuiTab-root": {
                    minWidth: 40,
                    minHeight: 40,
                    marginRight: 0.5,
                    padding: 0.2,
                    borderRadius: "15px", // Make tabs rounded
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1), // Add theme color on hover
                    },
                    "&.Mui-selected": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      border: "1px solid",
                      borderColor: "primary.main",
                    },
                  },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <Box
                    sx={{
                      // bgcolor: "#ECECEC",
                      borderRadius: "4px",
                      width: 35,
                      mr: 1,
                      height: 35, // Slightly reduce size
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircleUser color="#555" size={30} />
                  </Box>
                  <Box
                    sx={{
                      marginRight: "1rem",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textTransform: "capitalize",
                        color: "#444",
                        fontWeight: 600,
                        lineHeight: 1.1,
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "0.9rem",
                        mt: 0.5,
                      }}
                    >
                      {patient.firstName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.75rem",
                        lineHeight: 1,
                      }}
                    >
                      {patient.phone} • {calculateAge(patient.dob)}Y
                    </Typography>
                  </Box>
                </Box>
                <Tooltip
                  title="Patient Info"
                  placement="bottom"
                  slots={{ transition: Zoom }}
                  arrow
                >
                  <Tab icon={<Text size={20} />} {...a11yProps(0)} />
                </Tooltip>
                <Tooltip
                  title="Receipts"
                  placement="bottom"
                  slots={{ transition: Zoom }}
                  arrow
                >
                  <Tab
                    icon={<ReceiptIndianRupee size={20} />}
                    {...a11yProps(1)}
                  />
                </Tooltip>
                <Tooltip
                  title="OPD"
                  placement="bottom"
                  slots={{ transition: Zoom }}
                  arrow
                >
                  <Tab
                    icon={<BriefcaseMedical size={20} />}
                    {...a11yProps(2)}
                  />
                </Tooltip>
                <Tooltip
                  title="Beds"
                  placement="bottom"
                  slots={{ transition: Zoom }}
                  arrow
                >
                  <Tab icon={<Bed size={20} />} {...a11yProps(3)} />
                </Tooltip>
                {/* <Tooltip
                  title="IPD"
                  placement="bottom"
                  slots={{ transition: Zoom }}
                  arrow
                >
                  <Tab icon={<Bed size={20} />} {...a11yProps(3)} />
                </Tooltip>
                <Tooltip
                  title="Vitals"
                  placement="bottom"
                  slots={{ transition: Zoom }}
                  arrow
                >
                  <Tab icon={<Activity size={20} />} {...a11yProps(4)} />
                </Tooltip> */}
              </Tabs>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            paddingRight: "0.5rem",
            overflow: "hidden",
            borderRadius: "15px",
            border: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <TabPanel value={value} index={1}>
            <PatientsInfoTab
              key={key}
              PatientInfo={{ ...patient, notes: patient.notes ?? [] }}
            />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <ReceiptsTab patientId={patient.id.toString()} />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <OpdTab PatientInfo={patientWithStringId} />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <BedsTab patientId={patient.id.toString()} />
          </TabPanel>
          {/* <TabPanel value={value} index={4}>
            <IpdTab />
          </TabPanel>
          <TabPanel value={value} index={5}>
            <VitalsTab />
          </TabPanel> */}
        </Box>
      </CardContent>
    </Box>
  );
}

export default PatientInfoCard;
