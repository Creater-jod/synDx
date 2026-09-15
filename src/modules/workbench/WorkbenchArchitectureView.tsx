import React, { useState } from 'react';
import { Layers, CheckCircle2, Clock, Cpu, Network, ShieldCheck, Database, Stethoscope, ArrowRight, Box } from 'lucide-react';
import { ThreeDArchitectureView } from '../../components/ThreeDArchitectureView';

export const WorkbenchArchitectureView: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  const layers = [
    {
      id: 1,
      name: 'Layer 1: Patient Interaction (Offline-First)',
      tech: 'React Native / PWA • Encrypted IndexedDB Local Cache',
      icon: <Stethoscope className="w-5 h-5 text-[#2A5C82]" />,
      desc: 'Point-of-care vital signs and clinical phenotype symptom entry for rural health workers in low-connectivity clinics.',
      components: ['IntakeScreen.tsx', 'DiagnosisResultScreen.tsx', 'ReferralScreen.tsx', 'FollowUpCheckScreen.tsx (ADR Monitoring)']
    },
    {
      id: 2,
      name: 'Layer 2: On-Device Edge AI Inference',
      tech: 'TensorFlow Lite / ONNX Runtime (<200ms latency)',
      icon: <Cpu className="w-5 h-5 text-[#FF6321]" />,
      desc: 'Shared model family running local multi-task inference for rare disease classification and post-prescription drug reaction alerts.',
      components: ['rare_disease_classifier.tflite', 'adr_signal_model.tflite', 'run_diagnosis.py / run_adr_check.py']
    },
    {
      id: 3,
      name: 'Layer 3: Explainable AI (XAI Engine)',
      tech: 'SHAP & LIME Plain-Language Explanations',
      icon: <Layers className="w-5 h-5 text-[#2A5C82]" />,
      desc: 'Translates high-dimensional machine learning weights into human-understandable clinical biomarker importance lists.',
      components: ['shap_explainer.py', 'lime_explainer.py', 'ReasonList.tsx UI Component']
    },
    {
      id: 4,
      name: 'Layer 4: Decision Router & Triage Logic',
      tech: 'Confidence Tier Classifier + Emergency Override',
      icon: <Network className="w-5 h-5 text-[#141414]" />,
      desc: 'Classifies cases into Tier A (Direct Referral), Tier B (Priority Doctor Queue), Tier C (Expert Panel), and Emergency Vital Override.',
      components: ['router.py', 'adr_router_extension.py', 'emergency_override.py']
    },
    {
      id: 5,
      name: 'Layer 5: Referral Intelligence & Polygon Audit',
      tech: 'FastAPI / Node.js • Polygon Amoy Testnet Smart Contract',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      desc: 'Smart hospital matching, essential orphan drug stock lookup, and zero-knowledge SHA-256 case hash commits on Polygon blockchain.',
      components: ['facility_matcher.py', 'SynDxAudit.sol', 'BlockchainVerifiedBadge.tsx']
    },
    {
      id: 6,
      name: 'Layer 6: Continuous Federated Learning Loop',
      tech: 'Flower FedAvg Framework (Differential Privacy)',
      icon: <Database className="w-5 h-5 text-rose-700" />,
      desc: 'Continuous collaborative model training across rural PHC nodes without centralizing or sharing raw patient health records.',
      components: ['server.py (FedAvg)', 'client.py (Per-Clinic Client)', 'adr_pattern_aggregation.py']
    }
  ];

  const buildPlanDays = [
    { day: 'Day 1', task: 'Clinic Client shell + offline intake form + Local encrypted store', status: 'Completed' },
    { day: 'Day 2-3', task: 'Edge AI TFLite runtime + SHAP/LIME plain-language explainers', status: 'Completed' },
    { day: 'Day 4', task: 'Decision router + Tier A/B/C/Emergency triage + Referral matcher', status: 'Completed' },
    { day: 'Day 5', task: 'Polygon testnet blockchain audit contract & SHA-256 hash commit', status: 'Completed' },
    { day: 'Day 6', task: 'Federated learning Flower FedAvg multi-clinic round simulator', status: 'Completed' },
    { day: 'Day 7', task: 'Unified Doctor Review Console + Gemini AI Query Assistant', status: 'Completed' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#F0EEE9] border-2 border-[#141414] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-[#141414] text-white text-[10px] font-mono px-2.5 py-1 font-bold uppercase tracking-wider">
              SynDx Core Architecture & Workbench Tracker
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#141414] mt-2">
              6-Layer Architecture & 7-Day Real Build Plan Status
            </h1>
            <p className="text-xs font-serif italic text-[#141414]/80 mt-0.5 max-w-2xl">
              Visual 3D & 2D architecture diagram detailing end-to-end data flow from point-of-care offline intake to Polygon blockchain auditing and Flower federated learning.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3.5 py-2 font-bold uppercase tracking-wider border border-[#141414] transition-all flex items-center gap-1.5 ${
                viewMode === '3D' ? 'bg-[#141414] text-white' : 'bg-white text-[#141414] hover:bg-[#E4E3E0]'
              }`}
            >
              <Box className="w-4 h-4 text-[#FF6321]" />
              <span>3D Spatial View</span>
            </button>

            <button
              onClick={() => setViewMode('2D')}
              className={`px-3.5 py-2 font-bold uppercase tracking-wider border border-[#141414] transition-all flex items-center gap-1.5 ${
                viewMode === '2D' ? 'bg-[#141414] text-white' : 'bg-white text-[#141414] hover:bg-[#E4E3E0]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#2A5C82]" />
              <span>2D Layer Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Architecture Stage */}
      {viewMode === '3D' ? (
        <ThreeDArchitectureView />
      ) : (
        <div className="bg-white border border-[#141414] p-5 space-y-4">
        <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
          SynDx System Layer Architecture Map:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {layers.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`p-4 border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#141414] text-white border-[#141414]'
                    : 'bg-[#F0EEE9] text-[#141414] border-[#141414] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 border ${isActive ? 'bg-white text-[#141414] border-white' : 'bg-white text-[#141414] border-[#141414]'}`}>
                    {layer.icon}
                  </div>
                  <span className="font-bold text-xs uppercase tracking-tight font-mono">{layer.name}</span>
                </div>
                <p className={`text-[11px] font-serif italic leading-relaxed line-clamp-2 ${isActive ? 'text-white/80' : 'text-[#141414]/80'}`}>
                  {layer.desc}
                </p>
                <span className={`text-[10px] font-mono font-bold block mt-2 uppercase ${isActive ? 'text-[#FF6321]' : 'text-[#2A5C82]'}`}>
                  {layer.tech}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Layer Inspector */}
        {layers.find((l) => l.id === activeLayer) && (
          <div className="bg-[#F0EEE9] p-4 border-2 border-[#141414] text-xs space-y-2 mt-2">
            <span className="text-[#2A5C82] font-mono font-black uppercase tracking-wider text-[11px] block">
              Inspecting {layers.find((l) => l.id === activeLayer)?.name}:
            </span>
            <p className="text-[#141414] font-serif text-xs italic leading-relaxed">
              {layers.find((l) => l.id === activeLayer)?.desc}
            </p>
            <div className="pt-2">
              <span className="text-[#141414] text-[10px] block font-mono font-bold uppercase mb-1">Key Modules:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {layers.find((l) => l.id === activeLayer)?.components.map((comp, idx) => (
                  <span key={idx} className="bg-white border border-[#141414] text-[#141414] font-bold px-2.5 py-0.5">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 7-Day Real Build Plan Tracker */}
      <div className="bg-white border border-[#141414] p-5 space-y-4">
        <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          7-Day Real Build Plan Execution Progress:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {buildPlanDays.map((item, idx) => (
            <div key={idx} className="bg-[#F0EEE9] p-3 border border-[#141414] space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-[#2A5C82]">{item.day}</span>
                <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-black uppercase">
                  ✓ {item.status}
                </span>
              </div>
              <p className="text-[#141414] font-serif text-[11px] italic leading-snug">{item.task}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
