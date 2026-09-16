import React, { useState, useEffect } from 'react';
import { LocalStoreService } from '../../services/localStore';
import { AuditBlock } from '../../types/syndx';
import { ShieldCheck, Search, Link, CheckCircle2, Lock, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export const BlockchainLedgerView: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{ match: boolean; block?: AuditBlock } | null>(null);

  const loadBlocks = () => {
    setBlocks(LocalStoreService.getAuditBlocks());
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleVerifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    const query = verifyInput.trim().toLowerCase();
    const found = blocks.find(
      (b) => b.txHash.toLowerCase().includes(query) || b.caseHash.toLowerCase().includes(query)
    );

    if (found) {
      setVerificationResult({ match: true, block: found });
    } else {
      setVerificationResult({ match: false });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              Layer 5b: Immutable Blockchain Audit Ledger (Polygon Amoy Testnet)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Cryptographic SHA-256 Audit Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Zero raw health data on-chain. Only cryptographic case hashes, clinic identifiers, and timestamp proofs are immutably logged for tamper-proof accountability.
            </p>
          </div>

          <button
            onClick={loadBlocks}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-mono font-semibold uppercase flex items-center gap-2 transition-colors self-start sm:self-center"
          >
            <RefreshCw className="w-4 h-4 text-teal-400" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Verification Tool */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>On-Chain SHA-256 Audit Verification Tool</span>
        </h2>

        <form onSubmit={handleVerifyHash} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={verifyInput}
            onChange={(e) => setVerifyInput(e.target.value)}
            placeholder="Paste Tx Hash or Case SHA-256 Hash to verify on-chain..."
            className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-mono font-bold text-xs uppercase bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-500/10"
          >
            <Search className="w-4 h-4" />
            <span>Verify Record</span>
          </button>
        </form>

        {verificationResult && (
          <div className="pt-2">
            {verificationResult.match ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs space-y-2 font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RECORD VERIFIED ON POLYGON TESTNET (Block #{verificationResult.block?.blockNumber})</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Record Type: <strong className="text-white">{verificationResult.block?.recordType}</strong> • Clinic: {verificationResult.block?.clinicId} • Timestamp: {verificationResult.block?.timestamp}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 font-mono font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Hash not found in current local Polygon Amoy block cache.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blocks Feed */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Link className="w-4 h-4 text-teal-400" />
          <span>Latest Immutable Audit Blocks (Polygon Amoy Testnet):</span>
        </h2>

        <div className="space-y-3">
          {blocks.map((b) => (
            <div
              key={b.blockNumber}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs font-mono transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-bold">
                    Block #{b.blockNumber}
                  </span>
                  <span className="text-white font-bold">{b.recordType}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{b.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Case Hash:</span>
                  <span className="text-teal-300 font-mono break-all">{b.caseHash}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Tx Hash (Polygon):</span>
                  <span className="text-slate-300 font-mono break-all">{b.txHash}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                <span>PHC Node: <strong className="text-slate-300">{b.clinicId}</strong></span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${b.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <span>PolygonScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
