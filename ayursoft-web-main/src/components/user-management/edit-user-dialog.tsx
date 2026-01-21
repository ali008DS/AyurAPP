import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import ApiManager from "../services/apimanager";
import { useAppContext } from "../../context/app-context";
import { User } from "../../pages/create-user";
import { updateUserSchema } from "../../utils/validationSchemas";
import { ZodError } from "zod";

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

const EditUserDialog = ({
  open,
  onClose,
  onUserUpdated,
  user,
}: EditUserDialogProps) => {
  // changed userRole from an object to a string
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userRole: "",
    password: "",
  });

  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userRoles, setUserRoles] = useState<{ _id: string; name: string }[]>(
    []
  );
  const { setAlert } = useAppContext();

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const roles = await ApiManager.getUserRoles();
        const simplifiedRoles = roles.data.map((role: any) => ({
          _id: role._id,
          name: role.name,
        }));
        setUserRoles(simplifiedRoles);
      } catch (error) {
        setAlert({ severity: "error", message: "Failed to fetch user roles" });
      }
    };
    fetchUserRoles();
  }, [setAlert]);

  useEffect(() => {
    if (user && userRoles.length > 0) {
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        userRole: user.userRole?._id || "",
        password: "",
      });
    }
  }, [user, userRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    setLoading(true);
    try {
      // Validate with update schema (password is optional)
      updateUserSchema.parse(formData);

      const { password, ...rest } = formData;
      const updateData = password ? formData : rest;
      console.log("updateData", updateData);

      const resp = await ApiManager.updateUser(user.id.toString(), updateData);

      // Use standardized message unless API gives a very specific non-generic one
      const successMsg = resp?.message ?? "User update successfully";


      setAlert({ severity: "success", message: successMsg });
      onUserUpdated();
      onClose();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        const firstErrorMessage = error.errors[0]?.message || "Validation failed";
        setAlert({ severity: "error", message: firstErrorMessage });
      } else {
        console.error("Failed to update user", error);

        let errorMsg = "Failed to update user";
        const responseData = error.response?.data;
        const apiError = responseData?.message;

        if (Array.isArray(apiError)) {
          errorMsg = apiError.join(", ");
        } else if (typeof apiError === "string") {
          errorMsg = apiError;
        } else if (responseData?.error) {
          errorMsg = responseData.error;
        } else if (error.message) {
          errorMsg = error.message;
        }

        setAlert({ severity: "error", message: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    console.log("e", e.target.value);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                required
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                label="Last Name"
                name="lastName"
                value={formData?.lastName}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl required fullWidth size="small" error={!!errors.userRole}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="userRole"
                  value={formData.userRole}
                  label="Role"
                  onChange={handleChange}
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role._id} value={role._id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.userRole && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                    {errors.userRole}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {isAdmin && (
              <Grid item xs={12}>
                <TextField
                  type="password"
                  label="New Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Leave blank to keep current password"
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button type="submit" variant="text" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Update User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;
