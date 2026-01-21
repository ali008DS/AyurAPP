import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PermissionName =
  | "dashboard"
  | "patient"
  | "bed"
  | "therapyManagement"
  | "therapySession"
  | "trackingReport"
  | "bedOccupancyReport"
  | "medicinePrepUtensils"
  | "medicinePrepRes"
  | "medicinePrepChecked"
  | "panchkarmaUtensils"
  | "panchkarmaRes"
  | "panchkarmaChecked"
  | "searchPatient"
  | "internalNote"
  | "prescribedTests"
  | "departmentManagement"
  | "pilesOpd"
  | "spineOpd"
  | "medicineManufacturer"
  | "medicineDistributor"
  | "medicine"
  | "medicinePurchase"
  | "medicineStock"
  | "medicineSale"
  | "saleHistory"
  | "createUser"
  | "userRole"
  | "setting";

interface Permission {
  name: PermissionName;
  accessibility: boolean;
}

interface UserRoleState {
  permissions: Permission[];
}

const generateDefaultPermissions = (isAdmin: boolean): Permission[] => {
  const permissionNames: PermissionName[] = [
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
  ];

  return permissionNames.map((name) => ({
    name,
    accessibility: isAdmin,
  }));
};

const isAdmin =
  localStorage.getItem("isAdmin") === "true" ||
  sessionStorage.getItem("isAdmin") === "true";

export const userRoleSlice = createSlice({
  name: "userRole",
  initialState: {
    permissions: generateDefaultPermissions(isAdmin),
  } as UserRoleState,
  reducers: {
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
    },
    updatePermission: (
      state,
      action: PayloadAction<{ name: PermissionName; accessibility: boolean }>
    ) => {
      const permission = state.permissions.find(
        (p) => p.name === action.payload.name
      );
      if (permission) {
        permission.accessibility = action.payload.accessibility;
      }
    },
    clearPermissions: (state) => {
      state.permissions = [];
    },
  },
});

export const { setPermissions, updatePermission, clearPermissions } = userRoleSlice.actions;
