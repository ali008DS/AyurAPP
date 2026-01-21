import { Box, Button, Typography, IconButton } from "@mui/material";
import { useAppContext } from "../../../context/app-context";
import { Chip } from "@mui/material";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import ApiManager from "../../services/apimanager";
import CreateTestDialog from "./care-plan-dialog";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeadingText from "../../ui/HeadingText";
import ConfirmationDialog from "../../ui/confirmation-dialog";

interface CarePlanGroup {
  _id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestsManagement() {
  const [groups, setGroups] = useState<CarePlanGroup[]>([]);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const { setAlert } = useAppContext();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await ApiManager.getCarePlanGroups();
      const groupsData = Array.isArray(response.data) ? response.data : [];
      setGroups(groupsData);
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
    setDeleteTestId(null);
    if (confirmed && idToDelete) {
      setLoading(true);
      try {
        await ApiManager.deleteCarePlanGroup(idToDelete);
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

  const headings = [
    { key: "benefit", label: "Benefit" },
    { key: "risk", label: "Risk" },
    { key: "alternative", label: "Alternative" },
    { key: "outcome", label: "Outcome" },
    { key: "pathya", label: "Pathya" },
    { key: "apathya", label: "Apathya" },
    { key: "preventive", label: "Preventive Care" },
    { key: "curative", label: "Curative Care" },
    { key: "rehabilitative", label: "Rehabilitative Care" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => {
            navigate("/settings");
          }}
          sx={{ ml: 3, mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <HeadingText name="Care Plans" />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: "auto", mr: 3 }}
          onClick={() => setCreateTestOpen(true)}
        >
          Add Test
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          className="custom-scrollbar"
          sx={{
            minHeight: "100vh",
            px: 3,
            maxHeight: "100vh",
            overflow: "auto",
          }}
        >
          {headings.map((heading) => (
            <Box
              key={heading.key}
              sx={{
                mb: 3,
                px: 5,
                py: 2,
                borderBottom: "1px solid #eee",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">{heading.label}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxWidth: "75vw",
                }}
              >
                {groups
                  .filter((group) => group.type === heading.key)
                  .map((group) => (
                    <Chip
                      variant="outlined"
                      key={group._id}
                      label={group.name}
                      onDelete={() => setDeleteTestId(group._id)}
                      sx={{ maxWidth: "100%", wordBreak: "break-word" }}
                    />
                  ))}
              </Box>
            </Box>
          ))}
          {/* using as extra space, to make things look good */}
          <Box sx={{ minHeight: "200px" }}></Box>
        </Box>
      )}

      <CreateTestDialog
        open={createTestOpen}
        onClose={() => setCreateTestOpen(false)}
        onSuccess={() => {
          loadData();
          setCreateTestOpen(false);
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
