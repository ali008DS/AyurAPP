import { useState, useEffect } from "react";
import dayjs from "dayjs";
import ApiManager from "../../services/apimanager";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import receiptImage from "../../../assets/raishree-ayurveda-letter-pad-header.png";
import footer from "../../../assets/PreventiveCare.png";
import Rximg from "../../../assets/rx.jpg";
import { PrescriptionPilesType } from "../../department-management/types";
import { Panchakarma } from "../context/PrescriptionContext";

interface Prescription {
  opdId?: string;
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    gender?: string;
    phone?: string;
    dob?: string;
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
  };
  test: any[];
  user:
    | {
        _id: string;
        firstName: string;
        lastName: string;
      }
    | string;
  paymentStatus: string;
  prescriptionType: string;
  status: string;
  medicines: {
    name: string;
    type: string;
    dose: string;
    whenHow: string;
  }[];
  panchakarma: Panchakarma[];
  createdAt: string;
  createOn: string;
  updatedAt: string;
  advice: string;
  both: string;
  complaint: string;
  diagnosis: string;
  dietAndExercise: string;
  generalExamination: string;
  internalNote: string;
  lt: string;
  nextVisit: string;
  rt: string;
}

const calculateAge = (dob: string) => {
  if (!dob) return "";
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

const ReceiptsTab = ({
  patientId,
  presType,
}: {
  patientId: string;
  presType: "piles" | "spine" | "general";
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pilesPrescriptions, setPilesPrescriptions] = useState<
    PrescriptionPilesType[]
  >([]);
  const [generalPrescriptions, setGeneralPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPrescription = async () => {
      try {
        let resp;
        if (presType === "spine") {
          resp = await ApiManager.getPrescriptionsByPatientId(patientId);
        } else if (presType === "piles") {
          resp = await ApiManager.getPilesPrescriptionsByPatientId(patientId);
        } else if (presType === "general") {
          resp = await ApiManager.getGeneralPrescriptionsByPatientId(patientId);
        }
        // Sort prescriptions by date (newest first)
        const sortedPrescriptions = resp?.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (presType === "piles") {
          setPilesPrescriptions(sortedPrescriptions);
        } else if (presType === "general") {
          setGeneralPrescriptions(sortedPrescriptions);
        } else {
          setPrescriptions(sortedPrescriptions);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prescription:", error);
        setLoading(false);
      }
    };

    fetchLatestPrescription();
  }, [patientId]);

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

  if (prescriptions.length === 0 && pilesPrescriptions.length === 0 && generalPrescriptions.length === 0) {
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
        {prescriptions.map((prescription) => (
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
                    sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                  >
                    {`${prescription.patient.firstName} ${prescription.patient?.lastName}`}
                    {prescription.patient?.dob && (
                      <span
                        style={{ fontSize: "0.8rem", fontWeight: "normal" }}
                      >
                        {" "}
                        ({calculateAge(prescription.patient.dob)} years
                        {prescription.patient?.gender
                          ? `, ${prescription.patient.gender}`
                          : ""}
                        )
                        {prescription.patient?.phone &&
                          ` - ${prescription.patient.phone}`}
                      </span>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Date: </strong>{" "}
                    {prescription.createOn
                      ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                      : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                    <strong>Doctor:</strong>{" "}
                    {typeof prescription.user === "string"
                      ? prescription.user || "Dr. Manish"
                      : prescription.user?.firstName
                      ? `${prescription.user.firstName} ${prescription.user.lastName}`
                      : "Dr. Manish"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>OPD ID:</strong>{" "}
                    {prescription.opdId ? prescription.opdId : "N/A"}
                  </Typography>
                </Box>
              </Box>

              <CardMedia
                component="img"
                height="auto"
                image={receiptImage}
                alt="Receipt"
                sx={{
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  width: "98%",
                  mx: "auto",
                }}
              />
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
                      Tests Prescribed:
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

                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    mt: 2,
                    maxHeight: "160px",
                  }}
                  src={footer}
                  alt="Receipt"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
        {pilesPrescriptions.map((prescription) => (
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
                    sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                  >
                    {`${prescription.patient.firstName} ${prescription.patient?.lastName}`}
                    {prescription.patient?.dob && (
                      <span
                        style={{ fontSize: "0.8rem", fontWeight: "normal" }}
                      >
                        {" "}
                        ({calculateAge(prescription.patient.dob)} years
                        {prescription.patient?.gender
                          ? `, ${prescription.patient.gender}`
                          : ""}
                        )
                        {prescription.patient?.phone &&
                          ` - ${prescription.patient.phone}`}
                      </span>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Date:</strong>{" "}
                    {prescription.createOn
                      ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                      : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                    <strong>Doctor: </strong>
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
                    <strong>OPD ID:</strong>{" "}
                    {prescription.opdId ? prescription.opdId : "N/A"}
                  </Typography>
                </Box>
              </Box>

              <CardMedia
                component="img"
                height="auto"
                image={receiptImage}
                alt="Receipt"
                sx={{
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  width: "98%",
                  mx: "auto",
                }}
              />
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
                    {prescription?.medicines?.map((medicine, index) => (
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
                      Tests Prescribed:
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

                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    mt: 2,
                    maxHeight: "160px",
                  }}
                  src={footer}
                  alt="Receipt"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
        {generalPrescriptions.map((prescription) => (
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
                    sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                  >
                    {`${prescription.patient.firstName} ${prescription.patient?.lastName}`}
                    {prescription.patient?.dob && (
                      <span
                        style={{ fontSize: "0.8rem", fontWeight: "normal" }}
                      >
                        {" "}
                        ({calculateAge(prescription.patient.dob)} years
                        {prescription.patient?.gender
                          ? `, ${prescription.patient.gender}`
                          : ""}
                        )
                        {prescription.patient?.phone &&
                          ` - ${prescription.patient.phone}`}
                      </span>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    <strong>Date: </strong>{" "}
                    {prescription.createOn
                      ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                      : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                    <strong>Doctor: </strong>
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
                    <strong>OPD ID:</strong>{" "}
                    {prescription.opdId ? prescription.opdId : "N/A"}
                  </Typography>
                </Box>
              </Box>

              <CardMedia
                component="img"
                height="auto"
                image={receiptImage}
                alt="Receipt"
                sx={{
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  width: "98%",
                  mx: "auto",
                }}
              />
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
                    {prescription?.medicines?.map((medicine, index) => (
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
                        ? new Date(prescription.nextVisit).toLocaleDateString()
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
                      Tests Prescribed:
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

                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    mt: 2,
                    maxHeight: "160px",
                  }}
                  src={footer}
                  alt="Receipt"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReceiptsTab;
