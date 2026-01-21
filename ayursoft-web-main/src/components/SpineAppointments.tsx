"use client";

import { useState } from "react";
import { TextField, Box, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Eye, Trash2 } from "lucide-react";

// Mock data for demonstration
const initialPatients = [
  {
    id: 1,
    srNo: 1,
    name: "John Doe",
    lastVisit: "2024-11-01",
    phone: "123-456-7890",
    age: 35,
    totalVisits: 5,
    status: "Active",
    paymentStatus: "Paid",
    waitingFrom: "10:30 AM",
  },
  {
    id: 2,
    srNo: 2,
    name: "Jane Smith",
    lastVisit: "2024-10-29",
    phone: "098-765-4321",
    age: 28,
    totalVisits: 3,
    status: "Inactive",
    paymentStatus: "Pending",
    waitingFrom: "11:00 AM",
  },
  // Add more patients as needed
];

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState(initialPatients);

  const handleDelete = (id: number) => {
    setPatients(patients.filter((patient) => patient.id !== id));
  };

  const columns = [
    {
      field: "srNo",
      headerName: " Sr.no",
      width: 50,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "lighter" }}>{params.value}</span>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 50,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "bolder" }}>{params.value}</span>
      ),
    },
    {
      field: "lastVisit",
      headerName: "lastVisit",
      width: 50,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "bolder" }}>{params.value}</span>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 50,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "600" }}>{params.value}</span>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "600" }}>{params.value}</span>
      ),
    },
    {
      field: "totalVisits",
      headerName: "totalVisits",
      width: 80,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "600" }}>{params.value}</span>
      ),
    },
    {
      field: "status",
      headerName: "status",
      width: 80,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "600" }}>{params.value}</span>
      ),
    },
    {
      field: "paymentStatus",
      headerName: "paymentStatus",
      width: 80,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "600" }}>{params.value}</span>
      ),
    },
    {
      field: "waitingFrom",
      headerName: "waitingFrom",
      width: 80,
      flex: 1,
      renderCell: (params: any) => (
        <span style={{ fontWeight: "600" }}>{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      flex: 1,
      renderCell: (params: any) => (
        <Box>
          <Tooltip title="View">
            <IconButton color="info">
              <Eye size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Trash2 size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
      >
        Spine Appointment List:
      </h1>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <TextField
          label="Search..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: "200px" }}
        />
      </Box>
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          density="compact"
          rows={patients}
          columns={columns}
          sx={{ border: "none" }}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20 },
            },
          }}
        />
      </Box>
    </Box>
  );
}
