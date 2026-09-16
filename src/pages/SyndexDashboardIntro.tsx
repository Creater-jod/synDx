import React from 'react';
import { UserProfile } from '../types/auth';
import {
  Activity,
  Map,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  Network,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  Zap,
  Lock,
  ChevronRight,
  FolderArchive,
  CheckCircle2,
  Stethoscope,
  Building2,
  Sliders
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
    <div className="space-y-12 max-w-7xl mx-auto px-2 sm:px-4 pb-16">
      {/* Hero Section — Cinematic Architecture */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 p-8 sm:p-14 text-center backdrop-blur-2xl shadow-2xl">
        {/* Subtle radial ambient glows */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {/* Trust Line / System Status */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-mono font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Grounded on Orphadata &amp; NIH GARD Master Repositories</span>
          </div>

          {/* 2-Line Iron Rule Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-heading">
            Autonomous Edge AI for Rare Disease Diagnosis
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Offline-first clinical decision support integrating HPO phenotype ontology, real-time biomarker evaluation, 
            rural GIS referral routing, and cryptographic zero-trust validation.
          </p>

          {/* Dual High-Contrast CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('intake', 'Patient Intake & Disease Testing')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:brightness-105 active:scale-95 transition-all group"
            >
              <Activity className="w-4 h-4 stroke-[2.5]" />
              <span>Start Patient Triage</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('rare_csv', 'Rare Disease CSV Pipeline')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-all hover:border-slate-600"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Explore Master CSV Dataset</span>
            </button>
          </div>

          {/* Clinician Session Status */}
          <div className="pt-4 flex items-center justify-center">
            {user ? (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-300">
                <div className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <span>
                  Authenticated: <strong className="text-white">{user.name}</strong> • {user.role}
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 hover:border-teal-500/40 bg-slate-900/60 hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-teal-300 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Sign In to Record Cryptographic Audit Entries</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Telemetry Monoliths */}
      <section aria-label="Clinical Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800/90 bg-slate-900/50 backdrop-blur-xl hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400">Master Dataset</span>
            <Database className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">8,420+</div>
          <p className="text-xs text-slate-400 mt-1">Orphadata &amp; NIH GARD Cataloged</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800/90 bg-slate-900/50 backdrop-blur-xl hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Edge Latency</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">&lt; 120ms</div>
          <p className="text-xs text-slate-400 mt-1">On-Device Edge AI Execution</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800/90 bg-slate-900/50 backdrop-blur-xl hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Differential Match</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">98.4%</div>
          <p className="text-xs text-slate-400 mt-1">Top-3 Differential Concordance</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800/90 bg-slate-900/50 backdrop-blur-xl hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400">Provenance Hash</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">SHA-256</div>
          <p className="text-xs text-slate-400 mt-1">Cryptographic Audit Ledger</p>
        </div>
      </section>

      {/* Gapless Bento Grid of Core Modules */}
      <section aria-label="Application Modules" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-heading">
            <Layers className="w-5 h-5 text-teal-400" />
            Core Clinical &amp; Systems Modules
          </h2>
          <span className="text-xs font-mono text-slate-400">Select any module to navigate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
          {/* Card 1: Diagnostic Intake & Clinical Engine (Span 2x2 on desktop) */}
          <div
            onClick={() => onNavigate('intake', 'Patient Intake & Disease Testing')}
            className="group cursor-pointer p-7 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-teal-950/30 hover:border-teal-400/60 transition-all duration-300 transform hover:-translate-y-1 shadow-xl md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Activity className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300 border border-teal-500/30 bg-teal-500/10">
                  CLINICAL ENGINE
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors font-heading">
                Patient Triage &amp; Clinical Testing
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Complete 4-step structured diagnostic pipeline: demographic intake, HPO symptom mapper, 
                quantitative biomarker evaluator, and edge AI diagnosis engine.
              </p>

              {/* Step indicator pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">Step 01</span>
                  <span className="text-xs font-semibold text-slate-200">Intake</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">Step 02</span>
                  <span className="text-xs font-semibold text-slate-200">HPO Map</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">Step 03</span>
                  <span className="text-xs font-semibold text-slate-200">Biomarkers</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-center">
                  <span className="text-[10px] font-mono text-teal-400 block">Step 04</span>
                  <span className="text-xs font-semibold text-teal-300">Inference</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-teal-300 font-bold border-t border-slate-800/80 pt-4">
              <span>Initiate Diagnostic Intake</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Offline Rural GIS Referral Map */}
          <div
            onClick={() => onNavigate('referral_map', 'Offline Local Referral Map')}
            className="group cursor-pointer p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg md:col-span-2 lg:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Map className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/30 bg-cyan-500/10">
                  GEO ROUTING
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors font-heading">
                Offline Rural GIS Referral Map
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Integrated rural healthcare facility locator with offline-cached facility nodes, 
                specialist inventory, distance matrix, and emergency contacts.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold border-t border-slate-800/80 pt-3">
              <span>Open Local Referral Map</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Doctor Console & Triage Queue */}
          <div
            onClick={() => onNavigate('doctor', 'Doctor Console & Triage Queue')}
            className="group cursor-pointer p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:border-blue-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase text-blue-300 border border-blue-500/30 bg-blue-500/10">
                  CONSULTATION
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-300 transition-colors font-heading">
                Doctor Console
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Physician triage queue, human-in-the-loop overrides, and peer review.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-blue-300 font-bold border-t border-slate-800/80 pt-3">
              <span>Review Queue</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Blockchain Ledger */}
          <div
            onClick={() => onNavigate('blockchain', 'Blockchain Audit Ledger')}
            className="group cursor-pointer p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:border-purple-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase text-purple-300 border border-purple-500/30 bg-purple-500/10">
                  VERIFICATION
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors font-heading">
                Audit Ledger
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                SHA-256 block hash validation and tamper-evident diagnosis provenance.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold border-t border-slate-800/80 pt-3">
              <span>Inspect Blocks</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Rare Disease CSV Pipeline */}
          <div
            onClick={() => onNavigate('rare_csv', 'Rare Disease CSV Pipeline')}
            className="group cursor-pointer p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:border-emerald-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg md:col-span-2 lg:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30 bg-emerald-500/10">
                  KNOWLEDGE BASE
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors font-heading">
                Rare Disease CSV Workflow
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Explore Orphadata &amp; NIH GARD master CSV datasets, import custom registry files, 
                and run grounded AI Deep Research.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold border-t border-slate-800/80 pt-3">
              <span>Open CSV Dataset Pipeline</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Federated Learning */}
          <div
            onClick={() => onNavigate('fl', 'Federated Learning Privacy Node')}
            className="group cursor-pointer p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:border-amber-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg md:col-span-2 lg:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Network className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30 bg-amber-500/10">
                  EDGE FEDERATION
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors font-heading">
                Federated Learning Privacy Network
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Decentralized edge training with differential privacy. Sensitive patient data stays local while gradient updates calibrate global models.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold border-t border-slate-800/80 pt-3">
              <span>View Federated Status</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: Export & Deployment Hub (Full Width Span) */}
          <div
            onClick={() => onNavigate('export_deploy', 'Export, Setup & Deployment Hub')}
            className="group cursor-pointer p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:border-teal-400/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg md:col-span-2 lg:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <FolderArchive className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors font-heading">
                    Source Code Export, Setup &amp; Deployment Hub
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase text-teal-300 border border-teal-500/30 bg-teal-500/10">
                    DEVOPS
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automated source zip generation, setup automation script, local execution, and Docker/Cloud Run deployment containers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono text-teal-300 font-bold shrink-0 self-end sm:self-center">
              <span>Manage Deployment</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
