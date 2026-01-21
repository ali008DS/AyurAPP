import { useParams } from "react-router-dom";
import PilesPrescription from "../components/piles-prescription/components/PilesPrescription";

interface PilesPrescriptionWrapperProps {
  mode: "create" | "edit";
}

const PilesPrescriptionWrapper = ({ mode }: PilesPrescriptionWrapperProps) => {
  const { patientId, prescriptionID } = useParams<{
    patientId: string;
    prescriptionID: string;
  }>();

  const prescriptionProps = {
    patientId: patientId || "",
    prescriptionID: prescriptionID || "",
    mode: mode || "create",
  };

  if (mode === "edit" && !prescriptionID) {
    return <div>Invalid prescription ID</div>;
  }

  return <PilesPrescription {...prescriptionProps} />;
};

export default PilesPrescriptionWrapper;
