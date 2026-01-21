import dayjs from "dayjs";
import { createContext, useContext, useState, ReactNode } from "react";

interface Vitals {
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  height: string;
  weight: string;
  bmi: string;
  spo2: string;
  rbs: string;
  abdGrith: string;
  cvs?: string; // Optional fields for additional vitals
  cns?: string; // Optional fields for additional vitals
}

export interface Medicine {
  type: string;
  name: string;
  dose: string;
  whenHow: string;
  stockItemId?: string;
  medicineId?: string;
  totalQuantityInAUnit?: number;
  unitType?: string;
}

export interface Panchakarma {
  therapy: string;
  oil: string;
  quantity: string;
  duration: string;
  days: string;
}

type TestItem = {
  name: string;
  description: string;
  notes: string;
  marketPrice?: number;
  discountedPrice?: number;
};

interface TestCenter {
  center: string;
  test: TestItem[];
}

// Add the diagnostic fields from the image
interface DiagnosticDetails {
  // Pain related fields
  painIntensity: "0" | "1" | "2";
  painType: string[];
  painDuration: string;

  // Bleeding related fields
  bleedingIntensity: "0" | "1" | "2";
  bleedingType: string[];

  // Other symptoms
  burning: "0" | "1" | "2";
  itching: "0" | "1" | "2";
  analBulgingSwelling: "0" | "1" | "2";
  discharge: "0" | "1" | "2";

  // Discharge type
  dischargeType: string[];

  // Bowel habits
  // constipation: boolean;
  // hardStool: boolean;

  // Sitting time
  sittingTime: string;

  // Other diagnostic questions
  mucusInStool: "Yes" | "No" | "";
  diarrhea: "Yes" | "No" | "";
  fecalUrgeAfterMeal: "Yes" | "No" | "";
  fecalUrgeWithoutMeal: "Yes" | "No" | "";
  fecalFlatulenceIncontinence: "Yes" | "No" | "";

  digestiveDisorders: string[];
  bowelHabits: string[];
  // Digestive disorders
  // indigestion: boolean;
  // anorexia: boolean;
  // bloating: boolean;
  // gas: boolean;
  // acidity: boolean;

  // Additional fields for free text
  otherSymptoms: string;
  previousHistory: string;
}

export interface PilesPrescriptionData {
  patient: string;
  vitals: Vitals;
  complaint: string;
  generalExamination: string;
  diagnosis: string;
  medicines: Medicine[];
  panchakarma: Panchakarma[];
  selectedPanchakarmaGroupId?: string; // Track selected panchakarma group for draft restore
  test: TestCenter[];
  marketPriceTotal?: number;
  discountedPriceTotal?: number;
  dietAndExercise: string;
  user: any;
  advice: string;
  nextVisit: string;
  menstrualHistory: string;
  internalNote: string;
  paymentStatus: "paid" | "unpaid";
  prescriptionType?: "offline" | "online";
  rt: string;
  lt: string;
  both: string;
  diagnosticDetails: DiagnosticDetails;
  createOn?: string;
  createdAt: string;
  opdId: string;
}

interface PilesPrescriptionContextType {
  prescriptionData: PilesPrescriptionData;
  updatePrescriptionData: (data: Partial<PilesPrescriptionData>) => void;
}

const defaultDiagnosticDetails: DiagnosticDetails = {
  painIntensity: "0",
  painType: [],
  painDuration: "",
  bleedingIntensity: "0",
  bleedingType: [],
  burning: "0",
  itching: "0",
  analBulgingSwelling: "0",
  discharge: "0",
  dischargeType: [],
  sittingTime: "",
  mucusInStool: "",
  diarrhea: "",
  fecalUrgeAfterMeal: "",
  fecalUrgeWithoutMeal: "",
  fecalFlatulenceIncontinence: "",
  otherSymptoms: "",
  previousHistory: "",
  digestiveDisorders: [],
  bowelHabits: [],
};

const defaultPilesPrescriptionData: PilesPrescriptionData = {
  patient: "",
  vitals: {
    bpSystolic: "",
    bpDiastolic: "",
    pulse: "",
    height: "",
    weight: "",
    bmi: "",
    spo2: "",
    rbs: "",
    abdGrith: "",
    cvs: "",
    cns: "",
  },
  complaint: "",
  generalExamination: "",
  diagnosis: "",
  medicines: [
    {
      type: "",
      name: "",
      dose: "",
      whenHow: "",
    },
  ],
  panchakarma: [],
  selectedPanchakarmaGroupId: "",
  test: [],
  marketPriceTotal: 0,
  discountedPriceTotal: 0,
  dietAndExercise: "",
  advice: "",
  user: {},
  nextVisit: dayjs().add(10, "day").toISOString(), // Default to 10 days from now
  menstrualHistory: "",
  internalNote: "",
  paymentStatus: "unpaid",
  prescriptionType: "offline",
  rt: "",
  lt: "",
  both: "",
  diagnosticDetails: defaultDiagnosticDetails,
  createOn: dayjs().toISOString(),
  createdAt: dayjs().toISOString(),
  opdId: "",
};

const PilesPrescriptionContext = createContext<
  PilesPrescriptionContextType | undefined
>(undefined);

export function PilesPrescriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [prescriptionData, setPrescriptionData] =
    useState<PilesPrescriptionData>(defaultPilesPrescriptionData);

  const updatePrescriptionData = (data: Partial<PilesPrescriptionData>) => {
    setPrescriptionData((prev) => {
      // Create a deep copy of the previous state
      const newState = { ...prev, ...data };

      // Make sure all medicine fields are properly preserved even when typed manually
      if (data.medicines) {
        newState.medicines = data.medicines.map((medicine) => ({
          type: medicine.type || "",
          name: medicine.name || "",
          dose: medicine.dose || "",
          whenHow: medicine.whenHow || "",
        }));
      }

      // Make sure all panchakarma fields are properly preserved
      if (data.panchakarma) {
        newState.panchakarma = data.panchakarma.map((item) => ({
          therapy: item.therapy || "",
          oil: item.oil || "",
          quantity: item.quantity || "",
          duration: item.duration || "",
          days: item.days || "",
        }));
      }

      // Make sure all test fields are properly preserved even when typed manually
      if (data.test) {
        newState.test = data.test.map((center) => ({
          center: center.center || "",
          test: center.test.map((test) => ({
            name: test.name || "",
            description: test.description || "",
            notes: test.notes || "",
            marketPrice: test.marketPrice,
            discountedPrice: test.discountedPrice,
          })),
        }));
        // Also update outer totals if present
        if ('marketPriceTotal' in data) newState.marketPriceTotal = data.marketPriceTotal;
        if ('discountedPriceTotal' in data) newState.discountedPriceTotal = data.discountedPriceTotal;
      }

      return newState;
    });
  };

  return (
    <PilesPrescriptionContext.Provider
      value={{ prescriptionData, updatePrescriptionData }}
    >
      {children}
    </PilesPrescriptionContext.Provider>
  );
}

export function validateVitals(vitals: Vitals) {
  const errors: string[] = [];
  if (isNaN(parseInt(vitals.bpSystolic))) {
    errors.push("- BP Systolic must be a number");
  }
  if (isNaN(parseInt(vitals.bpDiastolic))) {
    errors.push("- BP Diastolic must be a number");
  }
  if (isNaN(parseInt(vitals.pulse))) {
    errors.push("- Pulse must be a number");
  }
  if (isNaN(parseInt(vitals.spo2))) {
    errors.push("- SPO2 must be a number");
  }
  // removed rbs amd abd grith validation
  return errors;
}

export function usePilesPrescription() {
  const context = useContext(PilesPrescriptionContext);
  if (context === undefined) {
    throw new Error(
      "usePilesPrescription must be used within a PilesPrescriptionProvider"
    );
  }
  return context;
}
