import dayjs from "dayjs";
import { createContext, useContext, ReactNode, useState } from "react";

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
  // optional fields populated when a stock batch is selected
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

interface TestItem {
  name: string;
  description: string;
  notes: string;
  marketPrice?: number;
  discountedPrice?: number;
}

interface TestCenter {
  center: string;
  test: TestItem[];
}

interface PrescriptionData {
  patient: string;
  vitals: Vitals;
  complaint: string;
  generalExamination: string;
  diagnosis: string;
  medicines: Medicine[];
  panchakarma: Panchakarma[];
  test: TestCenter[];
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
  createOn?: string;
  createdAt: string;
  opdId: string;
  selectedPanchakarmaGroupId?: string; // Track selected panchakarma group for draft restore
}

interface PrescriptionContextType {
  prescriptionData: PrescriptionData;
  updatePrescriptionData: (data: Partial<PrescriptionData>) => void;
}

const defaultPrescriptionData: PrescriptionData = {
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
  test: [],
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
  createOn: dayjs().toISOString(),
  createdAt: dayjs().toISOString(),
  opdId: "",
  selectedPanchakarmaGroupId: "",
};

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(
  undefined
);

export function PrescriptionProvider({ children }: { children: ReactNode }) {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>(
    defaultPrescriptionData
  );

  const updatePrescriptionData = (data: Partial<PrescriptionData>) => {
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

      // Make sure all test fields are properly preserved even when typed manually
      if (data.test) {
        newState.test = data.test.map((center) => ({
          center: center.center || "",
          test: center.test.map((test) => {
            // Ensure that if test name is present, all required fields are initialized
            // even if they're empty strings - this ensures they'll be included in API payload
            const hasName = Boolean(test.name && test.name.trim());
            return {
              name: test.name || "",
              description: hasName ? test.description || "" : test.description,
              notes: hasName ? test.notes || "" : test.notes,
              marketPrice: typeof test.marketPrice === "number" ? test.marketPrice : undefined,
              discountedPrice: typeof test.discountedPrice === "number" ? test.discountedPrice : undefined,
            };
          }),
        }));
      }

      return newState;
    });
  };

  return (
    <PrescriptionContext.Provider
      value={{ prescriptionData, updatePrescriptionData }}
    >
      {children}
    </PrescriptionContext.Provider>
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

export function usePrescription() {
  const context = useContext(PrescriptionContext);
  if (context === undefined) {
    throw new Error(
      "usePrescription must be used within a PrescriptionProvider"
    );
  }
  return context;
}
