import React from 'react';
import { DiagnosisResult, PatientIntake } from '../types/syndx';
import { ConfidenceTierBadge } from '../components/ConfidenceTierBadge';
import { ReasonList } from '../components/ReasonList';
import { BlockchainVerifiedBadge } from '../components/BlockchainVerifiedBadge';
import { ArrowRight, Activity, ShieldCheck, Zap, User, Clock, FileCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800/80 text-xs font-mono font-semibold text-slate-300">
                CASE #{result.caseId}
              </span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs font-mono text-teal-400 font-semibold">PATIENT: {result.patientCode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Edge AI Diagnostic Differential
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ConfidenceTierBadge tier={result.tier} size="lg" />
          </div>
        </div>

        {/* Primary Rare Disease Match Card */}
        <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-950/80 via-slate-900/90 to-teal-950/20 p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-lg">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-teal-500/10 border border-teal-500/30 text-teal-300">
                {topMatch?.icdCode || 'ICD-10'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-800 border border-slate-700 text-slate-300">
                {topMatch?.orphaCode || 'Orphanet'}
              </span>
              <span className="text-xs font-mono text-slate-400">Category: {topMatch?.category}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
              {topMatch?.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{topMatch?.description}</p>

            {/* Key Phenotypic Biomarkers */}
            <div className="pt-2">
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Correlated Phenotypic Biomarkers:
              </span>
              <div className="flex flex-wrap gap-2">
                {topMatch?.keyMarkers.map((marker, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-200 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Score Dial */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Top Concordance
            </span>
            <div className="text-5xl font-extrabold text-teal-300 font-mono tracking-tight my-2">
              {topMatch?.confidence}%
            </div>
            <div className="w-full bg-slate-800 h-2.5 my-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${topMatch?.confidence}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mt-2">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>Inference Time: <strong className="text-white">{result.inferenceTimeMs} ms</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Differential Diagnosis Candidates */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Ranked Differential Disease Candidates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {result.topCandidates.map((cand, idx) => (
            <div
              key={cand.id}
              className={`p-5 rounded-2xl border text-xs space-y-2 transition-all ${
                idx === 0
                  ? 'border-teal-500/40 bg-teal-500/5 text-white'
                  : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${idx === 0 ? 'text-teal-400' : 'text-slate-500'}`}>
                  Rank #{idx + 1}
                </span>
                <span className="font-mono font-bold text-sm text-white">{cand.confidence}%</span>
              </div>
              <div className="font-bold text-sm text-white tracking-tight font-heading">{cand.name}</div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cand.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP & LIME Explainability Breakdown */}
      <ReasonList shapReasons={result.shapReasons} limeReasons={result.limeReasons} />

      {/* Polygon Blockchain Audit Receipt */}
      <BlockchainVerifiedBadge
        txHash={result.blockchainTxHash}
        caseHash={`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`}
      />

      {/* Action Footer Navigation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <button
          onClick={onNewIntake}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>New Patient Intake</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onProceedToFollowUpADR}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-mono font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>ADR Follow-up</span>
          </button>

          <button
            onClick={onProceedToReferral}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <span>Proceed to Specialist Referral</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
