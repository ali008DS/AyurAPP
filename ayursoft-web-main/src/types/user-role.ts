export type PermissionName =
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

export const permissionLabels: Record<PermissionName, string> = {
  dashboard: "Dashboard",
  patient: "Patients",
  bed: "Beds",
  therapyManagement: "Therapies ❯ Therapy Management",
  therapySession: "Therapies ❯ Therapy Session",
  trackingReport: "Reports ❯ Tracking Reports",
  bedOccupancyReport: "Reports ❯ Bed Occupancy",
  medicinePrepUtensils: "Registers ❯ Medicine Preparation ❯ Mgmt MedPrep",
  medicinePrepRes: "Registers ❯ Medicine Preparation ❯ Responsibility",
  medicinePrepChecked: "Registers ❯ Medicine Preparation ❯ Checked By",
  panchkarmaUtensils: "Registers ❯ Panchkarma Inventory ❯ Mgmt Utensils",
  panchkarmaRes: "Registers ❯ Panchkarma Inventory ❯ Responsibility",
  panchkarmaChecked: "Registers ❯ Panchkarma Inventory ❯ Checked By",
  searchPatient: "Search ❯ Search Patients",
  internalNote: "Search ❯ Internal Notes",
  prescribedTests: "Search ❯ Prescribed Tests",
  departmentManagement: "OPD ❯ Dept. Management",
  spineOpd: "OPD ❯ Today's Spine OPD",
  pilesOpd: "OPD ❯ Today's Piles OPD",
  medicineManufacturer: "Pharmacy ❯ Manufacturer",
  medicineDistributor: "Pharmacy ❯ Distributor",
  medicine: "Pharmacy ❯ Medicine",
  medicinePurchase: "Pharmacy ❯ Medicine Purchase",
  medicineSale: "Pharmacy ❯ Medicine Sale",
  saleHistory: "Pharmacy ❯ Sale History",
  medicineStock: "Pharmacy ❯ Medicine Stock",
  createUser: "User Mgmt. ❯ Create User",
  userRole: "User Mgmt. ❯ Create User Roles",
  setting: "Settings",
};

export interface Permission {
  name: PermissionName;
  accessibility: boolean;
}

export interface UserRole {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDoctor: "yes" | "no";
  department: string[];
}

export interface CreateUserRolePayload {
  name: string;
  description: string;
  permissions: Permission[];
  isDoctor: "yes" | "no";
  department: string[];
}
