import React from 'react';
import { DiagnosisResult, PatientIntake } from '../types/syndx';
import { ConfidenceTierBadge } from '../components/ConfidenceTierBadge';
import { ReasonList } from '../components/ReasonList';
import { BlockchainVerifiedBadge } from '../components/BlockchainVerifiedBadge';
import { ArrowRight, Activity, ShieldCheck, Zap, User, Clock, FileCheck } from 'lucide-react';

interface Props {
  result: DiagnosisResult;
  intake: PatientIntake;
  onProceedToReferral: () => void;
  onProceedToFollowUpADR: () => void;
  onNewIntake: () => void;
}

export const DiagnosisResultScreen: React.FC<Props> = ({
  result,
  intake,
  onProceedToReferral,
  onProceedToFollowUpADR,
  onNewIntake
}) => {
  const topMatch = result.topCandidates[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Confidence Tier */}
      <div className="card-3d p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-3d px-2.5 py-0.5 text-xs font-mono font-bold text-slate-800">
                CASE ID: {result.caseId}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-600 font-bold">PATIENT: {result.patientCode}</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 drop-shadow-xs">
              Edge AI Diagnosis Evaluation
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ConfidenceTierBadge tier={result.tier} size="lg" />
          </div>
        </div>

        {/* Primary Rare Disease Match Card */}
        <div className="card-3d p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="btn-3d px-2.5 py-0.5 font-mono font-bold text-xs text-white">
                {topMatch?.icdCode || 'ICD-10'}
              </span>
              <span className="badge-3d px-2.5 py-0.5 font-mono font-bold text-xs text-slate-800">
                {topMatch?.orphaCode || 'Orphanet'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">Category: {topMatch?.category}</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight drop-shadow-xs">
              <span>{topMatch?.name}</span>
            </h2>

            <p className="text-xs font-serif italic text-slate-700 leading-relaxed">{topMatch?.description}</p>

            {/* Key Markers */}
            <div className="pt-2">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Matched Phenotypic Biomarkers:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topMatch?.keyMarkers.map((marker, idx) => (
                  <span key={idx} className="badge-3d text-slate-800 text-[11px] px-3 py-1 font-mono font-bold">
                    ✓ {marker}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Score Dial */}
          <div className="input-3d p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono font-bold uppercase text-slate-600 mb-1">Local Model Match Score</span>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight my-1 drop-shadow-sm">
              {topMatch?.confidence}%
            </div>
            <div className="w-full bg-slate-200 h-3 my-2 rounded-full border border-slate-300 shadow-inner overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${topMatch?.confidence}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-700 mt-1 font-bold">
              <Zap className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
              <span>Inference Time: {result.inferenceTimeMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Differential Diagnosis Candidates */}
      <div className="card-3d p-6 space-y-3">
        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-900">
          Ranked Differential Rare Disease Candidates:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {result.topCandidates.map((cand, idx) => (
            <div
              key={cand.id}
              className={`p-4 rounded-xl border text-xs space-y-1.5 shadow-sm transition-all ${
                idx === 0
                  ? 'btn-3d text-white'
                  : 'card-3d text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span className={`text-[10px] font-bold ${idx === 0 ? 'text-teal-300' : 'text-slate-500'}`}># Rank {idx + 1}</span>
                <span className="font-mono font-bold text-sm">{cand.confidence}%</span>
              </div>
              <div className="font-bold text-sm tracking-tight">{cand.name}</div>
              <p className={`text-[11px] font-serif italic line-clamp-2 ${idx === 0 ? 'text-slate-300' : 'text-slate-600'}`}>{cand.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP & LIME Plain-Language Explanations */}
      <ReasonList shapReasons={result.shapReasons} limeReasons={result.limeReasons} />

      {/* Polygon Blockchain Audit Receipt */}
      <BlockchainVerifiedBadge
        txHash={result.blockchainTxHash}
        caseHash={`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`}
      />

      {/* Action Buttons: Referral, Follow-Up ADR, or New Intake */}
      <div className="card-3d-dark p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <button
          onClick={onNewIntake}
          className="w-full sm:w-auto btn-3d px-5 py-2.5 font-mono font-bold text-xs uppercase"
        >
          ← Back to Step 1: Patient Intake
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onProceedToFollowUpADR}
            className="flex-1 sm:flex-none btn-3d-orange px-5 py-2.5 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
          >
            <Clock className="w-4 h-4" />
            <span>Step 4: ADR Check</span>
          </button>

          <button
            onClick={onProceedToReferral}
            className="flex-1 sm:flex-none btn-3d-emerald px-6 py-2.5 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Proceed to Step 3: Specialist Referral</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
