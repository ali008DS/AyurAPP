import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import HeadingText from "../components/ui/HeadingText";
import CreateUserRoleDialog from "../components/user-roles/create-user-role-dialog";
import DepartmentAssignmentDialog from "../components/user-roles/department-assignment-dialog";
import apiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import IOSSwitch from "../components/ui/ios-switch";
import {
  UserRole,
  Permission,
  PermissionName,
  permissionLabels,
} from "../types/user-role";

interface GridRow {
  id: string;
  permission: PermissionName;
}

function CreateUserRoles() {
  const AllPermissions: PermissionName[] = [
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const [userRolesState, setUserRolesState] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [tempPermissions, setTempPermissions] = useState<Permission[]>([]);

  // Auto-detect if all permissions are ON
  const areAllPermissionsOn = AllPermissions.every((perm) => {
    const found = tempPermissions.find((p) => p.name === perm);
    return found?.accessibility === true;
  });

  const { setAlert } = useAppContext();

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await apiManager.getUserRoles();
      setUserRolesState(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (roleId: string, updatedRole: UserRole) => {
    try {
      const response = await apiManager.updateUserRole(roleId, updatedRole);

      const successMsg = (response?.message && !response.message.toLowerCase().includes("data retri"))
        ? response.message
        : "Role update successfully";

      setAlert({
        severity: "success",
        message: successMsg,
      });
      fetchUserRoles();
    } catch (error: any) {
      console.error("Failed to update role", error);
      const errorMsg = error.response?.data?.message || "Failed to update role";
      setAlert({
        severity: "error",
        message: typeof errorMsg === "string" ? errorMsg : (Array.isArray(errorMsg) ? errorMsg.join(", ") : "Failed to update role"),
      });
    }
  };

  /* ================= DATAGRID SWITCH ================= */

  const handleSwitchToggle = (
    roleId: string,
    permissionName: PermissionName
  ) => {
    setUserRolesState((prev) =>
      prev.map((role) => {
        if (role._id !== roleId) return role;

        const existing = role.permissions.find(
          (p) => p.name === permissionName
        );

        const updatedPermissions = existing
          ? role.permissions.map((p) =>
            p.name === permissionName
              ? { ...p, accessibility: !p.accessibility }
              : p
          )
          : [...role.permissions, { name: permissionName, accessibility: true }];

        const updatedRole = { ...role, permissions: updatedPermissions };
        updateUserRole(roleId, updatedRole);
        return updatedRole;
      })
    );
  };

  /* ================= POPUP LOGIC ================= */

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = userRolesState.find((r) => r._id === roleId);
    setTempPermissions(role?.permissions || []);
  };

  const handlePermissionToggle = (permission: PermissionName) => {
    setTempPermissions((prev) => {
      const exists = prev.find((p) => p.name === permission);

      if (exists) {
        return prev.map((p) =>
          p.name === permission
            ? { ...p, accessibility: !p.accessibility }
            : p
        );
      }

      return [...prev, { name: permission, accessibility: true }];
    });
  };

  const handleToggleAll = () => {
    if (!selectedRoleId) return;

    setTempPermissions(
      AllPermissions.map((perm) => ({
        name: perm,
        accessibility: !areAllPermissionsOn,
      }))
    );
  };

  const handleSavePermissions = async () => {
    const role = userRolesState.find((r) => r._id === selectedRoleId);
    if (!role) return;

    await updateUserRole(selectedRoleId, {
      ...role,
      permissions: tempPermissions,
    });

    setPermissionDialogOpen(false);
  };

  /* ================= DATAGRID ================= */

  const rows: GridRow[] = AllPermissions.map((permission) => ({
    id: permission,
    permission,
  }));

  const columns: GridColDef[] = [
    {
      field: "permission",
      headerName: "Permission",
      width: 350,
      valueGetter: (_: unknown, row: GridRow) =>
        permissionLabels[row.permission] || row.permission,
    },
    ...userRolesState.map((role) => ({
      field: role._id,
      headerName: role.name,
      width: 110,
      renderCell: (params: GridRenderCellParams) => {
        const permission = role.permissions.find(
          (p) => p.name === params.row.permission
        );
        return (
          <IOSSwitch
            checked={permission?.accessibility || false}
            onChange={() =>
              handleSwitchToggle(role._id, params.row.permission)
            }
          />
        );
      },
    })),
  ];

  /* ================= JSX ================= */

  return (
    <Box sx={{ px: 3 }}>
      <HeadingText name="User Role Permissions" />

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => setDialogOpen(true)} sx={{ flex: 1 }}>
          Create User Role
        </Button>

        <Button
          variant="outlined"
          onClick={() => setAssignmentDialogOpen(true)}
          sx={{
            flex: 1,
            borderColor: "#ffeb3b",
            color: "#f57c00",
          }}
        >
          Assign Departments to Roles
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setPermissionDialogOpen(true)}
          sx={{ flex: 1 }}
        >
          Manage Role Permissions
        </Button>
      </Box>

      <Box sx={{ height: "calc(100vh - 220px)" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          loading={loading}
          getRowHeight={() => 55}
        />
      </Box>



      {/* PERMISSION POPUP */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Manage Role Permissions</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 1 }}>Select Role</Typography>

          <Select
            fullWidth
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {userRolesState.map((role) => (
              <MenuItem key={role._id} value={role._id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ mt: 2 }}>
            {AllPermissions.map((perm) => {
              const checked =
                tempPermissions.find((p) => p.name === perm)?.accessibility ||
                false;

              return (
                <FormControlLabel
                  key={perm}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() => handlePermissionToggle(perm)}
                    />
                  }
                  label={permissionLabels[perm] || perm}
                />
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleToggleAll}
            disabled={!selectedRoleId}
          >
            {areAllPermissionsOn ? "Toggle Off All" : "Toggle All"}
          </Button>

          <Box>
            <Button onClick={() => setPermissionDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePermissions}>
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <CreateUserRoleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchUserRoles}
      />

      <DepartmentAssignmentDialog
        open={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onSuccess={fetchUserRoles}
      />
    </Box>
  );
}

export default CreateUserRoles;
