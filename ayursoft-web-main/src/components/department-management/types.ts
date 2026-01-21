import { Panchakarma } from "../prescription/context/PrescriptionContext";

export type Department = {
  id: string;
  name: string;
  createdAt: string;
};

export interface DiagnosticDetails {
  painIntensity?: string;
  painType?: string;
  painDuration?: string;
  bleedingIntensity?: string;
  bleedingType?: string;
  burning?: string;
  itching?: string;
  analBulgingSwelling?: string;
  discharge?: string;
  dischargeType?: string;
  bowelHabits?: string[];
  sittingTime?: string;
  mucusInStool?: string;
  diarrhea?: string;
  fecalUrgeAfterMeal?: string;
  fecalUrgeWithoutMeal?: string;
  fecalFlatulenceIncontinence?: string;
  digestiveDisorders?: string[];
  otherSymptoms?: string;
  previousHistory?: string;
}

export interface Medicine {
  type?: string;
  name?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  whenHow?: string;
}

export interface Vital {
  pulse?: string;
  height?: string;
  weight?: string;
  bmi?: string;
  spo2?: string;
  rbs?: string;
  abdGrith?: string;
  bpSystolic?: string;
  bpDiastolic?: string;
  cvs?: string;
  cns?: string;
}

export interface Test {
  // Define this according to its actual structure.
  [key: string]: any;
}

export enum PaymentStatus {
  PAID = "paid",
  UNPAID = "unpaid",
}

export enum PrescriptionType {
  OFFLINE = "offline",
  ONLINE = "online",
}

export interface PrescriptionPilesType {
  _id: string;
  patient: {
    _id: string;
    opdId?: string;
    patientId?: string;
    firstName: string;
    lastName: string;
    gender?: string;
    phone?: string;
    dob?: string;
    attendantName?: string;
    uhId?: string;
    relationship?: "S/o" | "D/o" | "W/o" | "H/o";
    relativeName?: string;
  };
  vitals: Vital;
  diagnosticDetails?: DiagnosticDetails;
  complaint?: string;
  generalExamination?: string;
  diagnosis?: string;
  medicines?: Medicine[];
  panchakarma?: Panchakarma[];
  test?: Test[];
  dietAndExercise?: string;
  advice?: string;
  nextVisit?: string;
  menstrualHistory?: string;
  internalNote?: string;
  user?: string;
  paymentStatus: PaymentStatus;
  prescriptionType?: PrescriptionType;
  department: {
    _id?: string;
    name: string;
  };
  createdAt: string;
  createOn?: string;
  opdId?: string;
  updatedAt: string;
}

export enum UnitType {
  STRIP = 'strip',
  BOTTLE = 'bottle',
  PACKET = 'packet',
  BOX = 'box',
  JAR = 'jar',
  TAB = 'tab.',
  CAP = 'cap.',
  SYP = 'syp.',
  INJ = 'inj.',
  OIL = 'oil.',
  POW = 'pow.',
  OINT = 'oint.',
  LEP = 'lep.',
  AVLEH = 'avleh.',
  PASTE = 'paste.',
  KADHA = 'kadha.',
  SPRAY = 'spray.',
  DROP = 'drop.',
  LINI = 'lini.',
  RESIN = 'resin',
  MALT = 'malt',
  KWATH = 'kwath',
  PATCH = 'patch',
  POUCH = 'pouch',
  JERRY_CAN = 'jerry can',
  LITER = 'liter',
};

export enum UnitTypeBase {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SYRUP = 'syrup',
  INJECTION = 'injection',
  CREAM = 'cream',
  OINTMENT = 'ointment',
  POWDER = 'powder',
  SACHET = 'sachet',
  TAB = 'tab.',
  CAP = 'cap.',
  SYP = 'syp.',
  INJ = 'inj.',
  OIL = 'oil.',
  POW = 'pow.',
  OINT = 'oint.',
  LEP = 'lep.',
  AVLEH = 'avleh.',
  PASTE = 'paste.',
  KADHA = 'kadha.',
  SPRAY = 'spray.',
  DROP = 'drop.',
  LINI = 'lini.',
  RESIN = 'resin',
  MALT = 'malt',
  KWATH = 'kwath',
  PATCH = 'patch',
  POUCH = 'pouch',
  JERRY_CAN = 'jerry can',
  LITER = 'liter'
}
export interface PurchaseEntry {
  medicine: string;
  unitType: UnitType;
  unitConversion: number;
  quantityPurchased: number;
  totalPrice: number;
  purchaseDate: string;
  unitTypeBase: UnitTypeBase;
  pricePerUnit: number;
}

export interface BedOccupancy {
  _id: string;
  bed: string; // ObjectId as string
  patient: string | null; // ObjectId as string or null
  releasedAt: string | null; // ISO date string or null
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export enum FloorType {
  FLOOR_0 = 'floor0',
  FLOOR_1 = 'floor1',
}

export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

export interface BedPatient {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  uhId: string;
  ipdId: string;
  opdId: string;
}

export interface Bed {
  _id: string;
  bedId: string;
  bedType: string; // e.g., "child" | "general"
  floor: FloorType;   // e.g., "floor0" | "floor1"
  status: BedStatus;  // e.g., "available" | "occupied"
  patient: BedPatient | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface MedicineStock {
  _id: string;
  name: string;
  __v: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  manufacturer: string;
  baseUnitType: string;
  totalQuantityInAUnit: number;
  unitType: string;
}

export interface StockItem {
  _id: string;
  medicine: MedicineStock;
  batchNumber: string;
  __v: number;
  createdAt: string; // ISO date string
  expiryDate: string; // ISO date string
  totalQuantity: number;
  sellingPrice: number;
  unitType: string;
  updatedAt: string; // ISO date string
}

// Shared option shape used in Autocomplete lists for stock/batch entries
export interface StockOption {
  _id: string;
  medicineId?: string;
  name: string;
  batchNumber?: string;
  totalQuantity: number;
  unitType?: string;
  totalQuantityInAUnit?: number;
}

export enum TaxType {
  CENTRAL = 'central',
  STATE = 'state',
  NO_TAX = 'noTax',
}

export interface MedicineWithStock {
  _id: string;
  name: string;
  description: string | null;
  manufacturer: string;
  unitType: string;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
  totalQuantity: number;
}
