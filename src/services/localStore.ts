import {
  PatientIntake,
  DiagnosisResult,
  ADRSignal,
  DoctorCaseReview,
  AuditBlock,
  FLRoundState
} from '../types/syndx';
import { UserProfile } from '../types/auth';
import { DR_RATHIESH_PFP_DATA_URL } from '../assets/drRathieshPhoto';
import {
  MOCK_PATIENT_SAMPLES,
  MOCK_DOCTOR_CASES,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_FL_ROUNDS
} from './mockData';
import {
  syncCaseToFirestore,
  syncDoctorReviewToFirestore,
  updateDoctorReviewInFirestore,
  syncAuditBlockToFirestore
} from '../lib/firebase';

const CASES_KEY = 'syndx_diagnosis_cases_v1';
const ADR_KEY = 'syndx_adr_signals_v1';
const DOCTOR_QUEUE_KEY = 'syndx_doctor_queue_v1';
const AUDIT_BLOCKS_KEY = 'syndx_audit_blocks_v1';
const FL_STATE_KEY = 'syndx_fl_state_v1';
const OFFLINE_QUEUE_KEY = 'syndx_offline_queue_v1';
const DOCTOR_PROFILES_KEY = 'syndx_doctor_profiles_v2';

export class LocalStoreService {
  /**
   * Helper to retrieve items from localStorage safely
   */
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`[LocalStore] Failed to parse key ${key}`, e);
      return defaultValue;
    }
  }

  /**
   * Helper to save items to localStorage safely
   */
  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[LocalStore] Failed to write key ${key}`, e);
    }
  }

  /**
   * Initialize local store with seeds if empty
   */
  public static initStore(): void {
    if (!localStorage.getItem(DOCTOR_QUEUE_KEY)) {
      this.setItem(DOCTOR_QUEUE_KEY, MOCK_DOCTOR_CASES);
    }
    if (!localStorage.getItem(AUDIT_BLOCKS_KEY)) {
      this.setItem(AUDIT_BLOCKS_KEY, INITIAL_AUDIT_BLOCKS);
    }
    if (!localStorage.getItem(FL_STATE_KEY)) {
      this.setItem(FL_STATE_KEY, INITIAL_FL_ROUNDS);
    }
  }

  /**
   * Get all doctor queue cases (Diagnosis + ADR)
   */
  public static getDoctorQueue(): DoctorCaseReview[] {
    this.initStore();
    return this.getItem<DoctorCaseReview[]>(DOCTOR_QUEUE_KEY, MOCK_DOCTOR_CASES);
  }

  /**
   * Save or update a case review item
   */
  public static updateDoctorCaseStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'Overridden',
    notes?: string,
    overrideDiagnosis?: string
  ): DoctorCaseReview[] {
    const queue = this.getDoctorQueue();
    const updated = queue.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          doctorNotes: notes || item.doctorNotes,
          overrideDiagnosis: overrideDiagnosis || item.overrideDiagnosis
        };
      }
      return item;
    });
    this.setItem(DOCTOR_QUEUE_KEY, updated);

    // Sync status change to Firebase Firestore
    updateDoctorReviewInFirestore(id, {
      status,
      ...(notes ? { doctorNotes: notes } : {}),
      ...(overrideDiagnosis ? { overrideDiagnosis } : {})
    });

    return updated;
  }

  /**
   * Add a new diagnosis case
   */
  public static saveDiagnosisCase(result: DiagnosisResult, intake: PatientIntake): DoctorCaseReview {
    const queue = this.getDoctorQueue();

    // Create a new doctor review case
    const newCaseReview: DoctorCaseReview = {
      id: `doc-${Date.now().toString().slice(-6)}`,
      caseId: result.caseId,
      type: 'Diagnosis',
      patientCode: result.patientCode,
      clinicName: intake.clinicName || 'Local PHC Clinic',
      date: 'Just now',
      tier: result.tier,
      summary: `${result.topCandidates[0]?.name || 'Rare Disease'} (Confidence ${result.topCandidates[0]?.confidence || 80}%). ${result.tier} Routing.`,
      details: result,
      status: 'Pending Review',
      blockchainTxHash: result.blockchainTxHash || `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
    };

    const updated = [newCaseReview, ...queue];
    this.setItem(DOCTOR_QUEUE_KEY, updated);

    // Sync new diagnosis case and review to Firebase Firestore
    syncCaseToFirestore({ result, intake });
    syncDoctorReviewToFirestore(newCaseReview);

    // Also add to offline queue
    this.addToOfflineQueue({
      type: 'Diagnosis',
      id: result.caseId,
      timestamp: result.timestamp,
      payload: result
    });

    return newCaseReview;
  }

  /**
   * Add a new ADR signal
   */
  public static saveADRSignal(signal: ADRSignal, intake: PatientIntake): DoctorCaseReview {
    const queue = this.getDoctorQueue();

    const newADRReview: DoctorCaseReview = {
      id: `doc-adr-${Date.now().toString().slice(-6)}`,
      caseId: signal.caseId,
      type: 'ADR Alert',
      patientCode: signal.patientCode,
      clinicName: intake.clinicName || 'Local PHC Clinic',
      date: 'Just now',
      tier: signal.severityTier,
      summary: `ADR Alert: ${signal.suspectedReaction} correlated with ${signal.prescribedDrug} (${signal.daysPostPrescription} days post-start).`,
      details: signal,
      status: 'Pending Review',
      blockchainTxHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
    };

    const updated = [newADRReview, ...queue];
    this.setItem(DOCTOR_QUEUE_KEY, updated);

    // Sync ADR signal and review to Firebase Firestore
    syncDoctorReviewToFirestore(newADRReview);

    this.addToOfflineQueue({
      type: 'ADR Signal',
      id: signal.signalId,
      timestamp: signal.timestamp,
      payload: signal
    });

    return newADRReview;
  }

  /**
   * Get Polygon Blockchain Audit Ledger
   */
  public static getAuditBlocks(): AuditBlock[] {
    this.initStore();
    return this.getItem<AuditBlock[]>(AUDIT_BLOCKS_KEY, INITIAL_AUDIT_BLOCKS);
  }

  /**
   * Append new block hash commit to Polygon ledger
   */
  public static commitAuditHash(
    caseHash: string,
    recordType: 'Diagnosis Record' | 'ADR Signal' | 'Referral Authorization',
    clinicId: string
  ): AuditBlock {
    const blocks = this.getAuditBlocks();
    const lastBlockNum = blocks[0]?.blockNumber || 1048293;

    const newBlock: AuditBlock = {
      blockNumber: lastBlockNum + 1,
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      caseHash,
      recordType,
      clinicId,
      timestamp: new Date().toISOString(),
      polygonGasUsed: parseFloat((Math.random() * 0.001 + 0.0018).toFixed(4)),
      verified: true
    };

    const updated = [newBlock, ...blocks];
    this.setItem(AUDIT_BLOCKS_KEY, updated);

    // Sync block to Firebase Firestore
    syncAuditBlockToFirestore(newBlock);

    return newBlock;
  }

  /**
   * Get Federated Learning state
   */
  public static getFLState(): FLRoundState {
    this.initStore();
    return this.getItem<FLRoundState>(FL_STATE_KEY, INITIAL_FL_ROUNDS);
  }

  /**
   * Trigger a simulated Federated Learning FedAvg round
   */
  public static triggerFLRound(): FLRoundState {
    const current = this.getFLState();
    const nextRound = current.roundNumber + 1;
    const newAcc = Math.min(99.2, parseFloat((current.globalAccuracy + Math.random() * 0.4 + 0.1).toFixed(1)));
    const newLoss = Math.max(0.04, parseFloat((current.loss - 0.008).toFixed(3)));

    const updatedState: FLRoundState = {
      ...current,
      roundNumber: nextRound,
      globalAccuracy: newAcc,
      loss: newLoss,
      timestamp: new Date().toISOString(),
      nodes: current.nodes.map((node) => ({
        ...node,
        localCasesCount: node.localCasesCount + Math.floor(Math.random() * 3 + 1),
        lastGradNorm: parseFloat((Math.random() * 0.02 + 0.015).toFixed(3))
      }))
    };

    this.setItem(FL_STATE_KEY, updatedState);
    return updatedState;
  }

  /**
   * Doctor Profiles Storage & Management
   */
  public static getDoctorProfiles(): UserProfile[] {
    const defaultProfiles: UserProfile[] = [
      {
        id: 'doc-rathiesh',
        name: 'Dr. Rathiesh, MBBS, MD, FECSM',
        email: 'dr.rathiesh.medical@gmail.com',
        mobile: '+91 94421 99001',
        role: 'Rare Disease Specialist',
        clinicName: 'Coimbatore Medical College Hospital (CMCH)',
        clinicId: 'CMCH-COIMBATORE-01',
        medicalLicense: 'TMC-2021-98122',
        avatarUrl: DR_RATHIESH_PFP_DATA_URL,
        provider: 'google',
        verified: true,
        createdAt: new Date().toISOString(),
        qualifications: 'MBBS, MD, FECSM (Fellow of European Board of Sexual Medicine)',
        specialties: [
          'Sexual Health Medicine',
          'Sex Education & Clinical Counseling',
          'Inclusive Health Care',
          'LGBTQ+ & Adolescent Reproductive Health',
          'Rare Endocrine & Lysosomal Reproductive Manifestations'
        ],
        department: 'Department of Sexual Health & Inclusive Reproductive Medicine',
        bio: 'Specialist practitioner and public sex educator dedicated to evidence-based inclusive sexual healthcare, rare reproductive endocrine conditions, and clinical counseling.',
        consultationSlots: 'Mon-Fri: 2:00 PM - 6:00 PM'
      },
      {
        id: 'doc-evelyn',
        name: 'Dr. Evelyn Reed, MD',
        email: 'evelyn.reed.medical@gmail.com',
        mobile: '+91 98422 10982',
        role: 'Medical Officer (Doctor)',
        clinicName: 'Central Primary Health Centre, Vedapatti',
        clinicId: 'PHC-VEDAPATTI-01',
        medicalLicense: 'MCI-2018-77421',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        verified: true,
        createdAt: new Date().toISOString(),
        qualifications: 'MBBS, MD (General Medicine)',
        specialties: ['Primary Healthcare Triage', 'Rare Disease Screening', 'Infectious Diseases'],
        department: 'General OPD & Triage',
        bio: 'Senior Medical Officer leading rural PHC early screening for lysosomal and metabolic disorders.',
        consultationSlots: 'Mon-Sat: 9:00 AM - 1:00 PM'
      },
      {
        id: 'doc-marcus',
        name: 'Dr. Marcus Vance, MD, PhD',
        email: 'marcus.vance.genetics@gmail.com',
        mobile: '+91 97890 12345',
        role: 'Rare Disease Specialist',
        clinicName: 'Regional Specialty Rare Disease Hub',
        clinicId: 'HUB-SPECIALTY-01',
        medicalLicense: 'TNMC-2025-0012',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        provider: 'gmail',
        verified: true,
        createdAt: new Date().toISOString(),
        qualifications: 'MBBS, MD, PhD in Human Genetics',
        specialties: ['Tele-Genetics', 'Metabolic Disorders', 'Enzyme Replacement Therapy (ERT)'],
        department: 'Department of Clinical Genomics',
        bio: 'Expert in clinical genomics and orphan drug trial coordination.',
        consultationSlots: 'Tue & Thu: 10:00 AM - 4:00 PM'
      }
    ];

    const loaded = this.getItem<UserProfile[]>(DOCTOR_PROFILES_KEY, defaultProfiles);
    return loaded.map((p) => {
      if (p.id === 'doc-rathiesh' || p.email === 'dr.rathiesh.medical@gmail.com') {
        return {
          ...p,
          avatarUrl: DR_RATHIESH_PFP_DATA_URL
        };
      }
      return p;
    });
  }

  public static saveDoctorProfile(profile: UserProfile): UserProfile[] {
    const existing = this.getDoctorProfiles();
    const index = existing.findIndex((p) => p.id === profile.id || p.email === profile.email);

    let updated: UserProfile[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...existing[index], ...profile };
    } else {
      updated = [profile, ...existing];
    }

    this.setItem(DOCTOR_PROFILES_KEY, updated);
    return updated;
  }

  public static deleteDoctorProfile(id: string): UserProfile[] {
    const existing = this.getDoctorProfiles();
    const updated = existing.filter((p) => p.id !== id);
    this.setItem(DOCTOR_PROFILES_KEY, updated);
    return updated;
  }

  /**
   * Offline Sync Queue
   */
  public static getOfflineQueue(): any[] {
    return this.getItem<any[]>(OFFLINE_QUEUE_KEY, []);
  }

  public static addToOfflineQueue(item: any): void {
    const queue = this.getOfflineQueue();
    this.setItem(OFFLINE_QUEUE_KEY, [...queue, item]);
  }

  public static clearOfflineQueue(): void {
    this.setItem(OFFLINE_QUEUE_KEY, []);
  }

  /**
   * Reset store to initial demo state
   */
  public static resetDemoData(): void {
    localStorage.removeItem(CASES_KEY);
    localStorage.removeItem(ADR_KEY);
    localStorage.removeItem(DOCTOR_QUEUE_KEY);
    localStorage.removeItem(AUDIT_BLOCKS_KEY);
    localStorage.removeItem(FL_STATE_KEY);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    this.initStore();
  }
}
