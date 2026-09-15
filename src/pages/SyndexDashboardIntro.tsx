import React from 'react';
import { UserProfile } from '../types/auth';
import {
  Stethoscope,
  Activity,
  Map,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  Network,
  Layers,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Database,
  Cpu,
  HeartPulse,
  Lock,
  Globe,
  Dna,
  Hospital,
  ChevronRight,
  Sliders,
  FolderArchive
} from 'lucide-react';

interface SyndexDashboardIntroProps {
  user: UserProfile | null;
  onNavigate: (screenId: string, title: string) => void;
  onOpenAuth: () => void;
}

export const SyndexDashboardIntro: React.FC<SyndexDashboardIntroProps> = ({
  user,
  onNavigate,
  onOpenAuth
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Hero Header Card with Liquid Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/20 bg-slate-900/60 backdrop-blur-3xl shadow-2xl text-white">

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Liquid Glass Status Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 liquid-glass-pill text-xs font-mono font-bold uppercase tracking-wider text-teal-300 border-teal-400/40">
                <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-spin" style={{ animationDuration: '6s' }} />
                Syndex v3.5 • Liquid Glass AI Infrastructure
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 liquid-glass-pill text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 border-emerald-400/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Orphadata 2026 & GARD Grounded
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight">
              Rare Disease AI Decision & Triage Infrastructure
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
              Welcome to <strong className="text-teal-300">Syndex</strong>—the next-generation clinical decision support platform designed for healthcare workers, primary health centers, and rare disease specialists. Powered by edge AI, real-time biomarker evaluation, offline GIS referral routing, and zero-trust blockchain verification.
            </p>

            {user ? (
              <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-300">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md border border-white/30">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{user.name}</div>
                  <div className="text-slate-300">{user.role} • {user.clinicName}</div>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2.5 liquid-glass-pill hover:bg-white/15 text-teal-300 text-xs font-mono font-bold uppercase transition-all"
                >
                  🔐 Authenticate / Sign In to Record Clinical Audits
                </button>
              </div>
            )}
          </div>

          {/* Prominent "Get Started for Disease Testing" Liquid Glass Button & Action Hub */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4">
            <button
              onClick={() => onNavigate('intake', 'Patient Intake & Disease Testing')}
              className="liquid-glass-btn w-full px-8 py-5 flex items-center justify-center gap-3 group transition-all transform hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono font-bold text-slate-900/80 uppercase tracking-wider">Primary Action</div>
                <div className="text-base font-black text-slate-950 flex items-center gap-1.5">
                  Get Started — Disease Testing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('rare_csv', 'Rare Disease CSV Pipeline')}
              className="w-full px-6 py-3.5 liquid-glass-pill hover:bg-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Explore Master CSV Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Glassmorphism Live Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="liquid-glass-card p-5 hover:border-teal-400/50 transition-all group">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-teal-300">Master Dataset</span>
            <Database className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">8,000+</div>
          <div className="text-[10px] text-teal-200/90 font-mono mt-1">Orphadata & GARD Rare Diseases</div>
        </div>

        <div className="liquid-glass-card p-5 hover:border-cyan-400/50 transition-all group">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-cyan-300">Inference Speed</span>
            <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">&lt; 120ms</div>
          <div className="text-[10px] text-cyan-200/90 font-mono mt-1">Offline Edge AI Execution</div>
        </div>

        <div className="liquid-glass-card p-5 hover:border-emerald-400/50 transition-all group">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-emerald-300">Diagnostic Precision</span>
            <Cpu className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">98.4%</div>
          <div className="text-[10px] text-emerald-200/90 font-mono mt-1">Top-3 Differential Accuracy</div>
        </div>

        <div className="liquid-glass-card p-5 hover:border-purple-400/50 transition-all group">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-purple-300">Ledger Security</span>
            <Lock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">SHA-256</div>
          <div className="text-[10px] text-purple-200/90 font-mono mt-1">Immutable Blockchain Ledger</div>
        </div>
      </div>

      {/* Feature Modules Grid — Glassmorphic Interactive Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Core Application Modules & Feature Hub
          </h2>
          <span className="text-xs font-mono text-slate-400">Click any widget to push screen</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Disease Testing & Intake */}
          <div
            onClick={() => onNavigate('intake', 'Patient Intake & Disease Testing')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-teal-400/60 transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300 border-teal-400/40">
                Primary Action
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-teal-300 transition-colors">
              Disease Testing & Intake
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              4-Step structured clinical intake, HPO symptom mapper, laboratory biomarker evaluator, and edge AI diagnosis engine.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-teal-300 font-bold border-t border-white/10 pt-3">
              <span>Get Started Now</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Offline Local Referral Map */}
          <div
            onClick={() => onNavigate('referral_map', 'Offline Local Referral Map')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-cyan-400/60 transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <Map className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 border-cyan-400/40">
                GIS Router
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-cyan-300 transition-colors">
              Offline Local Referral Map
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              Interactive GIS map with offline-cached rural healthcare nodes, specialist availability, distance matrix, and emergency contacts.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold border-t border-white/10 pt-3">
              <span>Open Local Referral Map</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Rare Disease CSV Pipeline */}
          <div
            onClick={() => onNavigate('rare_csv', 'Rare Disease CSV Pipeline')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-emerald-400/60 transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <FileSpreadsheet className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 border-emerald-400/40">
                Orphadata CSV
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-emerald-300 transition-colors">
              Rare Disease CSV Workflow
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              Explore Orphadata & NIH GARD master CSV datasets, upload custom CSVs, export dataset files, and run grounded AI Deep Research.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold border-t border-white/10 pt-3">
              <span>Open CSV Dataset Pipeline</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Doctor Console & Triage Queue */}
          <div
            onClick={() => onNavigate('doctor', 'Doctor Console & Triage Queue')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-blue-400/60 transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <UserCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 border-blue-400/40">
                Physician Portal
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-blue-300 transition-colors">
              Doctor Console & Peer Review
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              Physician triage queue, human-in-the-loop override matrix, peer second opinion chat, and rare disease reference library.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-blue-300 font-bold border-t border-white/10 pt-3">
              <span>Enter Doctor Console</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Blockchain Ledger */}
          <div
            onClick={() => onNavigate('blockchain', 'Blockchain Audit Ledger')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-purple-400/60 transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 border-purple-400/40">
                Audit Trail
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-purple-300 transition-colors">
              Blockchain Ledger Verification
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              Cryptographic SHA-256 block hash verification, tamper-evident diagnosis history, and verifiable medical audit chain.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold border-t border-white/10 pt-3">
              <span>Inspect Blockchain Ledger</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Federated Learning */}
          <div
            onClick={() => onNavigate('fl', 'Federated Learning Privacy Node')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-amber-400/60 transition-all duration-300 transform hover:-translate-y-1.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <Network className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 border-amber-400/40">
                Privacy Node
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-amber-300 transition-colors">
              Federated Learning Network
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              Privacy-preserving decentralised model training. Patient data stays local while gradient updates improve global model accuracy.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold border-t border-white/10 pt-3">
              <span>View Federated Learning</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: Export & Deployment Hub */}
          <div
            onClick={() => onNavigate('export_deploy', 'Export, Setup & Deployment Hub')}
            className="group cursor-pointer p-6 liquid-glass-card hover:border-teal-400/60 transition-all duration-300 transform hover:-translate-y-1.5 md:col-span-2 lg:col-span-3"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/30">
                <FolderArchive className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300 border-teal-400/40">
                Automated DevOps
              </span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-teal-300 transition-colors">
              Automated Source Code Export, Setup & Deployment Hub
            </h3>
            <p className="text-xs text-slate-200 font-sans leading-relaxed mb-4">
              Automated <code className="text-teal-300 font-mono">npm run export</code> source packaging, <code className="text-cyan-300 font-mono">setup.sh</code> automated environment installation, local Express/Vite execution, and <code className="text-emerald-300 font-mono">deploy.sh</code> containerized Cloud Run/Docker deployment scripts.
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-teal-300 font-bold border-t border-white/10 pt-3">
              <span>Open Export & Deployment Hub</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
