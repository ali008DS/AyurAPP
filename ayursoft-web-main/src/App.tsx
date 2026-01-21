import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AppProvider } from "./context/app-context";
import { AuthProvider } from "./context/auth-context";
import { SidebarProvider } from "./context/sidebar-context";
import { PatientsProvider } from "./context/patients-context";
import { AppLayout } from "./components/layouts/AppLayout";
import { AppContainer } from "./components/ui/layouts";
import TenantMiddleware from "./components/tenant-middleware";
import { useAppDispatch } from "./redux/hooks";
import { setPermissions } from "./redux/slices/user-role";
import ApiManager from "./components/services/apimanager";
import "./App.css";
import "./SearchLayout.css";
import "./SampleSplitter.css";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isAdminLocal = localStorage.getItem("isAdmin") === "true";
    const isAdminSession = sessionStorage.getItem("isAdmin") === "true";
    const isAdmin = isAdminLocal || isAdminSession;

    if (!isAdmin) {
      try {
        const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
        const userSession = JSON.parse(sessionStorage.getItem("user") || "{}");
        const user = userLocal.role ? userLocal : userSession;
        const roleId = user.role;

        if (roleId) {
          ApiManager.getUserRoleById(roleId)
            .then((response) => {
              if (response.status && response.data?.permissions) {
                console.log("dispatched data:", response.data.permissions);
                dispatch(setPermissions(response.data.permissions));
              }
            })
            .catch((error) => {
              console.error("Error fetching user role:", error);
            });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <AppContainer>
      {/* <ThemeProvider> */}
      <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ keyboardDate: 'DD/MM/YYYY' }}>
        <TenantMiddleware>
          <Router>
            <PatientsProvider>
              <AppProvider>
                <AuthProvider>
                  <SidebarProvider>
                    <AppLayout />
                  </SidebarProvider>
                </AuthProvider>
              </AppProvider>
            </PatientsProvider>
          </Router>
        </TenantMiddleware>
      </LocalizationProvider>
      {/* </ThemeProvider> */}
    </AppContainer>
  );
}

export default App;
