import React from "react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface Column {
  field: string;
  headerName: string;
}

interface CustomLightTableProps {
  columns: Column[];
  rows: any[];
  searchField: string;
  maxPrescriptions: number;
}

const CustomLightTable: React.FC<CustomLightTableProps> = ({
  columns,
  rows,
  searchField,
  maxPrescriptions,
}) => {
  console.log("Rows:", rows);
  console.log("Columns:", columns);
  console.log("Search Field:", searchField);
  console.log("Max Prescriptions:", maxPrescriptions);
  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 0,
          borderRadius: 2,
          maxHeight: "95vh",
          overflowY: "auto",
          overflowX: "auto",
          width: "100%",
          minWidth: 900,
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 900,
            "& th, & td": {
              padding: "2px 6px",
              fontSize: "11px",
              lineHeight: 1.2,
              userSelect: "text",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    fontWeight: 700,
                    background: "#f5f5f5",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.id || idx}>
                <TableCell
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 700,
                    minWidth: 180,
                  }}
                >
                  {`${row.firstName || ""} ${row.lastName || ""}`.trim() || "-"}
                </TableCell>
                <TableCell>{row.phone || "-"}</TableCell>
                <TableCell sx={{ textTransform: "capitalize" }}>
                  {row.tests || "-"}
                </TableCell>
                <TableCell>
                  {row.createdAt
                    ? dayjs(row.createdAt).format("DD/MM/YYYY")
                    : "-"}
                </TableCell>
                {/* <TableCell sx={{ minWidth: 120 }}>
                  {[row.opdId, row.patientId, row.ipdId, row.uhId]
                    .filter(Boolean)
                    .join(" / ") || "-"}
                </TableCell> */}
                <TableCell sx={{ minWidth: 120 }}>
                  {row.type || "-"}
                </TableCell>
                {Array.from({ length: maxPrescriptions }, (_, i) => {
                  const arr = row[searchField];
                  const value =
                    Array.isArray(arr) && i < arr.length ? arr[i] : "-";
                  return (
                    <TableCell
                      key={i}
                      sx={{
                        color: value === "-" ? "#aaa" : "#555",
                        minWidth: 120,
                      }}
                    >
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CustomLightTable;
