import React, { useState } from 'react';
import { ConfidenceTierBadge } from '../../components/ConfidenceTierBadge';
import { ConfidenceTier } from '../../types/syndx';
import { Network, ShieldAlert, ArrowRight, CheckCircle2, Sliders } from 'lucide-react';

export const RouterInspectionView: React.FC = () => {
  const [modelConfidence, setModelConfidence] = useState<number>(88);
  const [oxygenSat, setOxygenSat] = useState<number>(98);
  const [sysBP, setSysBP] = useState<number>(120);

  // Compute routed tier dynamically
  let evaluatedTier: ConfidenceTier = 'Tier C';
  let triggerReason = 'Low confidence (<60%) -> Route to Expert Tele-Consult Panel';

  if (oxygenSat < 88 || sysBP > 180 || sysBP < 80) {
    evaluatedTier = 'Emergency';
    triggerReason = 'CRITICAL VITAL SAFETY LIMIT TRIPPED! Immediate Emergency Override Activated.';
  } else if (modelConfidence >= 85) {
    evaluatedTier = 'Tier A';
    triggerReason = 'High Confidence (>=85%) -> Direct Local Specialist Referral Protocol';
  } else if (modelConfidence >= 60) {
    evaluatedTier = 'Tier B';
    triggerReason = 'Moderate Confidence (60-85%) -> Route to Priority Doctor Review Queue';
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-2">
        <span className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider">
          Layer 4: Decision Router &amp; Emergency Override Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
          Confidence &amp; Vital Severity Routing Test Bench
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Guarantees patient safety by routing high-confidence cases directly to care, triaging moderate cases to doctor review, and enforcing instant vital overrides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sliders Input */}
        <div className="md:col-span-6 rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-7 space-y-5 shadow-xl backdrop-blur-xl">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Simulate Edge Model Inputs &amp; Vitals</span>
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1.5 font-semibold text-xs">
                <span>Model Confidence Score:</span>
                <span className="font-bold text-teal-400 text-sm">{modelConfidence}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={99}
                value={modelConfidence}
                onChange={(e) => setModelConfidence(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1.5 font-semibold text-xs">
                <span>O2 Saturation (%):</span>
                <span className={`font-bold text-sm ${oxygenSat < 88 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {oxygenSat}%
                </span>
              </div>
              <input
                type="range"
                min={75}
                max={100}
                value={oxygenSat}
                onChange={(e) => setOxygenSat(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1.5 font-semibold text-xs">
                <span>Systolic Blood Pressure (mmHg):</span>
                <span className={`font-bold text-sm ${sysBP > 180 || sysBP < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {sysBP} mmHg
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={200}
                value={sysBP}
                onChange={(e) => setSysBP(Number(e.target.value))}
                className="w-full accent-orange-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Router Output */}
        <div className="md:col-span-6 rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xl backdrop-blur-xl">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Network className="w-4 h-4 text-teal-400" />
              <span>Dynamic Router Output</span>
            </h2>

            <div className="my-4 text-center space-y-3">
              <ConfidenceTierBadge tier={evaluatedTier} size="lg" />
              <p className="text-xs text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mt-3 font-mono leading-relaxed">
                {triggerReason}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">Router Logic Matrix:</span>
            <p>• Tier A (&gt;=85%): Instant local specialist booking &amp; referral authorization.</p>
            <p>• Tier B (60-85%): Enters doctor console queue for expert confirmation.</p>
            <p>• Tier C (&lt;60%): Flags high diagnostic uncertainty for tele-consult panel.</p>
            <p>• Emergency Override: Overrides model if critical vitals breach physiological safety thresholds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
