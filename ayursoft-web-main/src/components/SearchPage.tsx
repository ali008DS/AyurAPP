import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  TextField,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { ArrowRightFromLine, FileDown } from "lucide-react";
import HeadingText from "./ui/HeadingText";
import AddPatientDialog from "./AddPatientDialog";
import * as XLSX from "xlsx";
import { PatientsProps } from "../types/patient";
import ApiManager from "./services/apimanager";

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const handleExport = (patients: any[]) => {
  if (!patients || patients.length === 0) {
    console.error("No patient data available for export.");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(patients);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
  XLSX.writeFile(workbook, "patients_list.xlsx");
};

function SearchPatients({ onPatientSelect }: PatientsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  // const [searchType, setSearchType] = useState<"prescription" | "piles">(
  //   "prescription"
  // );
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const theme = useTheme();

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      return;
    }
    setLoadingSearch(true);
    const fetch = async () => {
      try {
        const response = await ApiManager.getPatients(
          page + 1,
          pageSize,
          debouncedSearchTerm
        );
        const rows = (response?.data?.data || []).map((item: any) => ({
          ...item,
          id: item._id,
        }));
        setSearchResults(rows);
        setTotalCount(response?.data?.totalCount || 0);
      } catch (e) {
        setSearchResults([]);
        setTotalCount(0);
      } finally {
        setLoadingSearch(false);
      }
    };
    fetch();
  }, [debouncedSearchTerm, page, pageSize]);

  const columns = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Full Name",
        width: 120,
        sortable: false,
        renderCell: (params: { row: any }) => (
          <span
            style={{
              textTransform: "uppercase",
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "700",
              color: "#222",
            }}
          >
            {`${params.row?.firstName} ${params.row?.lastName}`}
          </span>
        ),
      },
      {
        field: "relative",
        headerName: "Relative",
        width: 120,
        sortable: false,
        renderCell: (params: { row: any }) => (
          <span
            style={{
              textTransform: "uppercase",
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "700",
              color: "#222",
            }}
          >
            {params.row?.relativeName &&
              `${params.row?.relationship} ${params.row?.relativeName}`}
          </span>
        ),
      },
      {
        field: "age",
        headerName: "Age",
        width: 50,
        renderCell: (params: any) => (
          <span
            style={{
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "550",
              color: "#333",
            }}
          >
            {calculateAge(params.row.dob)}
          </span>
        ),
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 100,
        renderCell: (params: any) => (
          <span
            style={{
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "600",
              color: "#555",
            }}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: "address",
        headerName: "Address",
        width: 300,
        flex: 1,
        renderCell: (params: any) => (
          <span
            style={{
              textTransform: "capitalize",
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "500",
              color: "#777",
            }}
          >
            {`${params.row.address}, ${params.row.city}, ${params.row.state}`}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        renderCell: (params: any) => (
          <Tooltip
            placement="right"
            title={`Patient Status: ${params.value}`}
            arrow
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "16px",
                fontSize: "10px",
                lineHeight: 1,
                borderRadius: "4px",
                backgroundColor:
                  params.value == "active"
                    ? "#d1e7dd"
                    : params.value == "patient"
                      ? "#f8d7da"
                      : params.value == "enquiry"
                        ? "#fff3cd"
                        : "#d1e7dd",
                padding: "0px 8px",
                "& .MuiButton-startIcon": {
                  margin: 0,
                },
              }}
            >
              <Typography
                sx={{
                  color:
                    params.value == "active"
                      ? "#52C41A"
                      : params.value == "patient"
                        ? "#CF1322"
                        : params.value == "enquiry"
                          ? "#D4380D"
                          : "primary.main",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "Nunito,sans-serif",
                }}
              >
                {params.value.charAt(0).toUpperCase() +
                  params.value.slice(1).toLowerCase()}{" "}
              </Typography>
            </Box>
          </Tooltip>
        ),
      },
      {
        field: "ids",
        headerName: "IDs",
        width: 130,
        renderCell: (params: any) => (
          <>
            {(params.row.opdId || params.row?.patientId) && (
              <Tooltip
                placement="right-end"
                title={`Patient ID: ${params.row.patientId || params.row.opdId
                  }`}
                arrow
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "16px",
                    fontSize: "10px",
                    lineHeight: 1,
                    borderRadius: "4px",
                    padding: "0px 8px",
                    mr: 0.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Typography
                    sx={{
                      color: "primary.main",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "Nunito,sans-serif",
                    }}
                  >
                    {params.row.opdId || params.row?.patientId}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {params.row?.ipdId && (
              <Tooltip
                placement="right-end"
                title={`IPD ID: ${params.row.ipdId}`}
                arrow
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "16px",
                    fontSize: "10px",
                    lineHeight: 1,
                    borderRadius: "4px",
                    backgroundColor: "#e8f5e9",
                    padding: "0px 8px",
                    mr: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#388e3c",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "Nunito,sans-serif",
                    }}
                  >
                    {params.row.ipdId}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {params.row?.uhId && (
              <Tooltip
                placement="right-end"
                title={`UH ID: ${params.row.uhId}`}
                arrow
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "16px",
                    fontSize: "10px",
                    lineHeight: 1,
                    borderRadius: "4px",
                    backgroundColor: "#fff3e0",
                    padding: "0px 8px",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#e65100",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "Nunito,sans-serif",
                    }}
                  >
                    {params.row.uhId}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </>
        ),
      },
      {
        field: "actions",
        headerName: "",
        width: 40,
        renderCell: (params: any) => (
          <Button
            fullWidth
            sx={{
              alignItems: "center",
              justifyContent: "flex-start",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPatientSelect(params.row);
            }}
          >
            <ArrowRightFromLine size={14} />
          </Button>
        ),
      },
    ],
    [onPatientSelect, theme]
  );

  return (
    <Box sx={{ px: "24px" }}>
      <HeadingText name="Search Page" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <TextField
          id="outlined-required"
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
              backgroundColor: "#fff",
              "& fieldset": {
                borderColor: "#e0e0e0",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: "1px",
              },
            },
          }}
        />
        {/* Use MenuItem for select options */}
        {/* <TextField
          select
          label="Type"
          value={searchType}
          onChange={(e) =>
            setSearchType(e.target.value as "prescription" | "piles")
          }
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="prescription">Spine</MenuItem>
          <MenuItem value="piles">Piles</MenuItem>
        </TextField> */}
        <IconButton color="primary" onClick={() => handleExport(searchResults)}>
          <FileDown size="24" />
        </IconButton>
      </Box>
      <AddPatientDialog
        open={open}
        onClose={() => setOpen(false)}
        onPatientAdded={() => { }}
      />

      {/* Only show table if searchTerm is present */}
      {searchTerm ? (
        <Box sx={{ height: "80vh", width: "100%" }}>
          <DataGrid
            loading={loadingSearch}
            density="compact"
            rowHeight={33}
            rows={searchResults}
            rowCount={totalCount} // <-- use totalCount for server-side pagination
            columns={columns}
            paginationMode="server"
            pageSizeOptions={[30, 50, 100, 150, 200]}
            pagination
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            sx={{
              border: 0,
              borderRadius: "16px",
              "& .MuiDataGrid-row:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              "& .MuiDataGrid-columnHeaders": {
                fontFamily: "Nunito, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: "start", color: "#888" }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            The search results for patients will be filtered using the following
            criteria:
          </Typography>
          <Box
            component="ul"
            sx={{ display: "inline-block", textAlign: "left", pl: 2, m: 0 }}
          >
            <li>Full Name</li>
            <li>Phone</li>
            <li>Email</li>
            <li>Address</li>
            <li>IPD ID</li>
            <li>UH ID</li>
            <li>OPD ID</li>
            <li>Patient ID</li>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default SearchPatients;
