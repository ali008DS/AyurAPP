import { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import HeadingText from "../components/ui/HeadingText";
import { Department } from "../components/department-management/types";
import DepartmentDialog from "../components/department-management/DepartmentDialog";
import ApiManager from "../components/services/apimanager";
import { ClipboardPlus, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from "../context/app-context";
import ConfirmationDialog from "../components/ui/confirmation-dialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";


function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({});
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await ApiManager.getDepartments();
        const departmentsData = response.data.map((dept: any) => ({
          id: dept._id,
          name: dept.name,
        }));
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setNewDepartment({});
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewDepartment({});
    setEditingDepartment(null);
  };

  const handleSave = async () => {
    try {
      // Refresh the departments list after dialog's API call completes
      const response = await ApiManager.getDepartments();
      const departmentsData = response.data.map((dept: any) => ({
        id: dept._id,
        name: dept.name,
        createdAt: dept.createdAt
      }));
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to refresh departments", error);
    }
    handleDialogClose();
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setNewDepartment({ name: department.name });
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setDepartmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async (confirmed: boolean) => {
    if (confirmed && departmentToDelete) {
      try {
        await ApiManager.deleteDepartment(departmentToDelete);
        setAlert({
          severity: "success",
          message: "Department deleted successfully",
        });
        // Refresh the departments list
        const response = await ApiManager.getDepartments();
        const departmentsData = response.data.map((dept: any) => ({
          id: dept._id,
          name: dept.name,
          createdAt: dept.createdAt
        }));
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to delete department", error);
        setAlert({
          severity: "error",
          message: "Failed to delete department",
        });
      }
    }
    setDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEditClick(params.row)}
            color="primary"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
            color="error"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ maxWidth: "7xl", mx: "auto", px: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => {
                navigate("/settings");
              }}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <HeadingText name="Department Management" />
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 'bold' }}> Add Department</Typography>
            <IconButton onClick={handleAddClick} color="primary" sx={{}}>
              <ClipboardPlus size={24} />
            </IconButton>
          </Box>
        </Box>

        <DataGrid
          rows={filteredDepartments}
          columns={columns}
          getRowId={(row) => row.id}
          density="compact"
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(49, 131, 213, 0.1)",
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          disableRowSelectionOnClick
          loading={loading}
        />
      </Box>

      <DepartmentDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSave={handleSave}
        editingDepartment={editingDepartment}
        newDepartment={newDepartment}
        setNewDepartment={setNewDepartment}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Department"
        message={`Are you sure you want to delete this department? This action cannot be undone.`}
        onClose={confirmDelete}
      />
    </Box>
  );
}

export default DepartmentManagement;
