import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';

interface Props {
  txHash?: string;
  blockNumber?: number;
  caseHash?: string;
}

export const BlockchainVerifiedBadge: React.FC<Props> = ({
  txHash = '0x8f3a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2',
  blockNumber = 1048292,
  caseHash = '0xa412bc7819ef381d63914a2b10931d8e72fa'
}) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl text-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide text-white text-xs font-heading">
                Cryptographic Audit Trail Committed
              </span>
              <span className="px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-mono font-semibold">
                Block #{blockNumber}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              SHA-256 hash committed to Polygon testnet (zero identifiable patient payload on-chain)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-mono font-semibold text-teal-400 hover:text-teal-300 transition-colors self-start sm:self-center"
        >
          {showDetails ? 'Hide Details' : 'Inspect Audit Proof'}
        </button>
      </div>

      {showDetails && (
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 uppercase text-[10px] font-bold">Transaction Hash:</span>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="truncate max-w-[200px] sm:max-w-[360px] text-teal-300 font-mono text-[11px]">{txHash}</span>
              <button onClick={copyHash} className="p-1 hover:text-white" title="Copy Tx Hash">
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 uppercase text-[10px] font-bold">Case Payload SHA-256:</span>
            <span className="text-purple-300 font-mono text-[11px]">{caseHash}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Consensus: Polygon POS (Chain ID 80002)</span>
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              <span>Verify on PolygonScan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
