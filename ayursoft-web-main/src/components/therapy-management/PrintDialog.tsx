import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ApiManager from "../services/apimanager";
import { useReactToPrint } from "react-to-print";
import receiptImage from "/src/assets/raishree-ayurveda-letter-pad-header.png";

interface PrintDialogProps {
  open: boolean;
  therapyId: string | null;
  onClose: () => void;
}

type Patient = {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  uhId?: string;
  [key: string]: any;
};

type Therapy = {
  _id: string;
  therapies?: string[];
  patient?: Patient;
  slotStart?: string;
  slotEnd?: string;
  [key: string]: any;
};

type Session = {
  _id: string;
  therapy?: Therapy;
  sessionDate?: string;
  slotStart?: string;
  slotEnd?: string;
  status?: string;
  therapist?: any;
  [key: string]: any;
};

function PrintDialog({ open, therapyId, onClose }: PrintDialogProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!therapyId) return;

    let mounted = true;
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await ApiManager.getTherapySessionByTherapyId(therapyId);
        // ApiManager returns response.data — normalize to array
        const data = res?.data ?? res ?? [];
        if (mounted) {
          // ensure it's an array
          setSessions(Array.isArray(data) ? data : data.data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch therapy sessions", err);
        if (mounted) setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSessions();

    return () => {
      mounted = false;
    };
  }, [open, therapyId]);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return iso;
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const componentRef = useRef<HTMLDivElement | null>(null);
  const pageStyle = `
    @page { size: A4 portrait; margin: 10mm }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table { page-break-inside: auto; font-size: 10px; }
      tr { page-break-inside: avoid; page-break-after: auto }
      .signature-col { display: table-cell !important; }
      h2 { page-break-after: avoid !important; }
      th { font-size: 10px !important; }
      td { font-size: 9px !important; }
      body, table, th, td, p, span, div {
        font-size: 12px !important;
        line-height: 1.3 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      h2 {
        font-size: 22px !important;
        margin: 0 0 6px 0 !important;
      }
      th {
        font-size: 12px !important;
      }
      td {
        font-size: 12px !important;
      }
    }
    @media screen {
      .signature-col { display: none; }
      th { font-size: 14px !important; }
      td { font-size: 13px !important; }
    }
  `;
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle,
    onAfterPrint: () => {
      onClose();
    },
  });

  const onPrintClick = () => {
    handlePrint();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Print Therapy Sessions</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 20 }}
          >
            <CircularProgress />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div ref={componentRef} style={{ backgroundColor: "#fff", padding: "10mm" }}>
              {/* Header Image */}
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={receiptImage}
                  alt="Header"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    maxHeight: "100px",
                  }}
                />
              </div>

              {/* Title Section */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                  padding: "8px 0",
                  borderBottom: "2px solid #428BCA",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Therapy Sessions Report
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Generated on: {(() => {
                    const d = new Date();
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = String(d.getFullYear()).slice(-2);
                    return `${day}/${month}/${year}`;
                  })()}
                </p>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ background: "#e6f3fb" }}>
                    <th
                      style={{
                        padding: 8,
                        border: "1px solid #cfdde6",
                        width: 10,
                      }}
                    >
                      S.No
                    </th>
                    <th
                      style={{
                        width: 40,
                        padding: 8,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        width: 20,
                        padding: 8,
                        textAlign: "center",
                        border: "1px solid #cfdde6",
                      }}
                    >
                      UHID
                    </th>
                    <th
                      style={{
                        width: 80,
                        padding: 8,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Patient
                    </th>
                    <th
                      style={{
                        width: 40,
                        padding: 8,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Time
                    </th>
                    <th
                      style={{
                        width: 150,
                        padding: 6,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Therapies
                    </th>
                    <th
                      className="signature-col"
                      style={{
                        width: 40,
                        padding: 8,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Therapist Sign
                    </th>
                    <th
                      className="signature-col"
                      style={{
                        width: 40,
                        padding: 8,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Patient Sign
                    </th>
                    <th
                      style={{
                        width: 80,
                        padding: 8,
                        border: "1px solid #cfdde6",
                      }}
                    >
                      Therapist
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions && sessions.length > 0 ? (
                    sessions.map((s, idx) => {
                      const therapy = s.therapy as Therapy | undefined;
                      const patient = therapy?.patient as Patient | undefined;
                      const date = formatDate(
                        s.sessionDate ?? therapy?.startDate
                      );
                      const start = formatTime(
                        s.slotStart ?? therapy?.slotStart
                      );
                      const end = formatTime(s.slotEnd ?? therapy?.slotEnd);
                      const time =
                        start && end ? `${start} - ${end}` : start || end || "";
                      const therapies = therapy?.therapies?.join(" , ") ?? "";
                      const patientName = `${patient?.firstName ?? ""} ${
                        patient?.lastName ?? ""
                      }`
                        .trim()
                        .toUpperCase();
                      const uhid = patient?.uhId ?? "";
                      const therapistName =
                        (s.therapist &&
                          (s.therapist.name ||
                            `${s.therapist.firstName || ""} ${
                              s.therapist.lastName || ""
                            }`)) ||
                        "";

                      return (
                        <tr key={s._id}>
                          <td
                            style={{
                              padding: 6,
                              border: "1px solid #ddd",
                              textAlign: "center",
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            style={{
                              padding: 6,
                              textAlign: "center",
                              border: "1px solid #ddd",
                              maxWidth: 40,
                            }}
                          >
                            {date}
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 20,
                            }}
                          >
                            {uhid}
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              maxWidth: 80,
                            }}
                          >
                            <div
                              style={{
                                textAlign: "center",
                              }}
                            >
                              {patientName}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: 6,
                              textAlign: "center",

                              border: "1px solid #ddd",
                            }}
                          >
                            {time}
                          </td>
                          <td
                            style={{
                              padding: 6,
                              textAlign: "center",
                              border: "1px solid #ddd",
                            }}
                          >
                            {therapies}
                          </td>
                          <td
                            className="signature-col"
                            style={{
                              padding: 6,
                              border: "1px solid #ddd",
                              minWidth: 80,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 40,
                            }}
                          >
                            {/* Signature placeholder */}
                          </td>
                          <td
                            className="signature-col"
                            style={{
                              padding: 6,
                              border: "1px solid #ddd",
                              minWidth: 80,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 40,
                            }}
                          >
                            {/* Signature placeholder */}
                          </td>
                          <td
                            style={{
                              padding: 6,
                              border: "1px solid #ddd",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 80,
                            }}
                          >
                            {therapistName}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        style={{ padding: 12, textAlign: "center" }}
                      >
                        No sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onPrintClick} variant="contained">
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PrintDialog;
