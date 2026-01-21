import { Box, Typography, IconButton } from "@mui/material";
import { PanelLeftClose } from "lucide-react";
import { useSidebar } from "../../context/sidebar-context";

interface HeadingTextProps {
  name: string;
}

const HeadingText = ({ name }: HeadingTextProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <Box
      sx={{
        mr: 3,
        my: 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      <IconButton
        onClick={toggleSidebar}
        sx={{
          height: "6vh",
          width: "6vh",
          mt: 0.4,
          transition: (theme) =>
            theme.transitions.create("transform", {
              duration: theme.transitions.duration.standard,
            }),
          transform: isCollapsed ? "rotate(180deg)" : "none",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <PanelLeftClose color="rgba(57, 57, 57, 0.95)" />
      </IconButton>
      <Typography
        sx={{
          fontSize: "28px",
          fontWeight: 700,
          color: "black",
          fontFamily: "Nunito, sans-serif",
        }}
      >
        {name} :
      </Typography>
    </Box>
  );
};

export default HeadingText;
