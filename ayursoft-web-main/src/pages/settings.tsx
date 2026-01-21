import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import {
  TestTube,
  Layers2,
  Stethoscope,
  BookHeart,
  Leaf,
  NotepadText,
  Landmark,
  Building2,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import HeadingText from "../components/ui/HeadingText";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  md?: number;
}

const cardDetails: SettingsCardProps[] = [
  {
    title: "Website Settings",
    description:
      "Configure and manage website settings, such as Icons, Logos, Header Footer, and more, enabling a personalization for your clinic.",
    icon: <Globe size={24} />,
    url: "/settings/website-settings",
    md: 6,
  },
  {
    title: "Tests Management",
    description:
      "Configure and manage diagnostic tests, procedures, and lab work",
    icon: <TestTube size={24} />,
    url: "/settings/tests-management",
    md: 3,
  },
  {
    title: "When & How Management",
    description: "Manage When & How options for faster patient care.",
    icon: <Layers2 size={24} />,
    url: "/settings/rx-group",
    md: 3,
  },
  {
    title: "Panchakarma Management",
    description:
      "Manage Panchakarma therapies, oils, and treatment plans effectively",
    icon: <BookHeart size={24} />,
    url: "/settings/panchakarma-management",
    md: 3,
  },
  {
    title: "Diagnostics Management",
    description:
      "Manage complaints, general examination, and diagnosis entries",
    icon: <Stethoscope size={24} />,
    url: "/settings/diagnostics-management",
    md: 3,
  },
  {
    title: "Diagnostic Center Management",
    description: "Create and manage diagnostic centers efficiently.",
    icon: <Building2 size={24} />,
    url: "/settings/diagnostic-centers",
    md: 3,
  },
  {
    title: "Care Plan",
    description: "Create and manage care plans for patients.",
    icon: <Leaf size={24} />,
    url: "/settings/care-plans",
    md: 3,
  },
  {
    title: "Internal Notes",
    description: "Create and manage internal notes for patients.",
    icon: <NotepadText size={24} />,
    url: "/settings/internal-notes",
    md: 3,
  },
  {
    title: "Bank Details",
    description: "Create and manage bank details.",
    icon: <Landmark size={24} />,
    url: "/settings/bank-details",
    md: 3,
  },
  {
    title: "Departments Management",
    description: "Create and manage departments for the clinic.",
    icon: <Stethoscope size={24} />,
    url: "/department-management",
    md: 3,
  },
  {
    title: "Units Management",
    description: "Create and manage units and sub-units for medicines.",
    icon: <Layers2 size={24} />,
    url: "/settings/units-management",
    md: 3,
  },
  // {
  //   title: "Beds Management",
  //   description: "Create and manage beds for patients.",
  //   icon: <Stethoscope size={24} />,
  //   url: "/beds-management",
  // },
];

function SettingsCard({ title, description, icon, url }: SettingsCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid #f0f0f0",
        backgroundColor: "WhiteSmoke",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent
        sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Box
          sx={{
            fontSize: "2rem",
            color: "primary.main",
            mb: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, flex: 1 }}
        >
          {description}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to={url}
          fullWidth
          sx={{
            mt: "auto",
            textTransform: "none",
            borderRadius: 1.5,
            py: 1,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              bgcolor: "primary.dark",
            },
          }}
        >
          Manage
        </Button>
      </CardContent>
    </Card>
  );
}

function Settings() {
  return (
    <Box
      sx={{ px: { xs: 2, sm: 3, md: 4 }, maxHeight: "97vh", overflowY: "auto" }}
    >
      <HeadingText name="Settings" />
      <Grid container spacing={3}>
        {cardDetails.map((card, index) => (
          <Grid item xs={12} sm={6} md={card.md} key={index}>
            <SettingsCard
              title={card.title}
              description={card.description}
              icon={card.icon}
              url={card.url}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Settings;
