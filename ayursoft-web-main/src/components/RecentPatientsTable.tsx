import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

interface Patient {
  id: number;
  name: string;
  date: string;
  payStatus: string;
}

const patients: Patient[] = [
  { id: 1, name: "John Doe", date: "2023-05-01", payStatus: "Paid" },
  {
    id: 2,
    name: "Jane Smith",
    date: "2023-05-02",
    payStatus: "Paid",
  },
  { id: 3, name: "Bob Johnson", date: "2023-05-03", payStatus: "Unpaid" },
];

function RecentPatientsTable() {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        boxShadow: 1,
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          Recent Patients
        </Typography>
        <Table stickyHeader aria-label="recent patients table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>PayStatus</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.date}</TableCell>
                <TableCell>{patient.payStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default RecentPatientsTable;
