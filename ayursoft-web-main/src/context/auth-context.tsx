import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "./app-context";
import { useAppDispatch } from "../redux/hooks";
import { setPermissions, clearPermissions } from "../redux/slices/user-role";

interface User {
  id: string;
  type: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAsUser: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  loginAsAdmin: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { setAlert } = useAppContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check localStorage first (persistent across tabs), then sessionStorage (old sessions)
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedIsAdmin =
      localStorage.getItem("isAdmin") || sessionStorage.getItem("isAdmin");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAdmin(storedIsAdmin === "true");

        ApiManager.initialize(storedToken);

        const storedPermissions =
          localStorage.getItem("permissions") ||
          sessionStorage.getItem("permissions");
        if (storedPermissions) {
          try {
            const permissions = JSON.parse(storedPermissions);
            dispatch(setPermissions(permissions));
          } catch (error) {
            console.error("[Auth] Error parsing stored permissions:", error);
          }
        }
      } catch (error) {
        console.error(
          "[Auth] Error parsing stored user data, clearing storage:",
          error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("permissions");
        localStorage.removeItem("department");
      }
    }

    setLoading(false);
  }, [dispatch]);

  const handleLogin = async (
    email: string,
    password: string,
    _rememberMe: boolean,
    isAdminLogin: boolean
  ) => {
    try {
      setLoading(true);

      const response = await (isAdminLogin
        ? ApiManager.tenantLogin({ email, password })
        : ApiManager.userLogin({ email, password }));

      const accessToken = response.data.accessToken;
      let loggedInUser;

      if (isAdminLogin) {
        loggedInUser = {
          id: response.data.admin?._id || "admin",
          type: "admin",
          role: "admin",
        };
      } else {
        loggedInUser = {
          id: response.data.user._id,
          type: "user",
          role: response.data.user.userRole,
        };
      }

      setUser(loggedInUser);
      setToken(accessToken);
      setIsAdmin(isAdminLogin);

      ApiManager.initialize(accessToken);

      try {
        const storage = localStorage;
        storage.setItem("token", accessToken);
        storage.setItem("isAdmin", isAdminLogin.toString());
        storage.setItem("user", JSON.stringify(loggedInUser));

        if (!isAdminLogin) {
          const userDetails = await ApiManager.getUserById(
            response.data.user._id
          );

          if (
            response.data.user.userType === "doctor" &&
            userDetails?.data?.userRole?.department
          ) {
            storage.setItem(
              "department",
              JSON.stringify(userDetails.data.userRole.department)
            );
          }

          if (userDetails?.data?.userRole?.permissions) {
            dispatch(setPermissions(userDetails.data.userRole.permissions));
            storage.setItem(
              "permissions",
              JSON.stringify(userDetails.data.userRole.permissions)
            );
          }
        } else {
          // For admin login, set all permissions to true
          const adminPermissions = [
            "dashboard",
            "patient",
            "bed",
            "therapyManagement",
            "therapySession",
            "trackingReport",
            "bedOccupancyReport",
            "medicinePrepUtensils",
            "medicinePrepRes",
            "medicinePrepChecked",
            "panchkarmaUtensils",
            "panchkarmaRes",
            "panchkarmaChecked",
            "searchPatient",
            "internalNote",
            "prescribedTests",
            "departmentManagement",
            "pilesOpd",
            "spineOpd",
            "medicineManufacturer",
            "medicineDistributor",
            "medicine",
            "medicinePurchase",
            "medicineStock",
            "medicineSale",
            "saleHistory",
            "createUser",
            "userRole",
            "setting",
          ] as const;

          const permissionsArray = adminPermissions.map((name) => ({
            name: name as any,
            accessibility: true
          }));

          dispatch(setPermissions(permissionsArray));
          storage.setItem("permissions", JSON.stringify(permissionsArray));
        }
      } catch (error) {
        console.error("[Auth] Error storing auth data:", error);
      }

      setAlert({
        severity: "success",
        message: `Successfully logged in as ${isAdminLogin ? "admin" : "user"
          }!`,
      });

      setTimeout(() => {
        navigate("/patients");
        setTimeout(() => {
          window.location.reload();
        }, 50);
      }, 50);
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      setAlert({
        severity: "error",
        message: "Failed to login. Please check your credentials.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsUser = (email: string, password: string, rememberMe = false) => {
    return handleLogin(email, password, rememberMe, false);
  };

  const loginAsAdmin = (
    email: string,
    password: string,
    rememberMe = false
  ) => {
    return handleLogin(email, password, rememberMe, true);
  };

  const logout = () => {
    const wasAdmin = isAdmin;

    setUser(null);
    setToken(null);
    setIsAdmin(false);

    ApiManager.initialize(null);

    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("department");
      localStorage.removeItem("permissions");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isAdmin");
      sessionStorage.removeItem("department");
      sessionStorage.removeItem("permissions");

      // Clear permissions from Redux store
      dispatch(clearPermissions());
    } catch (error) {
      console.error("[Auth] Error clearing stored auth data:", error);
    }

    navigate(wasAdmin ? "/admin-login" : "/user-login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin,
        loginAsUser,
        loginAsAdmin,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
