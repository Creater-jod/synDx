import React, { useState, useEffect } from 'react';
import { DoctorCaseReview } from '../../types/syndx';
import { LocalStoreService } from '../../services/localStore';
import { ConfidenceTierBadge } from '../../components/ConfidenceTierBadge';
import { ApproveRejectOverride } from '../../components/ApproveRejectOverride';
import { ReasonList } from '../../components/ReasonList';
import { BlockchainVerifiedBadge } from '../../components/BlockchainVerifiedBadge';
import { ChatQueryPanel } from './ChatQueryPanel';
import { Stethoscope, ShieldAlert, Filter, Search, ChevronRight, RefreshCw, MessageSquare, BookOpen, UserCheck } from 'lucide-react';
import { DiseaseLibraryModal } from '../../components/DiseaseLibraryModal';

export const QueueDashboard: React.FC = () => {
  const [queue, setQueue] = useState<DoctorCaseReview[]>([]);
  const [selectedCase, setSelectedCase] = useState<DoctorCaseReview | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Diagnosis' | 'ADR Alert'>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showChatPanel, setShowChatPanel] = useState<boolean>(false);
  const [showDiseaseLibrary, setShowDiseaseLibrary] = useState<boolean>(false);

  const loadQueue = () => {
    const data = LocalStoreService.getDoctorQueue();
    setQueue(data);
    if (!selectedCase && data.length > 0) {
      setSelectedCase(data[0]);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleUpdateStatus = (
    id: string,
    status: 'Approved' | 'Rejected' | 'Overridden',
    notes?: string,
    overrideDiagnosis?: string
  ) => {
    const updated = LocalStoreService.updateDoctorCaseStatus(id, status, notes, overrideDiagnosis);
    setQueue(updated);
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase(updated.find((c) => c.id === id) || null);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filterType !== 'All' && item.type !== filterType) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.patientCode.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term) ||
        item.clinicName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              Physician Decision Support Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Physician Triage Queue &amp; ADR Monitor
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Unified queue for rare disease diagnostic referrals, second opinion review, and post-prescription drug reaction alerts across rural nodes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowChatPanel(!showChatPanel)}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono font-semibold text-xs uppercase flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>{showChatPanel ? 'Hide Assistant' : 'AI Assistant'}</span>
            </button>

            <button
              onClick={() => setShowDiseaseLibrary(true)}
              className="px-3.5 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-mono font-semibold text-xs uppercase flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Disease Library</span>
            </button>

            <button
              onClick={loadQueue}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Doctor AI Assistant Drawer */}
      {showChatPanel && (
        <div>
          <ChatQueryPanel activeCase={selectedCase} />
        </div>
      )}

      {/* Main Grid: Queue List (5 cols) & Selected Case Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases Queue List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters & Search */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-3 backdrop-blur-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient code, clinic, diagnosis..."
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['All', 'Diagnosis', 'ADR Alert'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 font-mono font-semibold text-[10px] uppercase transition-colors rounded-lg ${
                      filterType === type ? 'bg-teal-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-mono font-semibold px-3 py-1.5 text-xs uppercase focus:outline-none focus:border-teal-400"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Overridden">Overridden</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredQueue.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-mono text-slate-400">
                No cases match the selected search and filter criteria.
              </div>
            ) : (
              filteredQueue.map((item) => {
                const isSelected = selectedCase?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCase(item)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-teal-500/50 bg-teal-500/10 shadow-lg ring-1 ring-teal-500/30'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`p-1.5 text-xs font-bold rounded-lg border ${
                            item.type === 'Diagnosis'
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                              : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          }`}
                        >
                          {item.type === 'Diagnosis' ? <Stethoscope className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        </span>
                        <span className="font-bold text-xs font-mono tracking-wider text-white">{item.patientCode}</span>
                        <span className="text-[11px] font-mono text-slate-400">({item.clinicName})</span>
                      </div>

                      <ConfidenceTierBadge tier={item.tier} size="sm" />
                    </div>

                    <p className="text-xs line-clamp-2 leading-relaxed mb-2 text-slate-300">{item.summary}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800 text-slate-400">
                      <span>{item.date}</span>
                      <span
                        className={`font-mono font-bold uppercase ${
                          item.status === 'Approved'
                            ? 'text-emerald-400'
                            : item.status === 'Overridden'
                            ? 'text-sky-400'
                            : item.status === 'Rejected'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        ● {item.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Inspector & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-7 space-y-5 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-400 text-slate-950 text-[10px] px-2.5 py-0.5 font-mono font-black uppercase rounded-md shadow-sm">
                      {selectedCase.type}
                    </span>
                    <span className="text-xs font-mono text-teal-300 font-bold">{selectedCase.patientCode}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1 tracking-tight font-heading">{selectedCase.summary}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">Node: {selectedCase.clinicName} • Reported {selectedCase.date}</p>
                </div>

                <ConfidenceTierBadge tier={selectedCase.tier} size="md" />
              </div>

              {/* Case Details depending on type */}
              {selectedCase.type === 'Diagnosis' ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h3 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                      Edge AI Top Rare Disease Candidates:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {((selectedCase.details as any).topCandidates || []).map((cand: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl flex justify-between font-mono bg-slate-900 border border-slate-800">
                          <span className="font-semibold text-slate-200">{cand.name}</span>
                          <span className="font-bold text-teal-300">{cand.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ReasonList
                    shapReasons={(selectedCase.details as any).shapReasons || []}
                    limeReasons={(selectedCase.details as any).limeReasons || []}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                      Suspected Adverse Reaction Signal:
                    </h3>
                    <p className="text-xs text-white font-bold font-mono">
                      {(selectedCase.details as any).suspectedReaction} (Prescribed: {(selectedCase.details as any).prescribedDrug})
                    </p>
                  </div>

                  <ReasonList
                    shapReasons={(selectedCase.details as any).shapReasons || []}
                    limeReasons={(selectedCase.details as any).limeReasons || []}
                    title="ADR Signal XAI Feature Attribution (SHAP & LIME)"
                  />
                </div>
              )}

              {/* Blockchain Verification */}
              <BlockchainVerifiedBadge txHash={selectedCase.blockchainTxHash} />

              {/* Physician Review & Action Controls */}
              <ApproveRejectOverride reviewCase={selectedCase} onUpdate={handleUpdateStatus} />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 font-mono text-xs">
              Select a case from the queue list to inspect clinical reasoning and approve/override diagnosis.
            </div>
          )}
        </div>
      </div>

      <DiseaseLibraryModal isOpen={showDiseaseLibrary} onClose={() => setShowDiseaseLibrary(false)} />
    </div>
  );
};
