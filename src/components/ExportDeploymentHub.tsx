import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Play, 
  Cloud, 
  Check, 
  Copy, 
  Code2, 
  FolderArchive, 
  Cpu, 
  CheckCircle2, 
  Server, 
  Box, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface ExportDeploymentHubProps {
  onBack?: () => void;
}

export const ExportDeploymentHub: React.FC<ExportDeploymentHubProps> = () => {
  const [activeTab, setActiveTab] = useState<'export' | 'setup' | 'local' | 'deploy'>('export');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const triggerSourceDownload = () => {
    setIsExporting(true);
    setExportComplete(false);

    setTimeout(() => {
      // Generate automated quick export package manifesto
      const content = `# Syndex Rare Disease AI Source Manifest
Export Timestamp: ${new Date().toISOString()}

==================================================
QUICK COMMANDS:
1. Setup: bash setup.sh  (or npm run setup)
2. Dev:   npm run dev
3. Start: npm start
4. Docker: docker build -t syndx-app .
==================================================
`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syndx-export-manifest-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportComplete(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 pb-12 font-sans">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl liquid-glass-card border border-white/20 relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300 border-teal-400/40">
                Automated DevOps Hub
              </span>
              <span className="px-3 py-1 liquid-glass-pill text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 border-emerald-400/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Scripts Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <FolderArchive className="w-8 h-8 text-teal-400" />
              Automated Code Export, Setup & Deployment
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Automate source code extraction, local environment setup, dependency installation, and one-click containerized cloud deployment.
            </p>
          </div>

          <button
            onClick={triggerSourceDownload}
            disabled={isExporting}
            className="liquid-glass-btn px-6 py-4 flex items-center justify-center gap-3 shrink-0"
          >
            <Download className="w-5 h-5 text-slate-950" />
            <div className="text-left">
              <div className="text-[10px] font-mono font-bold text-slate-900/80 uppercase">One-Click Action</div>
              <div className="text-sm font-black text-slate-950">
                {isExporting ? 'Packaging Archive...' : 'Download Export Manifest'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/15 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'export'
              ? 'liquid-glass-pill text-teal-300 border-teal-400/50 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>1. Export Source</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'setup'
              ? 'liquid-glass-pill text-teal-300 border-teal-400/50 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>2. Setup & Install</span>
        </button>

        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'local'
              ? 'liquid-glass-pill text-teal-300 border-teal-400/50 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Play className="w-4 h-4 text-emerald-400" />
          <span>3. Run Locally</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'deploy'
              ? 'liquid-glass-pill text-teal-300 border-teal-400/50 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cloud className="w-4 h-4 text-purple-400" />
          <span>4. Deploy Cloud / Docker</span>
        </button>
      </div>

      {/* Tab 1: Export Source Code */}
      {activeTab === 'export' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 liquid-glass-card space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">Automated Source Zip Generator</h3>
                  <p className="text-xs text-slate-300">Generates clean standalone source archive</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Run the automated export script in your workspace terminal. It cleans temporary build caches and packages all source code into a standalone <code className="text-teal-300 font-mono">syndx-rare-disease-ai-source.zip</code> file.
              </p>

              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Terminal Command:</div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-teal-300">
                  <span>npm run export</span>
                  <button
                    onClick={() => copyToClipboard('npm run export', 'export-cmd')}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                  >
                    {copiedIndex === 'export-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={triggerSourceDownload}
                  className="w-full py-3 liquid-glass-pill hover:bg-white/15 text-xs font-mono font-bold uppercase text-teal-300 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating...' : 'Trigger Immediate Download'}</span>
                </button>
                {exportComplete && (
                  <div className="mt-2 text-center text-xs font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Export manifest downloaded successfully!
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 liquid-glass-card space-y-4">
              <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                What's Included in the Export Archive
              </h3>

              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Full React 19 + TypeScript Source Code</span>
                </li>
                <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Express Full-Stack Backend Server (<code className="text-slate-200">server.ts</code>)</span>
                </li>
                <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Automated Setup & Deployment Shell Scripts</span>
                </li>
                <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Production Dockerfile & GCP Cloud Run Specs</span>
                </li>
                <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Firebase Blueprint & Security Rules</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Setup & Installation */}
      {activeTab === 'setup' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 liquid-glass-card space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                Automated Environment Setup Script
              </h3>
              <span className="text-xs font-mono text-slate-400">script: setup.sh</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              The automated setup script verifies your local Node.js environment, creates your local <code className="text-cyan-300 font-mono">.env</code> configuration file, installs dependencies with strict peer verification, and validates TypeScript compilation.
            </p>

            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold">Automated Setup Command:</div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/90 border border-white/10 font-mono text-xs text-cyan-300">
                <span>npm run setup</span>
                <button
                  onClick={() => copyToClipboard('npm run setup', 'setup-cmd')}
                  className="px-3 py-1.5 liquid-glass-pill hover:bg-white/15 text-white flex items-center gap-1.5 transition-all text-[11px]"
                >
                  {copiedIndex === 'setup-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'setup-cmd' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="text-xs font-mono text-slate-300 uppercase font-bold">Manual Step-by-Step Installation:</div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
                <div><span className="text-slate-500"># 1. Install dependencies</span></div>
                <div className="text-teal-300">npm install</div>
                <div><span className="text-slate-500"># 2. Copy environment variable template</span></div>
                <div className="text-teal-300">cp .env.example .env</div>
                <div><span className="text-slate-500"># 3. Verify TypeScript build</span></div>
                <div className="text-teal-300">npm run lint</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Run Locally */}
      {activeTab === 'local' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 liquid-glass-card space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">Vite Development Mode</h3>
                  <p className="text-xs text-slate-300">Fast frontend iteration</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Launches Vite dev server with instant module updates and fast client preview.
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-emerald-300">
                <span>npm run dev</span>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'dev-cmd')}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                >
                  {copiedIndex === 'dev-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Access URL: <strong className="text-emerald-300">http://localhost:3000</strong>
              </div>
            </div>

            <div className="p-6 liquid-glass-card space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">Full-Stack Production Mode</h3>
                  <p className="text-xs text-slate-300">Node Express server + Gemini AI APIs</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Compiles TypeScript assets and boots Express backend with server-side AI proxy routes.
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-teal-300">
                <span>npm run build && npm start</span>
                <button
                  onClick={() => copyToClipboard('npm run build && npm start', 'start-cmd')}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                >
                  {copiedIndex === 'start-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Access URL: <strong className="text-teal-300">http://localhost:3000</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Deploy Cloud / Docker */}
      {activeTab === 'deploy' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 liquid-glass-card space-y-6">
            <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-purple-400" />
              Automated Docker & Cloud Run Deployment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-slate-300 font-bold uppercase flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  1. Local Docker Container
                </div>
                <div className="text-slate-400"># Build production container image</div>
                <div className="text-cyan-300 p-2 rounded bg-slate-900 border border-white/5">docker build -t syndx-app .</div>
                <div className="text-slate-400"># Run container on port 3000</div>
                <div className="text-cyan-300 p-2 rounded bg-slate-900 border border-white/5">docker run -p 3000:3000 syndx-app</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-slate-300 font-bold uppercase flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-teal-400" />
                  2. Google Cloud Run Deploy
                </div>
                <div className="text-slate-400"># Direct Cloud Run automated deployment</div>
                <div className="text-teal-300 p-2 rounded bg-slate-900 border border-white/5">
                  gcloud run deploy syndx-app --source . --port 3000
                </div>
                <div className="text-slate-400"># Automated deployment script</div>
                <div className="text-teal-300 p-2 rounded bg-slate-900 border border-white/5">npm run deploy</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
