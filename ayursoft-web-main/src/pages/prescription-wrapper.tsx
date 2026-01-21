import { useParams } from "react-router-dom";
import Prescription from "../components/prescription/components/Prescription";

interface PrescriptionWrapperProps {
  mode: "create" | "edit";
}

const PrescriptionWrapper = ({ mode }: PrescriptionWrapperProps) => {
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

  return <Prescription {...prescriptionProps} />;
};

export default PrescriptionWrapper;
