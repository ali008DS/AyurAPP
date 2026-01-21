import HeadingText from "../components/ui/HeadingText";
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart
} from '@mui/x-charts';
import {
  Box,
  Grid,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardHeader,
  CssBaseline,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import { useState, useEffect } from "react";
import ApiManager from "../components/services/apimanager";

interface PatientData {
  count: number;
  year: number;
  month: number;
  day?: number;
}

interface PurchaseData {
  totalPurchaseAmount: number;
  totalTaxableAmount: number;
  totalDiscountAmount: number;
  totalInvoices: number;
  year: number;
  month: number;
  netPurchaseAmount: number;
}

interface SaleData {
  totalSalesAmount: number;
  totalPaidAmount: number;
  totalDiscount: number;
  totalInvoices: number;
  year: number;
  month: number;
  dueAmount: number;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
}

interface DoctorPrescriptionData {
  count: number;
  day: number;
}

interface RevenueData {
  pharmacy: {
    totalSales: number;
    totalPaid: number;
    totalDiscount: number;
  };
  panchakarma: {
    totalSales: number;
    totalPaid: number;
    totalDiscount: number;
  };
  expenses: {
    totalExpense: number;
  };
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalExpense: number;
    netRevenue: number;
  };
}

function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<{
    last6Months: PatientData[];
    last6Days: PatientData[];
  } | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
  const [saleData, setSaleData] = useState<SaleData[]>([]);
  const [panchakarmaPurchaseData, setPanchakarmaPurchaseData] = useState<PurchaseData[]>([]);
  const [panchakarmaSaleData, setPanchakarmaSaleData] = useState<SaleData[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [doctorPrescriptionData, setDoctorPrescriptionData] = useState<DoctorPrescriptionData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [patients, purchases, sales, pPurchases, pSales, doctorsRes, revenue] = await Promise.all([
          ApiManager.getPatientDashboard(),
          ApiManager.getPurchaseDashboard(),
          ApiManager.getSaleDashboard(),
          ApiManager.getPanchakarmaPurchaseDashboard(),
          ApiManager.getPanchakarmaSaleDashboard(),
          ApiManager.getDoctors(),
          ApiManager.getRevenueDashboard(),
        ]);

        setPatientData(patients.data);
        setPurchaseData(purchases.data);
        setSaleData(sales.data);
        setPanchakarmaPurchaseData(pPurchases.data);
        setPanchakarmaSaleData(pSales.data);
        setDoctors(doctorsRes.data);
        setRevenueData(revenue.data);

        // Set first doctor as default
        if (doctorsRes.data && doctorsRes.data.length > 0) {
          setSelectedDoctor(doctorsRes.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch doctor prescription data when doctor is selected
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (selectedDoctor) {
        try {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Last 30 days
          const prescriptionRes = await ApiManager.getDoctorPrescriptionDashboard(
            startDate.toISOString(),
            selectedDoctor
          );
          setDoctorPrescriptionData(prescriptionRes.data);
        } catch (error) {
          console.error("Error fetching doctor prescription data:", error);
        }
      }
    };

    fetchDoctorData();
  }, [selectedDoctor]);

  const handleDoctorChange = (event: SelectChangeEvent) => {
    setSelectedDoctor(event.target.value);
  };

  // Chart colors
  const chartColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main || '#4caf50',
    warning: theme.palette.warning.main || '#ff9800',
    error: theme.palette.error.main || '#f44336',
    info: theme.palette.info.main || '#2196f3',
    lightPrimary: alpha(theme.palette.primary.main, 0.7),
    lightSecondary: alpha(theme.palette.secondary.main, 0.7),
    lightSuccess: alpha('#4caf50', 0.7),
    lightWarning: alpha('#ff9800', 0.7),
  };

  // Helper function to get month name
  const getMonthName = (month: number) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1];
  };

  // Helper function to format date
  const formatDate = (year: number, month: number, day?: number) => {
    if (day) {
      return `${day}/${month}`;
    }
    return `${getMonthName(month)} ${year}`;
  };

  // Prepare chart data from API responses
  const patientMonthlyData = patientData?.last6Months.map(d => ({
    month: getMonthName(d.month),
    patients: d.count,
    label: `${getMonthName(d.month)} ${d.year}`
  })) || [];

  const patientDailyData = patientData?.last6Days.map(d => ({
    day: `${d.day}/${d.month}`,
    patients: d.count,
    label: formatDate(d.year, d.month, d.day)
  })) || [];

  // Medicine purchase and sale data combined
  const medicineData = purchaseData.map((purchase) => {
    const sale = saleData.find(s => s.year === purchase.year && s.month === purchase.month);
    return {
      month: getMonthName(purchase.month),
      purchase: purchase.netPurchaseAmount,
      sales: sale?.totalSalesAmount || 0,
      label: `${getMonthName(purchase.month)} ${purchase.year}`
    };
  });

  // Panchakarma purchase and sale data
  const panchakarmaData = panchakarmaPurchaseData.map((purchase) => {
    const sale = panchakarmaSaleData.find(s => s.year === purchase.year && s.month === purchase.month);
    return {
      month: getMonthName(purchase.month),
      purchase: purchase.netPurchaseAmount,
      sales: sale?.totalSalesAmount || 0,
      label: `${getMonthName(purchase.month)} ${purchase.year}`
    };
  });

  // Calculate totals for cards
  const totalPatients = patientData?.last6Months.reduce((sum, d) => sum + d.count, 0) || 0;
  const totalPurchaseAmount = purchaseData.reduce((sum, d) => sum + d.netPurchaseAmount, 0);
  const totalSalesAmount = saleData.reduce((sum, d) => sum + d.totalSalesAmount, 0);
  const totalDueAmount = saleData.reduce((sum, d) => sum + d.dueAmount, 0);
  const totalInvoices = saleData.reduce((sum, d) => sum + d.totalInvoices, 0);

  // Sample data for charts (keeping some existing charts)
  const patientsByDepartment = [
    { id: 0, value: 65, label: 'General', color: chartColors.primary },
    { id: 1, value: 35, label: 'Piles', color: chartColors.secondary },
    { id: 2, value: 25, label: 'Spine', color: chartColors.success },
  ];

  const treatmentData = [
    { x: 100, y: 200, id: 1 },
    { x: 120, y: 100, id: 2 },
    { x: 170, y: 300, id: 3 },
    { x: 140, y: 250, id: 4 },
    { x: 150, y: 400, id: 5 },
    { x: 110, y: 280, id: 6 },
  ];  // Card styling
  const cardStyle = {
    height: '100%',
    borderRadius: 2,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    transition: 'none',
    overflow: 'visible',
    // Removed hover transform/elevation to keep cards flat
  };

  const cardHeaderStyle = {
    pb: 0,
    '& .MuiCardHeader-title': {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
  };

  return (
    <>
    <CssBaseline />
    <Box sx={{
      flexGrow: 1,
      p: 3,
      background: 'linear-gradient(to bottom, #f9fafc, #eef2f7)',
      height: '100vh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      position: 'relative'
    }}>
      <Box mb={4}>
        <HeadingText name="Dashboard" />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ overflow: 'visible' }}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Patients (6 months)
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {totalPatients}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Last 6 months
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Sales
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  ₹{totalSalesAmount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Invoices: {totalInvoices}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Purchases
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  ₹{totalPurchaseAmount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Medicine & Panchakarma
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Due Amount
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  ₹{totalDueAmount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Outstanding payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Patient Registration Trend - Last 6 Months */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Patient Registration Trend"
                sx={cardHeaderStyle}
                subheader="Last 6 months"
              />
              <CardContent>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: patientMonthlyData.map(d => d.month),
                    tickLabelStyle: {
                      fontSize: 12,
                    },
                  }]}
                  series={[{
                    data: patientMonthlyData.map(d => d.patients),
                    label: 'New Patients',
                    color: chartColors.primary,
                    valueFormatter: (value) => `${value} patients`,
                  }]}
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  slotProps={{
                    legend: { },
                    tooltip: {
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Patient Registration - Last 6 Days */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Daily Patient Registrations"
                sx={cardHeaderStyle}
                subheader="Last 6 days"
              />
              <CardContent>
                <LineChart
                  xAxis={[{
                    data: patientDailyData.map(d => d.day),
                    scaleType: 'point',
                    tickLabelStyle: {
                      fontSize: 12,
                    },
                  }]}
                  series={[
                    {
                      data: patientDailyData.map(d => d.patients),
                      label: 'Patients',
                      color: chartColors.primary,
                      valueFormatter: (value) => value ? `${value} patients` : '',
                      showMark: true,
                      area: true,
                    }
                  ]}
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Medicine Purchase & Sales */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Medicine Analysis"
                sx={cardHeaderStyle}
                subheader="Purchase vs Sales"
              />
              <CardContent>
                <LineChart
                  xAxis={[{
                    data: medicineData.map(d => d.month),
                    scaleType: 'point',
                    tickLabelStyle: {
                      fontSize: 12,
                    },
                  }]}
                  series={[
                    {
                      data: medicineData.map(d => d.purchase),
                      label: 'Purchases (₹)',
                      color: chartColors.warning,
                      valueFormatter: (value) => value ? `₹${value.toLocaleString()}` : '',
                      showMark: true,
                    },
                    {
                      data: medicineData.map(d => d.sales),
                      label: 'Sales (₹)',
                      color: chartColors.success,
                      valueFormatter: (value) => value ? `₹${value.toLocaleString()}` : '',
                      showMark: true,
                    }
                  ]}
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Panchakarma Purchase & Sales */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Panchakarma Analysis"
                sx={cardHeaderStyle}
                subheader="Purchase vs Sales"
              />
              <CardContent>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: panchakarmaData.map(d => d.month),
                    tickLabelStyle: {
                      fontSize: 12,
                    },
                  }]}
                  series={[
                    {
                      data: panchakarmaData.map(d => d.purchase),
                      label: 'Purchases',
                      color: chartColors.info,
                      valueFormatter: (value) => `₹${value?.toLocaleString() || 0}`,
                    },
                    {
                      data: panchakarmaData.map(d => d.sales),
                      label: 'Sales',
                      color: chartColors.success,
                      valueFormatter: (value) => `₹${value?.toLocaleString() || 0}`,
                    }
                  ]}
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
                  slotProps={{
                    legend: { },
                    tooltip: {
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Department Distribution - Keep this as sample data for now */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Patient Distribution"
                sx={cardHeaderStyle}
                subheader="By department"
              />
              <CardContent>
                <PieChart
                  series={[
                    {
                      data: patientsByDepartment,
                      highlightScope: { fade: 'global', highlight: 'item' },
                      innerRadius: 30,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      valueFormatter: (item) => `${item.value} patients`,
                      arcLabel: (item) => `${item.label}: ${item.value}`,
                      arcLabelMinAngle: 45,
                    },
                  ]}
                  height={300}
                  margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  slotProps={{
                    legend: {
                      position: { vertical: 'bottom', horizontal: 'center' },
                    },
                    tooltip: {
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Treatment Analysis */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Treatment Analysis"
                sx={cardHeaderStyle}
                subheader="Duration vs effectiveness correlation"
              />
              <CardContent>
                <ScatterChart
                  series={[
                    {
                      data: treatmentData.map(d => ({ x: d.x, y: d.y, id: d.id })),
                      label: 'Treatment Effectiveness',
                      color: chartColors.warning,
                    },
                  ]}
                  height={300}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  xAxis={[{
                    label: 'Duration (minutes)',
                    min: 80,
                  }]}
                  yAxis={[{
                    label: 'Effectiveness (%)',
                  }]}
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Summary Card */}
          {revenueData && (
            <Grid item xs={12}>
              <Card sx={cardStyle}>
                <CardHeader
                  title="Revenue Summary"
                  sx={cardHeaderStyle}
                  subheader="Overall revenue breakdown"
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Pharmacy Sales
                        </Typography>
                        <Typography variant="h5" color="primary">
                          ₹{revenueData.pharmacy.totalSales.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Paid: ₹{revenueData.pharmacy.totalPaid.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Panchakarma Sales
                        </Typography>
                        <Typography variant="h5" color="secondary">
                          ₹{revenueData.panchakarma.totalSales.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Paid: ₹{revenueData.panchakarma.totalPaid.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total Revenue
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          ₹{revenueData.summary.totalRevenue.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Sales: ₹{revenueData.summary.totalSales.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Net Revenue
                        </Typography>
                        <Typography variant="h5" color="info.main">
                          ₹{revenueData.summary.netRevenue.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          After expenses
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Doctor Prescriptions Calendar */}
          <Grid item xs={12}>
            <Card sx={cardStyle}>
              <CardHeader
                title="Doctor Prescriptions Calendar"
                sx={cardHeaderStyle}
                subheader="Last 30 days prescription count"
                action={
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Select Doctor</InputLabel>
                    <Select
                      value={selectedDoctor}
                      label="Select Doctor"
                      onChange={handleDoctorChange}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          {doctor.firstName} {doctor.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                }
              />
              <CardContent>
                <Box sx={{ height: 250, width: '100%', position: 'relative' }}>
                  {doctorPrescriptionData.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <Typography color="textSecondary">
                        No prescription data available for selected doctor
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                        gap: 1,
                      }}
                    >
                      {Array.from({ length: 30 }, (_, i) => {
                        const dayNum = i + 1;
                        const prescriptionDay = doctorPrescriptionData.find(
                          (d) => d.day === dayNum
                        );
                        const count = prescriptionDay?.count || 0;
                        const today = new Date().getDate();
                        const isToday = dayNum === today;

                        return (
                          <Box
                            key={`day-${i}`}
                            sx={{
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              p: 1,
                              textAlign: 'center',
                              backgroundColor: isToday
                                ? alpha(chartColors.secondary, 0.1)
                                : count > 0
                                ? alpha(chartColors.primary, Math.min(0.1 + count / 10, 0.5))
                                : 'white',
                              borderColor: isToday ? chartColors.secondary : '#e0e0e0',
                            }}
                          >
                            <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>{dayNum}</Box>
                            <Box
                              sx={{
                                fontSize: '0.75rem',
                                p: 0.5,
                                borderRadius: 1,
                                color: count > 5 ? 'white' : 'text.primary',
                              }}
                            >
                              {count} Rx
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
    </>
  );
}

export default Dashboard;
