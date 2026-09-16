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
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Clock className="w-3.5 h-3.5" />
              Step 4: Post-Referral ADR Early-Warning
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Adverse Drug Reaction (ADR) Re-Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitors referred rare disease patients on high-risk therapies. Leverages on-device AI, SHAP explainability, and blockchain audit trails for patient safety.
            </p>
          </div>

          <button
            onClick={onBackToMain}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-mono font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleRunADRInference} className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-5 shadow-xl">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Pill className="w-4 h-4 text-orange-400" />
          <span>Follow-Up Intake &amp; Prescribed Therapy Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1.5">Patient Code</label>
            <input
              type="text"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 font-mono text-white text-xs font-bold focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1.5">Prescribed Specialty Drug</label>
            <input
              type="text"
              value={referredDrug}
              onChange={(e) => setReferredDrug(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1.5">Days Post Therapy Onset</label>
            <input
              type="number"
              value={daysPostStart}
              onChange={(e) => setDaysPostStart(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 font-mono text-white text-xs font-bold focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Re-check Biomarkers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Re-Check ALT/AST (U/L)</span>
            <input
              type="number"
              value={altAst}
              onChange={(e) => setAltAst(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-orange-400 text-base focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Systolic BP (mmHg)</span>
            <input
              type="number"
              value={sysBP}
              onChange={(e) => setSysBP(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Serum Creatinine</span>
            <input
              type="number"
              step="0.1"
              value={serumCreatinine}
              onChange={(e) => setSerumCreatinine(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Eosinophil Count (%)</span>
            <input
              type="number"
              value={eosinophils}
              onChange={(e) => setEosinophils(Number(e.target.value))}
              className="w-full bg-transparent font-mono font-bold text-orange-400 text-base focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-mono text-[10px] uppercase font-bold mb-1.5">New Post-Therapy Symptoms / Complaints:</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-400"
          />
        </div>

        <button
          type="submit"
          disabled={isEvaluating}
          className="w-full py-3.5 rounded-xl font-mono font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
        >
          <Zap className="w-4 h-4 fill-current text-white" />
          <span>{isEvaluating ? 'Evaluating ADR Onset Signal...' : 'Evaluate ADR Signal via SynDx Edge AI'}</span>
        </button>
      </form>

      {/* ADR Signal Result Card */}
      {adrResult && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-orange-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white font-heading">{adrResult.suspectedReaction}</h3>
              </div>
              <ConfidenceTierBadge tier={adrResult.severityTier} size="md" />
            </div>

            {/* Baseline vs Current Delta Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Biomarker Divergence Delta (Pre- vs Post-Therapy):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                {adrResult.vitalsDelta.map((delta, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <span className="text-slate-400 block text-[10px] font-semibold">{delta.marker}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 line-through text-[11px]">{delta.baseline}</span>
                      <span className="text-orange-400 font-bold">→ {delta.current}</span>
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <button
          onClick={onBackToReferral || onBackToMain}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-mono font-semibold text-xs uppercase flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 3: Referral</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNewIntake || onBackToMain}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 text-slate-950 hover:brightness-105 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Case &amp; Return to Step 1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
