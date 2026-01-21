import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

interface SectionBoxProps {
  title: string;
  children: React.ReactNode;
  backgroundColor?: string;
}

const SectionBox = ({
  title,
  children,
  backgroundColor,
}: SectionBoxProps) => {
  const theme = useTheme();
  const bgColor = backgroundColor || alpha(theme.palette.primary.main, 0.15);

  return (
    <Box sx={{ position: "relative", width: "100" }}>
      <Box
        sx={{
          position: "absolute",
          top: -12,
          left: 12,
          backgroundColor: "white",
          pr: 3,
          pl: 2,
          py: 1,
          border: `3px dashed ${bgColor}`,
          borderRadius: "8px",
          zIndex: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#666" }}>
          {title} {"  "}:
        </Typography>
      </Box>
      <Box
        sx={{
          pt: 5,
          px: 2,
          pb: 2,
          borderRadius: "12px",
          backgroundColor: bgColor,
          position: "relative",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SectionBox;
