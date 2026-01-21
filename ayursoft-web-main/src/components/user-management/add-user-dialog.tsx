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
import { userSchema } from "../../utils/validationSchemas";
import { ZodError } from "zod";

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserDialog = ({ open, onClose, onUserAdded }: AddUserDialogProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userRole: "",
    password: "",
  });

  const [retypePassword, setRetypePassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== retypePassword) {
      setAlert({ severity: "error", message: "Passwords do not match" });
      setErrors({ retypePassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      // Validate with Zod
      userSchema.parse(formData);

      console.log("Form data:", formData);
      const resp = await ApiManager.createUser({
        ...formData,
        recurringOffDays: [],
        customOffDays: [],
      });

      // Use standardized message unless API gives a very specific non-generic one
      const successMsg = (resp?.message && !resp.message.toLowerCase().includes("data retri"))
        ? resp.message
        : "User create successfully";

      setAlert({ severity: "success", message: successMsg });
      onUserAdded();

      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        userRole: "",
        password: "",
      });
      setRetypePassword("");
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
        // Show the first Zod error in the toast
        const firstErrorMessage = error.errors[0]?.message || "Validation failed";
        setAlert({ severity: "error", message: firstErrorMessage });
      } else {
        console.error("Failed to create user", error);

        // Handle NestJS / API validation errors dynamically
        let errorMsg = "Failed to create user";
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRetypePasswordChange = (e: any) => {
    setRetypePassword(e.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
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
            <Grid item xs={6}>
              <TextField
                required
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                type="password"
                label="Retype Password"
                name="retypePassword"
                value={retypePassword}
                onChange={handleRetypePasswordChange}
                fullWidth
                size="small"
                error={!!errors.retypePassword}
                helperText={errors.retypePassword}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button type="submit" variant="text" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Add User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserDialog;
