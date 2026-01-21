import React, { createContext, useContext, useState, useCallback } from "react";
import apimanager from "../components/services/apimanager";
import { Patient } from "../types/patient";

interface PatientsContextType {
  patients: Patient[];
  loading: boolean;
  totalCount: number;
  fetchPatients: (
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<void>;
}

const PatientsContext = createContext<PatientsContextType | undefined>(
  undefined
);

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPatients = useCallback(
    async (page: number = 1, limit: number = 30, search: string = "") => {
      try {
        setLoading(true);
        const response = await apimanager.getPatients(page, limit, search);

        // The response now contains the full API response including data and metadata
        const patientsData = response.data.data.map((patient: any) => ({
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient?.lastName,
          relativeName: patient?.relativeName,
          relationship: patient?.relationship,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          dob: patient.dob,
          opdId: patient.opdId,
          ipdId: patient.ipdId,
          uhId: patient.uhId,
          patientId: patient.patientId,
          city: patient.city,
          state: patient.state,
          status: patient.status,
        }));

        setPatients(patientsData);

        // Access the metadata directly from the response
        const metadata = response.data.metaData;
        setTotalCount(metadata?.totalItems || 0);
        console.log("Total patients count:", metadata?.totalItems);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <PatientsContext.Provider
      value={{ patients, loading, totalCount, fetchPatients }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientsContext);
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientsProvider");
  }
  return context;
}
