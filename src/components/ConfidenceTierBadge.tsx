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
          bg: 'bg-[#141414] text-[#E4E3E0] border border-[#141414]',
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          text: 'Tier A (>85% High Confidence)',
          sub: 'Direct Local Referral Protocol'
        };
      case 'Tier B':
        return {
          bg: 'bg-[#2A5C82] text-white border border-[#141414]',
          icon: <Clock className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          text: 'Tier B (60-85% Moderate Confidence)',
          sub: 'Priority Doctor Queue Review'
        };
      case 'Tier C':
        return {
          bg: 'bg-[#F0EEE9] text-[#141414] border border-[#141414]',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          text: 'Tier C (<60% High Uncertainty)',
          sub: 'Expert Panel Tele-Consult'
        };
      case 'Emergency':
        return {
          bg: 'bg-[#FF6321] text-white border border-[#141414]',
          icon: <ShieldAlert className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          text: 'EMERGENCY OVERRIDE',
          sub: 'Critical Vital Safety Limit Tripped'
        };
      default:
        return {
          bg: 'bg-white text-[#141414] border border-[#141414]',
          icon: <AlertTriangle className="w-4 h-4" />,
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
        <span className="font-extrabold text-xs uppercase tracking-wider">{style.text}</span>
        {showLabel && style.sub && <span className="text-[10px] opacity-80 uppercase font-sans">{style.sub}</span>}
      </div>
    </div>
  );
};
