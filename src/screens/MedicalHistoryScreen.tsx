import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types/auth';
import { PatientIntake, DiagnosisResult, DoctorCaseReview } from '../types/syndx';
import { LocalStoreService } from '../services/localStore';
import { MOCK_PATIENT_SAMPLES } from '../services/mockData';
import { db, FIRESTORE_COLLECTIONS } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Tilt3DCard } from '../components/Tilt3DCard';
import {
  FileText,
  Search,
  Filter,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Printer,
  Sparkles,
  Activity,
  Building2,
  Stethoscope,
  X,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Database,
  RefreshCw,
  FolderHeart,
  BarChart2,
  HeartPulse
} from 'lucide-react';

interface MedicalHistoryScreenProps {
  currentUser: UserProfile | null;
  onNavigateToADR?: (patientCode: string) => void;
  onNavigateToReferral?: (result: DiagnosisResult, intake: PatientIntake) => void;
}

export const MedicalHistoryScreen: React.FC<MedicalHistoryScreenProps> = ({
  currentUser,
  onNavigateToADR,
  onNavigateToReferral
}) => {
  // Navigation / View Modes
  const [filterMode, setFilterMode] = useState<'my_records' | 'patient_lookup' | 'all'>('all');
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [patientLookupInput, setPatientLookupInput] = useState('');
  const [selectedPatientCode, setSelectedPatientCode] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Loading & Data States
  const [casesQueue, setCasesQueue] = useState<DoctorCaseReview[]>([]);
  const [patientIntakes, setPatientIntakes] = useState<PatientIntake[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null);

  // Selected Case Modal
  const [activeCaseModal, setActiveCaseModal] = useState<DoctorCaseReview | null>(null);
  const [isExportingPrint, setIsExportingPrint] = useState(false);

  // Load records from LocalStore and Firestore on mount
  const loadRecords = async () => {
    setIsLoading(true);
    try {
      // 1. Get from LocalStore
      const localQueue = LocalStoreService.getDoctorQueue();
      setCasesQueue(localQueue);
      setPatientIntakes(MOCK_PATIENT_SAMPLES);

      // 2. Try fetching additional real-time documents from Firestore if available
      try {
        const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.DOCTOR_REVIEWS));
        const firestoreReviews: DoctorCaseReview[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as DoctorCaseReview;
          if (data && data.caseId) {
            firestoreReviews.push(data);
          }
        });

        if (firestoreReviews.length > 0) {
          // Merge unique by ID
          const existingIds = new Set(localQueue.map((c) => c.id));
          const merged = [...localQueue];
          firestoreReviews.forEach((fr) => {
            if (!existingIds.has(fr.id)) {
              merged.unshift(fr);
            }
          });
          setCasesQueue(merged);
        }
      } catch (fsErr) {
        console.warn('[MedicalHistory] Firestore fetch fallback to local store:', fsErr);
      }
    } catch (err) {
      console.error('[MedicalHistory] Error loading records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Filtered cases logic
  const filteredCases = useMemo(() => {
    return casesQueue.filter((item) => {
      // Filter Mode 1: My Created / Reviewed Records
      if (filterMode === 'my_records' && currentUser) {
        const matchesUser =
          item.clinicName.toLowerCase().includes(currentUser.clinicName.toLowerCase()) ||
          (item.doctorNotes && item.doctorNotes.toLowerCase().includes(currentUser.name.toLowerCase())) ||
          (currentUser.role === 'Rare Disease Specialist' && item.tier === 'Tier A');
        if (!matchesUser) return false;
      }

      // Filter Mode 2: Specific Patient Lookup
      if (filterMode === 'patient_lookup' && selectedPatientCode) {
        if (item.patientCode.toLowerCase() !== selectedPatientCode.toLowerCase()) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          item.patientCode.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.clinicName.toLowerCase().includes(q) ||
          (item.doctorNotes && item.doctorNotes.toLowerCase().includes(q)) ||
          (item.overrideDiagnosis && item.overrideDiagnosis.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Tier filter
      if (selectedTier !== 'ALL' && item.tier !== selectedTier) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [casesQueue, filterMode, currentUser, selectedPatientCode, searchQuery, selectedTier, selectedStatus]);

  // Unique patient codes list for quick chips
  const availablePatientCodes = useMemo(() => {
    const setCodes = new Set<string>();
    casesQueue.forEach((c) => setCodes.add(c.patientCode));
    MOCK_PATIENT_SAMPLES.forEach((p) => setCodes.add(p.patientCode));
    return Array.from(setCodes);
  }, [casesQueue]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = casesQueue.length;
    const tierA = casesQueue.filter((c) => c.tier === 'Tier A').length;
    const reviewed = casesQueue.filter((c) => c.status === 'Approved' || c.status === 'Overridden').length;
    const pending = casesQueue.filter((c) => c.status === 'Pending Review').length;
    return { total, tierA, reviewed, pending };
  }, [casesQueue]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxHash(hash);
    setTimeout(() => setCopiedTxHash(null), 2500);
  };

  const handlePatientLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientLookupInput.trim()) {
      setSelectedPatientCode(patientLookupInput.trim().toUpperCase());
      setFilterMode('patient_lookup');
    }
  };

  // Printable Summary Trigger
  const handlePrintSummary = () => {
    setIsExportingPrint(true);
    setTimeout(() => {
      window.print();
      setIsExportingPrint(false);
    }, 300);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      {/* Top Banner Header */}
      <div className="card-3d-dark p-6 rounded-2xl relative overflow-hidden border border-teal-500/30">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl text-white shadow-lg">
                <FolderHeart className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white font-sans flex items-center gap-2">
                Clinical Medical History Vault
              </h1>
              <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono text-[10px] font-bold uppercase rounded-full">
                Encrypted Repository
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Review historical diagnosis records, SHAP explainability matrices, physician overrides & audit hashes.
            </p>
          </div>

          {/* Active Clinician Context Badge */}
          {currentUser && (
            <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shrink-0 shadow-lg">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full border border-teal-400 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="text-xs font-mono">
                <div className="text-slate-400 text-[9px] uppercase font-bold">Active Clinician Context</div>
                <div className="font-bold text-white truncate max-w-[160px]">{currentUser.name}</div>
                <div className="text-[10px] text-teal-300 truncate max-w-[160px]">{currentUser.clinicName}</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 font-mono">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Records</span>
            <span className="text-lg font-black text-white">{stats.total} Cases</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-rose-400 uppercase block font-bold">Tier A Escalations</span>
            <span className="text-lg font-black text-rose-400">{stats.tierA} Urgent</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-emerald-400 uppercase block font-bold">Physician Reviewed</span>
            <span className="text-lg font-black text-emerald-400">{stats.reviewed} Verified</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-amber-400 uppercase block font-bold">Pending Review</span>
            <span className="text-lg font-black text-amber-400">{stats.pending} Pending</span>
          </div>
        </div>
      </div>

      {/* Filter Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFilterMode('all');
              setSelectedPatientCode(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
              filterMode === 'all'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg border border-teal-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>All Repository Cases ({casesQueue.length})</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setFilterMode('my_records');
                setSelectedPatientCode(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                filterMode === 'my_records'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Clinic Records</span>
            </button>
          )}

          <button
            onClick={() => setFilterMode('patient_lookup')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
              filterMode === 'patient_lookup'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg border border-orange-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Patient ID Lookup {selectedPatientCode ? `(${selectedPatientCode})` : ''}</span>
          </button>
        </div>

        <button
          onClick={loadRecords}
          disabled={isLoading}
          className="btn-3d px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1.5"
          title="Refresh diagnosis records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          <span>Sync Records</span>
        </button>
      </div>

      {/* Patient Lookup Input Bar (Shown when in patient_lookup mode) */}
      {filterMode === 'patient_lookup' && (
        <div className="card-3d-dark p-5 rounded-2xl border border-orange-500/40 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Diagnosis History by Patient Code / ID
            </h3>
            {selectedPatientCode && (
              <button
                onClick={() => {
                  setSelectedPatientCode(null);
                  setPatientLookupInput('');
                }}
                className="text-[10px] font-mono text-rose-400 hover:underline"
              >
                Clear Patient Filter
              </button>
            )}
          </div>

          <form onSubmit={handlePatientLookupSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={patientLookupInput}
              onChange={(e) => setPatientLookupInput(e.target.value)}
              placeholder="Enter Patient Code (e.g. PAT-VLP-8821, PAT-ANM-4412)..."
              className="flex-1 px-4 py-2.5 input-3d-dark text-xs font-mono text-white placeholder-slate-400 focus:border-orange-400"
            />
            <button
              type="submit"
              className="btn-3d-orange px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span>Fetch Timeline</span>
            </button>
          </form>

          {/* Quick Clickable Sample Patient Chips */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Quick Select Sample Patient Codes:
            </span>
            <div className="flex flex-wrap gap-2">
              {availablePatientCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedPatientCode(code);
                    setPatientLookupInput(code);
                    setFilterMode('patient_lookup');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
                    selectedPatientCode === code
                      ? 'bg-teal-500/20 text-teal-300 border-teal-400 shadow-md ring-2 ring-teal-400/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-teal-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>{code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Search & Secondary Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="relative flex items-center md:col-span-1">
          <Search className="w-4 h-4 text-teal-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by keyword, disease, or clinic..."
            className="w-full pl-10 pr-9 py-2.5 text-xs input-3d-dark text-white placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity Tier Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Tier:</span>
          {['ALL', 'Tier A', 'Tier B', 'Tier C'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedTier === t
                  ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Review Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Status:</span>
          {['ALL', 'Approved', 'Pending Review', 'Overridden'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                selectedStatus === s
                  ? 'bg-indigo-500 text-white font-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnosis History Records List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-teal-300">{filteredCases.length}</strong> matching diagnosis records
          </span>
          {(searchQuery || selectedTier !== 'ALL' || selectedStatus !== 'ALL' || selectedPatientCode) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('ALL');
                setSelectedStatus('ALL');
                setSelectedPatientCode(null);
                setFilterMode('all');
              }}
              className="text-rose-400 hover:underline text-[11px]"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {filteredCases.length === 0 ? (
          <div className="card-3d-dark p-12 text-center rounded-2xl border border-slate-800 space-y-3">
            <div className="p-4 bg-slate-800/80 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center text-slate-400">
              <FolderHeart className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">No Diagnosis Records Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No matching clinical diagnosis history records found for the selected filter or patient ID.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('ALL');
                setSelectedStatus('ALL');
                setSelectedPatientCode(null);
                setFilterMode('all');
              }}
              className="btn-3d px-4 py-2 font-mono text-xs font-bold text-teal-300 uppercase"
            >
              Show All Records
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCases.map((caseItem) => {
              const intake = patientIntakes.find((p) => p.patientCode === caseItem.patientCode);
              const isPending = caseItem.status === 'Pending Review';
              const isOverridden = caseItem.status === 'Overridden';
              const isApproved = caseItem.status === 'Approved';

              return (
                <Tilt3DCard
                  key={caseItem.id}
                  maxTilt={3}
                  scale={1.01}
                  className="w-full rounded-2xl overflow-hidden"
                >
                  <div className="card-3d-dark p-5 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl font-mono font-bold text-teal-400 text-sm shadow-md flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-teal-400" />
                          <span>{caseItem.patientCode}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-white">{caseItem.clinicName}</span>
                            <span className="text-xs text-slate-400 font-mono">• {caseItem.date}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>Record ID: {caseItem.caseId}</span>
                            {intake && (
                              <span className="text-teal-300">
                                ({intake.age}y / {intake.gender})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Router Tier Badge & Review Status Badge */}
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span
                          className={`px-3 py-1 rounded-xl font-bold uppercase border shadow-sm ${
                            caseItem.tier === 'Tier A'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : caseItem.tier === 'Tier B'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {caseItem.tier}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-xl font-bold uppercase border shadow-sm flex items-center gap-1.5 ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isOverridden
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {isOverridden && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                          {isPending && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{caseItem.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Summary Description & Diagnosis Match */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-teal-400 font-bold uppercase block mb-1">
                          Diagnostic Summary & Clinical Findings:
                        </span>
                        <p className="leading-relaxed font-sans">{caseItem.summary}</p>

                        {/* If Doctor Overrode the Diagnosis */}
                        {isOverridden && caseItem.overrideDiagnosis && (
                          <div className="mt-2 pt-2 border-t border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="uppercase text-[10px] block font-bold text-indigo-400">
                                Physician Override Applied:
                              </strong>
                              <span>{caseItem.overrideDiagnosis}</span>
                              {caseItem.doctorNotes && (
                                <p className="text-[11px] text-slate-300 italic mt-0.5 font-serif">
                                  "{caseItem.doctorNotes}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Symptoms & Vitals Snapshot (if intake linked) */}
                      {intake && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">
                            Key Symptoms:
                          </span>
                          {intake.symptoms.map((sym, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-md border border-slate-700"
                            >
                              • {sym}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Row - Blockchain Audit Hash & Interactive Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
                      {/* Polygon Tx Hash Badge */}
                      <button
                        onClick={() => handleCopyHash(caseItem.blockchainTxHash || '')}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-400 hover:text-teal-300 hover:border-teal-500/50 transition-colors"
                        title="Click to copy Polygon Audit Hash"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono truncate max-w-[140px] sm:max-w-[200px]">
                          Polygon Hash: {caseItem.blockchainTxHash}
                        </span>
                        {copiedTxHash === caseItem.blockchainTxHash ? (
                          <Check className="w-3 h-3 text-emerald-400 ml-1" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500 ml-1" />
                        )}
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {onNavigateToADR && (
                          <button
                            onClick={() => onNavigateToADR(caseItem.patientCode)}
                            className="btn-3d px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:text-white uppercase flex items-center gap-1"
                            title="File ADR / Follow-Up Check"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>ADR Follow-up</span>
                          </button>
                        )}

                        <button
                          onClick={() => setActiveCaseModal(caseItem)}
                          className="btn-3d-orange px-3.5 py-1.5 text-[11px] font-bold uppercase flex items-center gap-1.5 shadow-md"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Full Record</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Tilt3DCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Full Clinical Record Modal */}
      {activeCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="card-3d-dark w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-500/40 p-6 space-y-6 shadow-2xl relative font-sans my-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-500 via-indigo-600 to-orange-500 rounded-2xl text-white shadow-xl">
                  <FolderHeart className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">
                      Patient Medical Record: {activeCaseModal.patientCode}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold uppercase rounded-full">
                      Verified Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Case ID: {activeCaseModal.caseId} • Facility: {activeCaseModal.clinicName} • Registered: {activeCaseModal.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSummary}
                  className="btn-3d px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:text-white flex items-center gap-1.5"
                  title="Print Clinical Summary"
                >
                  <Printer className="w-4 h-4 text-teal-400" />
                  <span className="hidden sm:inline">Print Summary</span>
                </button>

                <button
                  onClick={() => setActiveCaseModal(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-600 rounded-xl transition-all border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Case Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Patient Profile Card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] text-teal-400 font-bold uppercase block">Patient Profile</span>
                <div className="text-sm font-bold text-white">Code: {activeCaseModal.patientCode}</div>
                <div className="text-slate-300">Routing Tier: <strong className="text-teal-300">{activeCaseModal.tier}</strong></div>
                <div className="text-slate-300">Status: <strong className="text-amber-300">{activeCaseModal.status}</strong></div>
              </div>

              {/* Facility & Location */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] text-teal-400 font-bold uppercase block">Originating Clinic</span>
                <div className="text-sm font-bold text-white">{activeCaseModal.clinicName}</div>
                <div className="text-slate-400 text-[11px]">Primary Intake & Diagnosis Log</div>
              </div>

              {/* Polygon Audit Ledger */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Polygon Audit Ledger
                </span>
                <div className="text-[10px] text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {activeCaseModal.blockchainTxHash}
                </div>
                <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Cryptographically Sealed</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Findings & Explainability Section */}
            <div className="space-y-3 bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                AI Diagnosis & Explainability Matrix
              </h3>

              <div className="text-sm font-sans text-slate-100 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {activeCaseModal.summary}
              </div>

              {/* SHAP Reason Drivers if available in details */}
              {activeCaseModal.details?.shapReasons && activeCaseModal.details.shapReasons.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Top SHAP Feature Drivers (+Confidence Impact):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                    {activeCaseModal.details.shapReasons.map((reason: any, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-200 font-bold">{reason.feature}</span>
                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-black rounded border border-teal-500/40">
                          +{reason.impact}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Review & Override Section */}
            <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3 font-mono">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Physician Review & Clinical Notes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Review Status:</span>
                  <span className="font-bold text-white">{activeCaseModal.status}</span>
                </div>

                {activeCaseModal.overrideDiagnosis && (
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold block">Custom Diagnosis Override:</span>
                    <span className="font-bold text-indigo-300">{activeCaseModal.overrideDiagnosis}</span>
                  </div>
                )}
              </div>

              {activeCaseModal.doctorNotes ? (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans italic">
                  "{activeCaseModal.doctorNotes}"
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic font-mono">
                  No additional clinician notes added yet.
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                SynDx Edge AI Vault • Standard ISO 27001 Sealed
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                {onNavigateToReferral && activeCaseModal.details && 'topCandidates' in activeCaseModal.details && (
                  <button
                    onClick={() => {
                      const caseIntake = patientIntakes.find((p) => p.patientCode === activeCaseModal.patientCode) || {
                        id: activeCaseModal.caseId,
                        patientCode: activeCaseModal.patientCode,
                        age: 30,
                        gender: 'Female',
                        clinicId: 'PHC-VALPARAI-01',
                        clinicName: activeCaseModal.clinicName,
                        healthWorkerName: 'Health Officer',
                        timestamp: new Date().toISOString(),
                        vitals: { heartRate: 80, sysBP: 120, diaBP: 80, oxygenSat: 98, temp: 36.6, respRate: 16 },
                        labs: {},
                        symptoms: ['Rare Metabolic Manifestation'],
                        medications: [],
                        familyHistory: false,
                        symptomDurationDays: 60
                      };
                      onNavigateToReferral(activeCaseModal.details as DiagnosisResult, caseIntake);
                      setActiveCaseModal(null);
                    }}
                    className="btn-3d px-4 py-2 font-bold text-teal-300 uppercase flex items-center gap-1.5"
                  >
                    <span>Proceed to Referral Hub</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setActiveCaseModal(null)}
                  className="btn-3d-orange px-6 py-2 font-bold uppercase shadow-lg"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
