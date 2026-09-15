import React, { useState, useEffect } from 'react';
import { InferenceService } from './services/inferenceService';
import { MOCK_PATIENT_SAMPLES } from './services/mockData';
import { PatientIntake, DiagnosisResult } from './types/syndx';
import { UserProfile } from './types/auth';
import { IntakeScreen } from './screens/IntakeScreen';
import { DiagnosisResultScreen } from './screens/DiagnosisResultScreen';
import { ReferralScreen } from './screens/ReferralScreen';
import { FollowUpCheckScreen } from './screens/FollowUpCheckScreen';
import { AuthScreen } from './screens/AuthScreen';
import { QueueDashboard } from './pages/doctor/QueueDashboard';
import { RouterInspectionView } from './modules/decision-router/RouterInspectionView';
import { BlockchainLedgerView } from './modules/blockchain/BlockchainLedgerView';
import { FederatedLearningView } from './modules/federated-learning/FederatedLearningView';
import { WorkbenchArchitectureView } from './modules/workbench/WorkbenchArchitectureView';
import { MedicalHistoryScreen } from './screens/MedicalHistoryScreen';
import { DoctorProfileScreen } from './screens/DoctorProfileScreen';
import { OfflineQueueIndicator } from './components/OfflineQueueIndicator';
import { OfflineLocalReferralMap } from './components/OfflineLocalReferralMap';
import { RareDiseaseCsvWorkflow } from './components/RareDiseaseCsvWorkflow';
import { UserProfileMenu } from './components/UserProfileMenu';
import { Tilt3DCard } from './components/Tilt3DCard';
import { SyndexDashboardIntro } from './pages/SyndexDashboardIntro';
import { ExportDeploymentHub } from './components/ExportDeploymentHub';
import {
  Stethoscope,
  Clock,
  UserCheck,
  Network,
  ShieldCheck,
  Database,
  Layers,
  HeartPulse,
  Key,
  Building2,
  CheckCircle2,
  ArrowRight,
  Activity,
  Workflow,
  Menu,
  X,
  Zap,
  Sparkles,
  Sliders,
  Cpu,
  Lock,
  LogOut,
  Home,
  ChevronRight,
  Search,
  Map,
  FileSpreadsheet,
  FolderArchive,
  ArrowLeft
} from 'lucide-react';

export type ScreenId =
  | 'dashboard'
  | 'intake'
  | 'referral_map'
  | 'rare_csv'
  | 'result'
  | 'referral'
  | 'adr'
  | 'doctor'
  | 'profile'
  | 'router'
  | 'blockchain'
  | 'fl'
  | 'architecture'
  | 'export_deploy'
  | 'auth'
  | 'history';

export interface NavStackItem {
  id: ScreenId;
  title: string;
  params?: any;
}

export default function App() {
  // Push / Pop Navigation Stack Architecture
  const [navStack, setNavStack] = useState<NavStackItem[]>([
    { id: 'dashboard', title: 'Syndex Dashboard' }
  ]);

  const currentScreen = navStack[navStack.length - 1] || { id: 'dashboard', title: 'Syndex Dashboard' };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentIntake, setCurrentIntake] = useState<PatientIntake | null>(null);
  const [currentResult, setCurrentResult] = useState<DiagnosisResult | null>(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  // Authentication state with local storage persistence
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('syndx_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user profile', e);
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('syndx_user_profile', JSON.stringify(currentUser));
      } catch (e) {
        console.error('Failed to save user profile', e);
      }
    } else {
      localStorage.removeItem('syndx_user_profile');
    }
  }, [currentUser]);

  // Auto-initialize default patient case & inference result so result & referral views are never blank
  useEffect(() => {
    if (!currentResult || !currentIntake) {
      const sampleIntake = MOCK_PATIENT_SAMPLES[0];
      InferenceService.runDiagnosisInference(sampleIntake).then((res) => {
        if (!currentResult) setCurrentResult(res);
        if (!currentIntake) setCurrentIntake(sampleIntake);
      });
    }
  }, []);

  // Stack Navigation Methods
  const pushScreen = (screenId: ScreenId, title: string, params?: any) => {
    setNavStack((prev) => [...prev, { id: screenId, title, params }]);
    setIsPortalOpen(false);
  };

  const popScreen = () => {
    if (navStack.length > 1) {
      setNavStack((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const jumpToBreadcrumb = (index: number) => {
    if (index >= 0 && index < navStack.length) {
      setNavStack((prev) => prev.slice(0, index + 1));
    }
  };

  const resetToDashboard = () => {
    setNavStack([{ id: 'dashboard', title: 'Syndex Dashboard' }]);
    setIsPortalOpen(false);
  };

  const handleDiagnosisComplete = (result: DiagnosisResult, intake: PatientIntake) => {
    setCurrentResult(result);
    setCurrentIntake(intake);
    pushScreen('result', 'AI Diagnosis Result');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    resetToDashboard();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    pushScreen('auth', 'Account Authentication');
  };

  // Portal Feature Items for Left Drawer Menu
  const portalFeatures = [
    {
      id: 'dashboard',
      title: 'Syndex Dashboard',
      subtitle: 'System Overview, Quick Metrics, Get Started for Disease Testing',
      icon: Home,
      color: 'from-teal-500 to-emerald-600',
      textColor: 'text-teal-400',
      badge: 'Main Hub'
    },
    {
      id: 'intake',
      title: 'Disease Testing & Intake',
      subtitle: '4-Step Patient Intake, AI Diagnosis, Specialist Referral & ADR Monitoring',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      badge: 'Primary Test'
    },
    {
      id: 'referral_map',
      title: 'Offline Local Referral Map',
      subtitle: 'GIS Rural Health Facility Finder, Cached Distance Matrix, Road Status & Emergency Contacts',
      icon: Map,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      badge: 'GIS Offline Map'
    },
    {
      id: 'rare_csv',
      title: 'Rare Disease CSV Dataset Workflow',
      subtitle: 'Orphadata & GARD Master CSV Explorer, Dataset CSV Import/Export, & AI Deep Research Grounding',
      icon: FileSpreadsheet,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      badge: 'CSV Pipeline'
    },
    {
      id: 'doctor',
      title: 'Doctor Console & Triage Queue',
      subtitle: 'Physician Review, Override Matrix, Patient Chat & Essential Rare Disease Library',
      icon: UserCheck,
      color: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-400',
      badge: 'Physician Portal'
    },
    {
      id: 'profile',
      title: 'Doctor Profile & Credentials',
      subtitle: 'Manage Medical License, Qualifications, Specialties & Create Custom Doctor Profiles',
      icon: Stethoscope,
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-400',
      badge: 'Practitioner Registry'
    },
    {
      id: 'history',
      title: 'View Medical History',
      subtitle: 'Summary of Previous Diagnosis Records, Patient ID Lookup & Audit Vault',
      icon: Clock,
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-400',
      badge: 'Records Vault'
    },
    {
      id: 'router',
      title: 'On-Device Decision Router Matrix',
      subtitle: 'Confidence Score Thresholds, Local vs Specialist Escalation Logic',
      icon: Network,
      color: 'from-indigo-500 to-purple-600',
      textColor: 'text-indigo-400',
      badge: 'Edge Logic'
    },
    {
      id: 'blockchain',
      title: 'Polygon Audit Ledger',
      subtitle: 'Tamper-Proof Immutable Cryptographic Hash Explorer for Medical Records',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-400',
      badge: 'Audit Vault'
    },
    {
      id: 'fl',
      title: 'Federated Learning Engine',
      subtitle: 'Privacy-Preserving On-Device Training & Differential Privacy Aggregation',
      icon: Database,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      badge: 'Edge AI Sync'
    },
    {
      id: 'architecture',
      title: 'Architecture Plan & System Blueprint',
      subtitle: 'Full Stack Topology, Offline Storage, SHAP Engine & Security Matrix',
      icon: Layers,
      color: 'from-teal-500 to-cyan-600',
      textColor: 'text-teal-400',
      badge: 'Workbench'
    },
    {
      id: 'export_deploy',
      title: 'Export, Setup & Deployment Hub',
      subtitle: 'Automated Source Zip, Setup Scripts, Local Run & Docker/Cloud Deploy',
      icon: FolderArchive,
      color: 'from-cyan-500 to-emerald-600',
      textColor: 'text-cyan-400',
      badge: 'Automated DevOps'
    },
    {
      id: 'auth',
      title: 'User Account & Credentials',
      subtitle: 'Multi-Role Login (Doctor, ANM, Specialist), SSO & Profile Credentials',
      icon: Key,
      color: 'from-slate-500 to-slate-700',
      textColor: 'text-slate-300',
      badge: 'Account Portal'
    }
  ];

  // If on Auth screen
  if (currentScreen.id === 'auth') {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans bg-slate-950 selection:bg-teal-500 selection:text-slate-900">
        <header className="sticky top-0 z-50 glass-3d border-b border-slate-800 py-3.5 px-6 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={resetToDashboard}>
              <div className="p-2.5 bg-gradient-to-br from-teal-500 via-indigo-600 to-orange-500 text-white rounded-xl shadow-lg border border-white/20">
                <HeartPulse className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black uppercase tracking-tight text-white font-sans drop-shadow-sm">
                  Syndex 3D
                </span>
                <span className="ml-2 px-2.5 py-0.5 badge-3d text-slate-900 font-mono text-[10px] font-bold">
                  v3.5 Clinical Auth
                </span>
              </div>
            </div>

            <OfflineQueueIndicator />
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onCancelGuest={resetToDashboard}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-900 relative overflow-x-hidden">
      {/* Top Header Bar — Liquid Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 border-b border-white/20 backdrop-blur-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left Section: Menu Drawer Toggle + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPortalOpen(true)}
                className="px-3.5 py-2 rounded-xl liquid-glass-pill hover:bg-white/15 text-teal-300 transition-all flex items-center gap-2 font-mono text-xs font-bold uppercase shadow-md group"
                title="Open Dashboard Navigation Menu"
              >
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform text-teal-300" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <div
                onClick={resetToDashboard}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="p-2 bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 rounded-xl shadow-lg border border-white/50 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black uppercase tracking-tight text-white font-sans drop-shadow-md group-hover:text-teal-300 transition-colors">
                      Syndex
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold liquid-glass-pill text-teal-300 border-teal-400/40">
                      v3.5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Offline Queue & User Profile Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              <OfflineQueueIndicator />
              <UserProfileMenu
                user={currentUser}
                onOpenAuth={() => pushScreen('auth', 'Account Authentication')}
                onLogout={handleLogout}
                onOpenMedicalHistory={() => pushScreen('history', 'Medical Records Vault')}
                onOpenDoctorProfile={() => pushScreen('profile', 'Doctor Practitioner Registry')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Push / Pop Navigation Control Bar & Liquid Glass Breadcrumb Trail */}
      <div className="bg-slate-900/40 border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            {/* Pop Screen (Back) Button */}
            {navStack.length > 1 && (
              <button
                onClick={popScreen}
                className="px-3.5 py-1.5 rounded-xl liquid-glass-pill hover:bg-white/15 text-teal-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4 text-teal-300" />
                <span>Back</span>
              </button>
            )}

            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-1 text-xs font-mono">
              {navStack.map((item, index) => {
                const isLast = index === navStack.length - 1;
                return (
                  <React.Fragment key={`${item.id}-${index}`}>
                    {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    <button
                      onClick={() => jumpToBreadcrumb(index)}
                      disabled={isLast}
                      className={`px-3 py-1 rounded-xl transition-all truncate max-w-[180px] ${
                        isLast
                          ? 'liquid-glass-pill text-teal-300 font-bold border-teal-400/50 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.title}
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className="text-[11px] font-mono text-slate-300 shrink-0 hidden md:block">
            Stack Depth: <strong className="text-teal-300">{navStack.length}</strong> Level{navStack.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Left-Side Dashboard Drawer (Rectangular Box) */}
      {isPortalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsPortalOpen(false)} />

          <aside className="relative z-10 w-80 sm:w-96 h-full bg-slate-900/80 backdrop-blur-3xl border-r border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-drawer-3d">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400 rounded-xl text-slate-950 shadow-lg border border-white/40">
                  <Menu className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Dashboard Menu
                  </h2>
                  <p className="text-[10px] font-mono text-teal-300/80 mt-0.5">
                    Push / Pop Navigation Architecture
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPortalOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-rose-500/30 transition-all rounded-xl border border-white/20"
                title="Close Navigation Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Quick Status */}
            <div className="px-5 py-3 bg-slate-950/40 border-b border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="truncate">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Session</span>
                <span className="text-teal-300 font-bold truncate block">{currentUser ? currentUser.name : 'Guest Officer'}</span>
              </div>
              <span className="px-2.5 py-1 liquid-glass-pill text-teal-300 text-[9px] font-bold uppercase border-teal-400/40">
                {currentUser ? currentUser.role : 'Guest'}
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="px-4 pt-3.5 pb-2 bg-slate-950/30 border-b border-white/10">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs font-mono liquid-glass-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Feature Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
              {(() => {
                const filtered = portalFeatures.filter((feat) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    feat.title.toLowerCase().includes(q) ||
                    feat.subtitle.toLowerCase().includes(q) ||
                    feat.badge.toLowerCase().includes(q)
                  );
                });

                return (
                  <>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                      <span>Navigation Modules</span>
                      <span className="text-teal-400 font-mono">
                        {filtered.length} Items
                      </span>
                    </div>

                    {filtered.map((feat) => {
                      const IconComp = feat.icon;
                      const isActive = currentScreen.id === feat.id;

                      return (
                        <Tilt3DCard
                          key={feat.id}
                          onClick={() => pushScreen(feat.id as ScreenId, feat.title)}
                          maxTilt={6}
                          scale={1.01}
                          className="w-full rounded-xl overflow-hidden"
                        >
                          <div
                            className={`w-full p-3.5 rounded-xl text-left transition-all border flex items-center gap-3.5 group ${
                              isActive
                                ? 'bg-slate-800 border-teal-400 text-white shadow-xl ring-2 ring-teal-400/30'
                                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/90 hover:text-white'
                            }`}
                          >
                            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${feat.color} text-white shadow-md shrink-0`}>
                              <IconComp className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-sans font-bold text-xs group-hover:text-teal-300 transition-colors truncate">
                                  {feat.title}
                                </h3>
                                <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[8px] font-mono font-bold text-slate-300 uppercase rounded shrink-0">
                                  {feat.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {feat.subtitle}
                              </p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 transition-colors shrink-0" />
                          </div>
                        </Tilt3DCard>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </aside>
        </div>
      )}

      {/* Main Active Stack View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentScreen.id === 'dashboard' && (
          <SyndexDashboardIntro
            user={currentUser}
            onNavigate={(screenId, title) => pushScreen(screenId as ScreenId, title)}
            onOpenAuth={() => pushScreen('auth', 'Account Authentication')}
          />
        )}

        {currentScreen.id === 'intake' && (
          <IntakeScreen onDiagnosisComplete={handleDiagnosisComplete} />
        )}

        {currentScreen.id === 'referral_map' && (
          <OfflineLocalReferralMap />
        )}

        {currentScreen.id === 'rare_csv' && (
          <RareDiseaseCsvWorkflow
            onLoadIntoIntake={() => {
              pushScreen('intake', 'Patient Intake & Disease Testing');
            }}
          />
        )}

        {currentScreen.id === 'result' && (
          currentResult && currentIntake ? (
            <DiagnosisResultScreen
              result={currentResult}
              intake={currentIntake}
              onProceedToReferral={() => pushScreen('referral', 'Specialist Referral Map')}
              onProceedToFollowUpADR={() => pushScreen('adr', 'ADR & Follow-up Monitor')}
              onNewIntake={() => pushScreen('intake', 'Patient Intake & Disease Testing')}
            />
          ) : (
            <div className="p-12 text-center max-w-lg mx-auto space-y-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Evaluating Edge AI Model...</h3>
              <p className="text-xs text-slate-400">Generating diagnosis confidence weights and decision routing explanation.</p>
            </div>
          )
        )}

        {currentScreen.id === 'referral' && (
          currentResult && currentIntake ? (
            <ReferralScreen
              diagnosisResult={currentResult}
              intake={currentIntake}
              onBackToResult={popScreen}
              onProceedToADR={() => pushScreen('adr', 'ADR & Follow-up Monitor')}
              onStartNewIntake={() => pushScreen('intake', 'Patient Intake & Disease Testing')}
            />
          ) : (
            <div className="p-12 text-center max-w-lg mx-auto space-y-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Loading Specialist Referral...</h3>
              <p className="text-xs text-slate-400">Routing patient to nearest tertiary facility with available specialist inventory.</p>
            </div>
          )
        )}

        {currentScreen.id === 'adr' && (
          <FollowUpCheckScreen
            initialPatientCode={currentIntake?.patientCode || 'PAT-ANM-4412'}
            onBackToMain={() => pushScreen('intake', 'Patient Intake & Disease Testing')}
            onBackToReferral={() => pushScreen('referral', 'Specialist Referral Map')}
            onNewIntake={() => pushScreen('intake', 'Patient Intake & Disease Testing')}
          />
        )}

        {currentScreen.id === 'doctor' && <QueueDashboard />}

        {currentScreen.id === 'profile' && (
          <DoctorProfileScreen
            currentUser={currentUser}
            onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
            onSwitchUser={(newUser) => setCurrentUser(newUser)}
          />
        )}

        {currentScreen.id === 'history' && (
          <MedicalHistoryScreen
            currentUser={currentUser}
            onNavigateToADR={() => pushScreen('adr', 'ADR & Follow-up Monitor')}
            onNavigateToReferral={(result, intake) => {
              setCurrentResult(result);
              setCurrentIntake(intake);
              pushScreen('referral', 'Specialist Referral Map');
            }}
          />
        )}

        {currentScreen.id === 'router' && <RouterInspectionView />}

        {currentScreen.id === 'blockchain' && <BlockchainLedgerView />}

        {currentScreen.id === 'fl' && <FederatedLearningView />}

        {currentScreen.id === 'architecture' && <WorkbenchArchitectureView />}

        {currentScreen.id === 'export_deploy' && <ExportDeploymentHub />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 py-4 text-center text-xs text-slate-400 backdrop-blur-md">
        <p className="font-bold uppercase tracking-wider font-mono">Syndex 3D — Edge AI Rare Disease Diagnosis & Referral Platform</p>
      </footer>
    </div>
  );
}
