import React, { useState } from 'react';
import { Layers, CheckCircle2, Clock, Cpu, Network, ShieldCheck, Database, Stethoscope, ArrowRight, Box, Check } from 'lucide-react';
import { ThreeDArchitectureView } from '../../components/ThreeDArchitectureView';

export const WorkbenchArchitectureView: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  const layers = [
    {
      id: 1,
      name: 'Layer 1: Patient Interaction (Offline-First)',
      tech: 'React 19 / PWA • Encrypted IndexedDB Local Cache',
      icon: <Stethoscope className="w-5 h-5 text-teal-400" />,
      desc: 'Point-of-care vital signs and clinical phenotype symptom entry for rural health workers in low-connectivity clinics.',
      components: ['IntakeScreen.tsx', 'DiagnosisResultScreen.tsx', 'ReferralScreen.tsx', 'FollowUpCheckScreen.tsx']
    },
    {
      id: 2,
      name: 'Layer 2: On-Device Edge AI Inference',
      tech: 'TensorFlow Lite / ONNX Runtime (<120ms latency)',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      desc: 'Shared model family running local multi-task inference for rare disease classification and post-prescription drug reaction alerts.',
      components: ['rare_disease_classifier.tflite', 'adr_signal_model.tflite', 'inferenceService.ts']
    },
    {
      id: 3,
      name: 'Layer 3: Explainable AI (XAI Engine)',
      tech: 'SHAP & LIME Plain-Language Explanations',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      desc: 'Translates high-dimensional machine learning weights into human-understandable clinical biomarker importance lists.',
      components: ['shap_explainer.py', 'lime_explainer.py', 'ReasonList.tsx']
    },
    {
      id: 4,
      name: 'Layer 4: Decision Router & Triage Logic',
      tech: 'Confidence Tier Classifier + Emergency Override',
      icon: <Network className="w-5 h-5 text-blue-400" />,
      desc: 'Classifies cases into Tier A (Direct Referral), Tier B (Priority Doctor Queue), Tier C (Expert Panel), and Emergency Vital Override.',
      components: ['router.py', 'adr_router_extension.py', 'RouterInspectionView.tsx']
    },
    {
      id: 5,
      name: 'Layer 5: Referral Intelligence & Polygon Audit',
      tech: 'FastAPI / Node.js • Polygon Amoy Testnet Smart Contract',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      desc: 'Smart hospital matching, essential orphan drug stock lookup, and zero-knowledge SHA-256 case hash commits on Polygon blockchain.',
      components: ['facility_matcher.py', 'SynDxAudit.sol', 'BlockchainVerifiedBadge.tsx']
    },
    {
      id: 6,
      name: 'Layer 6: Continuous Federated Learning Loop',
      tech: 'Flower FedAvg Framework (Differential Privacy)',
      icon: <Database className="w-5 h-5 text-amber-400" />,
      desc: 'Continuous collaborative model training across rural PHC nodes without centralizing or sharing raw patient health records.',
      components: ['server.py (FedAvg)', 'client.py (Per-Clinic Client)', 'FederatedLearningView.tsx']
    }
  ];

  const buildPlanDays = [
    { day: 'Phase 1', task: 'Clinic Client shell + offline intake form + Local encrypted store', status: 'Completed' },
    { day: 'Phase 2', task: 'Edge AI TFLite runtime + SHAP/LIME plain-language explainers', status: 'Completed' },
    { day: 'Phase 3', task: 'Decision router + Tier A/B/C/Emergency triage + Referral matcher', status: 'Completed' },
    { day: 'Phase 4', task: 'Polygon testnet blockchain audit contract & SHA-256 hash commit', status: 'Completed' },
    { day: 'Phase 5', task: 'Federated learning Flower FedAvg multi-clinic round simulator', status: 'Completed' },
    { day: 'Phase 6', task: 'Unified Doctor Review Console + Gemini AI Query Assistant', status: 'Completed' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              SynDx Core Architecture &amp; Blueprint
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              6-Layer Clinical Architecture &amp; Systems Topology
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interactive 3D &amp; 2D topology detailing end-to-end data flow from point-of-care offline intake to Polygon blockchain auditing and federated learning.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs self-start sm:self-center">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                viewMode === '3D'
                  ? 'border border-teal-500/40 bg-teal-500/20 text-teal-300 shadow-md'
                  : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4 text-teal-400" />
              <span>3D Spatial View</span>
            </button>

            <button
              onClick={() => setViewMode('2D')}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                viewMode === '2D'
                  ? 'border border-teal-500/40 bg-teal-500/20 text-teal-300 shadow-md'
                  : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>2D Layer Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Architecture Stage */}
      {viewMode === '3D' ? (
        <ThreeDArchitectureView />
      ) : (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            SynDx System Layer Architecture Map:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {layers.map((layer) => {
              const isActive = activeLayer === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? 'border-teal-500/50 bg-teal-500/10 text-white shadow-lg ring-1 ring-teal-500/30'
                      : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {layer.icon}
                    </div>
                    <span className="font-bold text-xs uppercase tracking-tight font-mono text-white">{layer.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {layer.desc}
                  </p>
                  <span className="text-[10px] font-mono font-bold block mt-3 uppercase text-teal-400">
                    {layer.tech}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected Layer Inspector */}
          {layers.find((l) => l.id === activeLayer) && (
            <div className="rounded-2xl border border-teal-500/30 bg-slate-950/80 p-5 text-xs space-y-2.5 mt-3">
              <span className="text-teal-300 font-mono font-bold uppercase tracking-wider text-xs block">
                Inspecting: {layers.find((l) => l.id === activeLayer)?.name}
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {layers.find((l) => l.id === activeLayer)?.desc}
              </p>
              <div className="pt-2">
                <span className="text-slate-400 text-[10px] block font-mono font-bold uppercase mb-2">Key Modules &amp; Components:</span>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {layers.find((l) => l.id === activeLayer)?.components.map((comp, idx) => (
                    <span key={idx} className="rounded-lg bg-slate-900 border border-slate-800 text-teal-200 px-3 py-1">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Build Plan Execution Progress */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Core System Delivery Verification</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {buildPlanDays.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400">{item.day}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{item.status}</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{item.task}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
