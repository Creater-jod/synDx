import React, { useState, useEffect } from 'react';
import { UserProfile, AuthProvider } from '../types/auth';
import { LocalStoreService } from '../services/localStore';
import { DR_RATHIESH_PFP_DATA_URL } from '../assets/drRathieshPhoto';
import { Tilt3DCard } from '../components/Tilt3DCard';
import {
  User,
  ShieldCheck,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Award,
  FileText,
  Clock,
  Plus,
  Edit3,
  CheckCircle2,
  Sparkles,
  UserPlus,
  RefreshCw,
  X,
  Check,
  Trash2,
  Briefcase,
  Layers,
  Activity,
  HeartPulse,
  Share2,
  Upload
} from 'lucide-react';

interface DoctorProfileScreenProps {
  currentUser: UserProfile | null;
  onProfileUpdate: (updatedUser: UserProfile) => void;
  onSwitchUser?: (newUser: UserProfile) => void;
}

const PRESET_AVATARS = [
  {
    id: 'dr-rathiesh',
    name: 'Dr. Rathiesh (Sex Educator & Sexual Health Specialist)',
    url: DR_RATHIESH_PFP_DATA_URL
  },
  {
    id: 'dr-evelyn',
    name: 'Senior Female Medical Specialist',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-marcus',
    name: 'Genetics & Clinical Genomics Specialist',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-mounish',
    name: 'Rare Hematology & Lysosomal Specialist',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-terrance',
    name: 'Inclusive Care & LGBTQ+ Health Specialist',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
  }
];

export const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({
  currentUser,
  onProfileUpdate,
  onSwitchUser
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'create' | 'directory'>('view');

  // List of all Doctor Profiles
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Edit / Creation Form States
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formRole, setFormRole] = useState<UserProfile['role']>('Rare Disease Specialist');
  const [formClinicName, setFormClinicName] = useState('');
  const [formClinicId, setFormClinicId] = useState('');
  const [formLicense, setFormLicense] = useState('');
  const [formQualifications, setFormQualifications] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSlots, setFormSlots] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formSpecialties, setFormSpecialties] = useState<string[]>([]);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');

  // Load profiles from LocalStore
  const reloadProfiles = () => {
    const list = LocalStoreService.getDoctorProfiles();
    setProfilesList(list);
  };

  useEffect(() => {
    reloadProfiles();
  }, []);

  // Sync form with current user if switching to edit tab
  const populateFormWithUser = (userToEdit: UserProfile) => {
    setFormId(userToEdit.id);
    setFormName(userToEdit.name);
    setFormEmail(userToEdit.email);
    setFormMobile(userToEdit.mobile || '');
    setFormRole(userToEdit.role);
    setFormClinicName(userToEdit.clinicName);
    setFormClinicId(userToEdit.clinicId);
    setFormLicense(userToEdit.medicalLicense || '');
    setFormQualifications(userToEdit.qualifications || 'MBBS, MD');
    setFormDepartment(userToEdit.department || 'Department of Specialty Medicine');
    setFormBio(userToEdit.bio || '');
    setFormSlots(userToEdit.consultationSlots || 'Mon-Fri 10:00 AM - 4:00 PM');
    setFormAvatarUrl(userToEdit.avatarUrl || DR_RATHIESH_PFP_DATA_URL);
    setFormSpecialties(userToEdit.specialties || ['Rare Disease Screening', 'Clinical Triage']);
  };

  const resetFormForCreation = () => {
    const newId = `doc-custom-${Date.now().toString().slice(-6)}`;
    setFormId(newId);
    setFormName('Dr. ');
    setFormEmail('');
    setFormMobile('+91 ');
    setFormRole('Rare Disease Specialist');
    setFormClinicName('Coimbatore Medical College Hospital (CMCH)');
    setFormClinicId(`CMCH-${Math.floor(100 + Math.random() * 900)}`);
    setFormLicense(`TMC-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormQualifications('MBBS, MD (General Medicine), DNB');
    setFormDepartment('Department of Genetics & Rare Metabolic Disorders');
    setFormBio('Specialist practitioner dedicated to rare disease diagnosis, early triage, and precision referral management.');
    setFormSlots('Mon-Fri: 10:00 AM - 3:00 PM');
    setFormAvatarUrl(DR_RATHIESH_PFP_DATA_URL);
    setFormSpecialties([
      'Rare Disease Screening',
      'Lysosomal Storage Disorders',
      'Clinical Triage & Ethics'
    ]);
  };

  const handleAddSpecialtyTag = () => {
    if (newSpecialtyInput.trim() && !formSpecialties.includes(newSpecialtyInput.trim())) {
      setFormSpecialties([...formSpecialties, newSpecialtyInput.trim()]);
      setNewSpecialtyInput('');
    }
  };

  const handleRemoveSpecialtyTag = (tag: string) => {
    setFormSpecialties(formSpecialties.filter((s) => s !== tag));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || formName === 'Dr. ') {
      alert('Please enter a valid Doctor Name');
      return;
    }

    const savedProfile: UserProfile = {
      id: formId || `doc-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim() || `doctor.${Date.now()}@syndx.med`,
      mobile: formMobile.trim(),
      role: formRole,
      clinicName: formClinicName.trim() || 'Coimbatore Medical College Hospital (CMCH)',
      clinicId: formClinicId.trim() || 'CMCH-01',
      medicalLicense: formLicense.trim() || 'TMC-2026-90182',
      avatarUrl: formAvatarUrl || DR_RATHIESH_PFP_DATA_URL,
      provider: 'google',
      verified: true,
      createdAt: new Date().toISOString(),
      qualifications: formQualifications.trim(),
      specialties: formSpecialties,
      department: formDepartment.trim(),
      bio: formBio.trim(),
      consultationSlots: formSlots.trim()
    };

    // Save to LocalStore
    LocalStoreService.saveDoctorProfile(savedProfile);
    reloadProfiles();

    // Trigger state update & activate new doctor profile
    onProfileUpdate(savedProfile);
    if (onSwitchUser) {
      onSwitchUser(savedProfile);
    }

    setSaveSuccessMessage(`Doctor Profile "${savedProfile.name}" created and set as active user successfully!`);
    setActiveTab('view');

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
  };

  const handleSwitchToDoctor = (prof: UserProfile) => {
    onProfileUpdate(prof);
    if (onSwitchUser) {
      onSwitchUser(prof);
    }
    setSaveSuccessMessage(`Switched active profile to ${prof.name}`);
    setActiveTab('view');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3000);
  };

  // Currently active doctor profile for display
  const activeDoctor = currentUser || profilesList[0] || {
    id: 'doc-rathiesh',
    name: 'Dr. Rathiesh, MBBS, MD, FECSM',
    email: 'dr.rathiesh.medical@gmail.com',
    role: 'Rare Disease Specialist' as const,
    clinicName: 'Coimbatore Medical College Hospital (CMCH)',
    clinicId: 'CMCH-01',
    medicalLicense: 'TMC-2021-98122',
    avatarUrl: DR_RATHIESH_PFP_DATA_URL,
    provider: 'google' as const,
    verified: true,
    createdAt: new Date().toISOString(),
    qualifications: 'MBBS, MD, FECSM',
    specialties: ['Sexual Health Medicine', 'Rare Endocrine Disorders'],
    department: 'Department of Sexual Health',
    bio: 'Specialist practitioner dedicated to inclusive healthcare.',
    consultationSlots: 'Mon-Fri 2:00 PM - 6:00 PM'
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Top Banner Header */}
      <div className="card-3d-dark p-6 rounded-2xl relative overflow-hidden border border-[#FF6321]/30">

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-br from-[#FF6321] to-amber-600 rounded-xl text-white shadow-lg">
                <Stethoscope className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white font-sans flex items-center gap-2">
                Doctor Credentials & Practitioner Profile
              </h1>
              <span className="px-2.5 py-0.5 bg-[#FF6321]/20 text-[#FF6321] border border-[#FF6321]/40 font-mono text-[10px] font-bold uppercase rounded-full">
                Medical Registry
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Manage clinical identity, state medical license verification, specialties, OPD referral slots & custom doctor profiles.
            </p>
          </div>

          <button
            onClick={() => {
              resetFormForCreation();
              setActiveTab('create');
            }}
            className="btn-3d-orange px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create New Doctor Profile</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl text-emerald-300 text-xs font-mono font-bold flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 rounded-xl font-bold uppercase transition-all flex items-center gap-2 ${
            activeTab === 'view'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md border border-teal-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Active Doctor Profile</span>
        </button>

        <button
          onClick={() => {
            populateFormWithUser(activeDoctor);
            setActiveTab('edit');
          }}
          className={`px-4 py-2 rounded-xl font-bold uppercase transition-all flex items-center gap-2 ${
            activeTab === 'edit'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-indigo-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Doctor Details</span>
        </button>

        <button
          onClick={() => {
            resetFormForCreation();
            setActiveTab('create');
          }}
          className={`px-4 py-2 rounded-xl font-bold uppercase transition-all flex items-center gap-2 ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-[#FF6321] to-amber-600 text-white shadow-md border border-[#FF6321]/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Doctor Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl font-bold uppercase transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md border border-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Doctor Directory ({profilesList.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE DOCTOR PROFILE DISPLAY */}
      {activeTab === 'view' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Main Left Card: Headshot Photo & Badges */}
          <Tilt3DCard maxTilt={3} scale={1.01} className="lg:col-span-1">
            <div className="card-3d-dark p-6 rounded-3xl border border-slate-800 text-center space-y-4 relative overflow-hidden">
              <div className="relative inline-block mx-auto">
                {activeDoctor.avatarUrl ? (
                  <img
                    src={activeDoctor.avatarUrl}
                    alt={activeDoctor.name}
                    className="w-36 h-36 rounded-full border-4 border-[#2A5C82] object-cover mx-auto shadow-2xl"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-teal-600 to-indigo-700 text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-2xl border-4 border-teal-400">
                    {activeDoctor.name.charAt(0)}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 p-2 bg-emerald-500 text-slate-950 rounded-full border-2 border-slate-900 shadow-lg" title="Verified Medical Practitioner">
                  <CheckCircle2 className="w-4 h-4 font-black" />
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                  <span>{activeDoctor.name}</span>
                </h2>
                <p className="text-xs text-[#FF6321] font-mono font-bold mt-1">
                  {activeDoctor.role}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeDoctor.clinicName}
                </p>
              </div>

              {/* Medical License Badge */}
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Medical Council License:</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <div className="font-bold text-white tracking-wider text-sm">
                  {activeDoctor.medicalLicense || 'TMC-2021-98122'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2 font-mono text-xs">
                <button
                  onClick={() => {
                    populateFormWithUser(activeDoctor);
                    setActiveTab('edit');
                  }}
                  className="btn-3d w-full py-2.5 font-bold text-teal-300 uppercase flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile Details</span>
                </button>

                <button
                  onClick={() => {
                    resetFormForCreation();
                    setActiveTab('create');
                  }}
                  className="btn-3d-orange w-full py-2.5 font-bold uppercase flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Another Doctor Profile</span>
                </button>
              </div>
            </div>
          </Tilt3DCard>

          {/* Right Section: Comprehensive Credentials & Specialties */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Qualifications & Department */}
            <div className="card-3d-dark p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                Medical Qualifications & Department Affiliation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Qualifications:</span>
                  <span className="font-bold text-white text-sm">
                    {activeDoctor.qualifications || 'MBBS, MD, FECSM'}
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department:</span>
                  <span className="font-bold text-teal-300 text-sm">
                    {activeDoctor.department || 'Department of Specialty Healthcare'}
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital / Health Center:</span>
                  <span className="font-bold text-white">{activeDoctor.clinicName}</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">OPD / Referral Slot:</span>
                  <span className="font-bold text-amber-300">
                    {activeDoctor.consultationSlots || 'Mon-Fri: 2:00 PM - 6:00 PM'}
                  </span>
                </div>
              </div>

              {/* Specialties Chips */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Clinical Specialties & Focus Areas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(activeDoctor.specialties || [
                    'Sexual Health Medicine',
                    'Sex Education & Counseling',
                    'Inclusive Healthcare',
                    'Rare Endocrine Manifestations'
                  ]).map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-200 border border-teal-500/40 rounded-xl font-mono text-xs font-bold"
                    >
                      ⚕️ {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio Statement */}
              {activeDoctor.bio && (
                <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1 font-sans">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Practitioner Clinical Statement:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic font-serif">
                    "{activeDoctor.bio}"
                  </p>
                </div>
              )}
            </div>

            {/* Contact Details & Practice Statistics */}
            <div className="card-3d-dark p-6 rounded-3xl border border-slate-800 space-y-4 font-mono text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Practice Contact & SynDx Triage Records
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Email:</span>
                    <span className="font-bold text-white truncate block max-w-[180px]">{activeDoctor.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Mobile:</span>
                    <span className="font-bold text-white">{activeDoctor.mobile || '+91 94421 99001'}</span>
                  </div>
                </div>
              </div>

              {/* SynDx Verified Performance Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Cases Triaged</span>
                  <span className="text-base font-black text-teal-300">142 Cases</span>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Overrides</span>
                  <span className="text-base font-black text-indigo-300">8 Overrides</span>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Polygon Ledger</span>
                  <span className="text-base font-black text-emerald-300">100% Sealed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: EDIT DOCTOR PROFILE OR CREATE NEW DOCTOR PROFILE FORM */}
      {(activeTab === 'edit' || activeTab === 'create') && (
        <div className="card-3d-dark p-6 sm:p-8 rounded-3xl border border-[#FF6321]/40 space-y-6 font-sans max-w-4xl mx-auto shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#FF6321] to-amber-600 rounded-2xl text-white shadow-lg">
                {activeTab === 'create' ? <UserPlus className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white font-mono">
                  {activeTab === 'create' ? 'Create New Doctor Profile' : 'Edit Doctor Profile Details'}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeTab === 'create'
                    ? 'Register a new clinician profile with state medical council license, qualifications, and specialties.'
                    : 'Update active doctor credentials, hospital affiliation, and consultation slots.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('view')}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProfileSubmit} className="space-y-6">
            {/* Preset Avatar Selection */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 block">
                Select Profile Photo / Medical Avatar:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_AVATARS.map((av) => (
                  <div
                    key={av.id}
                    onClick={() => setFormAvatarUrl(av.url)}
                    className={`p-2 rounded-2xl border transition-all cursor-pointer text-center space-y-2 ${
                      formAvatarUrl === av.url
                        ? 'bg-[#FF6321]/20 border-[#FF6321] ring-2 ring-[#FF6321]/40 shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-16 h-16 rounded-full border-2 border-teal-500 object-cover mx-auto shadow-md"
                    />
                    <div className="text-[10px] font-mono text-slate-300 font-bold truncate px-1">
                      {av.name.split(' ')[0]} {av.name.split(' ')[1]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="btn-3d px-4 py-2.5 bg-slate-900 text-teal-300 font-mono text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-2 border border-teal-500/40 hover:border-teal-400">
                    <Upload className="w-4 h-4 text-teal-400" />
                    <span>Upload Photo File from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {formAvatarUrl && (
                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 px-3 rounded-xl border border-slate-800">
                      <img
                        src={formAvatarUrl}
                        alt="Selected PFP Preview"
                        className="w-8 h-8 rounded-full object-cover border border-teal-500 shrink-0"
                      />
                      <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[180px]">
                        Photo Loaded
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    Or paste custom Image URL / Data URI:
                  </span>
                  <input
                    type="text"
                    value={formAvatarUrl}
                    onChange={(e) => setFormAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo... or data:image/png;base64,..."
                    className="w-full px-3 py-2 text-xs font-mono input-3d-dark text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Core Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Full Name & Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Rathiesh, MBBS, MD, FECSM"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Role / Clinical Designation <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold bg-slate-900"
                >
                  <option value="Rare Disease Specialist">Rare Disease Specialist</option>
                  <option value="Medical Officer (Doctor)">Medical Officer (Doctor)</option>
                  <option value="Health Worker (ANM)">Health Worker (ANM)</option>
                  <option value="Sex Educator & Sexual Health Specialist">Sex Educator & Sexual Health Specialist</option>
                  <option value="System Auditor / Admin">System Auditor / Admin</option>
                </select>
              </div>

              {/* Medical License Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  State Medical Council License No. <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formLicense}
                  onChange={(e) => setFormLicense(e.target.value)}
                  placeholder="e.g. TMC-2021-98122"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Qualifications */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Academic Qualifications
                </label>
                <input
                  type="text"
                  value={formQualifications}
                  onChange={(e) => setFormQualifications(e.target.value)}
                  placeholder="e.g. MBBS, MD, FECSM, DNB"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Hospital / Clinic Affiliation */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Hospital / Facility Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formClinicName}
                  onChange={(e) => setFormClinicName(e.target.value)}
                  placeholder="e.g. Coimbatore Medical College Hospital (CMCH)"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Department
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Department of Sexual Health & Inclusive Medicine"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder="e.g. +91 94421 99001"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. dr.rathiesh.medical@gmail.com"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>

              {/* Consultation Slots */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-300 font-bold uppercase block">
                  OPD & Referral Availability Hours
                </label>
                <input
                  type="text"
                  value={formSlots}
                  onChange={(e) => setFormSlots(e.target.value)}
                  placeholder="e.g. Mon-Fri: 2:00 PM - 6:00 PM"
                  className="w-full px-3.5 py-2.5 input-3d-dark text-white font-bold"
                />
              </div>
            </div>

            {/* Specialties Interactive Tag Builder */}
            <div className="space-y-2 font-mono">
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
                Specialties & Clinical Focus Tags:
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialtyInput}
                  onChange={(e) => setNewSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialtyTag();
                    }
                  }}
                  placeholder="Type a specialty (e.g. Lysosomal Storage Disorders) & press Add..."
                  className="flex-1 px-3.5 py-2 text-xs input-3d-dark text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialtyTag}
                  className="btn-3d px-4 py-2 text-xs font-bold text-teal-300 uppercase"
                >
                  + Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {formSpecialties.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-800 text-teal-300 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 font-bold"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialtyTag(tag)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bio Statement */}
            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-slate-300 font-bold uppercase block">
                Practitioner Bio / Clinical Statement
              </label>
              <textarea
                rows={3}
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Write a brief practitioner summary..."
                className="w-full p-3.5 text-xs font-sans input-3d-dark text-white placeholder-slate-500 rounded-2xl"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="btn-3d px-5 py-2.5 font-bold text-slate-400 hover:text-white uppercase"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-3d-orange px-8 py-3 font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {activeTab === 'create' ? 'Save & Activate New Doctor Profile' : 'Update Profile Details'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: DIRECTORY OF REGISTERED DOCTOR PROFILES */}
      {activeTab === 'directory' && (
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>
              Registered Doctor Profiles in SynDx Registry (<strong className="text-teal-300">{profilesList.length}</strong>)
            </span>
            <button
              onClick={() => {
                resetFormForCreation();
                setActiveTab('create');
              }}
              className="text-[#FF6321] hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profilesList.map((prof) => {
              const isCurrent = currentUser?.id === prof.id || currentUser?.email === prof.email;

              return (
                <Tilt3DCard key={prof.id} maxTilt={3} scale={1.01} className="w-full">
                  <div
                    className={`card-3d-dark p-5 rounded-2xl border transition-all space-y-4 ${
                      isCurrent
                        ? 'border-[#FF6321] ring-2 ring-[#FF6321]/30 bg-slate-950/90'
                        : 'border-slate-800 hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {prof.avatarUrl ? (
                        <img
                          src={prof.avatarUrl}
                          alt={prof.name}
                          className="w-14 h-14 rounded-full border-2 border-[#2A5C82] object-cover shrink-0 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                          {prof.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 font-mono">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm truncate">{prof.name}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#FF6321] text-white text-[9px] font-black uppercase rounded font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#FF6321] font-bold mt-0.5">{prof.role}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{prof.clinicName}</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl font-mono text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>License:</span>
                        <span className="font-bold text-white">{prof.medicalLicense || 'TMC-2021-98122'}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Qualifications:</span>
                        <span className="font-bold text-teal-300">{prof.qualifications || 'MBBS, MD'}</span>
                      </div>
                    </div>

                    {prof.specialties && prof.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prof.specialties.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded border border-slate-700"
                          >
                            • {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
                      <span className="text-[10px] text-slate-400">
                        {prof.mobile || prof.email}
                      </span>

                      {!isCurrent ? (
                        <button
                          onClick={() => handleSwitchToDoctor(prof)}
                          className="btn-3d-orange px-3.5 py-1.5 text-[11px] font-bold uppercase flex items-center gap-1 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Switch to Doctor</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Currently Active</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Tilt3DCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
