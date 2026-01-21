import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Box, Button, Typography, Grid, CircularProgress } from "@mui/material";
import { ArrowLeft, Printer } from "lucide-react";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import bgImage from "../assets/LetterPad.png";

const PrintableInvoice = ({ sale }: any) => {
  const calculateMedicineSubTotal = () => {
    return (sale.medicines || []).reduce(
      (total: number, medicine: any) => total + (medicine.totalPrice || 0),
      0
    );
  };

  const calculateTherapySubTotal = () => {
    return (sale.therapies || []).reduce(
      (total: number, therapy: any) => total + (therapy.price || 0),
      0
    );
  };

  const calculateSubTotal = () => {
    return calculateMedicineSubTotal() + calculateTherapySubTotal();
  };

  const calculateDiscount = () => {
    return (calculateSubTotal() * (sale.discount || 0)) / 100;
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "210mm",
        minHeight: "297mm",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        mx: "auto",
        backgroundColor: "white",
      }}
    >
      <Box sx={{ mt: 27, px: 5 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: 24, color: "#1976d2" }}
          >
            PANCHAKARMA SALE INVOICE
          </Typography>
        </Box>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Typography
              sx={{ fontSize: 14, fontWeight: "bold", color: "#333" }}
            >
              Invoice Number: {sale.invoiceNumber}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#555" }}>
              Date: {dayjs(sale.saleDate).format("DD/MM/YYYY")}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#555" }}>
              Time: {new Date(sale.saleDate).toLocaleTimeString()}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#555", textTransform: "uppercase" }}
            >
              Status: {sale.status}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#555" }}>
              Payment Type: {sale.paymentType === "cash" ? "Cash" : "Bank"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography
              sx={{ fontSize: 12, fontWeight: "bold", color: "#333", mb: 1 }}
            >
              Patient Details:
            </Typography>
            {sale.patient ? (
              <>
                <Typography sx={{ fontSize: 12, color: "#555" }}>
                  Name: {sale.patient.firstName} {sale.patient.lastName}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#555" }}>
                  Phone: {sale.patient.phone}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{ fontSize: 12, color: "#777", fontStyle: "italic" }}
              >
                No patient information
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Invoice Details Section */}
        <Box sx={{ mb: 4 }}>
          {(sale.medicines || []).length > 0 && (
            <>
              <Typography
                sx={{ fontSize: 14, fontWeight: "bold", color: "#333", mb: 2 }}
              >
                Medicine Details:
              </Typography>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #ddd",
                  marginBottom:
                    (sale.therapies || []).length > 0 ? "24px" : "0",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "8%",
                      }}
                    >
                      SN
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "50%",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "20%",
                      }}
                    >
                      Quantity
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "22%",
                      }}
                    >
                      Batch Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.medicines || []).map(
                    (medicine: any, index: number) => (
                      <tr key={index}>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "6px",
                            border: "1px solid #ddd",
                            fontSize: 11,
                            color: "#555",
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            textAlign: "left",
                            padding: "6px",
                            border: "1px solid #ddd",
                            fontSize: 11,
                            color: "#555",
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          {medicine.medicine?.name || medicine.medicine}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "6px",
                            border: "1px solid #ddd",
                            fontSize: 11,
                            color: "#555",
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          {medicine.quantity ||
                            medicine.totalQuantityInAUnit ||
                            "N/A"}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "6px",
                            border: "1px solid #ddd",
                            fontSize: 11,
                            color: "#555",
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          {medicine.batchNumber || "N/A"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </>
          )}

          {(sale.therapies || []).length > 0 && (
            <>
              <Typography
                sx={{ fontSize: 14, fontWeight: "bold", color: "#333", mb: 2 }}
              >
                Therapy Details:
              </Typography>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #ddd",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "8%",
                      }}
                    >
                      SN
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "70%",
                      }}
                    >
                      Therapy Name
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#333",
                        fontFamily: "Nunito, sans-serif",
                        width: "22%",
                      }}
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.therapies || []).map((therapy: any, index: number) => (
                    <tr key={index}>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "6px",
                          border: "1px solid #ddd",
                          fontSize: 11,
                          color: "#555",
                          fontFamily: "Nunito, sans-serif",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          textAlign: "left",
                          padding: "6px",
                          border: "1px solid #ddd",
                          fontSize: 11,
                          color: "#555",
                          fontFamily: "Nunito, sans-serif",
                        }}
                      >
                        {typeof therapy.therapy === "string"
                          ? therapy.therapy
                          : therapy.therapy?.name || "N/A"}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "6px",
                          border: "1px solid #ddd",
                          fontSize: 11,
                          color: "#555",
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        ₹{(therapy.price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Box>

        {/* Totals Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 4,
            pb: 4,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Box sx={{ width: "300px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                py: 0.5,
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#555" }}>
                Sub Total:
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "#555", fontWeight: "bold" }}
              >
                ₹{calculateSubTotal().toFixed(2)}
              </Typography>
            </Box>
            {sale.discount > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                  py: 0.5,
                }}
              >
                <Typography sx={{ fontSize: 12, color: "#555" }}>
                  Discount ({sale.discount}%):
                </Typography>
                <Typography
                  sx={{ fontSize: 12, color: "#4caf50", fontWeight: "bold" }}
                >
                  -₹{calculateDiscount().toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                py: 0.5,
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: "bold" }}>
                Grand Total:
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: "bold" }}>
                ₹{(calculateSubTotal() - calculateDiscount() || 0).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default function PanchakarmaSaleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAppContext();
  const componentRef = useRef<any>(null);
  const [sale, setSale] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ApiManager.getPanchakarmaSaleById(id || "");
        const data = resp?.data || resp || null;
        setSale(data);
      } catch (err) {
        console.error("Error fetching sale:", err);
        setAlert({ severity: "error", message: "Failed to load sale." });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Panchakarma-Invoice-${sale?.invoiceNumber || "Unknown"}`,
    pageStyle: `
      @page { size: A4; margin: 0.5in; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `,
  });

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (!sale) return <Typography>No sale found</Typography>;

  return (
    <Box sx={{ p: 3, height: "100vh", overflowY: "auto" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          startIcon={<Printer />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box>
      <div ref={componentRef}>
        <PrintableInvoice sale={sale} />
      </div>
    </Box>
  );
}
