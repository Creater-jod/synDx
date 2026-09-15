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
    <div className="bg-[#F0EEE9] border-t-2 border-[#141414] p-3.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#141414] text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[#141414] text-xs">Polygon Audit Trail Committed</span>
              <span className="px-1.5 py-0.5 bg-[#141414] text-white text-[9px] font-mono font-bold">
                Block #{blockNumber}
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#141414]/70">SHA-256 Hash committed to Polygon Amoy Testnet (Zero raw medical data on-chain)</p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414] underline hover:text-[#2A5C82]"
        >
          {showDetails ? 'Hide Explorer' : 'Inspect Audit'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#141414]/20 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between bg-white p-2 border border-[#141414]">
            <span className="text-[#141414]/60 uppercase text-[10px] font-bold">Tx Hash:</span>
            <div className="flex items-center gap-2 text-[#141414]">
              <span className="truncate max-w-[200px] sm:max-w-[320px] font-mono text-[11px]">{txHash}</span>
              <button onClick={copyHash} className="p-1 hover:text-[#2A5C82]" title="Copy Tx Hash">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-2 border border-[#141414]">
            <span className="text-[#141414]/60 uppercase text-[10px] font-bold">Case Payload Hash:</span>
            <span className="text-[#2A5C82] font-mono font-bold">{caseHash}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#141414]/70 pt-1 font-mono">
            <span>Network: Polygon Testnet (Chain ID 80002)</span>
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-bold uppercase tracking-wider text-[#141414] hover:text-[#2A5C82]"
            >
              <span>View on PolygonScan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
