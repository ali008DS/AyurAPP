import { useRef, useEffect } from "react";
import dayjs from "dayjs";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import { X, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import Rximg from "../../assets/rx.jpg";
import { PrescriptionPilesType } from "../department-management/types";
import CarePlanReceipt from "./CarePlanReceipt";
import { useAppContext } from "../../context/app-context";
import ApiManager from "../services/apimanager";
import { getTenantData } from "../../utils/tenant";

// const printOnlyStyles = {
//   "@media screen": {
//     display: "none",
//   },
//   "@media print": {
//     display: "flex",
//   },
// };

interface PrintPilesPrescriptionProps {
  open: boolean;
  onClose: () => void;
  prescription: PrescriptionPilesType | null;
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

const PrintPilesPrescription = ({
  open,
  onClose,
  prescription,
}: PrintPilesPrescriptionProps) => {
  const { websiteIdentity, updateWebsiteIdentity } = useAppContext();
  const componentRef = useRef<HTMLDivElement>(null);

  // Load prescription images when drawer opens
  useEffect(() => {
    const loadPrescriptionImages = async () => {
      if (!open) return;

      try {
        const tenantData = getTenantData();
        if (!tenantData?._id) return;

        const response = await ApiManager.getAppInfoByTenant(tenantData._id);
        if (response.status && response.data && response.data.imageUrls) {
          // Update context with signed URLs for prescription images
          const updates: any = {};
          if (response.data.imageUrls.prescriptionHeader) {
            updates.prescriptionHeader = response.data.imageUrls.prescriptionHeader;
          }
          if (response.data.imageUrls.prescriptionBackground) {
            updates.prescriptionBackground = response.data.imageUrls.prescriptionBackground;
          }
          if (response.data.imageUrls.prescriptionFooter) {
            updates.prescriptionFooter = response.data.imageUrls.prescriptionFooter;
          }
          if (Object.keys(updates).length > 0) {
            updateWebsiteIdentity(updates);
          }
        }
      } catch (error) {
        console.error("Error loading prescription images:", error);
      }
    };

    loadPrescriptionImages();
  }, [open, updateWebsiteIdentity]);

  const handlePrint = useReactToPrint({
    documentTitle: "Prescription",
    contentRef: componentRef,
    pageStyle: `
      @page { size: A4 portrait; margin: 1mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  if (!prescription) return null;

  const items = [
    {
      label: "Gen-Ex / Lab / History",
      value: prescription.generalExamination || "",
    },
    {
      label: "Menstrual History",
      value: prescription.menstrualHistory || "",
    },
    {
      label: "Complaints",
      value: prescription.complaint || "",
    },
    {
      label: "Diagnosis",
      value: prescription.diagnosis || "",
    },
  ];
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box
        className="custom-scrollbar"
        sx={{ px: 1, height: "100vh", position: "relative", overflowY: "auto" }}
      >
        {/* top bar - made sticky */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "white",
            p: 1,
            borderRadius: 1,
            position: "sticky",
            top: 0,
            gap: 2,
            zIndex: 1000,
            borderBottom: "1px solid #eee",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{
              textTransform: "none",
              minWidth: 200,
              border: "1px dashed",
              bgcolor: "rgba(25, 118, 210, 0.05)",
            }}
            startIcon={<Printer size={18} />}
            onClick={() => handlePrint()}
          >
            Print Prescription
          </Button>
          <IconButton
            color="error"
            sx={{ height: 33, width: 33 }}
            size="small"
            onClick={onClose}
          >
            <X size={22} />
          </IconButton>
        </Box>{" "}
        <Box
          sx={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Box ref={componentRef}>
            <Box
              sx={{
                position: "relative",
                width: "210mm",
                minHeight: "297mm",
                paddingy: 5,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
              }}
            >
              {/* Prescription Background */}
              {websiteIdentity.prescriptionBackground && (
                <Box
                  component="img"
                  src={websiteIdentity.prescriptionBackground}
                  alt="Background"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80%",
                    height: "auto",
                    opacity: 0.1,        // 👈 70% visible
                    objectFit: "contain",
                    zIndex: 0,
                    pointerEvents: "none" // optional (prevents blocking clicks)
                  }}
                />
              )}


              {/* Prescription Header */}
              {websiteIdentity.prescriptionHeader && (
                <Box
                  component="img"
                  src={websiteIdentity.prescriptionHeader}
                  alt="Header"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "200px",
                    objectFit: "contain",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Prescription Footer */}
              {websiteIdentity.prescriptionFooter && (
                <Box
                  component="img"
                  src={websiteIdentity.prescriptionFooter}
                  alt="Footer"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "150px",
                    objectFit: "contain",
                    zIndex: 1,
                  }}
                />
              )}

              <Typography
                sx={{
                  textTransform: "capitalize",
                  fontSize: 12,
                  fontWeight: 800,
                  position: "absolute",
                  bottom: 50,
                  right: 50,
                  zIndex: 2,
                }}
              >
                {prescription.nextVisit &&
                  dayjs(prescription.nextVisit).format("DD/MM/YYYY")}
              </Typography>

              <Box sx={{ mt: 27, px: 5, zIndex: 2, position: "relative" }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12}>
                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontSize: 18,
                      }}
                    >
                      <strong>
                        {`${prescription.patient.firstName} ${prescription.patient?.lastName}  `}
                      </strong>
                      (
                      {prescription.opdId
                        ? prescription.opdId + "-"
                        : prescription.patient.opdId + "-"}
                      {calculateAge(prescription.patient.dob || "")} Y/
                      {prescription.patient.gender &&
                        prescription.patient.gender[0].toUpperCase()}
                      ) - {prescription.patient.phone} |{" "}
                      <strong>UHID No:</strong>{" "}
                      {prescription.patient.uhId &&
                        `RAH${prescription.patient.uhId}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3.5}>
                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontSize: 12,
                      }}
                    >
                      <strong>{prescription.patient.relationship}: </strong>
                      {/* {prescription.patient.attendantName || '-'} */}
                      {prescription.patient.relativeName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3.5}>
                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontSize: 12,
                      }}
                    >
                      <strong>Doctor Name: </strong>
                      <em>Dr. </em>{" "}
                      {typeof prescription.user === "string"
                        ? prescription.user || "Manish"
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
                          ).firstName
                          } ${(
                            prescription.user as {
                              firstName: string;
                              lastName: string;
                            }
                          ).lastName
                          }`
                          : "Manish"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2.5}>
                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontSize: 12,
                      }}
                    >
                      <strong>Date: </strong>
                      {prescription.createOn
                        ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                        : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2.5}>
                    <Typography
                      sx={{
                        textTransform: "uppercase",
                        fontSize: 12,
                      }}
                    >
                      <strong>Time: </strong>
                      {new Date(
                        prescription.createOn
                          ? prescription.createOn
                          : prescription.createdAt
                      ).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontSize: 12,
                        color: "#555",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {items
                        .filter((i) => i.value)
                        .map((item, index) => (
                          <span key={index}>
                            {index > 0 && <span> | </span>}
                            <strong>{item.label} : </strong>
                            {item.value}
                          </span>
                        ))}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 10,
                        color: "#555",
                        display: "inline-flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {prescription.prescriptionType === "offline" ? (
                        <>
                          <span>
                            <strong>BP:</strong>{" "}
                            {prescription.vitals?.bpSystolic || "-"} /{" "}
                            {prescription.vitals?.bpDiastolic || "-"} mmHg
                          </span>
                          <span>
                            <strong>Pulse:</strong>{" "}
                            {prescription.vitals?.pulse
                              ? `${prescription.vitals.pulse} bpm`
                              : "-"}
                          </span>
                          <span>
                            <strong>Height:</strong>{" "}
                            {prescription.vitals?.height
                              ? `${prescription.vitals.height} cm`
                              : "-"}
                          </span>
                          <span>
                            <strong>Weight:</strong>{" "}
                            {prescription.vitals?.weight
                              ? `${prescription.vitals.weight} kg`
                              : "-"}
                          </span>
                          <span>
                            <strong>BMI:</strong>{" "}
                            {prescription.vitals?.bmi
                              ? `${prescription.vitals.bmi} kg/m²`
                              : "-"}
                          </span>
                          <span>
                            <strong>SpO2:</strong>{" "}
                            {prescription.vitals?.spo2
                              ? `${prescription.vitals.spo2} %`
                              : "-"}
                          </span>
                          <span>
                            <strong>RBS:</strong>{" "}
                            {prescription.vitals?.rbs
                              ? `${prescription.vitals.rbs} mg/dL`
                              : "-"}
                          </span>
                          <span>
                            <strong>Abd. Girth:</strong>{" "}
                            {prescription.vitals?.abdGrith
                              ? `${prescription.vitals.abdGrith} cm`
                              : "-"}
                          </span>
                          <span>
                            <strong>C.V.S:</strong>{" "}
                            {prescription.vitals?.cvs
                              ? `${prescription.vitals.cvs}`
                              : "-"}
                          </span>
                          <span>
                            <strong>C.N.S:</strong>{" "}
                            {prescription.vitals?.cns
                              ? `${prescription.vitals.cns}`
                              : "-"}
                          </span>
                        </>
                      ) : (
                        <Box sx={{ fontStyle: "italic", fontSize: 14 }}>
                          * Patient was consulted through an online digital
                          platform due to long-distance constraints and
                          immobility.
                        </Box>
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {prescription?.diagnosticDetails?.painIntensity !==
                        "0" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Pain type : </strong>
                              {Array.isArray(prescription.diagnosticDetails?.painType)
                                ? prescription.diagnosticDetails?.painType.join(", ")
                                : prescription.diagnosticDetails?.painType}
                            </Typography>
                          </Box>
                        )}
                      {prescription?.diagnosticDetails?.bleedingIntensity !==
                        "0" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Bleeding type : </strong>
                              {Array.isArray(prescription.diagnosticDetails?.bleedingType)
                                ? prescription.diagnosticDetails?.bleedingType.join(", ")
                                : prescription.diagnosticDetails?.bleedingType}
                            </Typography>
                          </Box>
                        )}
                      {prescription?.diagnosticDetails?.burning != "0" && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Burning : </strong>
                            {prescription.diagnosticDetails?.burning}
                          </Typography>
                        </Box>
                      )}
                      {prescription?.diagnosticDetails?.itching != "0" && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Itching : </strong>
                            {prescription.diagnosticDetails?.itching}
                          </Typography>
                        </Box>
                      )}

                      {prescription?.diagnosticDetails?.painDuration && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Pain Duration : </strong>
                            {prescription.diagnosticDetails?.painDuration}
                          </Typography>
                        </Box>
                      )}

                      {prescription?.diagnosticDetails?.analBulgingSwelling !=
                        "0" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Anal verge Bulging : </strong>
                              {
                                prescription.diagnosticDetails
                                  ?.analBulgingSwelling
                              }
                            </Typography>
                          </Box>
                        )}

                      {prescription?.diagnosticDetails?.discharge != "0" && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Discharge type : </strong>
                            {Array.isArray(prescription.diagnosticDetails?.dischargeType)
                              ? prescription.diagnosticDetails?.dischargeType.join(", ")
                              : prescription.diagnosticDetails?.dischargeType}
                          </Typography>
                        </Box>
                      )}

                      {prescription?.diagnosticDetails?.bowelHabits?.length && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Bowel habits : </strong>
                            {prescription.diagnosticDetails?.bowelHabits.join(
                              ", "
                            )}
                          </Typography>
                        </Box>
                      )}

                      {prescription?.diagnosticDetails?.sittingTime && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Sitting time : </strong>
                            {prescription.diagnosticDetails?.sittingTime}
                          </Typography>
                        </Box>
                      )}

                      {prescription?.diagnosticDetails?.mucusInStool ===
                        "Yes" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Mucus in Stool : </strong>
                              {prescription.diagnosticDetails?.mucusInStool}
                            </Typography>
                          </Box>
                        )}

                      {prescription?.diagnosticDetails?.diarrhea === "Yes" && (
                        <Box>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Diarrhea : </strong>
                            {prescription.diagnosticDetails?.diarrhea}
                          </Typography>
                        </Box>
                      )}

                      {prescription?.diagnosticDetails?.fecalUrgeAfterMeal ===
                        "Yes" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Fecal urgue after meal : </strong>
                              {prescription.diagnosticDetails?.fecalUrgeAfterMeal}
                            </Typography>
                          </Box>
                        )}
                      {prescription?.diagnosticDetails?.fecalUrgeWithoutMeal ===
                        "Yes" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Fecal urgue without meal : </strong>
                              {
                                prescription.diagnosticDetails
                                  ?.fecalUrgeWithoutMeal
                              }
                            </Typography>
                          </Box>
                        )}
                      {prescription?.diagnosticDetails
                        ?.fecalFlatulenceIncontinence === "Yes" && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Fecal/Flatulence Incontinence : </strong>
                              {
                                prescription.diagnosticDetails
                                  ?.fecalFlatulenceIncontinence
                              }
                            </Typography>
                          </Box>
                        )}
                      {prescription?.diagnosticDetails?.digestiveDisorders
                        ?.length && (
                          <Box>
                            <Typography
                              sx={{
                                textTransform: "capitalize",
                                fontSize: 12,
                                color: "#555",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 5,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <strong>Digestive disorder : </strong>
                              {prescription.diagnosticDetails?.digestiveDisorders.join(
                                ", "
                              )}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                  </Grid>
                </Grid>
                <Box>
                  {prescription.panchakarma &&
                    prescription.panchakarma.length > 0 && (
                      <>
                        <Typography
                          sx={{
                            textTransform: "capitalize",
                            fontSize: 12,
                            color: "#555",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: "vertical",
                            textOverflow: "ellipsis",
                            pt: 2,
                          }}
                        >
                          <strong>Panchakarma</strong>
                        </Typography>
                        <table>
                          <thead>
                            <tr>
                              <th
                                style={{
                                  margin: "0px",
                                  minWidth: 50,
                                }}
                              >
                                ◆
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "5px",
                                  color: "#333",
                                  fontSize: 13,
                                  minWidth: 200,
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                Therapy
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "5px",
                                  minWidth: 150,
                                  color: "#333",
                                  fontSize: 13,
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                Oil
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "5px",
                                  minWidth: 70,
                                  color: "#333",
                                  fontSize: 13,
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                Quantity
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "5px",
                                  fontSize: 13,
                                  color: "#333",
                                  fontFamily: "Nunito, sans-serif",
                                  whiteSpace: "nowrap",
                                  minWidth: 70,
                                }}
                              >
                                Time
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "5px",
                                  fontSize: 13,
                                  minWidth: 50,
                                  color: "#333",
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                Days
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.panchakarma?.map(
                              (panchakarma, index) => (
                                <tr key={index}>
                                  <td
                                    style={{
                                      padding: "2px",
                                      textAlign: "center",
                                      margin: "0px",
                                      fontWeight: 600,
                                      minWidth: 30,
                                      color: "#333",
                                      fontSize: 13,
                                      fontFamily: "Nunito, sans-serif",
                                    }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td
                                    style={{
                                      padding: "2px",
                                      paddingLeft: "6px",
                                      textAlign: "left",
                                      margin: "0px",
                                      fontSize: 13,
                                      color: "#555",
                                      fontFamily: "Nunito, sans-serif",
                                    }}
                                  >
                                    {panchakarma.therapy}
                                  </td>
                                  <td
                                    style={{
                                      padding: "2px",
                                      paddingLeft: "6px",
                                      margin: "0px",
                                      fontSize: 13,
                                      textTransform: "capitalize",
                                      color: "#555",
                                      fontFamily: "Nunito, sans-serif",
                                    }}
                                  >
                                    {panchakarma.oil}
                                  </td>
                                  <td
                                    style={{
                                      padding: "2px",
                                      margin: "0px",
                                      fontSize: 13,
                                      paddingLeft: "6px",
                                      color: "#555",
                                      fontFamily: "Nunito, sans-serif",
                                    }}
                                  >
                                    {panchakarma.quantity}
                                  </td>
                                  <td
                                    style={{
                                      padding: "2px",
                                      paddingLeft: "6px",
                                      margin: "0px",
                                      color: "#555",
                                      fontSize: 13,
                                      fontFamily: "Nunito, sans-serif",
                                      overflow: "hidden",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 5,
                                      WebkitBoxOrient: "vertical",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {panchakarma.duration} mins
                                  </td>
                                  <td
                                    style={{
                                      padding: "2px",
                                      paddingLeft: "6px",
                                      margin: "0px",
                                      color: "#555",
                                      fontSize: 13,
                                      fontFamily: "Nunito, sans-serif",
                                    }}
                                  >
                                    {panchakarma.days}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </>
                    )}

                  {prescription.medicines &&
                    prescription.medicines.length > 0 && (
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                margin: "0px",
                                minWidth: 20,
                              }}
                            >
                              <Box
                                component="img"
                                src={Rximg}
                                alt="Rx"
                                sx={{
                                  width: 35,
                                  height: 35,
                                  mixBlendMode: "multiply",
                                }}
                              />
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "5px",
                                color: "#333",
                                fontSize: 13,
                                minWidth: 50,
                                fontFamily: "Nunito, sans-serif",
                              }}
                            >
                              Type
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "5px",
                                minWidth: 100,
                                color: "#333",
                                fontSize: 13,
                                fontFamily: "Nunito, sans-serif",
                              }}
                            >
                              Medicine
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "5px",
                                minWidth: 70,
                                color: "#333",
                                fontSize: 13,
                                fontFamily: "Nunito, sans-serif",
                              }}
                            >
                              Dose
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "5px",
                                fontSize: 13,
                                color: "#333",
                                fontFamily: "Nunito, sans-serif",
                                whiteSpace: "nowrap",
                              }}
                            >
                              When & How
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescription.medicines.map((medicine, index) => (
                            <tr key={index}>
                              <td
                                style={{
                                  padding: "2px",
                                  textAlign: "center",
                                  margin: "0px",
                                  fontWeight: 600,
                                  minWidth: 30,
                                  color: "#333",
                                  fontSize: 13,
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                {index + 1}
                              </td>
                              <td
                                style={{
                                  padding: "2px",
                                  paddingLeft: "6px",
                                  textAlign: "left",
                                  margin: "0px",
                                  fontSize: 13,
                                  color: "#555",
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                {medicine.type}
                              </td>
                              <td
                                style={{
                                  padding: "2px",
                                  paddingLeft: "6px",
                                  margin: "0px",
                                  fontSize: 13,
                                  textTransform: "capitalize",
                                  color: "#555",
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                {medicine.name}
                              </td>
                              <td
                                style={{
                                  padding: "2px",
                                  margin: "0px",
                                  fontSize: 13,
                                  paddingLeft: "6px",
                                  color: "#555",
                                  fontFamily: "Nunito, sans-serif",
                                }}
                              >
                                {medicine.dose}
                              </td>
                              <td
                                style={{
                                  padding: "2px",
                                  paddingLeft: "6px",
                                  margin: "0px",
                                  color: "#555",
                                  fontSize: 13,
                                  fontFamily: "Nunito, sans-serif",
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 5,
                                  WebkitBoxOrient: "vertical",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {medicine.whenHow}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </Box>
                <Box mt={4}>
                  {/* MIddle setion with advice , SLR and Tests  */}
                  <Grid container spacing={0.5}>
                    {/* Advice — only show if present */}
                    {prescription.advice && (
                      <Grid item xs={12}>
                        <Typography
                          sx={{
                            textTransform: "capitalize",
                            fontSize: 12,
                            color: "#555",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: "vertical",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <strong>Advice : </strong>
                          {prescription.advice}
                        </Typography>
                      </Grid>
                    )}

                    {/* Tests — only show if at least one test exists */}
                    {Array.isArray(prescription.test) &&
                      prescription.test.some(
                        (center) =>
                          Array.isArray(center.test) && center.test.length > 0
                      ) && (
                        <Grid item xs={12}>
                          <Typography
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 12,
                              color: "#555",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>Tests Prescribed : </strong>
                          </Typography>

                          <Box mt={0.2}>
                            {prescription.test.map((center, index) => (
                              <Box key={index}>
                                {Array.isArray(center.test) &&
                                  center.test.map(
                                    (test: any, testIndex: number) => (
                                      <Typography
                                        key={testIndex}
                                        fontSize={12}
                                        color="#555"
                                        display="inline"
                                        mr={1}
                                      >
                                        <Typography
                                          fontSize={12}
                                          component="span"
                                          fontWeight={700}
                                          ml={0.5}
                                        >
                                          • {test.name} :{" "}
                                        </Typography>
                                        {test.notes}
                                      </Typography>
                                    )
                                  )}
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}
                  </Grid>
                </Box>
              </Box>
            </Box>

            <CarePlanReceipt prescriptionId={prescription._id} />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PrintPilesPrescription;
