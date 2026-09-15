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
      <div className="bg-[#F0EEE9] border-2 border-[#141414] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="bg-[#141414] text-white text-[10px] font-mono px-2.5 py-1 font-bold uppercase tracking-wider">
              Layer 6: Continuous Federated Improvement Loop (Flower FedAvg)
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#141414] mt-2">
              Privacy-Preserving Multi-Clinic Model Aggregation
            </h1>
            <p className="text-xs font-serif italic text-[#141414]/80 mt-0.5 max-w-2xl">
              Raw patient data NEVER leaves clinic devices. Only encrypted local weight gradient updates are aggregated across rural PHC nodes to continuously improve rare disease & ADR detection models.
            </p>
          </div>

          <button
            onClick={handleRunFLRound}
            disabled={isTraining}
            className="px-5 py-2.5 bg-[#141414] hover:bg-[#2A5C82] text-white font-mono font-bold uppercase text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isTraining ? <RefreshCw className="w-4 h-4 animate-spin text-[#FF6321]" /> : <Play className="w-4 h-4 fill-current text-[#FF6321]" />}
            <span>{isTraining ? 'Executing FedAvg Round...' : 'Simulate FedAvg Training Round'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#141414] p-4 text-center space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block">Current FL Round</span>
          <div className="text-2xl font-black text-[#141414] font-mono">Round #{flState.roundNumber}</div>
        </div>

        <div className="bg-white border border-[#141414] p-4 text-center space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block">Global Model Accuracy</span>
          <div className="text-2xl font-black text-[#2A5C82] font-mono">{flState.globalAccuracy}%</div>
        </div>

        <div className="bg-white border border-[#141414] p-4 text-center space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block">Cross-Entropy Loss</span>
          <div className="text-2xl font-black text-[#141414] font-mono">{flState.loss}</div>
        </div>

        <div className="bg-white border border-[#141414] p-4 text-center space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#141414]/70 block">Differential Privacy (ε)</span>
          <div className="text-2xl font-black text-[#FF6321] font-mono">ε = {flState.privacyBudgetEpsilon}</div>
        </div>
      </div>

      {/* Participating Clinic Nodes */}
      <div className="bg-white border border-[#141414] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#141414] pb-3">
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#2A5C82]" />
            Active Rural PHC Federated Client Nodes:
          </h2>
          <span className="text-xs text-[#2A5C82] font-mono font-bold uppercase">{flState.participatingClinics} Nodes Online</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {flState.nodes.map((node) => (
            <div key={node.clinicId} className="bg-[#F0EEE9] border border-[#141414] p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#141414] text-sm block font-serif">{node.name}</span>
                  <span className="text-[10px] text-[#141414]/70 font-mono">{node.location} ({node.clinicId})</span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#141414] text-white">
                  {node.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#141414]/30 text-[10px] text-[#141414]/80 font-mono">
                <span>Local Patient Cases: {node.localCasesCount}</span>
                <span>Gradient L2 Norm: {node.lastGradNorm}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
