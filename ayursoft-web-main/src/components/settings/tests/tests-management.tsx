import { Box, Button, Typography, IconButton } from "@mui/material";
import { useAppContext } from "../../../context/app-context";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import ApiManager from "../../services/apimanager";
import CreateTestDialog from "./create-test-dialog";
import EditTestDialog from "./edit-test-dialog";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeadingText from "../../ui/HeadingText";
import ConfirmationDialog from "../../ui/confirmation-dialog";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";

interface Test {
  _id: string;
  name: string;
  description: string;
  note: string;
  marketPrice?: number;
  discountedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export default function TestsManagement() {
  const [tests, setTests] = useState<Test[]>([]);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [editTest, setEditTest] = useState<Test | null>(null);
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const testsResponse = await ApiManager.getTests();

      // Ensure we have an array, even if empty
      const testsData = Array.isArray(testsResponse.data)
        ? testsResponse.data
        : [];

      console.log("Tests data:", testsData);
      setTests(testsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTest = async (confirmed: boolean) => {
    const idToDelete = deleteTestId;
    setDeleteTestId(null); // Close dialog immediately

    if (confirmed && idToDelete) {
      setLoading(true);
      try {
        await ApiManager.deleteTest(idToDelete);
        await loadData();
        setAlert({
          severity: "success",
          message: "Test deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting test:", error);
        setAlert({
          severity: "error",
          message: "Failed to delete test. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // DataGrid columns definition
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "note", headerName: "Note", flex: 1 },
    { field: "marketPrice", headerName: "Market Price", flex: 1 },
    { field: "discountedPrice", headerName: "Discounted Price", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem
          label="Delete"
          showInMenu
          onClick={() => setDeleteTestId(params.id as string)}
        />,
        <GridActionsCellItem
          label="Edit"
          showInMenu
          onClick={() => {
            const test = tests.find((t) => t._id === params.id);
            if (test) setEditTest(test);
          }}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={() => {
            navigate("/settings");
          }}
          sx={{ ml: 3, mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <HeadingText name="Tests Management" />
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              mt: 3,
              px: 5,
            }}
          >
            <Typography variant="h6">Medical Tests</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCreateTestOpen(true)}
            >
              Add Test
            </Button>
          </Box>
          <Box sx={{ height: "75vh", px: 5 }}>
            <DataGrid
              rows={tests}
              columns={columns}
              getRowId={(row) => row._id}
              disableRowSelectionOnClick
          pageSizeOptions={[20, 50, 100]}
            />
          </Box>
        </>
      )}
      <Box sx={{ minHeight: "50px" }} />
      <CreateTestDialog
        open={createTestOpen}
        onClose={() => setCreateTestOpen(false)}
        onSuccess={() => {
          loadData();
          setCreateTestOpen(false);
        }}
      />
      <EditTestDialog
        open={!!editTest}
        test={editTest}
        onClose={() => setEditTest(null)}
        onSuccess={() => {
          loadData();
          setEditTest(null);
        }}
      />
      <ConfirmationDialog
        open={!!deleteTestId}
        title="Delete Test"
        message="Are you sure you want to delete this test? This action cannot be undone."
        onClose={handleDeleteTest}
      />
    </Box>
  );
}
