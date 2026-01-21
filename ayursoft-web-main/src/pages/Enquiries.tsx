import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddEnquiryDialog from "../components/AddPatientDialog";

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  source: string;
  address: string;
  status: string;
}

export default function Enquiries() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ padding: "24px" }}>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Enquiry
      </Button>
      <AddEnquiryDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}
