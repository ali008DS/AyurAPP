import dayjs from "dayjs";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";

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
  cvs?: string;
  cns?: string;
}

export interface GeneralMedicine {
  type: string;
  name: string;
  dose: string;
  whenHow: string;
  stockItemId?: string;
  medicineId?: string;
  totalQuantityInAUnit?: number;
  unitType?: string;
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

interface GeneralPrescriptionData {
  patient: string;
  vitals: Vitals;
  complaint: string;
  generalExamination: string;
  diagnosis: string;
  medicines: GeneralMedicine[];
  test: TestCenter[];
  dietAndExercise: string;
  advice: string;
  nextVisit: string;
  menstrualHistory: string;
  internalNote: string;
  prescriptionType?: "offline" | "online";
  createOn?: string;
  createdAt: string;
  opdId: string;
  paymentStatus: "paid" | "unpaid";
  department: string;
  status?: string;
}

interface GeneralPrescriptionContextType {
  prescriptionData: GeneralPrescriptionData;
  updatePrescriptionData: (data: Partial<GeneralPrescriptionData>) => void;
}

const defaultGeneralPrescriptionData: GeneralPrescriptionData = {
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
  test: [],
  dietAndExercise: "",
  advice: "",
  nextVisit: dayjs().add(10, "day").toISOString(),
  menstrualHistory: "",
  internalNote: "",
  prescriptionType: "offline",
  createOn: dayjs().toISOString(),
  createdAt: dayjs().toISOString(),
  opdId: "",
  paymentStatus: "unpaid",
  department: "",
  status: "",
};

const GeneralPrescriptionContext = createContext<
  GeneralPrescriptionContextType | undefined
>(undefined);

export function GeneralPrescriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [prescriptionData, setPrescriptionData] =
    useState<GeneralPrescriptionData>(defaultGeneralPrescriptionData);

  const updatePrescriptionData = useCallback(
    (data: Partial<GeneralPrescriptionData>) => {
      setPrescriptionData((prev) => {
        const allowedKeys: (keyof GeneralPrescriptionData)[] = [
          "patient",
          "vitals",
          "complaint",
          "generalExamination",
          "diagnosis",
          "medicines",
          "test",
          "dietAndExercise",
          "advice",
          "nextVisit",
          "menstrualHistory",
          "internalNote",
          "prescriptionType",
          "createOn",
          "createdAt",
          "opdId",
          "paymentStatus",
          "department",
          "status",
        ];

        const newState: GeneralPrescriptionData = { ...prev };

        Object.keys(newState).forEach((key) => {
          if (!allowedKeys.includes(key as keyof GeneralPrescriptionData)) {
            delete (newState as unknown as Record<string, unknown>)[key];
          }
        });

        allowedKeys.forEach((key) => {
          if (data[key] === undefined) {
            return;
          }

          if (key === "medicines" && data.medicines) {
            newState.medicines = data.medicines.map((medicine) => ({
              type: medicine.type || "",
              name: medicine.name || "",
              dose: medicine.dose || "",
              whenHow: medicine.whenHow || "",
            }));
            return;
          }

          if (key === "test" && data.test) {
            newState.test = data.test.map((center) => ({
              center: center.center || "",
              test: center.test.map((test) => {
                const hasName = Boolean(test.name && test.name.trim());
                return {
                  name: test.name || "",
                  description: hasName
                    ? test.description || ""
                    : test.description,
                  notes: hasName ? test.notes || "" : test.notes,
                  marketPrice:
                    typeof test.marketPrice === "number"
                      ? test.marketPrice
                      : undefined,
                  discountedPrice:
                    typeof test.discountedPrice === "number"
                      ? test.discountedPrice
                      : undefined,
                };
              }),
            }));
            return;
          }

          // handle nested vitals merge to avoid dropping defaults when partial updates arrive
          if (key === "vitals" && data.vitals) {
            newState.vitals = {
              ...newState.vitals,
              ...data.vitals,
            };
            return;
          }

          const nextValue = data[key];
          if (nextValue !== undefined) {
            (newState as Record<keyof GeneralPrescriptionData, unknown>)[key] =
              nextValue as GeneralPrescriptionData[typeof key];
          }
        });

        return newState;
      });
    },
    []
  );

  return (
    <GeneralPrescriptionContext.Provider
      value={{ prescriptionData, updatePrescriptionData }}
    >
      {children}
    </GeneralPrescriptionContext.Provider>
  );
}

export function validateGeneralVitals(vitals: Vitals) {
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
  return errors;
}

export function useGeneralPrescription() {
  const context = useContext(GeneralPrescriptionContext);
  if (context === undefined) {
    throw new Error(
      "useGeneralPrescription must be used within a GeneralPrescriptionProvider"
    );
  }
  return context;
}
