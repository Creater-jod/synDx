export type ConfidenceTier = 'Tier A' | 'Tier B' | 'Tier C' | 'Emergency';

export interface Vitals {
  heartRate: number; // bpm
  sysBP: number; // mmHg
  diaBP: number; // mmHg
  oxygenSat: number; // %
  temp: number; // °C
  respRate: number; // bpm
}

export interface Labs {
  altAst?: number; // U/L
  serumCreatinine?: number; // mg/dL
  platelets?: number; // x10^3/uL
  wbc?: number; // x10^3/uL
  hemoglobin?: number; // g/dL
  eosinophils?: number; // %
  proteinuria?: boolean;
}

export interface FeatureImportance {
  feature: string;
  impact: number; // positive or negative percentage contribution
  description: string;
}

export interface DiseaseCandidate {
  id: string;
  name: string;
  category: string;
  confidence: number; // 0 - 100
  icdCode: string;
  orphaCode: string;
  description: string;
  keyMarkers: string[];
}

export interface PatientIntake {
  id: string;
  patientCode: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  clinicId: string;
  clinicName: string;
  healthWorkerName: string;
  timestamp: string;
  vitals: Vitals;
  labs: Labs;
  symptoms: string[];
  medications: string[];
  familyHistory: boolean;
  symptomDurationDays: number;
  notes?: string;
  isFollowUp?: boolean;
  referredDrug?: string;
}

export interface DiagnosisResult {
  caseId: string;
  patientId: string;
  patientCode: string;
  timestamp: string;
  tier: ConfidenceTier;
  topCandidates: DiseaseCandidate[];
  shapReasons: FeatureImportance[];
  limeReasons: FeatureImportance[];
  inferenceTimeMs: number;
  blockchainTxHash?: string;
  syncStatus: 'Synced' | 'Pending Offline' | 'Syncing';
}

export interface ADRSignal {
  signalId: string;
  caseId: string;
  patientCode: string;
  prescribedDrug: string;
  daysPostPrescription: number;
  suspectedReaction: string;
  severityTier: ConfidenceTier;
  confidence: number;
  shapReasons: FeatureImportance[];
  limeReasons?: FeatureImportance[];
  vitalsDelta: {
    marker: string;
    baseline: string;
    current: string;
    status: 'Elevated' | 'Critical' | 'Stable';
  }[];
  timestamp: string;
  syncStatus: 'Synced' | 'Pending Offline' | 'Syncing';
  status: 'Pending Review' | 'Confirmed ADR' | 'Dismissed' | 'Dose Adjusted';
  doctorNotes?: string;
}

export interface SpecialistInfo {
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  slot?: string;
  badges?: string[];
}

export interface ReferralFacility {
  id: string;
  name: string;
  distanceKm: number;
  type: 'District Hospital' | 'Tertiary Medical College' | 'Specialty Rare Disease Hub' | 'Rural Primary Health Center' | 'Community Health Center';
  specialistsAvailable: string[];
  specialistDetails?: SpecialistInfo[];
  bedAvailability: number;
  drugStockStatus: { drugName: string; status: 'In Stock' | 'Low Stock' | 'Out of Stock' }[];
  contactPhone: string;
  nextAvailableSlot: string;
  lat?: number;
  lng?: number;
  emergencyPhone?: string;
  ambulanceHelpline?: string;
  roadType?: 'Paved Highway (NH-83)' | 'Rural Feeder Road' | 'Hilly Forest Route' | 'Suburban Arterial';
  travelTimeMinutes?: { ambulance: number; car: number; bus: number };
  icuBeds?: number;
  has24x7Emergency?: boolean;
  offlineWaypoints?: string[];
  districtNode?: string;
}

export interface ReferralRecord {
  referralId: string;
  caseId: string;
  patientCode: string;
  facility: ReferralFacility;
  assignedDoctor: string;
  priority: 'Urgent Emergency' | 'High Priority' | 'Routine Consult';
  referralLetterText: string;
  timestamp: string;
  qrCodeHash: string;
}

export interface AuditBlock {
  blockNumber: number;
  txHash: string;
  caseHash: string;
  recordType: 'Diagnosis Record' | 'ADR Signal' | 'Referral Authorization';
  clinicId: string;
  timestamp: string;
  polygonGasUsed: number;
  verified: boolean;
}

export interface FLClinicNode {
  clinicId: string;
  name: string;
  location: string;
  localCasesCount: number;
  status: 'Active Training' | 'Aggregating' | 'Idle';
  lastGradNorm: number;
}

export interface FLRoundState {
  roundNumber: number;
  globalAccuracy: number;
  loss: number;
  participatingClinics: number;
  privacyBudgetEpsilon: number;
  timestamp: string;
  nodes: FLClinicNode[];
}

export interface DoctorCaseReview {
  id: string;
  caseId: string;
  type: 'Diagnosis' | 'ADR Alert';
  patientCode: string;
  clinicName: string;
  date: string;
  tier: ConfidenceTier;
  summary: string;
  details: DiagnosisResult | ADRSignal;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Overridden';
  doctorNotes?: string;
  overrideDiagnosis?: string;
  blockchainTxHash: string;
}
