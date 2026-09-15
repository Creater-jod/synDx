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
      <div className="bg-[#F0EEE9] border-2 border-[#141414] p-6 shadow-sm">
        <span className="bg-[#141414] text-white text-[10px] font-mono px-2.5 py-1 font-bold uppercase tracking-wider">
          Layer 4: Decision Router & Emergency Override Engine
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#141414] mt-2">
          Confidence & Vital Severity Routing Test Bench
        </h1>
        <p className="text-xs font-serif italic text-[#141414]/80 mt-0.5">
          Guarantees patient safety by routing high-confidence cases directly to care, triaging moderate cases to doctor review, and enforcing instant vital overrides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sliders Input */}
        <div className="md:col-span-6 bg-white border border-[#141414] p-5 space-y-5">
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5 border-b border-[#141414] pb-2">
            <Sliders className="w-4 h-4 text-[#2A5C82]" />
            Simulate Edge Model Inputs & Vitals:
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[#141414] mb-1 font-bold uppercase text-[10px]">
                <span>Model Confidence Score:</span>
                <span className="font-bold text-[#2A5C82] text-xs">{modelConfidence}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={99}
                value={modelConfidence}
                onChange={(e) => setModelConfidence(Number(e.target.value))}
                className="w-full accent-[#141414] bg-[#F0EEE9] h-2 rounded-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#141414] mb-1 font-bold uppercase text-[10px]">
                <span>O2 Saturation (%):</span>
                <span className={`font-bold text-xs ${oxygenSat < 88 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {oxygenSat}%
                </span>
              </div>
              <input
                type="range"
                min={75}
                max={100}
                value={oxygenSat}
                onChange={(e) => setOxygenSat(Number(e.target.value))}
                className="w-full accent-[#FF6321] bg-[#F0EEE9] h-2 rounded-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#141414] mb-1 font-bold uppercase text-[10px]">
                <span>Systolic Blood Pressure (mmHg):</span>
                <span className={`font-bold text-xs ${sysBP > 180 || sysBP < 80 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {sysBP} mmHg
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={200}
                value={sysBP}
                onChange={(e) => setSysBP(Number(e.target.value))}
                className="w-full accent-[#FF6321] bg-[#F0EEE9] h-2 rounded-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Router Output */}
        <div className="md:col-span-6 bg-white border border-[#141414] p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5 border-b border-[#141414] pb-2 mb-3">
              <Network className="w-4 h-4 text-[#2A5C82]" />
              Dynamic Router Output:
            </h2>

            <div className="my-4 text-center space-y-2">
              <ConfidenceTierBadge tier={evaluatedTier} size="lg" />
              <p className="text-xs font-serif italic text-[#141414] bg-[#F0EEE9] p-3 border border-[#141414] mt-3">
                {triggerReason}
              </p>
            </div>
          </div>

          <div className="bg-[#F0EEE9] p-3 border border-[#141414] text-[10px] font-mono text-[#141414]/90 space-y-1">
            <span className="font-bold text-[#141414] block uppercase">Router Architecture Logic:</span>
            <p>• Tier A (&gt;=85%): Instant local specialist booking & offline referral letter generation.</p>
            <p>• Tier B (60-85%): Enters doctor console queue for expert confirmation before referral.</p>
            <p>• Tier C (&lt;60%): Flags high diagnostic uncertainty for multi-specialty tele-board.</p>
            <p>• Emergency Override: Overrides model output if critical vital limits are breached.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
