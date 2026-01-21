import { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  CircularProgress,
  Button,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CustomLightTable from "./CustomLightTable";
import { FileDown, Search as LucideSearch } from "lucide-react";
import ApiManager from "./services/apimanager";

interface PrescribedTest {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  tests: string[] | {
        name: string;
        description?: string;
        notes?: string;
        marketPrice?: number;
        discountedPrice?: number;
      }[];
  createdAt: string;
  type: string;
}

const handleExport = (tests: PrescribedTest[]) => {
  if (!tests?.length) return;

  const exportData = tests.map((test) => ({
    "Patient Name": `${test.patient.firstName} ${test.patient.lastName}`,
    Phone: test.patient.phone,
    Tests: Array.isArray(test.tests)
      ? test.tests.map((t: any) => (typeof t === "string" ? t : t.name)).join(", ")
      : test.tests,
    Date: dayjs(test.createdAt).format("DD/MM/YYYY"),
    Type: test.type,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PrescribedTests");
  XLSX.writeFile(workbook, "prescribed_tests.xlsx");
};

function SearchPatients() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchResults, setSearchResults] = useState<PrescribedTest[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searched, setSearched] = useState(false);

  const minStartDate = dayjs("2023-01-01");
  const maxEndDate = dayjs();

  const columns = useMemo(
    () => [
      { field: "patientName", headerName: "Patient Name" },
      { field: "phone", headerName: "Phone" },
      { field: "tests", headerName: "Tests" },
      { field: "date", headerName: "Date" },
      { field: "type", headerName: "Type" },
    ],
    []
  );

  const processedResults = useMemo(() => {
    const processed = searchResults.map((test) => ({
      id: Math.random().toString(36).substr(2, 9),
      firstName: test.patient?.firstName || "",
      lastName: test.patient?.lastName || "",
      tests: Array.isArray(test.tests)
        ? test.tests.map((t) => (typeof t === "string" ? t : t.name)).join(", ")
        : test.tests || "-",
      phone: test.patient?.phone || "",
      createdAt: test.createdAt,
      patientId: "",
      ipdId: "",
      uhId: "",
      type: test.type || "-",
    }));
    console.log("Processed results for table:", processed);
    return processed;
  }, [searchResults]);

  const handleSearch = async () => {
    if (!startDate || !endDate) return;

    setLoadingSearch(true);
    setSearched(true);

    try {
      const params = {
        startDate: dayjs(startDate, "YYYY-MM-DD").startOf("day").toISOString(),
        endDate: dayjs(endDate, "YYYY-MM-DD").endOf("day").toISOString(),
      };

      console.log("Sending params:", params);
      const response = await ApiManager.getPrescribedTests(params);
      setSearchResults(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching prescribed tests:", error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <Box
      className="custom-scrollbar"
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            my: 2,
            mx: 2,
          }}
        >
          {/* date pickers */}
          <Box>
            <DatePicker
              label="Start Date"
              value={startDate ? dayjs(startDate) : null}
              onChange={(date) => {
                setStartDate(date ? date.format("YYYY-MM-DD") : "");
              }}
              minDate={minStartDate}
              maxDate={maxEndDate}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="End Date"
              value={endDate ? dayjs(endDate) : null}
              onChange={(date) => {
                setEndDate(date ? date.format("YYYY-MM-DD") : "");
              }}
              minDate={minStartDate}
              maxDate={maxEndDate}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>

          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LucideSearch size={20} />}
              onClick={handleSearch}
              disabled={loadingSearch || !startDate || !endDate}
              sx={{ borderRadius: 2, marginRight: 1 }}
            >
              Search
            </Button>
            <IconButton
              color="primary"
              onClick={() => handleExport(searchResults)}
              disabled={searchResults.length === 0}
              title={
                searchResults.length === 0
                  ? "No data to export"
                  : "Export to Excel"
              }
            >
              <FileDown size="24" />
            </IconButton>
          </Box>
        </Box>

        {/* Show table only after search, otherwise show icon and text */}
        {!searched ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LucideSearch size={60} color="#e0e0e0" />
            <Typography
              sx={{
                mt: 3,
                color: "#888",
                textAlign: "center",
              }}
            >
              Select both start and end dates, then click search to view
              prescribed tests.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            {loadingSearch ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={32} />
              </Box>
            ) : (
              <CustomLightTable
                columns={columns}
                rows={processedResults}
                searchField={"patientName"}
                maxPrescriptions={0}
              />
            )}
          </Box>
        )}
      </Box>
      <Box sx={{ height: 28, flexShrink: 0 }} />
    </Box>
  );
}

export default SearchPatients;
