import React from 'react';
import { ConfidenceTier } from '../types/syndx';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

interface Props {
  tier: ConfidenceTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ConfidenceTierBadge: React.FC<Props> = ({ tier, size = 'md', showLabel = true }) => {
  const getBadgeStyle = () => {
    switch (tier) {
      case 'Tier A':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.15)] rounded-xl backdrop-blur-md',
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-400' : size === 'lg' ? 'w-5 h-5 text-emerald-400' : 'w-4 h-4 text-emerald-400'} />,
          text: 'Tier A (>85% High Confidence)',
          sub: 'Direct Local Referral Protocol'
        };
      case 'Tier B':
        return {
          bg: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_2px_10px_rgba(6,182,212,0.15)] rounded-xl backdrop-blur-md',
          icon: <Clock className={size === 'sm' ? 'w-3.5 h-3.5 text-cyan-400' : size === 'lg' ? 'w-5 h-5 text-cyan-400' : 'w-4 h-4 text-cyan-400'} />,
          text: 'Tier B (60-85% Moderate Confidence)',
          sub: 'Priority Doctor Queue Review'
        };
      case 'Tier C':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_2px_10px_rgba(245,158,11,0.15)] rounded-xl backdrop-blur-md',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5 text-amber-400' : size === 'lg' ? 'w-5 h-5 text-amber-400' : 'w-4 h-4 text-amber-400'} />,
          text: 'Tier C (<60% High Uncertainty)',
          sub: 'Expert Panel Tele-Consult'
        };
      case 'Emergency':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_2px_10px_rgba(244,63,94,0.2)] rounded-xl backdrop-blur-md animate-pulse',
          icon: <ShieldAlert className={size === 'sm' ? 'w-3.5 h-3.5 text-rose-400' : size === 'lg' ? 'w-5 h-5 text-rose-400' : 'w-4 h-4 text-rose-400'} />,
          text: 'EMERGENCY OVERRIDE',
          sub: 'Critical Vital Safety Limit Tripped'
        };
      default:
        return {
          bg: 'bg-slate-800/60 text-slate-300 border border-slate-700/60 rounded-xl backdrop-blur-md',
          icon: <AlertTriangle className="w-4 h-4 text-slate-400" />,
          text: tier,
          sub: ''
        };
    }
  };

  const style = getBadgeStyle();

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${style.bg}`}>
        {style.icon}
        <span>{tier}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-2 font-mono ${style.bg}`}>
      {style.icon}
      <div className="flex flex-col">
        <span className="font-bold text-xs uppercase tracking-wider">{style.text}</span>
        {showLabel && style.sub && <span className="text-[10px] opacity-80 uppercase font-sans text-slate-400">{style.sub}</span>}
      </div>
    </div>
  );
};
