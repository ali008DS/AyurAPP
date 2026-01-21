import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import apimanager from "../../components/services/apimanager";
import { useAppContext } from "../../context/app-context";

interface CreateUserRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserRoleDialog = ({
  open,
  onClose,
  onSuccess,
}: CreateUserRoleDialogProps) => {
  const { setAlert } = useAppContext();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{
    name: string;
    description: string;
    isDoctor: string;
    department: string[];
  }>({
    defaultValues: {
      name: "",
      description: "",
      isDoctor: "no",
      department: [],
    },
  });
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const isDoctor = watch("isDoctor");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apimanager.getDepartments();
        setDepartments(response.data);
      } catch (error) {
        setAlert({ severity: "error", message: "Failed to fetch departments" });
      }
    };
    fetchDepartments();
  }, [setAlert]);

  const onSubmit = async (data: any) => {
    // Validate department is provided when isDoctor is "yes"
    if (
      data.isDoctor === "yes" &&
      (!data.department || data.department.length === 0)
    ) {
      setAlert({
        severity: "error",
        message: "Department is required for doctors",
      });
      return;
    }

    setLoading(true);
    const userRole: any = {
      name: data.name,
      description: data.description,
      permissions: [],
      isDoctor: data.isDoctor as "yes" | "no",
    };

    if (data.isDoctor === "yes") {
      userRole.department = data.department;
    }

    try {
      const response = await apimanager.createUserRole(userRole);

      const successMsg = (response?.message && !response.message.toLowerCase().includes("data retri"))
        ? response.message
        : "User role create successfully";

      setAlert({
        severity: "success",
        message: successMsg,
      });
      reset();
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create user role", error);
      const errorMsg = error.response?.data?.message || "Failed to create user role";
      setAlert({
        severity: "error",
        message: typeof errorMsg === "string" ? errorMsg : (Array.isArray(errorMsg) ? errorMsg.join(", ") : "Failed to create user role"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create User Role</DialogTitle>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              size="small"
              {...field}
              label="Name"
              fullWidth
              margin="normal"
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              size="small"
              {...field}
              label="Description"
              fullWidth
              margin="normal"
            />
          )}
        />
        <Controller
          name="isDoctor"
          control={control}
          render={({ field }) => (
            <TextField
              size="small"
              {...field}
              label="Is Doctor"
              select
              fullWidth
              margin="normal"
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
          )}
        />
        {isDoctor === "yes" && (
          <Controller
            name="department"
            control={control}
            rules={{
              validate: (value) =>
                (value && value.length > 0) ||
                "Department is required for doctors",
            }}
            render={({ field }) => (
              <Autocomplete
                size="small"
                value={departments.filter(dept => field.value.includes(dept._id))}
                multiple
                options={departments}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => field.onChange(newValue.map(dept => dept._id))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    margin="normal"
                    fullWidth
                    required
                    error={!!errors.department}
                    helperText={errors.department?.message}
                  />
                )}
              />
            )}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserRoleDialog;
