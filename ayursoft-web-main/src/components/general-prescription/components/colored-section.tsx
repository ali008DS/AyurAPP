import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface SectionBoxProps {
  title: string;
  children: ReactNode;
  backgroundColor?: string;
}

const SectionBox = ({
  title,
  children,
  backgroundColor = "rgba(165, 216, 255, 0.2)",
}: SectionBoxProps) => {
  return (
    <Box sx={{ position: "relative", width: "100%", marginBottom: 4 }}>
      <Box
        sx={{
          position: "absolute",
          top: -12,
          left: 12,
          backgroundColor: "white",
          pr: 3,
          pl: 2,
          py: 1,
          border: `3px dashed ${backgroundColor}`,
          borderRadius: "8px",
          zIndex: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#666" }}>
          {title} :
        </Typography>
      </Box>
      <Box
        sx={{
          pt: 5,
          pb: 2,
          px: 2,
          borderRadius: "12px",
          backgroundColor: backgroundColor,
          position: "relative",
          minHeight: "100px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SectionBox;
