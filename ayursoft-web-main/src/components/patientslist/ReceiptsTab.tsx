import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import PrintPrescriptionDrawer from "./PrintPrescriptionDrawer";
import ApiManager from "../services/apimanager";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Printer, HandCoins } from "lucide-react";
import Rximg from "../../assets/rx.jpg";
import { PrescriptionPilesType } from "../department-management/types";
import PrintPilesPrescription from "./PrintPilesPrescriptionDrawer";
import { Panchakarma } from "../prescription/context/PrescriptionContext";
import { useAppContext } from "../../context/app-context";
import { getTenantData } from "../../utils/tenant";

export interface Prescription {
  _id: string;
  patient: {
    _id: string;
    opdId?: string;
    patientId?: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    dob: string;
    attendantName?: string;
    relationship?: string;
    relativeName?: string;
    uhId: string;
  };
  vitals: {
    bpSystolic: string;
    bpDiastolic: string;
    pulse: string;
    height: string;
    weight: string;
    bmi: string;
    spo2: string;
    rbs: string;
    abdGrith: string;
    cvs?: string;
    cns?: string;
  };
  test: any;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  department: {
    _id?: string;
    name: string;
  };
  paymentStatus: string;
  prescriptionType: string;
  status: string;
  medicines: {
    name: string;
    type: string;
    dose: string;
    whenHow: string;
  }[];
  panchakarma?: Panchakarma[];
  createdAt: string;
  createOn?: string;
  opdId?: string;
  updatedAt: string;
  advice: string;
  both: string;
  complaint: string;
  diagnosis: string;
  dietAndExercise: string;
  generalExamination: string;
  menstrualHistory: string;
  internalNote: string;
  lt: string;
  nextVisit: string;
  rt: string;
}

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const ReceiptsTab = ({ patientId }: { patientId: string }) => {
  const { websiteIdentity, updateWebsiteIdentity } = useAppContext();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pilesPrescription, setPilesPrescription] = useState<
    PrescriptionPilesType[]
  >([]);
  const [generalPrescriptions, setGeneralPrescriptions] = useState<Prescription[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [selectedPilesPrescription, setSelectedPilesPrescription] =
    useState<PrescriptionPilesType | null>(null);
  const [selectedGeneralPrescription, setSelectedGeneralPrescription] =
    useState<Prescription | null>(null);
  const imagesLoadedRef = useRef(false);

  // Load prescription images when component mounts
  useEffect(() => {
    const loadPrescriptionImages = async () => {
      // Prevent multiple loads
      if (imagesLoadedRef.current) return;

      try {
        const tenantData = getTenantData();
        if (!tenantData?._id) return;

        const response = await ApiManager.getAppInfoByTenant(tenantData._id);
        if (response.status && response.data && response.data.imageUrls) {
          // Update context with signed URLs for prescription images (header and footer, no background)
          const updates: any = {};
          if (response.data.imageUrls.prescriptionHeader) {
            updates.prescriptionHeader = response.data.imageUrls.prescriptionHeader;
          }
          if (response.data.imageUrls.prescriptionFooter) {
            updates.prescriptionFooter = response.data.imageUrls.prescriptionFooter;
          }
          if (Object.keys(updates).length > 0) {
            updateWebsiteIdentity(updates);
            imagesLoadedRef.current = true;
          }
        }
      } catch (error) {
        console.error("Error loading prescription images:", error);
      }
    };

    loadPrescriptionImages();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescResp, pilesResp, generalResp, deptResp] = await Promise.all([
          ApiManager.getPrescriptionsByPatientId(patientId),
          ApiManager.getPilesPrescriptionsByPatientId(patientId),
          ApiManager.getGeneralPrescriptionsByPatientId(patientId),
          ApiManager.getDepartments(),
        ]);

        const sortedPrescriptions = prescResp.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const sortedPilesPrescriptions = pilesResp.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const sortedGeneralPrescriptions = generalResp.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPilesPrescription(sortedPilesPrescriptions);
        setPrescriptions(sortedPrescriptions);
        setGeneralPrescriptions(sortedGeneralPrescriptions);
        setDepartments(deptResp.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Filter prescriptions based on selected department
  const filteredPrescriptions =
    selectedDepartment === "all"
      ? prescriptions
      : prescriptions.filter(
          (prescription) =>
            prescription.department?._id === selectedDepartment ||
            prescription.department?.name === selectedDepartment
        );

  const filteredPilesPrescriptions =
    selectedDepartment === "all"
      ? pilesPrescription
      : pilesPrescription.filter(
          (prescription) =>
            prescription.department?._id === selectedDepartment ||
            prescription.department?.name === selectedDepartment
        );

  const filteredGeneralPrescriptions =
    selectedDepartment === "all"
      ? generalPrescriptions
      : generalPrescriptions.filter(
          (prescription) =>
            prescription.department?._id === selectedDepartment ||
            prescription.department?.name === selectedDepartment
        );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Only show empty state if there are no prescriptions at all (not just for filtered results)
  if (prescriptions.length === 0 && pilesPrescription.length === 0 && generalPrescriptions.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Typography>No prescriptions found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Department Filter */}
      <Box sx={{ my: 1.5, px: 1 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Department</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            label="Filter by Department"
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept._id} value={dept._id}>
                {dept.name.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>{" "}
      <Grid
        container
        spacing={1}
        sx={{
          pb: 10,
          pr: 1,
          m: 0,
          flex: 1,
          overflowY: "auto",
        }}
        className="custom-scrollbar"
      >
        {/* Show message when no prescriptions match the filter but prescriptions exist */}
        {filteredPrescriptions.length === 0 &&
          filteredPilesPrescriptions.length === 0 &&
          filteredGeneralPrescriptions.length === 0 &&
          (prescriptions.length > 0 || pilesPrescription.length > 0 || generalPrescriptions.length > 0) && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No prescriptions found for the selected department
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Try selecting a different department or "All Departments"
                </Typography>
              </Box>
            </Grid>
          )}

        {filteredPrescriptions.map((prescription) => (
          <Grid item xs={12} key={prescription._id}>
            <Card sx={{ borderRadius: "8px", position: "relative" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: "0.75rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textTransform: "capitalize",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {`${prescription.patient.firstName} ${prescription.patient?.lastName}`}
                    <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                      {" "}
                      ({calculateAge(prescription.patient.dob)} years
                      {prescription.patient?.gender
                        ? `, ${prescription.patient.gender}`
                        : ""}
                      ) - {prescription.patient.phone} |{" "}
                      <strong>Attendant Name:</strong>{" "}
                      {prescription?.patient?.attendantName || "-"}
                    </span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Date: </strong>{" "}
                    {prescription.createOn
                      ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                      : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                    <strong>Doctor : </strong>{" "}
                    {prescription.user?.firstName
                      ? `${prescription.user.firstName.toUpperCase()} ${prescription.user.lastName.toUpperCase()}`
                      : "DR. MANISH"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Department:</strong>{" "}
                    {prescription.department?.name ??
                      (prescription.department || "-")}
                  </Typography>
                  {(() => {
                    // Find first test with marketPrice or discountedPrice
                    const testWithPrice = Array.isArray(prescription.test)
                      ? prescription.test
                          .flatMap((center) => center.test)
                          .find((t) => t.marketPrice || t.discountedPrice)
                      : null;
                    if (testWithPrice) {
                      return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Typography sx={{ fontSize: "0.65rem" }}>
                            <strong>Discounted Price:</strong>{" "}
                            {testWithPrice.discountedPrice ?? "-"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.65rem" }}>
                            <strong>Market Price:</strong>{" "}
                            {testWithPrice.marketPrice ?? "-"}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })()}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    sx={{ backgroundColor: "rgba(77, 255, 77, 0.19)" }}
                    onClick={() => setSelectedPrescription(prescription)}
                  >
                    <Printer size={18} color="#52C41A" />
                  </IconButton>
                  <IconButton
                    sx={{ backgroundColor: "rgba(255, 82, 82, 0.19)" }}
                  >
                    <HandCoins size={18} color="#D4380D" />
                  </IconButton>
                </Box>
              </Box>
              {websiteIdentity.prescriptionHeader && (
                <CardMedia
                  component="img"
                  height="auto"
                  image={websiteIdentity.prescriptionHeader}
                  alt="Receipt Header"
                  sx={{
                    objectFit: "contain",
                    width: "97%",
                    mt: 1,
                    mx: "auto",
                  }}
                />
              )}
              <CardContent sx={{ px: "0.75rem", pb: "0 !important", pt: 0 }}>
                {/* Vitals Section */}
                <Box sx={{ my: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {prescription.prescriptionType === "offline" ? (
                      <>
                        <span>
                          <strong>BP:</strong> {prescription.vitals?.bpSystolic}{" "}
                          / {prescription.vitals?.bpDiastolic}
                        </span>
                        <span>
                          <strong>Pulse:</strong>{" "}
                          {prescription.vitals?.pulse || "-"}
                        </span>
                        <span>
                          <strong>Height:</strong>{" "}
                          {prescription.vitals?.height || "-"}
                        </span>
                        <span>
                          <strong>Weight:</strong>{" "}
                          {prescription.vitals?.weight || "-"}
                        </span>
                        <span>
                          <strong>BMI:</strong>{" "}
                          {prescription.vitals?.bmi || "-"}
                        </span>
                        <span>
                          <strong>SpO2:</strong>{" "}
                          {prescription.vitals?.spo2 || "-"}
                        </span>
                        <span>
                          <strong>RBS:</strong>{" "}
                          {prescription.vitals?.rbs || "-"}
                        </span>
                        <span>
                          <strong>Abd. Girth:</strong>{" "}
                          {prescription.vitals?.abdGrith || "-"}
                        </span>
                        <span>
                          <strong>C.V.S:</strong>{" "}
                          {prescription.vitals?.cvs
                            ? `${prescription.vitals?.cvs}`
                            : "-"}
                        </span>
                        <span>
                          <strong>C.N.S:</strong>{" "}
                          {prescription.vitals?.cns
                            ? `${prescription.vitals?.cns}`
                            : "-"}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontStyle: "italic" }}>
                        Patient was consulted through an online digital platform
                        due to long-distance constraints and immobility.
                      </span>
                    )}
                  </Typography>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>Complaints</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.complaint || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>Diagnosis</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.diagnosis || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>General Examination</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.generalExamination || "-"}
                    </Typography>
                  </Grid>
                </Grid>
                {prescription.panchakarma &&
                  prescription.panchakarma.length > 0 && (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        {/* <Box
                    component="img"
                    src={Rximg}
                    alt="Rx"
                    sx={{
                      width: "20px",
                      height: "20px",
                      mixBlendMode: "multiply",
                      marginRight: 1,
                    }}
                  /> */}
                        <Typography
                          sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Panchakarma
                        </Typography>
                      </Box>
                      <Table
                        sx={{
                          marginTop: "0.1rem",
                          borderCollapse: "collapse",
                          width: "100%",
                          "& th": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "5%",
                              }}
                            >
                              #
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "30%",
                              }}
                            >
                              Therapy
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "25%",
                              }}
                            >
                              Oil
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Quantity
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Time
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Days
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {prescription.panchakarma.map(
                            (panchakarma, index) => (
                              <TableRow key={index}>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {index + 1}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.therapy}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.oil}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.quantity}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.duration}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.days}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </>
                  )}
                {/* Medicines Section */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box
                    component="img"
                    src={Rximg}
                    alt="Rx"
                    sx={{
                      width: "20px",
                      height: "20px",
                      mixBlendMode: "multiply",
                      marginRight: 1,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Medicines
                  </Typography>
                </Box>
                <Table
                  sx={{
                    marginTop: "0.1rem",
                    borderCollapse: "collapse",
                    width: "100%",
                    "& th": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "5%",
                        }}
                      >
                        #
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Medicine
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Dose
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "50%",
                        }}
                      >
                        When & How
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {prescription.medicines.map((medicine, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.type}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.dose}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.whenHow}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Additional Details and Diagnostic Section */}
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Additional Details:
                    </Typography>
                    <Typography color="#555" fontSize={12}>
                      <strong>Advice:</strong> {prescription.advice || "-"}
                    </Typography>
                    <Typography color="#555" fontSize={12}>
                      <strong>Next Visit:</strong>{" "}
                      {prescription.nextVisit
                        ? dayjs(prescription.nextVisit).format("DD/MM/YYYY")
                        : "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Tests Prescribed :
                    </Typography>
                    {Array.isArray(prescription.test) &&
                    prescription.test.length > 0 ? (
                      <Box>
                        {prescription.test.flatMap(
                          (center: any, index: number) =>
                            center.test.map((test: any, testIndex: number) => (
                              <Typography
                                key={`${index}-${testIndex}`}
                                sx={{
                                  fontSize: 11,
                                  color: "#888",
                                  display: "inline",
                                  marginRight: 1,
                                }}
                              >
                                • <strong>{test.name}</strong> : {test.notes}
                              </Typography>
                            ))
                        )}
                      </Box>
                    ) : (
                      <Typography color="#777" fontSize={11}>
                        -
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {websiteIdentity.prescriptionFooter && (
                  <Box
                    component="img"
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      mt: 2,
                      maxHeight: "200px",
                    }}
                    src={websiteIdentity.prescriptionFooter}
                    alt="Receipt Footer"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredPilesPrescriptions.map((prescription) => (
          <Grid item xs={12} key={prescription._id}>
            <Card sx={{ borderRadius: "8px", position: "relative" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: "0.75rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textTransform: "capitalize",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {`${prescription.patient.firstName} ${prescription.patient?.lastName}`}
                    <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                      {" "}
                      ({calculateAge(prescription?.patient?.dob || "")} years
                      {prescription.patient?.gender
                        ? `, ${prescription?.patient?.gender}`
                        : ""}
                      ) - {prescription?.patient?.phone} |{" "}
                      <strong>Attendant Name:</strong>{" "}
                      {prescription?.patient?.attendantName || "-"}
                    </span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Date:</strong>{" "}
                    {prescription.createOn
                      ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                      : dayjs(prescription.createdAt).format("DD/MM/YYYY")}{" "}
                    <strong>Doctor : </strong>{" "}
                    {typeof prescription.user === "string"
                      ? (prescription.user || "Dr. Manish").toUpperCase()
                      : typeof prescription.user === "object" &&
                        prescription.user &&
                        (
                          prescription.user as {
                            firstName?: string;
                            lastName?: string;
                          }
                        ).firstName
                      ? `${(
                          prescription.user as {
                            firstName: string;
                            lastName: string;
                          }
                        ).firstName.toUpperCase()} ${(
                          prescription.user as {
                            firstName: string;
                            lastName: string;
                          }
                        ).lastName.toUpperCase()}`
                      : "DR. MANISH"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Department:</strong>{" "}
                    {prescription.department?.name ??
                      (prescription.department || "-")}
                  </Typography>
                  {(() => {
                    // Find first test with marketPrice or discountedPrice
                    const testWithPrice = Array.isArray(prescription.test)
                      ? prescription.test
                          .flatMap((center) => center.test)
                          .find((t) => t.marketPrice || t.discountedPrice)
                      : null;
                    if (testWithPrice) {
                      return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Typography sx={{ fontSize: "0.65rem" }}>
                            <strong>Discounted Price:</strong>{" "}
                            {testWithPrice.discountedPrice ?? "-"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.65rem" }}>
                            <strong>Market Price:</strong>{" "}
                            {testWithPrice.marketPrice ?? "-"}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })()}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    sx={{ backgroundColor: "rgba(77, 255, 77, 0.19)" }}
                    onClick={() => setSelectedPilesPrescription(prescription)}
                  >
                    <Printer size={18} color="#52C41A" />
                  </IconButton>
                  <IconButton
                    sx={{ backgroundColor: "rgba(255, 82, 82, 0.19)" }}
                  >
                    <HandCoins size={18} color="#D4380D" />
                  </IconButton>
                </Box>
              </Box>

              {websiteIdentity.prescriptionHeader && (
                <CardMedia
                  component="img"
                  height="auto"
                  image={websiteIdentity.prescriptionHeader}
                  alt="Receipt Header"
                  sx={{ objectFit: "contain", backgroundColor: "#f5f5f5" }}
                />
              )}
              <CardContent sx={{ px: "0.75rem", pb: "0 !important", pt: 0 }}>
                {/* Vitals Section */}
                <Box sx={{ my: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {prescription.prescriptionType === "offline" ? (
                      <>
                        <span>
                          <strong>BP:</strong> {prescription.vitals?.bpSystolic}{" "}
                          / {prescription.vitals?.bpDiastolic}
                        </span>
                        <span>
                          <strong>Pulse:</strong>{" "}
                          {prescription.vitals?.pulse || "-"}
                        </span>
                        <span>
                          <strong>Height:</strong>{" "}
                          {prescription.vitals?.height || "-"}
                        </span>
                        <span>
                          <strong>Weight:</strong>{" "}
                          {prescription.vitals?.weight || "-"}
                        </span>
                        <span>
                          <strong>BMI:</strong>{" "}
                          {prescription.vitals?.bmi || "-"}
                        </span>
                        <span>
                          <strong>SpO2:</strong>{" "}
                          {prescription.vitals?.spo2 || "-"}
                        </span>
                        <span>
                          <strong>RBS:</strong>{" "}
                          {prescription.vitals?.rbs || "-"}
                        </span>
                        <span>
                          <strong>Abd. Girth:</strong>{" "}
                          {prescription.vitals?.abdGrith || "-"}
                        </span>
                        <span>
                          <strong>C.V.S:</strong>{" "}
                          {prescription.vitals?.cvs
                            ? `${prescription.vitals?.cvs}`
                            : "-"}
                        </span>
                        <span>
                          <strong>C.N.S:</strong>{" "}
                          {prescription.vitals?.cns
                            ? `${prescription.vitals?.cns}`
                            : "-"}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontStyle: "italic" }}>
                        Patient was consulted through an online digital platform
                        due to long-distance constraints and immobility.
                      </span>
                    )}
                  </Typography>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>Complaints</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.complaint || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>Diagnosis</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.diagnosis || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>General Examination</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.generalExamination || "-"}
                    </Typography>
                  </Grid>
                </Grid>
                {/* Panchakarma Section */}
                {prescription.panchakarma &&
                  prescription.panchakarma.length > 0 && (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        {/* <Box
                    component="img"
                    src={Rximg}
                    alt="Rx"
                    sx={{
                      width: "20px",
                      height: "20px",
                      mixBlendMode: "multiply",
                      marginRight: 1,
                    }}
                  /> */}
                        <Typography
                          sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Panchakarma
                        </Typography>
                      </Box>
                      <Table
                        sx={{
                          marginTop: "0.1rem",
                          borderCollapse: "collapse",
                          width: "100%",
                          "& th": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "5%",
                              }}
                            >
                              #
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "30%",
                              }}
                            >
                              Therapy
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "25%",
                              }}
                            >
                              Oil
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Quantity
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Time
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Days
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {prescription.panchakarma.map(
                            (panchakarma, index) => (
                              <TableRow key={index}>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {index + 1}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.therapy}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.oil}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.quantity}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.duration}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.days}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </>
                  )}
                {/* Medicines Section */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box
                    component="img"
                    src={Rximg}
                    alt="Rx"
                    sx={{
                      width: "20px",
                      height: "20px",
                      mixBlendMode: "multiply",
                      marginRight: 1,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Medicines
                  </Typography>
                </Box>
                <Table
                  sx={{
                    marginTop: "0.1rem",
                    borderCollapse: "collapse",
                    width: "100%",
                    "& th": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "5%",
                        }}
                      >
                        #
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Medicine
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Dose
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "50%",
                        }}
                      >
                        When & How
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {prescription.medicines?.map((medicine, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.type}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.dose}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.whenHow}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Additional Details and Diagnostic Section */}
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Additional Details:
                    </Typography>
                    <Typography color="#555" fontSize={12}>
                      <strong>Advice:</strong> {prescription.advice || "-"}
                    </Typography>
                    <Typography color="#555" fontSize={12}>
                      <strong>Next Visit:</strong>{" "}
                      {prescription.nextVisit
                        ? dayjs(prescription.nextVisit).format("DD/MM/YYYY")
                        : "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Tests Prescribed :
                    </Typography>
                    {Array.isArray(prescription.test) &&
                    prescription.test.length > 0 ? (
                      <Box>
                        {prescription.test.flatMap(
                          (center: any, index: number) =>
                            center.test.map((test: any, testIndex: number) => (
                              <Typography
                                key={`${index}-${testIndex}`}
                                sx={{
                                  fontSize: 11,
                                  color: "#888",
                                  display: "inline",
                                  marginRight: 1,
                                }}
                              >
                                • <strong>{test.name}</strong> : {test.notes}
                              </Typography>
                            ))
                        )}
                      </Box>
                    ) : (
                      <Typography color="#777" fontSize={11}>
                        -
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {websiteIdentity.prescriptionFooter && (
                  <Box
                    component="img"
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      mt: 2,
                      maxHeight: "200px",
                    }}
                    src={websiteIdentity.prescriptionFooter}
                    alt="Receipt Footer"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredGeneralPrescriptions.map((prescription) => (
          <Grid item xs={12} key={prescription._id}>
            <Card sx={{ borderRadius: "8px", position: "relative" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: "0.75rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textTransform: "capitalize",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {`${prescription.patient.firstName} ${prescription.patient?.lastName}`}
                    <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                      {" "}
                      ({calculateAge(prescription.patient.dob)} years
                      {prescription.patient?.gender
                        ? `, ${prescription.patient.gender}`
                        : ""}
                      ) - {prescription.patient.phone} |{" "}
                      <strong>Attendant Name:</strong>{" "}
                      {prescription?.patient?.attendantName || "-"}
                    </span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Date: </strong>{" "}
                    {prescription.createOn
                      ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                      : dayjs(prescription.createdAt).format("DD/MM/YYYY")}{" "}
                    <strong>Doctor : </strong>{" "}
                    {prescription.user?.firstName
                      ? `${prescription.user.firstName.toUpperCase()} ${prescription.user.lastName.toUpperCase()}`
                      : "DR. MANISH"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Department:</strong>{" "}
                    {prescription.department?.name ??
                      (prescription.department || "-")}
                  </Typography>
                  {(() => {
                    // Find first test with marketPrice or discountedPrice
                    const testWithPrice = Array.isArray(prescription.test)
                      ? prescription.test
                          .flatMap((center) => center.test)
                          .find((t) => t.marketPrice || t.discountedPrice)
                      : null;
                    if (testWithPrice) {
                      return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Typography sx={{ fontSize: "0.65rem" }}>
                            <strong>Discounted Price:</strong>{" "}
                            {testWithPrice.discountedPrice ?? "-"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.65rem" }}>
                            <strong>Market Price:</strong>{" "}
                            {testWithPrice.marketPrice ?? "-"}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })()}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    sx={{ backgroundColor: "rgba(77, 255, 77, 0.19)" }}
                    onClick={() => setSelectedGeneralPrescription(prescription)}
                  >
                    <Printer size={18} color="#52C41A" />
                  </IconButton>
                  <IconButton
                    sx={{ backgroundColor: "rgba(255, 82, 82, 0.19)" }}
                  >
                    <HandCoins size={18} color="#D4380D" />
                  </IconButton>
                </Box>
              </Box>
              {websiteIdentity.prescriptionHeader && (
                <CardMedia
                  component="img"
                  height="auto"
                  image={websiteIdentity.prescriptionHeader}
                  alt="Receipt Header"
                  sx={{
                    objectFit: "contain",
                    width: "97%",
                    mt: 1,
                    mx: "auto",
                  }}
                />
              )}
              <CardContent sx={{ px: "0.75rem", pb: "0 !important", pt: 0 }}>
                {/* Vitals Section */}
                <Box sx={{ my: 1 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {prescription.prescriptionType === "offline" ? (
                      <>
                        <span>
                          <strong>BP:</strong> {prescription.vitals?.bpSystolic}{" "}
                          / {prescription.vitals?.bpDiastolic}
                        </span>
                        <span>
                          <strong>Pulse:</strong>{" "}
                          {prescription.vitals?.pulse || "-"}
                        </span>
                        <span>
                          <strong>Height:</strong>{" "}
                          {prescription.vitals?.height || "-"}
                        </span>
                        <span>
                          <strong>Weight:</strong>{" "}
                          {prescription.vitals?.weight || "-"}
                        </span>
                        <span>
                          <strong>BMI:</strong>{" "}
                          {prescription.vitals?.bmi || "-"}
                        </span>
                        <span>
                          <strong>SpO2:</strong>{" "}
                          {prescription.vitals?.spo2 || "-"}
                        </span>
                        <span>
                          <strong>RBS:</strong>{" "}
                          {prescription.vitals?.rbs || "-"}
                        </span>
                        <span>
                          <strong>Abd. Girth:</strong>{" "}
                          {prescription.vitals?.abdGrith || "-"}
                        </span>
                        <span>
                          <strong>C.V.S:</strong>{" "}
                          {prescription.vitals?.cvs
                            ? `${prescription.vitals?.cvs}`
                            : "-"}
                        </span>
                        <span>
                          <strong>C.N.S:</strong>{" "}
                          {prescription.vitals?.cns
                            ? `${prescription.vitals?.cns}`
                            : "-"}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontStyle: "italic" }}>
                        Patient was consulted through an online digital platform
                        due to long-distance constraints and immobility.
                      </span>
                    )}
                  </Typography>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>Complaints</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.complaint || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>Diagnosis</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.diagnosis || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem", color: "#666" }}
                    >
                      <strong>General Examination</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {prescription.generalExamination || "-"}
                    </Typography>
                  </Grid>
                </Grid>
                {prescription.panchakarma &&
                  prescription.panchakarma.length > 0 && (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        {/* <Box
                    component="img"
                    src={Rximg}
                    alt="Rx"
                    sx={{
                      width: "20px",
                      height: "20px",
                      mixBlendMode: "multiply",
                      marginRight: 1,
                    }}
                  /> */}
                        <Typography
                          sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Panchakarma
                        </Typography>
                      </Box>
                      <Table
                        sx={{
                          marginTop: "0.1rem",
                          borderCollapse: "collapse",
                          width: "100%",
                          "& th": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "5%",
                              }}
                            >
                              #
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "30%",
                              }}
                            >
                              Therapy
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "25%",
                              }}
                            >
                              Oil
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Quantity
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Time
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "start",
                                border: "1px solid #ddd",
                                padding: "0.05rem",
                                fontSize: "0.6rem",
                                width: "15%",
                              }}
                            >
                              Days
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {prescription.panchakarma.map(
                            (panchakarma, index) => (
                              <TableRow key={index}>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {index + 1}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.therapy}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.oil}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.quantity}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.duration}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "start",
                                    border: "1px solid #ddd",
                                    padding: "0.05rem",
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {panchakarma.days}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </>
                  )}
                {/* Medicines Section */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box
                    component="img"
                    src={Rximg}
                    alt="Rx"
                    sx={{
                      width: "20px",
                      height: "20px",
                      mixBlendMode: "multiply",
                      marginRight: 1,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Medicines
                  </Typography>
                </Box>
                <Table
                  sx={{
                    marginTop: "0.1rem",
                    borderCollapse: "collapse",
                    width: "100%",
                    "& th": { bgcolor: "rgba(25, 118, 210, 0.04)" },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "5%",
                        }}
                      >
                        #
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Medicine
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "15%",
                        }}
                      >
                        Dose
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "start",
                          border: "1px solid #ddd",
                          padding: "0.05rem",
                          fontSize: "0.6rem",
                          width: "50%",
                        }}
                      >
                        When & How
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {prescription.medicines?.map((medicine, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.type}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.dose}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "start",
                            border: "1px solid #ddd",
                            padding: "0.05rem",
                            fontSize: "0.6rem",
                          }}
                        >
                          {medicine.whenHow}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Additional Details and Diagnostic Section */}
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Additional Details:
                    </Typography>
                    <Typography color="#555" fontSize={12}>
                      <strong>Advice:</strong> {prescription.advice || "-"}
                    </Typography>
                    <Typography color="#555" fontSize={12}>
                      <strong>Next Visit:</strong>{" "}
                      {prescription.nextVisit
                        ? dayjs(prescription.nextVisit).format("DD/MM/YYYY")
                        : "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Tests Prescribed :
                    </Typography>
                    {Array.isArray(prescription.test) &&
                    prescription.test.length > 0 ? (
                      <Box>
                        {prescription.test.flatMap(
                          (center: any, index: number) =>
                            center.test.map((test: any, testIndex: number) => (
                              <Typography
                                key={`${index}-${testIndex}`}
                                sx={{
                                  fontSize: 11,
                                  color: "#888",
                                  display: "inline",
                                  marginRight: 1,
                                }}
                              >
                                • <strong>{test.name}</strong> : {test.notes}
                              </Typography>
                            ))
                        )}
                      </Box>
                    ) : (
                      <Typography color="#777" fontSize={11}>
                        -
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {websiteIdentity.prescriptionFooter && (
                  <Box
                    component="img"
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      mt: 2,
                      maxHeight: "200px",
                    }}
                    src={websiteIdentity.prescriptionFooter}
                    alt="Receipt Footer"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <PrintPrescriptionDrawer
        open={selectedPrescription !== null}
        onClose={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />
      <PrintPilesPrescription
        open={selectedPilesPrescription !== null}
        onClose={() => setSelectedPilesPrescription(null)}
        prescription={selectedPilesPrescription}
      />
      <PrintPrescriptionDrawer
        open={selectedGeneralPrescription !== null}
        onClose={() => setSelectedGeneralPrescription(null)}
        prescription={selectedGeneralPrescription}
      />
    </Box>
  );
};

export default ReceiptsTab;
