import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import apimanager from "../../components/services/apimanager";
import { useAppContext } from "../../context/app-context";

interface DepartmentAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DepartmentAssignmentDialog = ({
  open,
  onClose,
  onSuccess,
}: DepartmentAssignmentDialogProps) => {
  const { setAlert } = useAppContext();
  const [departments, setDepartments] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      resetDialog();
    }
  }, [open]);

  const resetDialog = () => {
    setSelectedRole(null);
    setSelectedDepartments([]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [departmentsRes, rolesRes] = await Promise.all([
        apimanager.getDepartments(),
        apimanager.getUserRoles(),
      ]);
      setDepartments(departmentsRes.data || []);

      setUserRoles(
        (rolesRes.data || []).filter((role: any) => role.isDoctor === "yes")
      );
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole && selectedRole.department && departments.length > 0) {
      const preselectedDepts = selectedRole.department
        .map((dept: any) => {
          if (typeof dept === "string") {
            return departments.find((d: any) => d._id === dept);
          } else {
            return departments.find((d: any) => d._id === dept._id);
          }
        })
        .filter((dept: any) => dept !== undefined);

      setSelectedDepartments(preselectedDepts);
    } else {
      setSelectedDepartments([]);
    }
  }, [selectedRole, departments]);

  const handleSave = async () => {
    if (!selectedRole) {
      setAlert({ severity: "error", message: "Please select a role" });
      return;
    }
    setSaving(true);
    try {
      const updatedRole = {
        ...selectedRole,
        department: selectedDepartments,
      };

      await apimanager.updateUserRole(selectedRole._id, updatedRole);
      setAlert({
        severity: "success",
        message: "Departments assigned successfully",
      });
      onSuccess();
      onClose();
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to assign departments" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Assign Departments to User Roles</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Select the user role and then pick departments (preselected ones
              are shown):
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Role</InputLabel>
              <Select
                value={selectedRole?._id || ""}
                onChange={(e) => {
                  const role = userRoles.find(
                    (r: any) => r._id === e.target.value
                  );
                  setSelectedRole(role || null);
                }}
                label="Select Role"
              >
                {userRoles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedRole && (
              <Autocomplete
                multiple
                options={departments}
                value={selectedDepartments}
                onChange={(_, newValue) => setSelectedDepartments(newValue)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Departments"
                    placeholder="Choose departments..."
                    helperText={`${selectedDepartments.length} department(s) selected`}
                  />
                )}
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentAssignmentDialog;
