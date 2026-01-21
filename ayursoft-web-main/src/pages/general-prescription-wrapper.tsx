import { useParams } from "react-router-dom";
import GeneralPrescription from "../components/general-prescription/components/GeneralPrescription";

interface GeneralPrescriptionWrapperProps {
  mode: "create" | "edit";
}

const GeneralPrescriptionWrapper = ({
  mode,
}: GeneralPrescriptionWrapperProps) => {
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

  return <GeneralPrescription {...prescriptionProps} />;
};

export default GeneralPrescriptionWrapper;
