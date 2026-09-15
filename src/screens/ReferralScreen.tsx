import React, { useState } from 'react';
import { DiagnosisResult, PatientIntake, ReferralFacility, ReferralRecord } from '../types/syndx';
import { REFERRAL_FACILITIES } from '../services/mockData';
import { Building2, MapPin, Phone, UserCheck, Pill, FileText, CheckCircle2, Printer, Copy, ArrowRight, ArrowLeft, RefreshCw, Clock, Navigation, Map } from 'lucide-react';
import { OfflineLocalReferralMap } from '../components/OfflineLocalReferralMap';

interface Props {
  diagnosisResult: DiagnosisResult;
  intake: PatientIntake;
  onBackToResult: () => void;
  onProceedToADR?: () => void;
  onStartNewIntake?: () => void;
}

export const ReferralScreen: React.FC<Props> = ({
  diagnosisResult,
  intake,
  onBackToResult,
  onProceedToADR,
  onStartNewIntake
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'letter' | 'map'>('letter');
  const [selectedFacility, setSelectedFacility] = useState<ReferralFacility>(REFERRAL_FACILITIES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    selectedFacility.specialistsAvailable[0] || 'Duty Specialist'
  );
  const [copied, setCopied] = useState(false);

  const topDisease = diagnosisResult.topCandidates[0]?.name || 'Rare Metabolic Condition';

  // Referral Letter Generator
  const referralLetterText = `
SYN DX - RURAL SPECIALIST REFERRAL AUTHORIZATION
--------------------------------------------------
REFERRAL ID: REF-${Date.now().toString().slice(-6)}
DATE: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
TIMESTAMP: ${new Date().toLocaleTimeString('en-IN')}

PATIENT CODE: ${intake.patientCode}
AGE/GENDER: ${intake.age} Yrs / ${intake.gender}
PRIMARY RURAL CLINIC: ${intake.clinicName}
HEALTH WORKER: ${intake.healthWorkerName}

DIAGNOSTIC CLINICAL IMPRESSION (SynDx Edge AI):
- Top Match: ${topDisease} (${diagnosisResult.topCandidates[0]?.confidence}% Confidence)
- ICD-10 Code: ${diagnosisResult.topCandidates[0]?.icdCode || 'N/A'} | Orpha Code: ${diagnosisResult.topCandidates[0]?.orphaCode || 'N/A'}
- Router Classification: ${diagnosisResult.tier}

KEY BIOMARKERS & VITALS AT INTAKE:
- Heart Rate: ${intake.vitals.heartRate} bpm | BP: ${intake.vitals.sysBP}/${intake.vitals.diaBP} mmHg | O2 Sat: ${intake.vitals.oxygenSat}%
- Platelets: ${intake.labs.platelets || 'N/A'} k/µL | ALT/AST: ${intake.labs.altAst || 'N/A'} U/L
- Presenting Symptoms: ${intake.symptoms.join(', ')}

DESTINATION SPECIALIST FACILITY:
- Facility: ${selectedFacility.name} (${selectedFacility.distanceKm} km from PHC)
- Assigned Specialist: ${selectedDoctor}
- Reserved Appointment Window: ${selectedFacility.nextAvailableSlot}
- Contact Phone: ${selectedFacility.contactPhone}

POLYGON BLOCKCHAIN AUDIT COMMIT:
- Tx Hash: ${diagnosisResult.blockchainTxHash}
- Verification Ledger: Polygon Amoy Testnet (Record Hash Verified)
--------------------------------------------------
CONFIDENTIAL MEDICAL DOCUMENT - FOR AUTHORIZED SPECIALIST REVIEW
`;

  const copyLetter = () => {
    navigator.clipboard.writeText(referralLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printLetter = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="card-3d p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="badge-3d px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800">
              Layer 5a: Referral Intelligence & Offline Local Map
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mt-2 drop-shadow-xs">
              Smart Facility Matcher & Offline Local Referral Map
            </h1>
            <p className="text-xs font-serif italic text-slate-600 mt-0.5">
              Automated spatial routing based on distance, specialist availability, bed capacity, and offline cached GIS coordinates.
            </p>
          </div>

          <button
            onClick={onBackToResult}
            className="btn-3d px-4 py-2 font-mono font-bold text-xs uppercase"
          >
            ← Back to Diagnosis
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-300">
          <button
            onClick={() => setActiveSubTab('letter')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'letter'
                ? 'bg-slate-900 text-teal-300 border border-teal-500/50 shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Referral Authorization & Letter</span>
          </button>

          <button
            onClick={() => setActiveSubTab('map')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'map'
                ? 'bg-slate-900 text-teal-300 border border-teal-500/50 shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Map className="w-4 h-4 text-teal-400" />
            <span>Offline Local Referral Map</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'map' ? (
        <OfflineLocalReferralMap
          onSelectFacilityForReferral={(fac) => {
            setSelectedFacility(fac);
            setSelectedDoctor(fac.specialistsAvailable[0] || 'Duty Specialist');
            setActiveSubTab('letter');
          }}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Facility Matcher & Drug Stock (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#2A5C82]" />
            Matched Specialty Referral Facilities:
          </h2>

          <div className="space-y-3">
            {REFERRAL_FACILITIES.map((fac) => {
              const isSelected = selectedFacility.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => {
                    setSelectedFacility(fac);
                    setSelectedDoctor(fac.specialistsAvailable[0]);
                  }}
                  className={`p-5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'btn-3d text-white'
                      : 'card-3d text-slate-800 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight">{fac.name}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase ${
                          isSelected ? 'badge-3d text-slate-900' : 'btn-3d text-white'
                        }`}>
                          {fac.type}
                        </span>
                      </div>
                      <div className={`flex items-center gap-3 text-[11px] font-mono mt-1 ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                        <span className="flex items-center gap-1 font-bold">
                          <MapPin className="w-3 h-3 text-teal-300" />
                          {fac.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-teal-300" />
                          {fac.contactPhone}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase ${
                      isSelected ? 'badge-3d text-slate-900' : 'badge-3d text-slate-800'
                    }`}>
                      {fac.bedAvailability} Beds Open
                    </span>
                  </div>

                  {/* Doctors List with Profile Photo Cards */}
                  <div className={`p-3 rounded-xl border space-y-2 mt-3 ${
                    isSelected ? 'bg-white/10 border-white/20' : 'input-3d'
                  }`}>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                      isSelected ? 'text-teal-200' : 'text-slate-600'
                    }`}>
                      Available Rare Disease Specialists:
                    </span>
                    
                    {fac.specialistDetails && fac.specialistDetails.length > 0 ? (
                      <div className="space-y-2">
                        {fac.specialistDetails.map((spec, sIdx) => (
                          <div
                            key={sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoctor(spec.name);
                            }}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              selectedDoctor.includes('Rathiesh') && spec.name.includes('Rathiesh')
                                ? 'bg-white text-slate-900 border-[#FF6321] ring-2 ring-[#FF6321]/40 shadow-md'
                                : isSelected
                                ? 'bg-slate-900/40 text-white border-white/20 hover:bg-slate-900/70'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {spec.avatar ? (
                              <img
                                src={spec.avatar}
                                alt={spec.name}
                                className="w-12 h-12 rounded-full border-2 border-[#2A5C82] object-cover shrink-0 shadow-md"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#2A5C82] text-white font-bold flex items-center justify-center shrink-0">
                                👨‍⚕️
                              </div>
                            )}
                            <div className="min-w-0 flex-1 text-xs">
                              <div className="font-bold tracking-tight truncate flex items-center gap-1">
                                <span>{spec.name}</span>
                                {spec.name.includes('Rathiesh') && (
                                  <span className="px-1.5 py-0.2 bg-[#FF6321] text-white font-mono text-[9px] rounded uppercase font-bold">
                                    PFP Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] opacity-80 font-sans truncate">{spec.role}</div>
                              {spec.badges && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {spec.badges.map((b, bIdx) => (
                                    <span key={bIdx} className="px-1.5 py-0.2 bg-slate-200 text-slate-800 text-[8px] font-mono font-bold rounded">
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {fac.specialistsAvailable.map((doc, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                            isSelected ? 'bg-white text-slate-900 shadow-sm' : 'badge-3d text-slate-800'
                          }`}>
                            👨‍⚕️ {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drug Stock Lookup */}
                  <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                    isSelected ? 'border-white/20' : 'border-slate-200'
                  }`}>
                    <span className={`flex items-center gap-1 font-bold text-[10px] uppercase ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}>
                      <Pill className="w-3.5 h-3.5 text-teal-300" />
                      Essential Drug Stock:
                    </span>
                    <div className="flex items-center gap-2">
                      {fac.drugStockStatus.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase shadow-sm ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-500 text-white'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {item.drugName}: {item.status}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Generated Referral Letter (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#2A5C82]" />
              Referral Letter Preview:
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={copyLetter}
                className="btn-3d px-3 py-1.5 font-mono text-xs font-bold flex items-center gap-1"
                title="Copy text"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={printLetter}
                className="btn-3d-orange px-3 py-1.5 font-mono text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <pre className="card-3d-dark p-4 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto shadow-2xl">
            {referralLetterText}
          </pre>
        </div>
      </div>
      )}

      {/* Step Navigation Action Bar */}
      <div className="card-3d-dark p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <button
          onClick={onBackToResult}
          className="w-full sm:w-auto btn-3d px-4 py-2.5 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 2: Diagnosis Result</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onStartNewIntake && (
            <button
              onClick={onStartNewIntake}
              className="flex-1 sm:flex-none btn-3d px-4 py-2.5 text-slate-800 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Patient Intake (Step 1)</span>
            </button>
          )}

          {onProceedToADR && (
            <button
              onClick={onProceedToADR}
              className="flex-1 sm:flex-none btn-3d-orange px-6 py-2.5 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
            >
              <Clock className="w-4 h-4" />
              <span>Proceed to Step 4: Post-Referral ADR Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
