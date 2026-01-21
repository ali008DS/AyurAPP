import {
  ClipboardList,
  Activity,
  LineChart,
  FileText,
  HeartPulse,
  Utensils,
  Stethoscope,
  Pill,
  TrendingUp,
} from "lucide-react";
import ProcedureCarePlan from "../components/therapy-docs/ProcedureCarePlan";
import DailyVitalFeedback from "../components/therapy-docs/DailyVitalFeedback";
import PainScoringChart from "../components/therapy-docs/PainScoringChart";
import TherapistNotes from "../components/therapy-docs/TherapistNotes";
import VitalChart from "../components/therapy-docs/VitalChart";
import DailyDietAssessmentForm from "../components/therapy-docs/dayliDiestAssesmentForm";
import NurseObservationForm from "../components/therapy-docs/nurseObserVationForm";
import DailyMedicationsSchedule from "../components/therapy-docs/dailyMedicationsSchedule";
import ProgressNotes from "../components/therapy-docs/progressNotes";
import ProcedureCarePrint from "../components/therapy-docs/print/ProcedureCarePrint";
import DailyVitalFeedbackPrint from "../components/therapy-docs/print/DailyVitalFeedbackPrint";
import PainScoringChartPrint from "../components/therapy-docs/print/PainScoringChartPrint";
import TherapistNotesPrint from "../components/therapy-docs/print/TherapistNotesPrint";
import VitalChartPrint from "../components/therapy-docs/print/VitalChartPrint";
import DailyDietAssessmentPrint from "../components/therapy-docs/print/DailyDietAssessmentPrint";
import NurseObservationPrint from "../components/therapy-docs/print/NurseObservationPrint";
import DailyMedicationsPrint from "../components/therapy-docs/print/DailyMedicationsPrint";
import ProgressNotesPrint from "../components/therapy-docs/print/ProgressNotesPrint";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  apiKey: string;
  component: React.ComponentType<any>;
}

const reportCards: ReportCard[] = [
  {
    id: "1",
    title: "Procedure Care Plan",
    description: "Comprehensive treatment and care planning documentation",
    icon: ClipboardList,
    color: "#1976d2",
    bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    apiKey: "procedureCare",
    component: ProcedureCarePlan,
  },
  {
    id: "2",
    title: "Daily Vital Pain Scoring & Daily Feedback Form",
    description: "Track patient vitals, pain levels, and daily feedback",
    icon: Activity,
    color: "#2e7d32",
    bgGradient: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    apiKey: "dailyVitalFeedback",
    component: DailyVitalFeedback,
  },
  {
    id: "3",
    title: "Pain Scoring Chart",
    description: "Visual pain assessment and tracking over time",
    icon: HeartPulse,
    color: "#ed6c02",
    bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    apiKey: "painScoring",
    component: PainScoringChart,
  },
  {
    id: "4",
    title: "Therapist Notes",
    description: "Clinical notes and observations from therapy sessions",
    icon: FileText,
    color: "#9c27b0",
    bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    apiKey: "therapistNote",
    component: TherapistNotes,
  },
  {
    id: "5",
    title: "Vital Chart",
    description: "IPD Patient's vital signs tracking",
    icon: LineChart,
    color: "#d32f2f",
    bgGradient: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
    apiKey: "vitalChart",
    component: VitalChart,
  },
  {
    id: "6",
    title: "Daily Diet Assessment Form",
    description: "Assessment of patient's dietary habits and nutritional needs",
    icon: Utensils,
    color: "#0288d1",
    bgGradient: "linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)",
    apiKey: "dailyDietAssessment",
    component: DailyDietAssessmentForm,
  },
  {
    id: "7",
    title: "Nurse Observation Form",
    description: "Documentation of nurse observations and patient interactions",
    icon: Stethoscope,
    color: "#009688",
    bgGradient: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
    apiKey: "nurseObservation",
    component: NurseObservationForm,
  },
  {
    id: "8",
    title: "Daily Medications Schedule",
    description: "Schedule for patient medications and dosages",
    icon: Pill,
    color: "#00796b",
    bgGradient: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
    apiKey: "dailyMedication",
    component: DailyMedicationsSchedule,
  },
  {
    id: "9",
    title: "Progress Notes",
    description: "Documentation of patient progress and treatment outcomes",
    icon: TrendingUp,
    color: "#ec407a",
    bgGradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    apiKey: "progressNote",
    component: ProgressNotes,
  },
];

export default reportCards;

// Helper function to get print configuration for a given card
export async function getPrintConfig(
  cardId: string,
  therapyId: string
): Promise<{
  component: React.ReactNode;
  title: string;
  documentTitle: string;
  orientation?: "portrait" | "landscape";
} | null> {
  // Import ApiManager dynamically to avoid circular dependencies
  const { default: ApiManager } = await import(
    "../components/services/apimanager"
  );

  let printComponent: React.ReactNode;
  let title: string;
  let documentTitle: string;

  // Map each card to its print component and fetch required data
  switch (cardId) {
    case "1": // Procedure Care Plan
      const procedureResponse = await ApiManager.getProcedureCaresByTherapyId(
        therapyId
      );
      if (procedureResponse?.data?.length > 0) {
        printComponent = (
          <ProcedureCarePrint procedureId={procedureResponse.data[0]._id} />
        );
        title = "Procedure Care Plan - Print Preview";
        documentTitle = "Procedure Care Plan";
      } else {
        console.warn("No procedure care data found");
        return null;
      }
      break;

    case "2": // Daily Vital Feedback
      printComponent = <DailyVitalFeedbackPrint therapyId={therapyId} />;
      title = "Daily Vital Pain Scoring & Daily Feedback Form - Print Preview";
      documentTitle = "Daily Vital Feedback";
      return {
        component: printComponent,
        title,
        documentTitle,
        orientation: "landscape",
      };

    case "3": // Pain Scoring Chart
      printComponent = <PainScoringChartPrint therapyId={therapyId} />;
      title = "Pain Scoring Chart - Print Preview";
      documentTitle = "Pain Scoring Chart";
      break;

    case "4": // Therapist Notes
      printComponent = <TherapistNotesPrint therapyId={therapyId} />;
      title = "Therapist Notes - Print Preview";
      documentTitle = "Therapist Notes";
      break;

    case "5": // Vital Chart
      printComponent = <VitalChartPrint therapyId={therapyId} />;
      title = "Vital Chart - Print Preview";
      documentTitle = "Vital Chart";
      break;

    case "6": // Daily Diet Assessment
      printComponent = <DailyDietAssessmentPrint therapyId={therapyId} />;
      title = "Daily Diet Assessment Form - Print Preview";
      documentTitle = "Daily Diet Assessment";
      break;

    case "7": // Nurse Observation
      printComponent = <NurseObservationPrint therapyId={therapyId} />;
      title = "Nurse Observation Form - Print Preview";
      documentTitle = "Nurse Observation";
      return {
        component: printComponent,
        title,
        documentTitle,
        orientation: "landscape",
      };

    case "8": // Daily Medications
      printComponent = <DailyMedicationsPrint therapyId={therapyId} />;
      title = "Daily Medications Schedule - Print Preview";
      documentTitle = "Daily Medications";
      break;

    case "9": // Progress Notes
      printComponent = <ProgressNotesPrint therapyId={therapyId} />;
      title = "Progress Notes - Print Preview";
      documentTitle = "Progress Notes";
      break;

    default:
      console.warn("Unknown card ID:", cardId);
      return null;
  }

  return {
    component: printComponent,
    title,
    documentTitle,
  };
}
