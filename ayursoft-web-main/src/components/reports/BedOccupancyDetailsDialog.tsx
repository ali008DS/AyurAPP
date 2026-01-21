import { Dialog, DialogTitle, DialogContent, IconButton, Box } from "@mui/material";
import { X } from "lucide-react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface OccupancyDetail {
  name: string;
  occupiedBed: string;
  isReleased: boolean;
}

interface BedOccupancyDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  date: string;
  details: OccupancyDetail[];
}

function BedOccupancyDetailsDialog({ open, onClose, date, details }: BedOccupancyDetailsDialogProps) {
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Patient Name",
      flex: 1,
      renderCell: (params) => (
        <span style={{ fontSize: "13px", fontFamily: "Nunito, sans-serif", fontWeight: "700", textTransform: "capitalize" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "occupiedBed",
      headerName: "Bed Number",
      width: 150,
      renderCell: (params) => (
        <span style={{ fontSize: "13px", fontFamily: "Nunito, sans-serif", fontWeight: "600" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "isReleased",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span style={{ fontSize: "13px", fontFamily: "Nunito, sans-serif", fontWeight: "600", color: !params.value ? "#52c41a" : "#666" }}>
          {params.value ? "Released" : "Occupied"}
        </span>
      ),
    },
  ];

  const rows = details.map((detail, index) => ({ id: index, ...detail }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: "700" }}>
          Occupancy Details - {new Date(date).toLocaleDateString()}
        </span>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            disableRowSelectionOnClick
            density="compact"
            hideFooter
            sx={{ border: 0, "& .MuiDataGrid-cell:focus": { outline: "none" } }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default BedOccupancyDetailsDialog;
