import { Box, Typography } from "@mui/material";
import backgroundImage from "../../src/assets/question-mark-random-pattern-background-black-and-white-vector.jpg";

const NotFound = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
          zIndex: -1,
        }}
      />
      <Typography
        variant="h1"
        sx={{
          fontSize: "6rem",
          marginBottom: "1rem",
          color: "#555",
          fontWeight: "300",
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{ marginBottom: "2rem", color: "#666", fontWeight: "400" }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ marginBottom: "2rem", color: "#555", fontWeight: "400" }}
      >
        The page you are looking for doesn't exist or has been moved.
      </Typography>
    </Box>
  );
};

export default NotFound;
