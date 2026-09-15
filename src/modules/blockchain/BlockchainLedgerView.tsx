import React, { useState, useEffect } from 'react';
import { LocalStoreService } from '../../services/localStore';
import { AuditBlock } from '../../types/syndx';
import { ShieldCheck, Search, Link, CheckCircle2, Lock, ExternalLink, RefreshCw } from 'lucide-react';

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
      <div className="bg-[#F0EEE9] border-2 border-[#141414] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="bg-[#141414] text-white text-[10px] font-mono px-2.5 py-1 font-bold uppercase tracking-wider">
              Layer 5b: Immutable Blockchain Audit Ledger (Polygon Amoy Testnet)
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#141414] mt-2">
              Cryptographic SHA-256 Verification & Audit Explorer
            </h1>
            <p className="text-xs font-serif italic text-[#141414]/80 mt-0.5 max-w-2xl">
              Zero raw health data on-chain. Only cryptographic case hashes, clinic identifiers, and timestamp proofs are immutably logged to ensure complete tamper-proof accountability.
            </p>
          </div>

          <button
            onClick={loadBlocks}
            className="p-2.5 bg-white text-[#141414] border border-[#141414] hover:bg-[#E4E3E0] text-xs font-mono font-bold uppercase flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Verification Tool */}
      <div className="bg-white border border-[#141414] p-5 space-y-4">
        <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2A5C82]" />
          On-Chain SHA-256 Audit Verification Tool:
        </h2>

        <form onSubmit={handleVerifyHash} className="flex gap-2">
          <input
            type="text"
            value={verifyInput}
            onChange={(e) => setVerifyInput(e.target.value)}
            placeholder="Paste Tx Hash or Case SHA-256 Hash to verify on-chain..."
            className="flex-1 bg-[#F0EEE9] border border-[#141414] p-2.5 font-mono text-xs text-[#141414] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#141414] hover:bg-[#2A5C82] text-white font-mono font-bold uppercase px-5 py-2.5 text-xs flex items-center gap-1.5 transition-all"
          >
            <Search className="w-4 h-4 text-[#FF6321]" />
            <span>Verify Record</span>
          </button>
        </form>

        {verificationResult && (
          <div className="animate-fade-in">
            {verificationResult.match ? (
              <div className="bg-[#F0EEE9] border-2 border-emerald-700 p-4 text-xs space-y-2 font-mono">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>RECORD VERIFIED ON POLYGON TESTNET (Block #{verificationResult.block?.blockNumber})</span>
                </div>
                <p className="text-[#141414] text-[11px]">
                  Record Type: <strong className="text-[#141414]">{verificationResult.block?.recordType}</strong> • Clinic: {verificationResult.block?.clinicId} • Timestamp: {verificationResult.block?.timestamp}
                </p>
              </div>
            ) : (
              <div className="bg-[#F0EEE9] border-2 border-rose-700 p-4 text-xs text-rose-800 font-mono font-bold">
                ✕ Hash not found in current local Polygon Amoy block cache.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Polygon Block Feed */}
      <div className="bg-white border border-[#141414] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#141414] pb-3">
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#2A5C82]" />
            Recent SynDx Polygon Audit Transactions:
          </h2>
          <span className="text-xs font-mono font-bold text-[#141414]/70">Total On-Chain Logs: {blocks.length}</span>
        </div>

        <div className="space-y-3">
          {blocks.map((b) => (
            <div key={b.txHash} className="bg-[#F0EEE9] border border-[#141414] p-4 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141414]/30 pb-2">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-[#141414] text-white font-bold text-[10px]">
                    Block #{b.blockNumber}
                  </span>
                  <span className="font-bold text-[#141414]">{b.recordType}</span>
                </div>

                <span className="text-[10px] text-[#141414]/70 font-mono">{b.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-[#141414]/60 block uppercase font-bold">Tx Hash:</span>
                  <span className="text-[#2A5C82] font-bold truncate block">{b.txHash}</span>
                </div>
                <div>
                  <span className="text-[#141414]/60 block uppercase font-bold">Case SHA-256 Payload Hash:</span>
                  <span className="text-[#141414] font-bold truncate block">{b.caseHash}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#141414]/80">
                <span>Clinic ID: {b.clinicId} • Gas Used: {b.polygonGasUsed} MATIC</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${b.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2A5C82] hover:text-[#141414] font-bold flex items-center gap-1 uppercase"
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
