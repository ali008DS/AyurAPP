import { createTheme } from "@mui/material";

const theme = createTheme({
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#e0e0e0",
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: "#2196f3",
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "Nunito, sans-serif",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#444",
          fontFamily: "Nunito, sans-serif",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "Nunito, sans-serif",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        component: "span",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#e0e0e0",
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: "#2196f3",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Nunito, sans-serif",
          textTransform: "capitalize",
        },
      },
    },
  },
});

export default theme;
