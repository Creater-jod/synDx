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
  ArrowRight,
  Activity,
  Menu,
  X,
  Zap,
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
  ArrowLeft,
  Sparkles
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

interface FeatureSection {
  category: string;
  items: {
    id: ScreenId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
  }[];
}

const PORTAL_FEATURE_SECTIONS: FeatureSection[] = [
  {
    category: 'Clinical Core & Triage',
    items: [
      {
        id: 'dashboard',
        title: 'System Dashboard',
        subtitle: 'Clinical overview, telemetry metrics, and triage launcher',
        icon: Home,
        tag: 'MAIN'
      },
      {
        id: 'intake',
        title: 'Patient Intake & Testing',
        subtitle: '4-step clinical intake, HPO phenotype mapper, and edge inference',
        icon: Activity,
        tag: 'TRIAGE'
      },
      {
        id: 'referral_map',
        title: 'Rural GIS Referral Map',
        subtitle: 'Offline-cached health facility matrix, distance, and routing',
        icon: Map,
        tag: 'GIS'
      },
      {
        id: 'rare_csv',
        title: 'Rare Disease CSV Pipeline',
        subtitle: 'Orphadata & NIH GARD dataset search, upload, and grounded AI',
        icon: FileSpreadsheet,
        tag: 'DATASET'
      }
    ]
  },
  {
    category: 'Provider Operations & Records',
    items: [
      {
        id: 'doctor',
        title: 'Physician Console',
        subtitle: 'Triage queue review, clinical overrides, and consultation notes',
        icon: UserCheck,
        tag: 'QUEUE'
      },
      {
        id: 'profile',
        title: 'Practitioner Registry',
        subtitle: 'Medical license credentials, hospital affiliation, and specialties',
        icon: Stethoscope,
        tag: 'CREDENTIALS'
      },
      {
        id: 'history',
        title: 'Medical Records Vault',
        subtitle: 'Patient differential records, audit trails, and longitudinal follow-up',
        icon: Clock,
        tag: 'VAULT'
      }
    ]
  },
  {
    category: 'Architecture & Trust Systems',
    items: [
      {
        id: 'router',
        title: 'Decision Router Matrix',
        subtitle: 'Edge confidence thresholds and secondary escalation logic',
        icon: Network,
        tag: 'ROUTER'
      },
      {
        id: 'blockchain',
        title: 'Cryptographic Audit Ledger',
        subtitle: 'SHA-256 block hash verification and diagnosis provenance',
        icon: ShieldCheck,
        tag: 'LEDGER'
      },
      {
        id: 'fl',
        title: 'Federated Learning Engine',
        subtitle: 'Privacy-preserving gradient optimization with differential privacy',
        icon: Database,
        tag: 'FEDERATION'
      },
      {
        id: 'architecture',
        title: 'System Topology Blueprint',
        subtitle: 'SHAP explainability matrix, local storage, and component graph',
        icon: Layers,
        tag: 'SYSTEM'
      },
      {
        id: 'export_deploy',
        title: 'DevOps & Deployment Hub',
        subtitle: 'Automated source packaging, setup scripts, and Cloud Run deploy',
        icon: FolderArchive,
        tag: 'DEVOPS'
      }
    ]
  }
];

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

  // Keyboard navigation: Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPortalOpen) {
        setIsPortalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPortalOpen]);

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

  // If on Auth screen
  if (currentScreen.id === 'auth') {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans bg-slate-950 selection:bg-teal-400 selection:text-slate-950">
        <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-900/80 backdrop-blur-2xl py-3.5 px-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={resetToDashboard}>
              <div className="p-2.5 bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 rounded-xl shadow-md">
                <HeartPulse className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-heading">
                  Syndex
                </span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 font-mono text-[10px] font-semibold">
                  Clinical Authentication
                </span>
              </div>
            </div>

            <OfflineQueueIndicator />
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onCancelGuest={resetToDashboard}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-teal-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Sleek Floating Glass Header Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Menu Drawer Trigger & Brand */}
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setIsPortalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200 hover:text-white transition-all flex items-center gap-2 font-mono text-xs font-semibold tracking-wide"
                aria-label="Open Navigation Drawer"
              >
                <Menu className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <div
                onClick={resetToDashboard}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="p-2 bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-white font-heading group-hover:text-teal-300 transition-colors">
                      Syndex
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border border-teal-500/30 bg-teal-500/10 text-teal-300">
                      v3.5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Quick Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1.5 border border-slate-800 rounded-full px-3 py-1 bg-slate-950/60 backdrop-blur-md text-xs font-medium text-slate-300">
              <button
                onClick={() => pushScreen('intake', 'Patient Intake & Disease Testing')}
                className={`px-3 py-1 rounded-full transition-colors ${currentScreen.id === 'intake' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'hover:text-white'}`}
              >
                Patient Triage
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => pushScreen('referral_map', 'Offline Local Referral Map')}
                className={`px-3 py-1 rounded-full transition-colors ${currentScreen.id === 'referral_map' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'hover:text-white'}`}
              >
                GIS Map
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => pushScreen('doctor', 'Doctor Console & Triage Queue')}
                className={`px-3 py-1 rounded-full transition-colors ${currentScreen.id === 'doctor' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'hover:text-white'}`}
              >
                Doctor Queue
              </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => pushScreen('rare_csv', 'Rare Disease CSV Pipeline')}
                className={`px-3 py-1 rounded-full transition-colors ${currentScreen.id === 'rare_csv' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'hover:text-white'}`}
              >
                Orphadata CSV
              </button>
            </nav>

            {/* Right: Offline Indicator & User Profile */}
            <div className="flex items-center gap-3">
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

      {/* Push / Pop Breadcrumb Trail */}
      <div className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            {navStack.length > 1 && (
              <button
                onClick={popScreen}
                className="px-3 py-1 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-teal-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all"
                aria-label="Navigate to previous screen"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-teal-300" />
                <span>Back</span>
              </button>
            )}

            <nav aria-label="Breadcrumbs" className="flex items-center gap-1 text-xs font-mono">
              {navStack.map((item, index) => {
                const isLast = index === navStack.length - 1;
                return (
                  <React.Fragment key={`${item.id}-${index}`}>
                    {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    <button
                      onClick={() => jumpToBreadcrumb(index)}
                      disabled={isLast}
                      className={`px-2.5 py-0.5 rounded-md transition-colors truncate max-w-[200px] ${
                        isLast
                          ? 'border border-teal-500/30 bg-teal-500/10 text-teal-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.title}
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className="text-[11px] font-mono text-slate-500 shrink-0 hidden md:block">
            Stack Depth: <strong className="text-teal-400">{navStack.length}</strong> Level{navStack.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Left-Side Dashboard Drawer */}
      {isPortalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-start">
          <div className="absolute inset-0" onClick={() => setIsPortalOpen(false)} />

          <aside 
            aria-label="Navigation Menu" 
            className="relative z-10 w-80 sm:w-96 h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl text-slate-950 shadow-md">
                  <Menu className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    Navigation Matrix
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400">
                    Push / Pop Architecture
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPortalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                aria-label="Close Navigation Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Status */}
            <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="truncate">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Practitioner</span>
                <span className="text-teal-400 font-semibold truncate block">
                  {currentUser ? currentUser.name : 'Guest Health Worker'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-[10px] text-slate-300 font-semibold">
                {currentUser ? currentUser.role : 'Guest'}
              </span>
            </div>

            {/* Search Filter */}
            <div className="px-4 py-3 bg-slate-950/30 border-b border-slate-800">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter clinical modules..."
                  className="w-full pl-9 pr-8 py-2 text-xs font-mono rounded-xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categorized Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {PORTAL_FEATURE_SECTIONS.map((section) => {
                const filteredItems = section.items.filter((item) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    item.title.toLowerCase().includes(q) ||
                    item.subtitle.toLowerCase().includes(q) ||
                    item.tag.toLowerCase().includes(q)
                  );
                });

                if (filteredItems.length === 0) return null;

                return (
                  <div key={section.category} className="space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2">
                      {section.category}
                    </div>

                    <div className="space-y-1.5">
                      {filteredItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = currentScreen.id === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => pushScreen(item.id, item.title)}
                            className={`w-full p-3 rounded-xl cursor-pointer text-left transition-all border flex items-center gap-3 group ${
                              isActive
                                ? 'bg-teal-500/10 border-teal-500/40 text-white shadow-sm'
                                : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-300 group-hover:text-teal-300'} transition-colors shrink-0`}>
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-semibold text-xs group-hover:text-teal-300 transition-colors truncate">
                                  {item.title}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border border-slate-800 bg-slate-900 text-slate-400">
                                  {item.tag}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>

                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-300 transition-colors shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div key={currentScreen.id} className="transition-opacity duration-200">
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
                <h3 className="text-lg font-bold text-white font-heading">Evaluating Edge AI Model...</h3>
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
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-white font-heading">Loading Specialist Referral...</h3>
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
        </div>
      </main>

      {/* Editorial High-Contrast Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">
                Syndex Clinical Decision Platform
              </p>
              <p className="text-[11px] text-slate-500">
                Autonomous Edge AI • HPO Phenotype Mapping • Zero-Trust Cryptographic Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-500">
            <span>Orphadata &amp; NIH GARD Grounded</span>
            <span>•</span>
            <span>Offline-First Mesh</span>
            <span>•</span>
            <span className="text-teal-400">Status: Nominal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
