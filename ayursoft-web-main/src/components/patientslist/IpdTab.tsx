import CardRender from "./cardsection/IPDinside"; // Importing CardRender for dynamic data rendering

const ipdData = [
  {
    id: 1,
    doctorNote: "Review of diabetes management.",
    date: "2024-12-01",
    prescriptionNo: "2025",
    name: "Ramesh Sharma",
    lastVisit: "2024-11-25",
    nextVisit: "2024-12-15",
    patientAge: 45,
  },
  {
    id: 2,
    doctorNote: "Follow-up on hypertension.",
    date: "2024-12-02",
    prescriptionNo: "2026",
    name: "Suman Devi",
    lastVisit: "2024-11-20",
    nextVisit: "2024-12-18",
    patientAge: 50,
  },
  {
    id: 3,
    doctorNote: "Chronic back pain review.",
    date: "2024-12-03",
    prescriptionNo: "2027",
    name: "Arun Kumar",
    lastVisit: "2024-11-15",
    nextVisit: "2024-12-20",
    patientAge: 38,
  },
  {
    id: 4,
    doctorNote: "Post-surgery consultation.",
    date: "2024-12-04",
    prescriptionNo: "2028",
    name: "Meena Gupta",
    lastVisit: "2024-11-22",
    nextVisit: "2024-12-25",
    patientAge: 29,
  },
  {
    id: 5,
    doctorNote: "Allergy treatment.",
    date: "2024-12-05",
    prescriptionNo: "2029",
    name: "Rajiv Das",
    lastVisit: "2024-11-28",
    nextVisit: "2024-12-29",
    patientAge: 40,
  },
  {
    id: 6,
    doctorNote: "Flu and fever follow-up.",
    date: "2024-12-06",
    prescriptionNo: "2030",
    name: "Priya Singh",
    lastVisit: "2024-11-29",
    nextVisit: "2024-12-30",
    patientAge: 32,
  },
  {
    id: 7,
    doctorNote: "Joint pain review.",
    date: "2024-12-07",
    prescriptionNo: "2031",
    name: "Anil Kapoor",
    lastVisit: "2024-11-27",
    nextVisit: "2024-12-31",
    patientAge: 55,
  },
  {
    id: 8,
    doctorNote: "Headache and stress management.",
    date: "2024-12-08",
    prescriptionNo: "2032",
    name: "Sunita Rao",
    lastVisit: "2024-11-26",
    nextVisit: "2024-12-28",
    patientAge: 27,
  },
  {
    id: 9,
    doctorNote: "Routine check-up for cholesterol.",
    date: "2024-12-09",
    prescriptionNo: "2033",
    name: "Amit Verma",
    lastVisit: "2024-11-30",
    nextVisit: "2024-12-10",
    patientAge: 48,
  },
  {
    id: 10,
    doctorNote: "Thyroid medication follow-up.",
    date: "2024-12-10",
    prescriptionNo: "2034",
    name: "Seema Patil",
    lastVisit: "2024-11-18",
    nextVisit: "2024-12-12",
    patientAge: 36,
  },
  {
    id: 11,
    doctorNote: "Back pain treatment update.",
    date: "2024-12-11",
    prescriptionNo: "2035",
    name: "Vikram Singh",
    lastVisit: "2024-11-23",
    nextVisit: "2024-12-14",
    patientAge: 42,
  },
  {
    id: 12,
    doctorNote: "Vitamin D deficiency management.",
    date: "2024-12-12",
    prescriptionNo: "2036",
    name: "Neelam Joshi",
    lastVisit: "2024-11-25",
    nextVisit: "2024-12-16",
    patientAge: 33,
  },
];


const IPDTab = () => {
  return (
    <div>
      <CardRender ipdData={ipdData} />
    </div>
  );
};

export default IPDTab;