import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import CustomAlert from "../components/custom-alert";

interface CustomAlertType {
  severity: "success" | "warning" | "error" | "";
  message: string;
}

interface WebsiteIdentity {
  clinicName: string;
  description: string;
  logo: string | null;
  address: string;
  phoneNumber: string;
  email: string;
  prescriptionHeader: string | null;
  prescriptionBackground: string | null;
  prescriptionFooter: string | null;
}

interface AppContextInterface {
  setAlert: (data: CustomAlertType) => void;
  websiteIdentity: WebsiteIdentity;
  updateWebsiteIdentity: (identity: Partial<WebsiteIdentity>) => void;
  themeColor: string;
  updateThemeColor: (color: string) => void;
}

const AppContext = createContext<AppContextInterface>(
  {} as AppContextInterface
);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [alert, setAlertData] = useState<CustomAlertType>({
    severity: "",
    message: "",
  });

  // Initialize website identity from localStorage
  const [websiteIdentity, setWebsiteIdentity] = useState<WebsiteIdentity>(() => {
    const saved = localStorage.getItem("websiteIdentity");
    return saved
      ? JSON.parse(saved)
      : {
        clinicName: "Rayshree",
        description: "Ayurveda",
        logo: "/images.png",
        address: "",
        phoneNumber: "",
        email: "",
        prescriptionHeader: null,
        prescriptionBackground: null,
        prescriptionFooter: null,
      };
  });

  const updateWebsiteIdentity = (newIdentity: Partial<WebsiteIdentity>) => {
    setWebsiteIdentity((prev) => {
      const updated = { ...prev, ...newIdentity };
      localStorage.setItem("websiteIdentity", JSON.stringify(updated));
      return updated;
    });
  };

  // Initialize theme color from localStorage
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem("themeColor") || "#1976d2";
  });

  const updateThemeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("themeColor", color);
  };

  const value = useMemo(
    () => ({
      setAlert: setAlertData,
      websiteIdentity,
      updateWebsiteIdentity,
      themeColor,
      updateThemeColor,
    }),
    [websiteIdentity, themeColor]
  );

  // Create dynamic theme
  const theme = useMemo(() => createTheme({
    palette: {
      primary: {
        main: themeColor,
      },
      secondary: {
        main: themeColor, // Use same or derivative for secondary
      },
    },
    typography: {
      fontFamily: "Nunito, sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "capitalize",
            borderRadius: "8px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          },
        },
      },
    },
  }), [themeColor]);

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {alert.message && (
          <CustomAlert
            onOpen={Boolean(alert.message)}
            onClose={() => setAlertData({ severity: "", message: "" })}
            severity={alert.severity}
            position="right"
            message={alert.message}
          />
        )}
        {children}
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
