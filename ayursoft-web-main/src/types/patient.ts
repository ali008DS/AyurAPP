export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | ''
  address: string;
  dob: string;
  city: string;
  state: string;
  status: string;
  documents: string[];
  createdAt?: string;
  patientId?: string;
  opdId?: string;
  ipdId?: string;
  uhId?: string;
  notes?: string[];
  relativeName?: string;
  relationship?: 'S/o' | 'D/o' | 'W/o' | 'H/o';
}

export interface PatientsProps {
  onPatientSelect: (patient: Patient) => void;
}
