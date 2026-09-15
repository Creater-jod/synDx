import React, { useState, useEffect } from 'react';
import { LocalStoreService } from '../services/localStore';
import { Wifi, WifiOff, RefreshCw, ShieldCheck, Database } from 'lucide-react';

interface Props {
  onSyncComplete?: () => void;
  className?: string;
}

export const OfflineQueueIndicator: React.FC<Props> = ({ onSyncComplete, className = '' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const checkQueue = () => {
    const queue = LocalStoreService.getOfflineQueue();
    setQueueCount(queue.length);
  };

  useEffect(() => {
    checkQueue();
    const interval = setInterval(checkQueue, 2000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncNow = () => {
    if (queueCount === 0) return;
    setIsSyncing(true);
    setSyncSuccess(false);

    setTimeout(() => {
      // Commit hashes for queued items
      const queue = LocalStoreService.getOfflineQueue();
      queue.forEach((item) => {
        LocalStoreService.commitAuditHash(
          `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
          item.type === 'ADR Signal' ? 'ADR Signal' : 'Diagnosis Record',
          'PHC-VALPARAI-01'
        );
      });

      LocalStoreService.clearOfflineQueue();
      setIsSyncing(false);
      setSyncSuccess(true);
      setQueueCount(0);
      if (onSyncComplete) onSyncComplete();

      setTimeout(() => setSyncSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Network Connectivity Status Badge */}
      <button
        onClick={() => setIsOnline(!isOnline)}
        title="Click to toggle network simulation (Online / Offline)"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider transition-all border shadow-sm ${
          isOnline
            ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/40 hover:border-emerald-400/80 hover:bg-slate-800'
            : 'bg-amber-950/90 text-amber-300 border-amber-500/60 hover:bg-amber-900 animate-pulse'
        }`}
      >
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        )}
        <span className="hidden xs:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
      </button>

      {/* Pending Offline Records Indicator Badge */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
          queueCount > 0
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
            : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
        }`}
        title={`${queueCount} pending offline records waiting to sync`}
      >
        <Database className={`w-3.5 h-3.5 ${queueCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
        <span className="font-bold font-mono text-amber-300">{queueCount}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-300 hidden md:inline">
          {queueCount === 1 ? 'Pending Record' : 'Pending Records'}
        </span>
      </div>

      {/* Sync Now Button - Active when online and pending items exist */}
      {queueCount > 0 && isOnline && (
        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="btn-3d flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-sans text-xs font-black uppercase tracking-wider rounded-lg shadow-lg border border-teal-300/40 transition-all active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      )}

      {/* Success Notification Feedback */}
      {syncSuccess && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-lg text-[10px] font-mono font-bold animate-fade-in shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Synced to Chain</span>
        </div>
      )}
    </div>
  );
};

