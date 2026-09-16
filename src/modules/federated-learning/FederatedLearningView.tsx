import React, { useState, useEffect } from 'react';
import { LocalStoreService } from '../../services/localStore';
import { FLRoundState } from '../../types/syndx';
import { Cpu, RefreshCw, ShieldCheck, Activity, Layers, Play } from 'lucide-react';

export const FederatedLearningView: React.FC = () => {
  const [flState, setFlState] = useState<FLRoundState>(LocalStoreService.getFLState());
  const [isTraining, setIsTraining] = useState<boolean>(false);

  const loadFLState = () => {
    setFlState(LocalStoreService.getFLState());
  };

  useEffect(() => {
    loadFLState();
  }, []);

  const handleRunFLRound = () => {
    setIsTraining(true);
    setTimeout(() => {
      const updated = LocalStoreService.triggerFLRound();
      setFlState(updated);
      setIsTraining(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              Layer 6: Continuous Federated Improvement Loop (Flower FedAvg)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Privacy-Preserving Multi-Clinic Model Aggregation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Raw patient data NEVER leaves clinic devices. Only encrypted local weight gradient updates are aggregated across rural PHC nodes to continuously calibrate rare disease models.
            </p>
          </div>

          <button
            onClick={handleRunFLRound}
            disabled={isTraining}
            className="px-6 py-3 rounded-xl font-mono font-bold uppercase text-xs bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-slate-950 hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 shrink-0"
          >
            {isTraining ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Play className="w-4 h-4 fill-current text-slate-950" />}
            <span>{isTraining ? 'Executing FedAvg Round...' : 'Simulate FedAvg Round'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 text-center space-y-1 backdrop-blur-xl">
          <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block">Current FL Round</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">Round #{flState.roundNumber}</div>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 text-center space-y-1 backdrop-blur-xl">
          <span className="text-[10px] font-mono font-semibold uppercase text-teal-400 block">Global Accuracy</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">{flState.globalAccuracy}%</div>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 text-center space-y-1 backdrop-blur-xl">
          <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block">Cross-Entropy Loss</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{flState.loss}</div>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 text-center space-y-1 backdrop-blur-xl">
          <span className="text-[10px] font-mono font-semibold uppercase text-amber-400 block">Privacy Budget (ε)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">ε = {flState.privacyBudgetEpsilon}</div>
        </div>
      </div>

      {/* Participating Clinic Nodes */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>Active Rural PHC Federated Client Nodes</span>
          </h2>
          <span className="text-xs text-teal-400 font-mono font-semibold uppercase">{flState.participatingClinics} Nodes Online</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {flState.nodes.map((node) => (
            <div key={node.clinicId} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block font-heading">{node.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{node.location} ({node.clinicId})</span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  {node.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <div>Samples: <strong className="text-slate-200">{node.localCasesCount}</strong></div>
                <div>Gradient Delta: <strong className="text-teal-400">{node.lastGradNorm}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
