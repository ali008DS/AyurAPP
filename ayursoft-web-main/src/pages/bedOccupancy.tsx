import { Box, Button, IconButton } from "@mui/material";
import HeadingText from "../components/ui/HeadingText";
import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Download, Eye } from "lucide-react";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import * as XLSX from "xlsx";
import BedOccupancyDetailsDialog from "../components/reports/BedOccupancyDetailsDialog";

interface OccupancyDetail {
  name: string;
  occupiedBed: string;
  isReleased: boolean;
}

interface BedOccupancyData {
  date: string;
  totalBeds: number;
  occupancyRate: number;
  occupiedBeds: number;
  bedsAvailable: number;
  occupancyDetails: OccupancyDetail[];
}

function BedOccupancy() {
  const { setAlert } = useAppContext();
  const [data, setData] = useState<BedOccupancyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [summary, setSummary] = useState({
    totalBedDays: 0,
    occupiedBedDays: 0,
    avgOccupancy: 0,
    month: "",
    year: "",
    totalBeds: 0,
    daysInMonth: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<{
    date: string;
    details: OccupancyDetail[];
  }>({ date: "", details: [] });

  const fetchReport = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const response = await ApiManager.getBedOccupancyReport(
        selectedDate.toISOString()
      );
      setData(response.data);

      if (response.data.length > 0) {
        const totalBeds = response.data[0].totalBeds;
        const month = selectedDate.format("MMMM YYYY");
        const daysInMonth = selectedDate.daysInMonth();
        const totalBedDays = totalBeds * daysInMonth;
        const occupiedBedDays = response.data.reduce(
          (sum: number, day: BedOccupancyData) => sum + day.occupiedBeds,
          0
        );
        const avgOccupancy = (occupiedBedDays / totalBedDays) * 100;

        setSummary({
          totalBedDays,
          occupiedBedDays,
          avgOccupancy,
          month,
          year: selectedDate.format("YYYY"),
          totalBeds,
          daysInMonth,
        });
      }
    } catch (error) {
      console.error("Failed to fetch bed occupancy report", error);
      setAlert({ severity: "error", message: "Failed to fetch report" });
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const excelData = data.map((day) => ({
    Date: dayjs(day.date).format("DD/MM/YYYY"),
      "Total Beds": day.totalBeds,
      "Beds Occupied": day.occupiedBeds,
      "Beds Vacant": day.bedsAvailable,
      "Occupancy %": day.occupancyRate.toFixed(2),
      Remarks:
        day.occupancyDetails.length > 0
          ? day.occupancyDetails
              .map(
                (d) =>
                  `${d.name} (${d.occupiedBed} - ${
                    d.isReleased ? "Discharged" : "Occupied"
                  })`
              )
              .join(", ")
          : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bed Occupancy");
    XLSX.writeFile(wb, `Bed_Occupancy_${summary.month.replace(" ", "_")}.xlsx`);
  };

  const handleViewDetails = (date: string, details: OccupancyDetail[]) => {
    setSelectedDetails({ date, details });
    setDialogOpen(true);
  };

  const rows = data.map((day, index) => ({
    id: index,
    date: day.date,
    totalBeds: day.totalBeds,
    occupiedBeds: day.occupiedBeds,
    bedsAvailable: day.bedsAvailable,
    occupancyRate: day.occupancyRate,
    hasDetails: day.occupancyDetails.length > 0,
    occupancyDetails: day.occupancyDetails,
  }));

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: (params) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "600",
          }}
        >
          {params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""}
        </span>
      ),
    },
    {
      field: "totalBeds",
      headerName: "Total Beds",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "occupiedBeds",
      headerName: "Beds Occupied",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "bedsAvailable",
      headerName: "Beds Vacant",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "500",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "occupancyRate",
      headerName: "Occupancy %",
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: "600",
          }}
        >
          {params.value.toFixed(2)}%
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Details",
      width: 100,
      renderCell: (params) =>
        params.row.hasDetails ? (
          <IconButton
            onClick={() =>
              handleViewDetails(params.row.date, params.row.occupancyDetails)
            }
            size="small"
            sx={{
              backgroundColor: "#e6f7ff",
              color: "#1890ff",
              width: 28,
              height: 28,
            }}
          >
            <Eye size={16} />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <Box sx={{ px: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <HeadingText name="Bed Occupancy Report" />
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <DatePicker
            label="Select Month"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            views={["month", "year"]}
            slotProps={{ textField: { size: "small" } }}
          />
          <Button
            variant="outlined"
            onClick={fetchReport}
            sx={{ fontWeight: "bold" }}
          >
            Fetch Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={downloadExcel}
            disabled={data.length === 0}
            sx={{ fontWeight: "bold", border: "dashed 1px" }}
          >
            Download Excel
          </Button>
        </Box>
      </Box>

      {data.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Box
            sx={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: "700",
              fontSize: "16px",
              mb: 1,
            }}
          >
            Monthly Summary ({summary.month})
          </Box>
          <Box
            sx={{
              fontFamily: "Nunito, sans-serif",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Total Bed-Days Available: {summary.totalBeds} beds ×{" "}
            {summary.daysInMonth} days = {summary.totalBedDays} Bed-Days
          </Box>
          <Box
            sx={{
              fontFamily: "Nunito, sans-serif",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Total Bed-Days Occupied: {summary.occupiedBedDays}
          </Box>
          <Box
            sx={{
              fontFamily: "Nunito, sans-serif",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Average Daily Occupancy %: ({summary.occupiedBedDays} ÷{" "}
            {summary.totalBedDays}) × 100 = {summary.avgOccupancy.toFixed(2)}%
          </Box>
        </Box>
      )}
  
      <Box sx={{ width: "100%", height: "60vh", mt: 2 }}>
        <DataGrid
          disableColumnMenu
          density="compact"
          rows={rows}
          columns={columns}
          loading={loading}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "Nunito, sans-serif",
            },
          }}
        />
      </Box>

      <BedOccupancyDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        date={selectedDetails.date}
        details={selectedDetails.details}
      />
    </Box>
  );
}

export default BedOccupancy;
