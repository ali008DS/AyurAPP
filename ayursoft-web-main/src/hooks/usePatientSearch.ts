import { useCallback, useRef, useState } from "react";
import ApiManager from "../components/services/apimanager";

export interface PatientOption {
  _id: string;
  firstName?: string;
  lastName?: string;
  opdId?: string;
  uhId?: string;
}

export default function usePatientSearch() {
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<string, PatientOption[]>>(new Map());

  const search = useCallback(async (query: string) => {
    const q = query?.trim();
    if (!q) return [] as PatientOption[];
    if (cache.current.has(q)) {
      return cache.current.get(q) as PatientOption[];
    }
    setLoading(true);
    try {
      const resp = await ApiManager.getPatients(1, 10, q);
      const rows = resp?.data?.data ?? [];
      cache.current.set(q, rows as PatientOption[]);
      return rows as PatientOption[];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchExact = useCallback(async (q: string) => {
    const rows = await search(q);
    const exact = rows.find((r: any) => r.opdId === q || r._id === q || r.uhId === q);
    return exact || null;
  }, [search]);

  return { search, searchExact, loading };
}
