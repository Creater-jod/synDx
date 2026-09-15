import React, { useState } from 'react';
import { UserProfile, AuthProvider, DemoAccount } from '../types/auth';
import { auth } from '../firebase';
import { DR_RATHIESH_PFP_DATA_URL } from '../assets/drRathieshPhoto';
import {
  LogIn,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Sparkles,
  ArrowRight,
  User,
  Building,
  Award,
  AlertCircle,
  RefreshCw,
  Key,
  Smartphone,
  Hospital,
  ChevronRight,
  Github,
  HeartPulse
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancelGuest?: () => void;
}

const PRESET_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Dr. Rathiesh, MBBS, MD (Sex Educator & Sexual Health Specialist)',
    email: 'dr.rathiesh.medical@gmail.com',
    role: 'Rare Disease Specialist',
    clinicName: 'Coimbatore Medical College Hospital (CMCH)',
    avatar: DR_RATHIESH_PFP_DATA_URL,
    provider: 'google',
    mobile: '+91 94421 99001',
    license: 'TMC-2021-98122'
  },
  {
    name: 'Dr. Evelyn Reed (Senior Medical Officer)',
    email: 'evelyn.reed.medical@gmail.com',
    role: 'Medical Officer (Doctor)',
    clinicName: 'Central Primary Health Centre, Vedapatti',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    provider: 'google',
    mobile: '+91 98422 10982',
    license: 'MCI-2018-77421'
  },
  {
    name: 'Clara Vance (Field Health Officer)',
    email: 'clara.vance.health@gmail.com',
    role: 'Health Worker (ANM)',
    clinicName: 'Rural Sub-Centre Sulur Node',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'google',
    mobile: '+91 94431 88201',
    license: 'ANM-TN-2024-88'
  },
  {
    name: 'Dr. Marcus Vance (Genetic Specialist)',
    email: 'marcus.vance.genetics@gmail.com',
    role: 'Rare Disease Specialist',
    clinicName: 'Regional Specialty Rare Disease Hub',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    provider: 'gmail',
    mobile: '+91 97890 12345',
    license: 'TNMC-2025-0012'
  }
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onCancelGuest }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [method, setMethod] = useState<'google' | 'mobile' | 'gmail' | 'sso'>('google');

  // Gmail / Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Mobile & OTP State
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(30);

  // Manual Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpMobile, setSignUpMobile] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserProfile['role']>('Health Worker (ANM)');
  const [signUpClinic, setSignUpClinic] = useState('Central Rural Health Centre');
  const [signUpLicense, setSignUpLicense] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // SSO Extra Options State
  const [selectedSSO, setSelectedSSO] = useState<'abha' | 'hospital' | 'github' | 'microsoft'>('abha');
  const [ssoIdentifier, setSsoIdentifier] = useState('');

  // General Status & Error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Trigger OTP countdown timer
  const startOtpTimer = () => {
    setOtpCountdown(30);
    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtpCode(['4', '8', '2', '9', '1', '0']); // auto-fill demo OTP
      setSuccessMsg(`Verification code sent to ${countryCode} ${mobileNumber}. Demo Code: 482910`);
      startOtpTimer();
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: `USR-MOB-${Date.now().toString().slice(-6)}`,
        name: `Health Officer (${mobileNumber.slice(-4)})`,
        email: `mobile.${mobileNumber}@syndx.org`,
        mobile: `${countryCode} ${mobileNumber}`,
        role: 'Health Worker (ANM)',
        clinicName: 'PSG Sub-Centre Sulur',
        clinicId: 'PSG-SULUR-04',
        provider: 'mobile',
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
    }, 900);
  };

  const handleGoogleLogin = (demoAcc?: DemoAccount) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      const chosen = demoAcc || PRESET_DEMO_ACCOUNTS[0];
      const user: UserProfile = {
        id: `USR-GGL-${Date.now().toString().slice(-6)}`,
        name: chosen.name,
        email: chosen.email,
        mobile: chosen.mobile,
        role: chosen.role,
        clinicName: chosen.clinicName,
        clinicId: 'PSG-PHC-01',
        medicalLicense: chosen.license,
        avatarUrl: chosen.avatar,
        provider: 'google',
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
    }, 1000);
  };

  const handleGmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Gmail / Email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const nameFromEmail = email.split('@')[0].replace('.', ' ');
      const user: UserProfile = {
        id: `USR-GML-${Date.now().toString().slice(-6)}`,
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: email,
        role: 'Medical Officer (Doctor)',
        clinicName: 'PSG Specialty Hospital',
        clinicId: 'PSG-HOSP-02',
        provider: 'gmail',
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
    }, 900);
  };

  const handleManualSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!signUpName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!signUpEmail || !signUpEmail.includes('@')) {
      setError('Please provide a valid Gmail / Email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms of service to create an account.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: `USR-REG-${Date.now().toString().slice(-6)}`,
        name: signUpName,
        email: signUpEmail,
        mobile: signUpMobile || '+91 98000 00000',
        role: signUpRole,
        clinicName: signUpClinic,
        clinicId: 'PSG-NEW-NODE',
        medicalLicense: signUpLicense || 'REG-PENDING',
        provider: 'manual',
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
    }, 1100);
  };

  const handleSSOLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ssoIdentifier) {
      setError(`Please enter your ${selectedSSO.toUpperCase()} ID or credentials.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const providerNames: Record<string, AuthProvider> = {
        abha: 'abha',
        hospital: 'hospital_sso',
        github: 'github',
        microsoft: 'microsoft'
      };

      const user: UserProfile = {
        id: `USR-SSO-${Date.now().toString().slice(-6)}`,
        name: `${selectedSSO.toUpperCase()} User (${ssoIdentifier.slice(0, 8)})`,
        email: `${ssoIdentifier}@${selectedSSO}.auth.syndx.org`,
        role: 'Rare Disease Specialist',
        clinicName: 'Ayushman Bharat Digital Health Network',
        clinicId: 'ABDM-PSG-NODE',
        abhaId: selectedSSO === 'abha' ? ssoIdentifier : '14-8891-2026-4412',
        provider: providerNames[selectedSSO] || 'hospital_sso',
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
    }, 1000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-4xl bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_#141414] overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Branding, Project Information & Security Guarantee */}
        <div className="md:col-span-5 bg-[#141414] text-white p-6 sm:p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-[#141414]">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FF6321] text-white font-mono">
                <HeartPulse className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-black uppercase tracking-tight font-sans text-white">
                  SynDx
                </span>
                <span className="block text-[10px] font-mono tracking-widest text-[#FF6321] uppercase">
                  Edge AI Portal
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/20 pt-4">
              <h2 className="text-xl font-black text-white font-sans tracking-tight">
                Healthcare Officer & Doctor Authentication
              </h2>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Log in to access the federated diagnostic decision console, local zero-trust audit trail, and rare disease knowledge workbench.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300 pt-2">
              <div className="flex items-start gap-2.5 p-2.5 bg-white/5 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">ABDM & HIPAA Compliant</span>
                  <span className="text-[10px] text-slate-400">Zero raw patient record storage on remote servers.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white/5 border border-white/10">
                <Globe className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Polygon Audit Ledger</span>
                  <span className="text-[10px] text-slate-400">Tamper-proof diagnostic event hash verification.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20 font-mono text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-teal-300 uppercase tracking-wider">SynDx Clinical AI Platform 3D</p>
            <p className="text-[10px] text-slate-300">Edge AI Decision Architecture & Unified Patient Portal</p>
          </div>
        </div>

        {/* Right Side: Tabbed Login / Sign Up Forms */}
        <div className="md:col-span-7 bg-[#E4E3E0] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top Auth Mode Toggle (Sign In vs Sign Up) */}
            <div className="flex items-center justify-between border-b-2 border-[#141414] pb-3 mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all border border-[#141414] flex items-center gap-2 ${
                    mode === 'signin'
                      ? 'bg-[#141414] text-white shadow-[2px_2px_0px_0px_#FF6321]'
                      : 'bg-white text-[#141414] hover:bg-[#F0EEE9]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all border border-[#141414] flex items-center gap-2 ${
                    mode === 'signup'
                      ? 'bg-[#141414] text-white shadow-[2px_2px_0px_0px_#FF6321]'
                      : 'bg-white text-[#141414] hover:bg-[#F0EEE9]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {onCancelGuest && (
                <button
                  type="button"
                  onClick={onCancelGuest}
                  className="text-xs font-mono font-bold text-[#141414]/70 hover:text-[#141414] underline"
                >
                  Guest Access
                </button>
              )}
            </div>

            {/* Error and Success Alert Banners */}
            {error && (
              <div className="mb-4 p-3 bg-[#F87171]/20 border-2 border-[#EF4444] text-[#7F1D1D] font-mono text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-[#4ADE80]/20 border-2 border-[#22C55E] text-[#14532D] font-mono text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* MODE 1: SIGN IN FLOW */}
            {mode === 'signin' && (
              <div className="space-y-5">
                {/* Login Method Buttons */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-white border border-[#141414] font-mono text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('google');
                      setError(null);
                    }}
                    className={`py-2 text-center transition-all ${
                      method === 'google' ? 'bg-[#141414] text-white' : 'text-[#141414] hover:bg-[#E4E3E0]'
                    }`}
                  >
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('mobile');
                      setError(null);
                    }}
                    className={`py-2 text-center transition-all ${
                      method === 'mobile' ? 'bg-[#141414] text-white' : 'text-[#141414] hover:bg-[#E4E3E0]'
                    }`}
                  >
                    Mobile #
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('gmail');
                      setError(null);
                    }}
                    className={`py-2 text-center transition-all ${
                      method === 'gmail' ? 'bg-[#141414] text-white' : 'text-[#141414] hover:bg-[#E4E3E0]'
                    }`}
                  >
                    Gmail / Email
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('sso');
                      setError(null);
                    }}
                    className={`py-2 text-center transition-all ${
                      method === 'sso' ? 'bg-[#141414] text-white' : 'text-[#141414] hover:bg-[#E4E3E0]'
                    }`}
                  >
                    Other SSO
                  </button>
                </div>

                {/* METHOD 1: GOOGLE ACCOUNT LOGIN */}
                {method === 'google' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-700 font-sans">
                      Sign in using your verified Google Account or select a registered clinical medical officer profile:
                    </p>

                    {/* Official One-Click Google Sign In Button */}
                    <button
                      type="button"
                      onClick={() => handleGoogleLogin()}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-white hover:bg-[#F8F8F8] border-2 border-[#141414] shadow-[4px_4px_0px_0px_#141414] flex items-center justify-center gap-3 font-mono font-bold text-sm text-[#141414] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      {/* SVG Google Logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{loading ? 'Authenticating with Google...' : 'Sign in with Google Account'}</span>
                    </button>

                    <div className="relative my-4 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#141414]/30"></div>
                      </div>
                      <span className="relative px-3 bg-[#E4E3E0] text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/60">
                        Or Pick Quick Demo Google Profile
                      </span>
                    </div>

                    {/* Demo Accounts List */}
                    <div className="space-y-2">
                      {PRESET_DEMO_ACCOUNTS.map((acc, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleGoogleLogin(acc)}
                          className="p-3 bg-white border border-[#141414] hover:border-[#FF6321] hover:bg-[#FFF8F5] cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-9 h-9 rounded-full border border-[#141414] object-cover"
                            />
                            <div>
                              <div className="font-sans font-bold text-xs text-[#141414] group-hover:text-[#FF6321] flex items-center gap-1.5">
                                <span>{acc.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#141414] text-white">
                                  {acc.role.split(' ')[0]}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-[#141414]/70">{acc.email}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#141414]/40 group-hover:text-[#FF6321] transition-transform group-hover:translate-x-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* METHOD 2: MOBILE NUMBER & OTP LOGIN */}
                {method === 'mobile' && (
                  <div>
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-xs text-[#141414]/80 font-sans">
                          Enter your registered 10-digit mobile number to receive a secure SMS verification code:
                        </p>

                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                            Mobile Phone Number
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="px-3 py-2 bg-white border-2 border-[#141414] font-mono text-xs font-bold focus:outline-none"
                            >
                              <option value="+91">🇮🇳 +91 (IN)</option>
                              <option value="+1">🇺🇸 +1 (US)</option>
                              <option value="+44">🇬🇧 +44 (UK)</option>
                              <option value="+65">🇸🇬 +65 (SG)</option>
                            </select>

                            <div className="relative flex-1">
                              <Phone className="w-4 h-4 text-[#141414]/40 absolute left-3 top-2.5" />
                              <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                placeholder="98422 10982"
                                maxLength={10}
                                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#141414] font-mono text-xs text-[#141414] placeholder-[#141414]/40 focus:outline-none focus:border-[#FF6321]"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-[#141414] hover:bg-[#2A5C82] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#141414]"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )}
                          <span>Send Verification OTP</span>
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#141414]/80 font-sans">
                            Enter the 6-digit code sent to <span className="font-mono font-bold">{countryCode} {mobileNumber}</span>:
                          </p>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-[10px] font-mono font-bold text-[#FF6321] hover:underline"
                          >
                            Change Number
                          </button>
                        </div>

                        {/* 6 Digit Input Boxes */}
                        <div className="flex gap-2 justify-between">
                          {otpCode.map((digit, i) => (
                            <input
                              key={i}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => {
                                const val = e.target.value;
                                const newOtp = [...otpCode];
                                newOtp[i] = val;
                                setOtpCode(newOtp);
                              }}
                              className="w-11 h-12 text-center bg-white border-2 border-[#141414] font-mono font-black text-lg focus:border-[#FF6321] focus:outline-none"
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#141414]/60">
                            {otpCountdown > 0 ? `Resend OTP in ${otpCountdown}s` : 'Code expired'}
                          </span>
                          {otpCountdown === 0 && (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="text-[#FF6321] font-bold hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-[#FF6321] hover:bg-[#e05316] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#141414]"
                        >
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                          <span>Verify & Sign In</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* METHOD 3: GMAIL / MANUAL EMAIL & PASSWORD */}
                {method === 'gmail' && (
                  <form onSubmit={handleGmailLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                        Gmail or Clinical Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#141414]/40 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="doctor.rathiesh@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#141414] font-mono text-xs text-[#141414] focus:outline-none focus:border-[#FF6321]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono font-bold uppercase text-[#141414]">
                          Password
                        </label>
                        <a
                          href="#forgot"
                          onClick={(e) => {
                            e.preventDefault();
                            setSuccessMsg('A password reset link has been dispatched to your Gmail address.');
                          }}
                          className="text-[10px] font-mono text-[#2A5C82] hover:underline"
                        >
                          Forgot Password?
                        </a>
                      </div>

                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#141414]/40 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-9 py-2 bg-white border-2 border-[#141414] font-mono text-xs text-[#141414] focus:outline-none focus:border-[#FF6321]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#141414]/50 hover:text-[#141414]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-[#141414] cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-xs font-mono text-[#141414]/80 cursor-pointer">
                        Keep me signed in on this edge node
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#141414] hover:bg-[#2A5C82] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#141414] shadow-[3px_3px_0px_0px_#FF6321]"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                      <span>Sign In with Gmail</span>
                    </button>
                  </form>
                )}

                {/* METHOD 4: OTHER ONLINE PLATFORMS / SSO */}
                {method === 'sso' && (
                  <form onSubmit={handleSSOLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                        Select Institutional Platform
                      </label>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedSSO('abha')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 ${
                            selectedSSO === 'abha'
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-white text-[#141414] border-[#141414]'
                          }`}
                        >
                          <Hospital className="w-4 h-4 text-[#4ADE80]" />
                          <div>
                            <span className="font-bold block">ABHA ID</span>
                            <span className="text-[9px] opacity-70">Ayushman Bharat</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSSO('hospital')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 ${
                            selectedSSO === 'hospital'
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-white text-[#141414] border-[#141414]'
                          }`}
                        >
                          <Building className="w-4 h-4 text-[#38BDF8]" />
                          <div>
                            <span className="font-bold block">PSG Health</span>
                            <span className="text-[9px] opacity-70">Hospital Network</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSSO('microsoft')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 ${
                            selectedSSO === 'microsoft'
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-white text-[#141414] border-[#141414]'
                          }`}
                        >
                          <Globe className="w-4 h-4 text-[#F59E0B]" />
                          <div>
                            <span className="font-bold block">Microsoft 365</span>
                            <span className="text-[9px] opacity-70">Medical Portal</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSSO('github')}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 ${
                            selectedSSO === 'github'
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-white text-[#141414] border-[#141414]'
                          }`}
                        >
                          <Github className="w-4 h-4 text-[#C084FC]" />
                          <div>
                            <span className="font-bold block">GitHub</span>
                            <span className="text-[9px] opacity-70">Auditor Login</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#141414] mb-1">
                        {selectedSSO === 'abha'
                          ? '14-Digit ABHA Health ID'
                          : selectedSSO === 'hospital'
                          ? 'PSG Hospital Staff Employee ID'
                          : 'Institutional User ID / Email'}
                      </label>
                      <input
                        type="text"
                        value={ssoIdentifier}
                        onChange={(e) => setSsoIdentifier(e.target.value)}
                        placeholder={
                          selectedSSO === 'abha'
                            ? '14-8891-2026-4412@abdm'
                            : selectedSSO === 'hospital'
                            ? 'PSG-DOC-2026-09'
                            : 'user@institution.edu'
                        }
                        className="w-full px-3 py-2 bg-white border-2 border-[#141414] font-mono text-xs text-[#141414] focus:outline-none focus:border-[#FF6321]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#2A5C82] hover:bg-[#1E4461] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#141414]"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      <span>Authenticate with {selectedSSO.toUpperCase()}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* MODE 2: SIGN UP / MANUAL REGISTRATION FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleManualSignUp} className="space-y-3 font-mono text-xs">
                <p className="text-xs text-[#141414]/80 font-sans mb-2">
                  Create a new healthcare officer account to register your clinic node into the SynDx federated network:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-[#141414]/40 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Dr. Anand Kumar"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Clinical Role</label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserProfile['role'])}
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none"
                    >
                      <option value="Health Worker (ANM)">Health Worker (ANM / CHO)</option>
                      <option value="Medical Officer (Doctor)">Medical Officer (Doctor)</option>
                      <option value="Rare Disease Specialist">Rare Disease Specialist</option>
                      <option value="System Auditor / Admin">System Auditor / Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Gmail / Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#141414]/40 absolute left-2.5 top-2.5" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="anand.psg@gmail.com"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#141414]/40 absolute left-2.5 top-2.5" />
                      <input
                        type="tel"
                        value={signUpMobile}
                        onChange={(e) => setSignUpMobile(e.target.value)}
                        placeholder="+91 98421 00192"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Clinic / Hospital Facility</label>
                    <input
                      type="text"
                      value={signUpClinic}
                      onChange={(e) => setSignUpClinic(e.target.value)}
                      placeholder="PSG Rural Health Centre"
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Medical License / ID #</label>
                    <input
                      type="text"
                      value={signUpLicense}
                      onChange={(e) => setSignUpLicense(e.target.value)}
                      placeholder="MCI-TN-2026-99"
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Password</label>
                    <input
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[10px] mb-0.5">Confirm Password</label>
                    <input
                      type="password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-[#141414] focus:outline-none focus:border-[#FF6321]"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#141414] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[10px] text-[#141414]/80 cursor-pointer font-sans leading-tight">
                    I agree to the <span className="font-bold underline">SynDx ABDM Medical Ethics Policy</span> and agree to process anonymized patient symptoms strictly on-device.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-[#FF6321] hover:bg-[#e05316] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#141414] shadow-[3px_3px_0px_0px_#141414]"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Register & Create Account</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-[#141414]/20 flex items-center justify-between text-[11px] font-mono text-[#141414]/60">
            <span>Powered by SynDx Edge Model v1.0</span>
            <span>256-bit Key Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
