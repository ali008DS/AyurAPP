import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  Chip,
  Typography,
  Grid,
  Stack,
} from "@mui/material";
import { IndianRupee, X } from "lucide-react";

interface Medicine {
  _id: string;
  name: string;
  baseUnitType: string;
  manufacturer: string;
  totalQuantityInAUnit: number;
  unitType: string;
}

interface PurchaseMedicineItem {
  medicine: Medicine;
  totalPurchasedUnit: number;
  purchasePrice: number;
  mrp: number;
  batchNumber: string;
  sellingPrice: number;
  hsnCode: string;
  manufacturingDate: string;
  expiryDate: string;
  discountPercentage: number;
  taxPercentage: number;
}

interface Distributor {
  _id: string;
  name: string;
  gstNo: string;
  primaryContactNo: string;
  secondaryContactNo: string;
  address: string;
  deletedAt: string | null;
  __v: number;
}

interface PurchaseRecord {
  _id: string;
  invoiceNumber: string;
  medicines: PurchaseMedicineItem[];
  distributor: Distributor;
  totalAmount: number;
  purchaseDate: string;
  taxableAmount: number;
}

interface PurchaseViewDialogProps {
  open: boolean;
  purchase: PurchaseRecord | null;
  onClose: () => void;
}

export default function PurchaseViewDialog({
  open,
  purchase,
  onClose,
}: PurchaseViewDialogProps) {
  if (!purchase) return null;

  const formatCurrency = (value: number | undefined | null) =>
    typeof value === "number"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        }).format(value)
      : "—";

  const formatDate = (value: string | undefined | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, pt: 1.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
              Purchase Invoice #{purchase.invoiceNumber}
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: "auto", p: 0.5 }}>
            <X size={18} />
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 2,
          pb: 2,
          fontFamily: "Nunito, sans-serif",
          maxHeight: { xs: "75vh", md: "70vh" },
          overflowY: "auto",
          pr: 1,
        }}
      >
        <Box
          sx={{
            mb: 2,
            px: 1.5,
            py: 1.5,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "grey.200",
            bgcolor: "grey.50",
          }}
        >
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                Purchase Date
              </Typography>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                {formatDate(purchase.purchaseDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                Distributor
              </Typography>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                {purchase.distributor.name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                Taxable Amount
              </Typography>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                {formatCurrency(purchase.taxableAmount)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                Total Amount
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IndianRupee size={13} />
                <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                  {purchase.totalAmount.toFixed(2)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}> 
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                Medicines Count
              </Typography>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                {purchase.medicines.length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                Invoice ID
              </Typography>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                {purchase._id}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Stack spacing={1.5}>
          {purchase.medicines.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 0.5 }}
              >
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    fontSize="0.9rem"
                  >
                    {item.medicine.name}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  <Chip
                    label={`${item.totalPurchasedUnit} ${item.medicine.unitType}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Batch ${item.batchNumber || "—"}`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              <Grid container>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Base Unit Type
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {item.medicine.baseUnitType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Units per Package
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {item.medicine.totalQuantityInAUnit}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Purchase Price
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(item.purchasePrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    MRP
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(item.mrp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Selling Price
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(item.sellingPrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Discount
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {item.discountPercentage}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Tax
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {item.taxPercentage}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    HSN Code
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {item.hsnCode || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Manufacturing Date
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatDate(item.manufacturingDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    Expiry Date
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatDate(item.expiryDate)}
                  </Typography>
                </Grid>
              </Grid>

              {idx !== purchase.medicines.length - 1 && (
                <Divider sx={{ mt: 1.5 }} />
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
