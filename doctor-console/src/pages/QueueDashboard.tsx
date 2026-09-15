import React, { useState, useEffect } from 'react';
import { DoctorCaseReview } from '../../../src/types/syndx';
import { LocalStoreService } from '../../../src/services/localStore';
import { ConfidenceTierBadge } from '../../../src/components/ConfidenceTierBadge';
import { ApproveRejectOverride } from '../../../src/components/ApproveRejectOverride';
import { ReasonList } from '../../../src/components/ReasonList';
import { BlockchainVerifiedBadge } from '../../../src/components/BlockchainVerifiedBadge';
import { ChatQueryPanel } from '../../../src/pages/doctor/ChatQueryPanel';
import { Stethoscope, ShieldAlert, Filter, Search, ChevronRight, RefreshCw, MessageSquare } from 'lucide-react';

export const QueueDashboard: React.FC = () => {
  const [queue, setQueue] = useState<DoctorCaseReview[]>([]);
  const [selectedCase, setSelectedCase] = useState<DoctorCaseReview | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Diagnosis' | 'ADR Alert'>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showChatPanel, setShowChatPanel] = useState<boolean>(false);

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
      <div className="bg-[#F0EEE9] border-2 border-[#141414] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-[#141414] text-white text-[10px] font-mono px-2.5 py-1 font-bold uppercase tracking-wider">
              SynDx Unified Doctor Review Console
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#141414] mt-2">
              Physician Decision Support & ADR Signal Triage Queue
            </h1>
            <p className="text-xs font-serif italic text-[#141414]/80 mt-0.5">
              Single unified queue for rare disease diagnostic referrals and post-prescription drug reaction alerts across rural PHC nodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChatPanel(!showChatPanel)}
              className="px-4 py-2 bg-[#141414] hover:bg-[#2A5C82] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-[#FF6321]" />
              <span>{showChatPanel ? 'Hide AI Query Panel' : 'Open Doctor AI Chat'}</span>
            </button>

            <button
              onClick={loadQueue}
              className="p-2 bg-white text-[#141414] border border-[#141414] hover:bg-[#E4E3E0] text-xs font-mono font-bold"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Doctor AI Assistant Drawer */}
      {showChatPanel && (
        <div className="animate-fade-in">
          <ChatQueryPanel activeCase={selectedCase} />
        </div>
      )}

      {/* Main Grid: Queue List (5 cols) & Selected Case Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases Queue List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters & Search */}
          <div className="bg-white border border-[#141414] p-3.5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient code, clinic, diagnosis..."
                className="w-full bg-[#F0EEE9] border border-[#141414] pl-9 pr-3 py-2 text-xs text-[#141414] font-mono focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 bg-[#F0EEE9] p-1 border border-[#141414]">
                {(['All', 'Diagnosis', 'ADR Alert'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 font-mono font-bold text-[10px] uppercase transition-colors ${
                      filterType === type ? 'bg-[#141414] text-white' : 'text-[#141414]/70 hover:text-[#141414]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F0EEE9] border border-[#141414] text-[#141414] font-mono font-bold p-1.5 text-[10px] uppercase focus:outline-none"
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
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueue.length === 0 ? (
              <div className="bg-white border border-[#141414] p-8 text-center text-xs font-mono text-[#141414]/70">
                No cases match the selected search and filter criteria.
              </div>
            ) : (
              filteredQueue.map((item) => {
                const isSelected = selectedCase?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCase(item)}
                    className={`p-3.5 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-white text-[#141414] border-[#141414] hover:bg-[#F0EEE9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1 text-xs font-bold border uppercase ${
                            item.type === 'Diagnosis'
                              ? 'bg-[#2A5C82] text-white border-[#2A5C82]'
                              : 'bg-[#FF6321] text-white border-[#FF6321]'
                          }`}
                        >
                          {item.type === 'Diagnosis' ? <Stethoscope className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        </span>
                        <span className="font-bold text-xs font-mono tracking-wider">{item.patientCode}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-white/70' : 'text-[#141414]/60'}`}>({item.clinicName})</span>
                      </div>

                      <ConfidenceTierBadge tier={item.tier} size="sm" />
                    </div>

                    <p className={`text-xs font-serif italic line-clamp-2 leading-relaxed mb-2 ${isSelected ? 'text-white/90' : 'text-[#141414]/90'}`}>{item.summary}</p>

                    <div className={`flex items-center justify-between text-[10px] font-mono pt-1 border-t ${isSelected ? 'border-white/20 text-white/70' : 'border-[#141414]/20 text-[#141414]/60'}`}>
                      <span>{item.date}</span>
                      <span
                        className={`font-mono font-bold uppercase ${
                          item.status === 'Approved'
                            ? isSelected ? 'text-emerald-300' : 'text-emerald-700'
                            : item.status === 'Overridden'
                            ? isSelected ? 'text-sky-300' : 'text-[#2A5C82]'
                            : item.status === 'Rejected'
                            ? isSelected ? 'text-rose-300' : 'text-rose-700'
                            : isSelected ? 'text-amber-300' : 'text-[#FF6321]'
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
            <div className="bg-[#F0EEE9] border-2 border-[#141414] p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141414] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#141414] text-white text-[10px] px-2 py-0.5 font-mono font-bold uppercase">
                      {selectedCase.type}
                    </span>
                    <span className="text-xs font-mono text-[#141414] font-bold">{selectedCase.patientCode}</span>
                  </div>
                  <h2 className="text-xl font-black uppercase text-[#141414] mt-1 tracking-tight">{selectedCase.summary}</h2>
                  <p className="text-xs font-mono text-[#141414]/70">Node: {selectedCase.clinicName} • Reported {selectedCase.date}</p>
                </div>

                <ConfidenceTierBadge tier={selectedCase.tier} size="md" />
              </div>

              {/* Case Details depending on type */}
              {selectedCase.type === 'Diagnosis' ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 border border-[#141414] space-y-2">
                    <h3 className="text-xs font-mono font-black text-[#141414] uppercase tracking-wider">
                      Edge AI Top Rare Disease Candidates:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {((selectedCase.details as any).topCandidates || []).map((cand: any, idx: number) => (
                        <div key={idx} className="bg-[#F0EEE9] p-2.5 border border-[#141414] flex justify-between font-mono">
                          <span className="font-bold text-[#141414]">{cand.name}</span>
                          <span className="font-black text-[#2A5C82]">{cand.confidence}%</span>
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
                  <div className="bg-white p-4 border border-[#141414] space-y-2">
                    <h3 className="text-xs font-mono font-black text-[#FF6321] uppercase tracking-wider">
                      Suspected Adverse Reaction Signal:
                    </h3>
                    <p className="text-xs text-[#141414] font-bold font-mono">
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
            <div className="bg-white border border-[#141414] p-12 text-center text-[#141414]/70 font-mono text-xs">
              Select a case from the queue list to inspect clinical reasoning and approve/override diagnosis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
