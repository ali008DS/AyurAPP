import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Box, Button, Typography, Grid, CircularProgress } from "@mui/material";
import { ArrowLeft, Printer, Eye, EyeClosed } from "lucide-react";
// import HeadingText from "../components/ui/HeadingText";
import ApiManager from "../components/services/apimanager";
import { useAppContext } from "../context/app-context";
import { getTenantData } from "../utils/tenant";

interface SaleDetail {
  _id: string;
  invoiceNumber: string;
  status: string;
  patient?: {
    _id: string;
    firstName: string;
    uhId: string;
    lastName: string;
    phone: string;
    address: string;
    email?: string;
    age?: string;
  };
  saleDate: string;
  medicines: {
    medicine: {
      _id: string;
      name: string;
    };
    sellingUnitType: string;
    totalUnit: number;
    totalQuantityInAUnit: number;
    price: number; // changed from pricePerUnit
    totalPrice: number;
  }[];
  discount: number;
  totalAmount: number;
  bank?:
  | {
    _id: string;
    name?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
    address?: string;
  }
  | string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  paymentType: string;
  paidAmount?: number;
  __v: number;
}

const PrintableInvoice = ({ sale }: { sale: SaleDetail }) => {
  const { websiteIdentity } = useAppContext();

  const calculateSubTotal = () => {
    return sale.medicines.reduce(
      (total, medicine) => total + medicine.totalPrice,
      0
    );
  };

  const calculateDiscount = () => {
    return (calculateSubTotal() * sale.discount) / 100;
  };

  return (
    <Box
      sx={{
        width: "210mm",
        minHeight: "297mm",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        mx: "auto",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      {/* Render dynamic header at the very top if available */}
      {websiteIdentity.prescriptionHeader && (
        <Box
          component="img"
          src={websiteIdentity.prescriptionHeader}
          alt="Invoice Header"
          sx={{
            width: "100%",
            maxHeight: "150px",
            objectFit: "contain",
            display: "block",
          }}
        />
      )}

      {/* Background image container with fixed width */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "210mm",
          height: "100%",
          backgroundImage: websiteIdentity.prescriptionBackground
            ? `url(${websiteIdentity.prescriptionBackground})`
            : 'none',
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Invoice Content */}
      <Box sx={{ position: "relative", zIndex: 1, mt: websiteIdentity.prescriptionHeader ? 2 : 5, px: 5 }}>
        {/* Invoice Title */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: 24, color: "#1976d2" }}
          >
            MEDICINE SALE INVOICE
          </Typography>
        </Box>

        {/* Invoice and Patient Details */}
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
              Time:{" "}
              {new Date(sale.saleDate).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
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
                  Name: {sale.patient.firstName} {sale.patient.lastName}{" "}
                  UHID-RAH : {sale.patient.uhId}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#555" }}>
                  Phone: {sale.patient.phone}
                </Typography>
                {sale.patient.email && (
                  <Typography sx={{ fontSize: 12, color: "#555" }}>
                    Email: {sale.patient.email}
                  </Typography>
                )}
                {sale.patient.address && (
                  <Typography sx={{ fontSize: 12, color: "#555" }}>
                    Address: {sale.patient.address}
                  </Typography>
                )}
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

        {/* Medicine Details Table */}
        <Box sx={{ mb: 4 }}>
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
                    width: "4%",
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
                    width: "40%",
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
                    width: "15%",
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
                    width: "12%",
                  }}
                >
                  Subunit Qty
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
                    width: "17%",
                  }}
                >
                  Subunit Price
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
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.medicines.map((medicine, index) => {
                // Subunit: totalQuantityInAUnit
                // Quantity: totalUnit
                // Price × Subunit: price * totalQuantityInAUnit
                // Total Price: totalPrice
                return (
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
                      {medicine.medicine.name}
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
                      {medicine.totalUnit}
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
                      {medicine.totalQuantityInAUnit}
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
                      ₹{medicine.price.toFixed(2)}
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
                      ₹{medicine.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                borderTop: "2px solid #333",
                pt: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ fontSize: 14, fontWeight: "bold", color: "#333" }}
              >
                Total Amount:
              </Typography>
              <Typography
                sx={{ fontSize: 14, fontWeight: "bold", color: "#333" }}
              >
                ₹{sale.totalAmount.toFixed(2)}
              </Typography>
            </Box>
            {sale.paidAmount !== undefined && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 12, fontWeight: "bold", color: "#333" }}
                >
                  Paid Amount:
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: "bold", color: "#4caf50" }}
                >
                  ₹{sale.paidAmount.toFixed(2)}
                </Typography>
              </Box>
            )}
            {sale.paidAmount !== undefined && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 12, fontWeight: "bold", color: "#333" }}
                >
                  Remaining Amount:
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: "bold", color: "#f44336" }}
                >
                  ₹{(sale.totalAmount - sale.paidAmount).toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer Note */}
        <Box sx={{ textAlign: "center", mt: 6, pt: 3 }}>
          <Typography sx={{ fontSize: 12, color: "#777", fontStyle: "italic" }}>
            Thank you for your business! Please keep this invoice for your
            records.
          </Typography>
          <Typography sx={{ fontSize: 10, color: "#999", mt: 1 }}>
            Generated on {dayjs().format("DD/MM/YYYY")} at {new Date().toLocaleTimeString()}
          </Typography>
          {/* Bank Details Footer */}
          {sale.paymentType === "cash" ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#888" }}>
                Payment Method
              </Typography>
              <Typography sx={{ fontSize: 8, color: "#777", fontWeight: 500 }}>
                Cash Payment
              </Typography>
            </Box>
          ) : typeof sale.bank === "object" && sale.bank ? (
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, color: "#888", mb: 0.5 }}
              >
                Bank Details
              </Typography>
              <Typography sx={{ fontSize: 8, color: "#777", fontWeight: 500 }}>
                Bank: {sale.bank.name || sale.bank.bankName}
              </Typography>
              <Typography sx={{ fontSize: 8, color: "#999" }}>
                Account No:{" "}
                <b style={{ color: "#999" }}>{sale.bank.accountNumber}</b>
              </Typography>
              <Typography sx={{ fontSize: 8, color: "#999" }}>
                IFSC: <b style={{ color: "#999" }}>{sale.bank.ifscCode}</b>
              </Typography>
              <Typography sx={{ fontSize: 8, color: "#999" }}>
                Branch: <b style={{ color: "#999" }}>{sale.bank.branch}</b>
              </Typography>
              <Typography sx={{ fontSize: 8, color: "#999" }}>
                {sale.bank.address}
              </Typography>
            </Box>
          ) : sale.bank ? (
            <Typography sx={{ fontSize: 8, color: "#777", mt: 2 }}>
              Bank Payment ID: {sale.bank}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

// Add this component after the PrintableInvoice component
const ThermalPrintableInvoice = ({ sale }: { sale: SaleDetail }) => {
  const { websiteIdentity } = useAppContext();
  const calculateSubTotal = () => {
    return sale.medicines.reduce(
      (total, medicine) => total + medicine.totalPrice,
      0
    );
  };

  const calculateDiscount = () => {
    return (calculateSubTotal() * sale.discount) / 100;
  };

  return (
    <Box
      sx={{
        width: "80mm",
        margin: "0 auto",
        padding: "8px",
        fontFamily: "monospace",
        backgroundColor: "white",
        color: "black",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
      className="thermal-print-content"
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: "bold" }}>
          {websiteIdentity.clinicName} {websiteIdentity.description}
        </Typography>
        {websiteIdentity.address && (
          <Typography sx={{ fontSize: 10 }}>
            {websiteIdentity.address}
          </Typography>
        )}
        {websiteIdentity.phoneNumber && (
          <Typography sx={{ fontSize: 10 }}>{websiteIdentity.phoneNumber}</Typography>
        )}
        {websiteIdentity.email && (
          <Typography sx={{ fontSize: 9, mb: 1 }}>
            {websiteIdentity.email}
          </Typography>
        )}
        <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
          MEDICINE SALE INVOICE
        </Typography>
        <div style={{ border: "1px dashed black", margin: "4px 0" }} />
      </Box>

      {/* Invoice Details */}
      <Box sx={{ mb: 1, fontSize: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Invoice: {sale.invoiceNumber || "N/A"}</span>
          <span>Status: {sale.status || "N/A"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            Date: {dayjs(sale.saleDate).format("DD/MM/YYYY")}
          </span>
          <span>
            Time:{" "}
            {new Date(sale.saleDate).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Payment: {sale.paymentType === "cash" ? "Cash" : "Bank"}</span>
        </div>
      </Box>

      {/* Patient Info */}
      {sale.patient && (
        <Box sx={{ mb: 1, fontSize: 10 }}>
          <Typography sx={{ fontWeight: "bold" }}>Patient:</Typography>
          <div>
            {sale.patient.firstName} {sale.patient.lastName}
          </div>
          {sale.patient.phone && <div>Ph: {sale.patient.phone}</div>}
          {sale.patient.address && <div>Addr: {sale.patient.address}</div>}
        </Box>
      )}

      <div style={{ border: "1px dashed black", margin: "4px 0" }} />

      {/* Items */}
      <Box sx={{ mb: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            fontWeight: "bold",
          }}
        >
          <span style={{ width: "30%" }}>Item</span>
          <span style={{ width: "15%", textAlign: "center" }}>Qty</span>
          <span style={{ width: "15%", textAlign: "center" }}>Subunit Qty</span>
          <span style={{ width: "20%", textAlign: "right" }}>Price×Sub</span>
          <span style={{ width: "20%", textAlign: "right" }}>Total</span>
        </div>
        <div style={{ border: "1px dashed black", margin: "4px 0" }} />

        {sale.medicines.map((medicine, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                width: "30%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                borderRight: "1px solid #000",
                paddingRight: 2,
              }}
            >
              {medicine.medicine.name}
            </span>
            <span style={{ width: "15%", textAlign: "center", borderRight: "1px solid #000", paddingRight: 2 }}>
              {medicine.totalUnit}
            </span>
            <span style={{ width: "15%", textAlign: "center", borderRight: "1px solid #000", paddingRight: 2 }}>
              {medicine.totalQuantityInAUnit}
            </span>
            <span style={{ width: "20%", textAlign: "right", borderRight: "1px solid #000", paddingRight: 2 }}>
              ₹{medicine.price.toFixed(2)}
            </span>
            <span style={{ width: "20%", textAlign: "right" }}>
              ₹{medicine.totalPrice.toFixed(2)}
            </span>
          </div>
        ))}
      </Box>

      <div style={{ border: "1px dashed black", margin: "4px 0" }} />

      {/* Totals */}
      <Box sx={{ mb: 1, fontSize: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sub Total:</span>
          <span>₹{calculateSubTotal().toFixed(2)}</span>
        </div>

        {sale.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Discount ({sale.discount}%):</span>
            <span>-₹{calculateDiscount().toFixed(2)}</span>
          </div>
        )}

        <div style={{ border: "1px dashed black", margin: "4px 0" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
          }}
        >
          <span>TOTAL:</span>
          <span>₹{sale.totalAmount.toFixed(2)}</span>
        </div>
      </Box>

      {/* Payment Info */}
      {sale.paymentType === "cash" ? (
        <Box sx={{ mb: 1, fontSize: 9 }}>
          <div style={{ fontWeight: "bold" }}>Payment Details:</div>
          <div>Cash Payment</div>
        </Box>
      ) : typeof sale.bank === "object" && sale.bank ? (
        <Box sx={{ mb: 1, fontSize: 9 }}>
          <div style={{ fontWeight: "bold" }}>Payment Details:</div>
          <div>{sale.bank.name || sale.bank.bankName || "Bank Payment"}</div>
          {sale.bank.accountNumber && <div>A/C: {sale.bank.accountNumber}</div>}
          {sale.bank.ifscCode && <div>IFSC: {sale.bank.ifscCode}</div>}
        </Box>
      ) : sale.bank ? (
        <Box sx={{ mb: 1, fontSize: 9 }}>
          <div style={{ fontWeight: "bold" }}>Payment Details:</div>
          <div>Bank Payment ID: {sale.bank}</div>
        </Box>
      ) : null}

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 2, fontSize: 9 }}>
        <div>Thank you for your business!</div>
        <div style={{ fontSize: 8, marginTop: 4 }}>
          {dayjs().format("DD/MM/YYYY")}{" "}
          {new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </Box>
    </Box>
  );
};

function MedicineSaleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAlert, updateWebsiteIdentity } = useAppContext();
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showThermalPreview, setShowThermalPreview] = useState(false); // Add this line
  const printRef = useRef<HTMLDivElement>(null);
  const thermalPrintRef = useRef<HTMLDivElement>(null);
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
          // Update context with signed URLs for prescription images (header and background, no footer)
          const updates: any = {};
          if (response.data.imageUrls.prescriptionHeader) {
            updates.prescriptionHeader = response.data.imageUrls.prescriptionHeader;
          }
          if (response.data.imageUrls.prescriptionBackground) {
            updates.prescriptionBackground = response.data.imageUrls.prescriptionBackground;
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${sale?.invoiceNumber || "Unknown"}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  const handleThermalPrint = useReactToPrint({
    contentRef: thermalPrintRef,
    documentTitle: `Thermal-Invoice-${sale?.invoiceNumber || "Unknown"}`,
    // use onBeforePrint returning a Promise<void> (matches types)
    onBeforePrint: async () => {
      console.log(
        "[thermal] onBeforePrint - preparing thermal content",
        thermalPrintRef.current
      );
      if (!thermalPrintRef.current) {
        console.error("[thermal] ref missing");
        setAlert({
          severity: "error",
          message: "Unable to prepare thermal print, please try again.",
        });
        return Promise.reject(new Error("thermal-ref-missing"));
      }
      // ensure the element is visible to the browser when printing
      const el = thermalPrintRef.current as HTMLElement;
      el.style.position = "static";
      el.style.left = "auto";
      el.style.top = "auto";
      el.style.width = "80mm";
      el.style.backgroundColor = "#ffffff";
      el.style.color = "#000000";
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log("[thermal] onAfterPrint - done");
      // hide off-screen again
      if (thermalPrintRef.current) {
        const el = thermalPrintRef.current as HTMLElement;
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.top = "-9999px";
      }
    },
    onPrintError: (location, error) => {
      console.error("[thermal] print error", location, error);
      setAlert({
        severity: "error",
        message: `Thermal printing failed: ${error || location}`,
      });
    },
    pageStyle: `
      @page { size: 80mm auto; margin: 0mm; }
      @media print {
        html, body { width: 80mm !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .thermal-print-content { width: 80mm !important; background: #ffffff !important; color: #000000 !important; }
        * { box-shadow: none !important; text-shadow: none !important; }
      }
    `,
  });

  const handleButtonClick = () => {
    if (printRef.current) {
      handlePrint();
    } else {
      setAlert({
        severity: "error",
        message: "Unable to print, please try again later.",
      });
    }
  };

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!id) {
        setAlert({
          severity: "error",
          message: "Sale ID is required",
        });
        navigate("/medicine-sale-history");
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching sale details for id:", id);
        const response = await ApiManager.getSaleMedicineById(id);
        const res = response.data;
        console.log("API response:", JSON.stringify(res, null, 4));

        if (res && res.status === true && res.data) {
          console.log("Setting sale with res.data:", res.data);
          setSale(res.data);
        } else if (res && res._id) {
          console.log("Setting sale with res directly:", res);
          setSale(res);
        } else {
          console.log("Mapped sale:", res?.data);
          throw new Error("Sale not found");
        }
      } catch (error) {
        console.error("Error fetching sale details:", error);
        setAlert({
          severity: "error",
          message: "Failed to fetch sale details, please try again later.",
        });
        navigate("/medicine-sale-history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id, navigate, setAlert]);

  if (isLoading) {
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
  }

  if (!sale) {
    return null; // or some fallback UI
  }

  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Back Button and Print Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none",
            color: "#1976d2",
            borderColor: "#1976d2",
          }}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setShowThermalPreview(!showThermalPreview)}
            sx={{
              minWidth: 40,
              padding: 0.5,
              borderColor: showThermalPreview ? "#4caf50" : "#1976d2",
              color: showThermalPreview ? "#4caf50" : "#1976d2",
            }}
          >
            {showThermalPreview ? <EyeClosed /> : <Eye />}
          </Button>
          <Button
            variant="outlined"
            endIcon={<Printer />}
            onClick={handleThermalPrint}
          >
            Thermal Print
          </Button>
          <Button
            variant="outlined"
            endIcon={<Printer />}
            onClick={handleButtonClick}
          >
            Normal Print
          </Button>
        </Box>
      </Box>

      {/* Content Area - Side by side when preview is enabled */}
      <Box
        sx={{
          display: "flex",
          flexDirection: showThermalPreview ? "row" : "column",
          gap: 2,
          p: 2,
          "@media print": { display: "block" },
        }}
      >
        {/* Regular Invoice */}
        <Box
          sx={{
            flex: 1,
            "@media print": { width: "100%" },
          }}
          ref={printRef}
        >
          {sale && <PrintableInvoice sale={sale} />}
        </Box>

        {/* Thermal Preview */}
        {showThermalPreview && (
          <Box
            sx={{
              width: "80mm",
              backgroundColor: "#fff",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              p: 1,
              alignSelf: "flex-start",
              "@media print": { display: "none" },
            }}
          >
            {sale && <ThermalPrintableInvoice sale={sale} />}
          </Box>
        )}
      </Box>

      {/* Hidden thermal print element for actual printing (positioned off-screen) */}
      <div
        ref={thermalPrintRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "80mm",
          backgroundColor: "#ffffff",
          color: "#000000",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
        className="thermal-print-wrapper"
      >
        {sale && (
          <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
            <ThermalPrintableInvoice sale={sale} />
          </div>
        )}
      </div>
    </Box>
  );
}

export default MedicineSaleView;
