export type AuthProvider = 'google' | 'mobile' | 'gmail' | 'abha' | 'hospital_sso' | 'github' | 'microsoft' | 'manual';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'Health Worker (ANM)' | 'Medical Officer (Doctor)' | 'Rare Disease Specialist' | 'System Auditor / Admin';
  clinicName: string;
  clinicId: string;
  medicalLicense?: string;
  avatarUrl?: string;
  provider: AuthProvider;
  abhaId?: string;
  verified: boolean;
  createdAt: string;
  qualifications?: string;
  specialties?: string[];
  department?: string;
  bio?: string;
  consultationSlots?: string;
}

export interface DemoAccount {
  name: string;
  email: string;
  role: UserProfile['role'];
  clinicName: string;
  avatar: string;
  provider: AuthProvider;
  mobile: string;
  license: string;
}
