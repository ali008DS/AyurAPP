import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Box, IconButton } from "@mui/material";
import { UserPlus, UserRoundPen } from "lucide-react";
import HeadingText from "../components/ui/HeadingText";
import AddUserDialog from "../components/user-management/add-user-dialog";
import EditUserDialog from "../components/user-management/edit-user-dialog";
import ApiManager from "../components/services/apimanager";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userRole: any;
  status?: string;
}

function CreateUser() {
  const { control } = useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const resp = await ApiManager.getUsers();
        const fetchedUsers = resp.data.map((user: any) => ({
          id: user._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user.email,
          phone: user.phone,
          userRole: user.userRole,
        }));
        setUsers(fetchedUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const resp = await ApiManager.getUsers();
      const fetchedUsers = resp.data.map((user: any) => ({
        id: user._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user.email,
        phone: user.phone,
        userRole: user.userRole,
      }));
      setUsers(fetchedUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Full Name",
        width: 180,
        flex: 1,
        sortable: false,
        renderCell: (params: { row: any }) => (
          <span
            style={{
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "600",
              color: "#333",
            }}
          >{`${params.row.firstName} ${params.row?.lastName}`}</span>
        ),
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 180,
        renderCell: (params: any) => (
          <span
            style={{
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "500",
              color: "#555",
            }}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: "email",
        headerName: "Email",
        width: 200,
        renderCell: (params: any) => (
          <span
            style={{
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "400",
              color: "#888",
            }}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: "userRole",
        headerName: "Role",
        width: 150,
        renderCell: (params: any) => (
          <span
            style={{
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "500",
              color: "#555",
            }}
          >
            {params.formattedValue?.name || "N/A"}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        sortable: false,
        renderCell: (params: any) => (
          <IconButton sx={{ ml: 2 }} onClick={() => handleEdit(params.row)}>
            <UserRoundPen size="14" color="#2196f3" />
          </IconButton>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ px: "24px" }}>
      <HeadingText name="User Management" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Controller
          name="searchTerm"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Search Users"
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#2196f3",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2196f3",
                    borderWidth: "1px",
                  },
                },
              }}
              onChange={(e) => {
                field.onChange(e);
                setSearchTerm(e.target.value);
              }}
            />
          )}
        />
        <IconButton color="primary" onClick={() => setAddDialogOpen(true)}>
          <UserPlus size="22" />
        </IconButton>
      </Box>
      <AddUserDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onUserAdded={fetchUsers}
      />
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={fetchUsers}
        user={selectedUser}
      />
      <Box sx={{ height: "80vh", width: "100%" }}>
        <DataGrid
          density="compact"
          rows={filteredUsers}
          columns={columns}
          loading={loading}
          pagination
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          sx={{
            border: 0,
            borderRadius: "16px",
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(49, 131, 213, 0.1)",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default CreateUser;
