import React, { useState } from 'react';
import { PatientIntake, ADRSignal } from '../types/syndx';
import { InferenceService } from '../services/inferenceService';
import { LocalStoreService } from '../services/localStore';
import { ReasonList } from '../components/ReasonList';
import { ConfidenceTierBadge } from '../components/ConfidenceTierBadge';
import { BlockchainVerifiedBadge } from '../components/BlockchainVerifiedBadge';
import { ShieldAlert, Clock, Activity, Zap, Pill, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  initialPatientCode?: string;
  onBackToMain: () => void;
  onBackToReferral?: () => void;
  onNewIntake?: () => void;
}

export const FollowUpCheckScreen: React.FC<Props> = ({
  initialPatientCode = 'PAT-ANM-4412',
  onBackToMain,
  onBackToReferral,
  onNewIntake
}) => {
  const [patientCode, setPatientCode] = useState(initialPatientCode);
  const [referredDrug, setReferredDrug] = useState('Imiglucerase ERT (Type 1 Gaucher Therapy)');
  const [daysPostStart, setDaysPostStart] = useState<number>(14);

  // Vitals
  const [heartRate, setHeartRate] = useState<number>(92);
  const [sysBP, setSysBP] = useState<number>(142);
  const [diaBP, setDiaBP] = useState<number>(88);
  const [oxygenSat, setOxygenSat] = useState<number>(97);
  const [temp, setTemp] = useState<number>(37.2);

  // Labs
  const [altAst, setAltAst] = useState<number>(68);
  const [serumCreatinine, setSerumCreatinine] = useState<number>(1.2);
  const [eosinophils, setEosinophils] = useState<number>(8);

  const [symptoms, setSymptoms] = useState<string>('Facial Flushing, Mild Pruritus, Persistent Fatigue');

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [adrResult, setAdrResult] = useState<ADRSignal | null>(null);

  const handleRunADRInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    const intake: PatientIntake = {
      id: `adr-intake-${Date.now()}`,
      patientCode,
      age: 34,
      gender: 'Male',
      clinicId: 'PHC-ANAMALAI-02',
      clinicName: 'Anamalai Rural Health Post',
      healthWorkerName: 'Health Worker Nikil Vardhan',
      timestamp: new Date().toISOString(),
      vitals: { heartRate, sysBP, diaBP, oxygenSat, temp, respRate: 18 },
      labs: { altAst, serumCreatinine, eosinophils },
      symptoms: symptoms.split(',').map((s) => s.trim()),
      medications: [referredDrug],
      familyHistory: true,
      symptomDurationDays: daysPostStart,
      isFollowUp: true,
      referredDrug
    };

    const signal = await InferenceService.runADRCheck(intake);
    LocalStoreService.saveADRSignal(signal, intake);

    setIsEvaluating(false);
    setAdrResult(signal);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="card-3d p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="btn-3d-orange px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Clock className="w-3.5 h-3.5" />
                Integrated Feature: Post-Referral ADR Early-Warning
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mt-2 drop-shadow-xs">
              Adverse Drug Reaction (ADR) Vitals & Lab Re-Check
            </h1>
            <p className="text-xs font-serif italic text-slate-600 mt-1 max-w-2xl">
              Monitors referred rare disease patients on high-risk therapies. Reuses SynDx&apos;s on-device AI, SHAP explainability, decision router, and Polygon blockchain audit trail without creating duplicate infrastructure.
            </p>
          </div>

          <button
            onClick={onBackToMain}
            className="btn-3d px-4 py-2 font-mono font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return
          </button>
        </div>
      </div>

      <form onSubmit={handleRunADRInference} className="card-3d p-6 space-y-4">
        <h2 className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Pill className="w-4 h-4 text-[#FF6321]" />
          Follow-Up Intake & Prescribed Therapy Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-slate-700 mb-1">Patient Code</label>
            <input
              type="text"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              className="w-full input-3d p-2.5 font-mono text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-slate-700 mb-1">Prescribed Specialty Drug</label>
            <input
              type="text"
              value={referredDrug}
              onChange={(e) => setReferredDrug(e.target.value)}
              className="w-full input-3d p-2.5 text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-slate-700 mb-1">Days Post Therapy Onset</label>
            <input
              type="number"
              value={daysPostStart}
              onChange={(e) => setDaysPostStart(Number(e.target.value))}
              className="w-full input-3d p-2.5 font-mono text-slate-900 font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Re-check Biomarkers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="input-3d p-3">
            <span className="text-slate-600 font-mono text-[10px] uppercase block mb-1">Re-Check ALT/AST (U/L)</span>
            <input
              type="number"
              value={altAst}
              onChange={(e) => setAltAst(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-[#FF6321] text-sm focus:outline-none"
            />
          </div>

          <div className="input-3d p-3">
            <span className="text-slate-600 font-mono text-[10px] uppercase block mb-1">Systolic BP (mmHg)</span>
            <input
              type="number"
              value={sysBP}
              onChange={(e) => setSysBP(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-slate-900 text-sm focus:outline-none"
            />
          </div>

          <div className="input-3d p-3">
            <span className="text-slate-600 font-mono text-[10px] uppercase block mb-1">Serum Creatinine</span>
            <input
              type="number"
              step="0.1"
              value={serumCreatinine}
              onChange={(e) => setSerumCreatinine(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-slate-900 text-sm focus:outline-none"
            />
          </div>

          <div className="input-3d p-3">
            <span className="text-slate-600 font-mono text-[10px] uppercase block mb-1">Eosinophil Count (%)</span>
            <input
              type="number"
              value={eosinophils}
              onChange={(e) => setEosinophils(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-[#FF6321] text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-mono text-[10px] uppercase font-bold mb-1">New Post-Therapy Symptoms / Complaints:</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full input-3d p-2.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isEvaluating}
          className="w-full btn-3d-orange py-3.5 font-mono font-bold uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
        >
          <Zap className="w-4 h-4 fill-current text-white" />
          <span>{isEvaluating ? 'Evaluating ADR Onset Signal...' : 'Evaluate ADR Signal via SynDx Edge AI'}</span>
        </button>
      </form>

      {/* ADR Signal Result Card */}
      {adrResult && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-3d p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FF6321]" />
                <h3 className="text-base font-black text-slate-900 uppercase drop-shadow-xs">{adrResult.suspectedReaction}</h3>
              </div>
              <ConfidenceTierBadge tier={adrResult.severityTier} size="md" />
            </div>

            {/* Baseline vs Current Delta Table */}
            <div className="card-3d p-5 space-y-2">
              <h4 className="text-xs font-mono font-black text-slate-900 uppercase tracking-wider">
                Biomarker Divergence Delta (Pre- vs Post-Therapy):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                {adrResult.vitalsDelta.map((delta, idx) => (
                  <div key={idx} className="input-3d p-3">
                    <span className="text-slate-600 block text-[10px] font-bold">{delta.marker}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 line-through text-[11px]">{delta.baseline}</span>
                      <span className="text-[#FF6321] font-bold">→ {delta.current}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHAP Explanation */}
            <ReasonList
              shapReasons={adrResult.shapReasons}
              title="ADR Signal SHAP Attribution (Drug-Onset Correlation)"
            />

            <BlockchainVerifiedBadge caseHash={adrResult.signalId} />
          </div>
        </div>
      )}

      {/* Step Navigation Action Bar */}
      <div className="card-3d-dark p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <button
          onClick={onBackToReferral || onBackToMain}
          className="w-full sm:w-auto btn-3d px-4 py-2.5 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 3: Referral</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNewIntake || onBackToMain}
            className="w-full sm:w-auto btn-3d-emerald px-6 py-2.5 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Pipeline & Start New Patient Intake (Step 1)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
