import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types/auth';
import {
  User,
  LogOut,
  ShieldCheck,
  Building,
  Key,
  ChevronDown,
  CheckCircle2,
  Mail,
  Phone,
  Award,
  Globe,
  LogIn,
  FolderHeart,
  Stethoscope
} from 'lucide-react';

interface UserProfileMenuProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenMedicalHistory?: () => void;
  onOpenDoctorProfile?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenMedicalHistory, 
  onOpenDoctorProfile 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-4 py-2 rounded-xl font-bold text-xs font-mono uppercase tracking-wider bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const getProviderBadge = (provider: UserProfile['provider']) => {
    switch (provider) {
      case 'google':
        return { label: 'Google', bg: 'bg-blue-500/20 border-blue-500/30 text-blue-300' };
      case 'mobile':
        return { label: 'Mobile OTP', bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' };
      case 'gmail':
        return { label: 'Gmail', bg: 'bg-rose-500/20 border-rose-500/30 text-rose-300' };
      case 'abha':
        return { label: 'ABHA ID', bg: 'bg-purple-500/20 border-purple-500/30 text-purple-300' };
      default:
        return { label: 'Registered', bg: 'bg-slate-700/40 border-slate-600 text-slate-300' };
    }
  };

  const badge = getProviderBadge(user.provider);

  return (
    <div className="relative font-mono" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 hover:border-teal-500/50 rounded-xl text-xs font-semibold shadow-md transition-all text-white group"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 object-cover" />
          ) : (
            <span>{user.name.charAt(0)}</span>
          )}
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-slate-100 truncate max-w-[130px]">
            {user.name}
          </div>
          <div className="text-[10px] text-teal-400 font-medium">
            {user.role}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 transition-colors ml-0.5" />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-2xl z-50 p-4 space-y-3.5 shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 object-cover" />
                ) : (
                  <span>{user.name.charAt(0)}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">{user.name}</div>
                <div className="text-xs text-teal-400 truncate">{user.role}</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300 border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center gap-2.5 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>

            {user.mobile && (
              <div className="flex items-center gap-2.5 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{user.mobile}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-[11px]">
              <Building className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{user.clinicName}</span>
            </div>

            {user.medicalLicense && (
              <div className="flex items-center gap-2.5 text-[11px]">
                <Award className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-bold text-teal-300">{user.medicalLicense}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {onOpenDoctorProfile && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenDoctorProfile();
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>Practitioner Credentials &amp; Profile</span>
              </button>
            )}

            {onOpenMedicalHistory && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMedicalHistory();
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-colors"
              >
                <FolderHeart className="w-3.5 h-3.5 text-orange-400" />
                <span>Patient Differential History</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Node Practitioner</span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
