import React, { useState } from 'react';
import { DiagnosisResult, PatientIntake, ReferralFacility, ReferralRecord } from '../types/syndx';
import { REFERRAL_FACILITIES } from '../services/mockData';
import { Building2, MapPin, Phone, UserCheck, Pill, FileText, CheckCircle2, Printer, Copy, ArrowRight, ArrowLeft, RefreshCw, Clock, Navigation, Map, Stethoscope } from 'lucide-react';
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
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              Step 3: Referral Intelligence &amp; Facility Matching
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Specialist Facility Matcher &amp; GIS Routing
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated spatial routing based on travel distance, specialist on-duty availability, bed capacity, and cached road accessibility.
            </p>
          </div>

          <button
            onClick={onBackToResult}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-mono font-semibold text-xs transition-colors self-start sm:self-center"
          >
            ← Back to Diagnosis
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('letter')}
            className={`px-4 py-2 text-xs font-mono font-semibold tracking-wide rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'letter'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Referral Authorization Letter</span>
          </button>

          <button
            onClick={() => setActiveSubTab('map')}
            className={`px-4 py-2 text-xs font-mono font-semibold tracking-wide rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'map'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Map className="w-4 h-4 text-cyan-400" />
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
          {/* Left Column: Facility Matcher & Drug Stock */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Matched Specialty Referral Facilities ({REFERRAL_FACILITIES.length})</span>
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
                        ? 'border-teal-500/50 bg-teal-500/10 text-white shadow-lg ring-1 ring-teal-500/30'
                        : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white font-heading">{fac.name}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 border border-slate-700 text-teal-300">
                            {fac.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono mt-1 text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-400" />
                            {fac.distanceKm} km from clinic
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-teal-400" />
                            {fac.contactPhone}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border border-slate-700 bg-slate-800/80 text-emerald-400 shrink-0">
                        {fac.bedAvailability} Beds
                      </span>
                    </div>

                    {/* Specialists List */}
                    <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2 mt-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block text-slate-400">
                        Assigned Rare Disease Specialists:
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
                                  ? 'bg-teal-500/15 text-white border-teal-500/50 shadow-sm'
                                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              {spec.avatar ? (
                                <img
                                  src={spec.avatar}
                                  alt={spec.name}
                                  className="w-10 h-10 rounded-full border border-teal-400/40 object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-teal-300 font-bold flex items-center justify-center shrink-0 border border-slate-700">
                                  <UserCheck className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1 text-xs">
                                <div className="font-semibold text-white truncate flex items-center gap-1.5">
                                  <span>{spec.name}</span>
                                  {spec.name.includes('Rathiesh') && (
                                    <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 font-mono text-[9px] rounded uppercase font-bold border border-teal-500/30">
                                      Registry Verified
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{spec.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {fac.specialistsAvailable.map((doc, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border border-slate-800 bg-slate-900 text-slate-300">
                              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Drug Stock Lookup */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Pill className="w-3.5 h-3.5 text-teal-400" />
                        <span>Orphan Drug Inventory:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {fac.drugStockStatus.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              item.status === 'In Stock'
                                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                : item.status === 'Low Stock'
                                ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                                : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
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

          {/* Right Column: Generated Referral Letter */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Referral Letter Document</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyLetter}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Copy letter to clipboard"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={printLetter}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-400" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <pre className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-teal-300/90 whitespace-pre-wrap leading-relaxed max-h-[520px] overflow-y-auto custom-scrollbar shadow-xl">
              {referralLetterText}
            </pre>
          </div>
        </div>
      )}

      {/* Step Navigation Action Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <button
          onClick={onBackToResult}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 2: Diagnostic Evaluation</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {onStartNewIntake && (
            <button
              onClick={onStartNewIntake}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-mono font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Patient Intake</span>
            </button>
          )}

          {onProceedToADR && (
            <button
              onClick={onProceedToADR}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 text-slate-950 hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Clock className="w-4 h-4" />
              <span>Proceed to Step 4: ADR Monitoring</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
