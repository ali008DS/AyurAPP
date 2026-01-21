import { Box, Typography } from "@mui/material";
import carePlanImage from "../../assets/care-plan.jpg";
import { useEffect, useState } from "react";
import { CarePlanType } from "../../utils/validationSchemas";
import ApiManager from "../services/apimanager";

interface CarePlanReceiptProps {
  prescriptionId: string;
}

const fields = {
  benefit: "Benefit",
  risk: "Risk",
  alternative: "Alternative",
  outcome: "Outcome",
  pathya: "Pathya",
  apathya: "Apathya",
  preventiveCare: "Preventive Care",
  curetetiveCare: "Curative Care",
  rehabilitativeCare: "Rehabilitative Care",
};

const CarePlanReceipt = ({ prescriptionId }: CarePlanReceiptProps) => {
  const [carePlanData, setCarePlanData] = useState<CarePlanType | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await ApiManager.getCarePlanByPres(prescriptionId);
        setCarePlanData(data?.data);
        console.log("Care Plan Data:", data);
      } catch (error) {
        console.error("Error fetching care plan receipt:", error);
      }
    })();
  }, [prescriptionId]);

  if (!carePlanData) return null;

  return (
    <Box
      sx={{
        backgroundImage: `url(${carePlanImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "210mm",
        minHeight: "297mm",
        paddingy: 5,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Box sx={{ paddingTop: 35, mx: 3 }}>
        {Object.entries(fields).map(([key, label]) => {
          if (!carePlanData.hasOwnProperty(key)) return null;
          return (
            <Typography p={1} variant="body1" component="li">
              <strong>{label}:</strong>
              {carePlanData[key as keyof CarePlanType] || ""}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default CarePlanReceipt;
