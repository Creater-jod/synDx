import React, { useState } from 'react';
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

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onOpenAuth, onLogout, onOpenMedicalHistory, onOpenDoctorProfile }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="btn-3d-orange px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In / Register</span>
      </button>
    );
  }

  const getProviderBadge = (provider: UserProfile['provider']) => {
    switch (provider) {
      case 'google':
        return { label: 'Google', bg: 'bg-[#4285F4]', text: 'text-white' };
      case 'mobile':
        return { label: 'Mobile OTP', bg: 'bg-[#10B981]', text: 'text-white' };
      case 'gmail':
        return { label: 'Gmail', bg: 'bg-[#EA4335]', text: 'text-white' };
      case 'abha':
        return { label: 'ABHA ID', bg: 'bg-[#8B5CF6]', text: 'text-white' };
      default:
        return { label: 'Manual Sign Up', bg: 'bg-[#2A5C82]', text: 'text-white' };
    }
  };

  const badge = getProviderBadge(user.provider);

  return (
    <div className="relative font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl text-xs font-bold shadow-xl hover:border-teal-400/50 transition-all text-white group"
      >
        {/* 3D Rotating Avatar Wrapper */}
        <div className="avatar-3d-wrapper">
          <div className="avatar-3d-card w-7 h-7 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full border-2 border-teal-400 object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center font-black text-[11px] border border-white/40 shadow-inner">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-[11px] font-sans font-bold text-slate-100 leading-tight truncate max-w-[120px]">
            {user.name}
          </div>
          <div className="text-[9px] text-slate-400 leading-tight flex items-center gap-1">
            <span className={`px-1.5 py-0.2 rounded ${badge.bg} ${badge.text} font-bold text-[8px] uppercase shadow-xs`}>
              {badge.label}
            </span>
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 transition-colors ml-0.5" />
      </button>

      {/* Profile Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 card-3d-dark z-50 p-5 space-y-4 shadow-2xl border border-teal-500/30 backdrop-blur-xl">
          <div className="flex items-start justify-between border-b border-slate-700/60 pb-3.5">
            <div className="flex items-center gap-3">
              {/* Large 3D Rotating Avatar */}
              <div className="avatar-3d-wrapper">
                <div className="avatar-3d-card w-12 h-12 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full border-2 border-teal-400 object-cover shadow-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center font-black text-base border-2 border-white/50 shadow-lg">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="font-sans font-bold text-sm text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-teal-300 font-bold font-mono mt-0.5">{user.role}</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${badge.bg} ${badge.text} shadow-sm`}>
              {badge.label}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300 border-b border-slate-700/60 pb-3.5">
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
                <span className="font-bold text-amber-300">{user.medicalLicense}</span>
              </div>
            )}
          </div>

          {onOpenDoctorProfile && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDoctorProfile();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-[#FF6321]/20 to-amber-500/20 hover:from-[#FF6321]/30 hover:to-amber-500/30 border border-[#FF6321]/40 text-[#FF6321] rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#FF6321]" />
              <span>Doctor Profile & Credentials</span>
            </button>
          )}

          {onOpenMedicalHistory && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenMedicalHistory();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 text-orange-300 rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FolderHeart className="w-3.5 h-3.5 text-orange-400" />
              <span>View Medical History</span>
            </button>
          )}

          <div className="pt-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Node Officer</span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="btn-3d px-3 py-1.5 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-rose-600 transition-all"
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
