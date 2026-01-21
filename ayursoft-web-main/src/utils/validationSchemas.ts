import { z } from "zod";
import { TaxType } from "../components/department-management/types";
export const patientSchema = z.object({
  firstName: z.string().nonempty("First Name is required"),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .nonempty("Phone number is required"),
  age: z.string().nonempty("Age is required"),
  address: z.string().optional(),
  dob: z.string().nonempty("Date of Birth is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z
    .enum(["enquiry", "active", "inactive", "patient", "rejected"])
    .refine((val) => val !== undefined, {
      message: "Status is required",
    }),
  uhId: z.string().optional(),
  ipdId: z.string().optional(),
  opdId: z.string().optional(),
});

export const perescriptionSchema = z.object({
  name: z.string().nonempty("Name is required"),
  phone: z.string().nonempty("Phone is required"),
  age: z.string().nonempty("Age is required"),
  conmplains: z.string(),
  generalExamination: z.string(),
  Diagnosists: z.string(),

  patientId: z.string().nonempty("Patient is required"),
  doctorId: z.string().nonempty("Doctor is required"),
  diagnosis: z.string().nonempty("Diagnosis is required"),
  medicines: z.array(
    z.object({
      name: z.string().nonempty("Medicine name is required"),
      dose: z.string().nonempty("Dose is required"),
      duration: z.string().nonempty("Duration is required"),
    })
  ),
  followUp: z.string().nonempty("Follow up is required"),
  notes: z.string().nonempty("Notes is required"),
});

export const carePlanSchema = z.object({
  prescriptionId: z.string().nonempty("Prescription ID is required"),
  benefit: z.string().optional(),
  risk: z.string().optional(),
  alternative: z.string().optional(),
  outcome: z.string().optional(),
  pathya: z.string().optional(),
  apathya: z.string().optional(),
  preventiveCare: z.string().optional(),
  curativeCare: z.string().optional(),
  rehabilitativeCare: z.string().optional(),
  curetetiveCare: z.string().optional(),
});

export default {
  patientSchema,
};

export type CarePlanType = z.infer<typeof carePlanSchema>;

export const MedicineSaleSchema = z
  .object({
    status: z.enum(["paid", "pending"], {
      required_error: "Status is required",
    }),
    patientType: z.enum(["patient", "nonPatient"], {
      required_error: "Patient type is required",
    }),
    patient: z.string().nullable(),
    nonPatientName: z.string().optional(),
    nonPatientPhone: z.string().optional(),
    saleDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid sale date format",
    }),
    discount: z.coerce
      .number()
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%"),
    paidAmount: z.coerce
      .number()
      .nonnegative("Paid amount must be non-negative")
      .optional(),
    totalAmount: z.coerce.number().min(0, "Total amount must be non-negative"),
    medicines: z
      .array(
        z.object({
          medicine: z.string().optional(),
          stockItemId: z.string().optional(),
          sellingUnitType: z.string().optional(),
          totalUnit: z.coerce.number().optional(),
          totalQuantityInAUnit: z.coerce.number().optional(),
          price: z.coerce.number().optional(),
          totalPrice: z.coerce.number().optional(),
          batchNumber: z.string().optional(),
        })
      )
      .optional(),
    bank: z.string().optional(),
    paymentType: z.enum(["cash", "online"]).default("cash"),
  })
  .superRefine((data, ctx) => {
    // If paymentType is 'online', bank must be provided
    if (data.paymentType === "online") {
      if (!data.bank || data.bank.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bank selection is required for online payment.",
          path: ["bank"],
        });
      }
    }

    // If patientType is 'patient', patient must be provided
    if (data.patientType === "patient") {
      if (!data.patient) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Patient selection is required.",
          path: ["patient"],
        });
      }
    }

    // If patientType is 'nonPatient', nonPatientName and nonPatientPhone must be provided
    if (data.patientType === "nonPatient") {
      if (!data.nonPatientName || data.nonPatientName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required for non-patient.",
          path: ["nonPatientName"],
        });
      }
      if (!data.nonPatientPhone || data.nonPatientPhone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone is required for non-patient.",
          path: ["nonPatientPhone"],
        });
      }
    }
  });

export type MedicineSaleType = z.infer<typeof MedicineSaleSchema>;

export const ManufacturerFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  agencyName: z
    .string()
    .min(3, "Agency Name must be at least 3 characters long"),
  mrName: z.string().min(3, "MR Name must be at least 3 characters long"),
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  secondaryNumber: z
    .string()
    .regex(/^\d{10}$/, "Secondary number must be exactly 10 digits")
    .optional(),
});

export type ManufacturerFormType = z.infer<typeof ManufacturerFormSchema> & {
  id: string; // Add id property for patch API
};

export const PurchaseEntrySchema = z
  .object({
    medicine: z.string().min(1, "Medicine name is required"),
    totalPurchasedUnit: z.coerce
      .number()
      .nonnegative()
      .min(1, "Total purchased unit must be at least 1"),
    pricePerUnit: z.coerce
      .number()
      .nonnegative()
      .min(1, "Price per unit must be at least 1"),
    totalPrice: z.coerce
      .number()
      .nonnegative()
      .min(1, "Total price must be at least 1"),
    mrp: z.coerce.number().nonnegative().min(1, "MRP must be at least 1"),
    batchNumber: z.string().min(1, "Batch number is required"),
    taxType: z.nativeEnum(TaxType, {
      errorMap: () => ({ message: "Tax type is required" }),
    }),
    // Make tax fields optional initially, as their requirement is conditional
    cgst: z.coerce
      .number()
      .nonnegative("CGST must be non-negative")
      .max(100)
      .optional(),
    sgst: z.coerce
      .number()
      .nonnegative("SGST must be non-negative")
      .max(100)
      .optional(),
    igst: z.coerce
      .number()
      .nonnegative("IGST must be non-negative")
      .max(100)
      .optional(),
    purchaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    manufacturingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    sellingPrice: z.coerce
      .number()
      .nonnegative()
      .min(1, "Selling price must be at least 1"),
    discount: z.coerce
      .number()
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%"),
    hsnCode: z.string().min(1, "HSN Code is required"),
  })
  .superRefine((data, ctx) => {
    // If taxType is 'central', IGST must be provided and be greater than 0
    if (data.taxType === TaxType.CENTRAL) {
      if (!data.igst || data.igst <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "IGST is required and must be greater than 0.",
          path: ["igst"],
        });
      }
    }

    // If taxType is 'state', CGST and SGST must be provided and be greater than 0
    if (data.taxType === TaxType.STATE) {
      if (!data.cgst || data.cgst <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CGST is required and must be greater than 0.",
          path: ["cgst"],
        });
      }
      if (!data.sgst || data.sgst <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SGST is required and must be greater than 0.",
          path: ["sgst"],
        });
      }
    }
  });

export type PurchaseEntryType = z.infer<typeof PurchaseEntrySchema>;

// Simplified Open Stock Schema matching CreateOpeningStockDto
export const OpenStockSchema = z.object({
  medicine: z.string().min(1, "Medicine is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  adjustmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  totalQuantity: z.coerce
    .number()
    .nonnegative()
    .min(1, "Total quantity must be at least 1"),
  sellingPrice: z.coerce
    .number()
    .positive("Selling price must be greater than 0"),
  manufacturingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export type OpenStockType = z.infer<typeof OpenStockSchema>;

export const DistributorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  gstNo: z.string().min(15, "GST number must be at least 15 characters long"),
  primaryContactNo: z
    .string()
    .regex(/^\d{10}$/, "Primary contact number must be exactly 10 digits"),
  secondaryContactNo: z
    .string()
    .regex(/^\d{10}$/, "Secondary contact number must be exactly 10 digits")
    .optional(),
  address: z.string().min(10, "Address must be at least 10 characters long"),
});

export type DistributorFormType = z.infer<typeof DistributorFormSchema> & {
  id: string; // Add id property for patch API
};

export const userSchema = z.object({
  firstName: z.string().min(3, "First Name must be at least 3 characters long"),
  lastName: z.string().nonempty("Last Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  userRole: z.string().nonempty("Role is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  recurringOffDays: z.array(z.string()).optional(),
  customOffDays: z.array(z.string()).optional(),
});

export const updateUserSchema = userSchema.extend({
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters long",
    }),
});

export type UserFormType = z.infer<typeof userSchema>;
export type UpdateUserFormType = z.infer<typeof updateUserSchema>;
