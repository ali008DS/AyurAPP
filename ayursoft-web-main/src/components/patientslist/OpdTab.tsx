import {
  Button,
  Box,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import CreatePrescriptionDialog from "../create-prescription/create-dialog";
import ApiManager from "../services/apimanager";
import { BadgeIndianRupee, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../ui/confirmation-dialog";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  city: string;
  state: string;
  status: string;
}

interface Prescription {
  _id: string;
  paymentStatus: string;
  createdAt: string;
  createOn?: string;
  updatedAt?: string;
  advice: string;
  complaint: string;
  diagnosis: string;
  dietAndExercise: string;
  generalExamination: string;
  internalNote: string;
  nextVisit: string;
  status: string;
  department?:
  | string
  | {
    name: string;
    id: string;
  };
}

interface OpdTabProps {
  PatientInfo: Patient | null;
}
function OpdTab({ PatientInfo }: OpdTabProps) {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pilesPres, setPilesPres] = useState<Prescription[]>([]);
  const [generalPres, setGeneralPres] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletePrescriptionId, setDeletePrescriptionId] = useState<
    string | null
  >(null);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleDeletePrescription = async (confirmed: boolean) => {
    const idToDelete = deletePrescriptionId;
    setDeletePrescriptionId(null); // Close dialog immediately

    if (confirmed && idToDelete && PatientInfo) {
      setLoading(true);
      try {
        // Determine prescription type by checking which array it belongs to
        const isSpinePrescription = prescriptions.some(
          (p) => p._id === idToDelete
        );
        const isPilesPrescription = pilesPres.some((p) => p._id === idToDelete);
        const isGeneralPrescription = generalPres.some(
          (p) => p._id === idToDelete
        );

        // Call the appropriate delete method based on prescription type
        if (isPilesPrescription) {
          await ApiManager.deletePilesPrescription(idToDelete);
        } else if (isGeneralPrescription) {
          await ApiManager.deleteGeneralPrescription(idToDelete);
        } else if (isSpinePrescription) {
          await ApiManager.deletePrescription(idToDelete);
        } else {
          console.error("Prescription not found in any category");
          return;
        }

        // Refresh all prescription lists
        const [response, pilesResponse, generalResponse] = await Promise.all([
          ApiManager.getPrescriptionsByPatientId(PatientInfo.id),
          ApiManager.getPilesPrescriptionsByPatientId(PatientInfo.id),
          ApiManager.getGeneralPrescriptionsByPatientId(PatientInfo.id),
        ]);
        setPrescriptions(response.data);
        setPilesPres(pilesResponse.data);
        setGeneralPres(generalResponse.data);
      } catch (error) {
        console.error("Error deleting prescription:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrescriptionAction = (
    prescription: Prescription,
    type: "spine" | "piles" | "general"
  ) => {
    const { _id: prescriptionId, status } = prescription;
    if (!PatientInfo) return;

    // Determine the route based on prescription type
    let baseRoute = "/general-prescription";
    if (type === "piles") {
      baseRoute = "/piles-prescription";
    } else if (type === "spine") {
      baseRoute = "/prescription";
    }

    if (status === "pending") {
      navigate(`${baseRoute}/create/${PatientInfo.id}/${prescriptionId}`);
    } else if (status === "completed") {
      navigate(`${baseRoute}/edit/${PatientInfo.id}/${prescriptionId}`);
    }
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (PatientInfo) {
        try {
          setLoading(true);
          const [response, pilesResponse, generalResponse] = await Promise.all([
            ApiManager.getPrescriptionsByPatientId(PatientInfo.id),
            ApiManager.getPilesPrescriptionsByPatientId(PatientInfo.id),
            ApiManager.getGeneralPrescriptionsByPatientId(PatientInfo.id),
          ]);
          setPrescriptions(response.data);
          setPilesPres(pilesResponse.data);
          setGeneralPres(generalResponse.data);
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPrescriptions();
  }, [PatientInfo]);

  return (
    <Box>
      {PatientInfo ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              fullWidth
              color="primary"
              onClick={handleOpenDialog}
              sx={{ m: 1, fontSize: "1rem", fontWeight: "bold" }}
            >
              Move to OPD
            </Button>
          </Box>

          <CreatePrescriptionDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            patient={PatientInfo}
            onPrescriptionCreated={() => {
              if (PatientInfo) {
                ApiManager.getPrescriptionsByPatientId(PatientInfo.id)
                  .then((response) => setPrescriptions(response.data))
                  .catch((error) =>
                    console.error("Error fetching prescriptions:", error)
                  );
                ApiManager.getPilesPrescriptionsByPatientId(PatientInfo.id)
                  .then((response) => setPilesPres(response.data))
                  .catch((error) =>
                    console.error("Error fetching prescriptions:", error)
                  );
                ApiManager.getGeneralPrescriptionsByPatientId(PatientInfo.id)
                  .then((response) => setGeneralPres(response.data))
                  .catch((error) =>
                    console.error("Error fetching prescriptions:", error)
                  );
              }
            }}
          />
          <Box sx={{ maxHeight: "520px", overflowY: "auto", px: 1 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Payment</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Department</TableCell> {/* New column */}
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow key={prescription._id}>
                        <TableCell align="center">
                          <Tooltip
                            placement="right"
                            title={`Payment Status: ${prescription.paymentStatus}`}
                            arrow
                          >
                            <IconButton
                              size="small"
                              sx={{
                                backgroundColor:
                                  prescription.paymentStatus === "paid"
                                    ? alpha("#52c41a", 0.1)
                                    : alpha("#f5222d", 0.1),
                                "&:hover": {
                                  backgroundColor:
                                    prescription.paymentStatus === "paid"
                                      ? alpha("#52c41a", 0.2)
                                      : alpha("#f5222d", 0.2),
                                },
                              }}
                            >
                              <BadgeIndianRupee
                                size={22}
                                color={
                                  prescription.paymentStatus === "paid"
                                    ? "#52c41a"
                                    : "#f5222d"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {prescription.createOn
                            ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                            : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                        </TableCell>
                        <TableCell>
                          {typeof prescription.department === "object"
                            ? prescription.department.name
                            : "N/A"}
                        </TableCell>

                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                            {prescription.status === "pending" && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                                onClick={() =>
                                  handlePrescriptionAction(prescription, "spine")
                                }
                              >
                                Create
                              </Button>
                            )}
                            {prescription.status === "completed" && (
                              <Button
                                variant="outlined"
                                sx={{
                                  color: "warning.main",
                                  borderColor: "warning.main",
                                  fontWeight: 'bold'
                                }}
                                size="small"
                                onClick={() =>
                                  handlePrescriptionAction(prescription, "spine")
                                }
                              >
                                Edit
                              </Button>
                            )}
                            <IconButton
                              color="error"
                              onClick={() =>
                                setDeletePrescriptionId(prescription._id)
                              }
                              sx={{ borderRadius: "50%", p: 0.5 }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                    {pilesPres.map((prescription) => (
                      <TableRow key={prescription._id}>
                        <TableCell align="center">
                          <Tooltip
                            placement="right"
                            title={`Payment Status: ${prescription.paymentStatus}`}
                            arrow
                          >
                            <IconButton
                              size="small"
                              sx={{
                                backgroundColor:
                                  prescription.paymentStatus === "paid"
                                    ? alpha("#52c41a", 0.1)
                                    : alpha("#f5222d", 0.1),
                                "&:hover": {
                                  backgroundColor:
                                    prescription.paymentStatus === "paid"
                                      ? alpha("#52c41a", 0.2)
                                      : alpha("#f5222d", 0.2),
                                },
                              }}
                            >
                              <BadgeIndianRupee
                                size={22}
                                color={
                                  prescription.paymentStatus === "paid"
                                    ? "#52c41a"
                                    : "#f5222d"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {prescription.createOn
                            ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                            : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                        </TableCell>
                        <TableCell>
                          {typeof prescription.department === "object"
                            ? prescription.department.name
                            : "N/A"}
                        </TableCell>

                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                            {prescription.status === "pending" && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                                onClick={() =>
                                  handlePrescriptionAction(prescription, "piles")
                                }
                              >
                                Create
                              </Button>
                            )}
                            {prescription.status === "completed" && (
                              <Button
                                variant="outlined"
                                sx={{
                                  color: "warning.main",
                                  borderColor: "warning.main",
                                  fontWeight: 'bold'
                                }}
                                size="small"
                                onClick={() =>
                                  handlePrescriptionAction(prescription, "piles")
                                }
                              >
                                Edit
                              </Button>
                            )}
                            <IconButton
                              color="error"
                              onClick={() =>
                                setDeletePrescriptionId(prescription._id)
                              }
                              sx={{ borderRadius: "50%", p: 0.5 }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                    {generalPres.map((prescription) => (
                      <TableRow key={prescription._id}>
                        <TableCell align="center">
                          <Tooltip
                            placement="right"
                            title={`Payment Status: ${prescription.paymentStatus}`}
                            arrow
                          >
                            <IconButton
                              size="small"
                              sx={{
                                backgroundColor:
                                  prescription.paymentStatus === "paid"
                                    ? alpha("#52c41a", 0.1)
                                    : alpha("#f5222d", 0.1),
                                "&:hover": {
                                  backgroundColor:
                                    prescription.paymentStatus === "paid"
                                      ? alpha("#52c41a", 0.2)
                                      : alpha("#f5222d", 0.2),
                                },
                              }}
                            >
                              <BadgeIndianRupee
                                size={22}
                                color={
                                  prescription.paymentStatus === "paid"
                                    ? "#52c41a"
                                    : "#f5222d"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {prescription.createOn
                            ? dayjs(prescription.createOn).format("DD/MM/YYYY")
                            : dayjs(prescription.createdAt).format("DD/MM/YYYY")} {" "}
                        </TableCell>
                        <TableCell>
                          {typeof prescription.department === "object"
                            ? prescription.department.name
                            : "N/A"}
                        </TableCell>

                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                            {prescription.status === "pending" && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                                onClick={() =>
                                  handlePrescriptionAction(
                                    prescription,
                                    "general"
                                  )
                                }
                              >
                                Create
                              </Button>
                            )}
                            {prescription.status === "completed" && (
                              <Button
                                variant="outlined"
                                sx={{
                                  color: "warning.main",
                                  borderColor: "warning.main",
                                  fontWeight: 'bold'
                                }}
                                size="small"
                                onClick={() =>
                                  handlePrescriptionAction(
                                    prescription,
                                    "general"
                                  )
                                }
                              >
                                Edit
                              </Button>
                            )}
                            <IconButton
                              color="error"
                              onClick={() =>
                                setDeletePrescriptionId(prescription._id)
                              }
                              sx={{ borderRadius: "50%", p: 0.5 }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </>
      ) : (
        <p>No PatientInfo selected</p>
      )}
      <ConfirmationDialog
        open={!!deletePrescriptionId}
        title="Delete Prescription"
        message="Are you sure you want to delete this prescription? This action cannot be undone."
        onClose={handleDeletePrescription}
      />
    </Box>
  );
}

export default OpdTab;
