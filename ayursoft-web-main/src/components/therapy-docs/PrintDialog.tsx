import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useRef, ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import headerImage from "/src/assets/raishree-ayurveda-letter-pad-header.png";

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  documentTitle?: string;
  children: ReactNode;
  orientation?: "portrait" | "landscape";
}

function PrintDialog({
  open,
  onClose,
  title = "Print Preview",
  documentTitle = "Document",
  orientation = "portrait",
  children,
}: PrintDialogProps) {
  const componentRef = useRef<HTMLDivElement | null>(null);

  const pageStyle = `
    @page { 
      size: A4 ${orientation}; 
      margin: 0mm;
    }
    @media print {
      body { 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      * {
        box-sizing: border-box;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle,
    documentTitle,
  });

  const onPrintClick = () => {
    if (handlePrint) {
      handlePrint();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            minHeight: "400px",
          }}
        >
          <Box
            ref={componentRef}
            sx={{
              width: orientation === "portrait" ? "210mm" : "297mm",
              minHeight: orientation === "portrait" ? "297mm" : "210mm",
              backgroundColor: "#fff",
              padding: "10mm 15mm",
              margin: 0,
              fontFamily: "Arial, sans-serif",
              "@media print": {
                padding: "10mm 15mm",
                margin: 0,
              },
            }}
          >
            {/* Header Image */}
            <Box
              sx={{
                width: "100%",
                mb: 3,
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={headerImage}
                alt="Header"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "100px",
                }}
              />
            </Box>
            {children}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
        <Button
          onClick={onPrintClick}
          variant="outlined"
          sx={{ border: "dashed 1px" }}
          color="primary"
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PrintDialog;
