import React, { useState } from 'react';
import { PatientIntake, DiagnosisResult } from '../types/syndx';
import { InferenceService } from '../services/inferenceService';
import { LocalStoreService } from '../services/localStore';
import { MOCK_PATIENT_SAMPLES } from '../services/mockData';
import { Stethoscope, Activity, FileText, Zap, User, AlertCircle, HeartPulse, CheckCircle2, ArrowRight, Check } from 'lucide-react';

interface Props {
  onDiagnosisComplete: (result: DiagnosisResult, intake: PatientIntake) => void;
}

const COMMON_RARE_SYMPTOMS = [
  'Hepatosplenomegaly',
  'Severe Bone Pain (Bones/Joints)',
  'Persistent Fatigue',
  'Easy Bruising / Petechiae',
  'Acroparesthesia (Burning palms & soles)',
  'Angiokeratomas (Dark reddish spots)',
  'Hypohidrosis (Inability to sweat in heat)',
  'Proteinuria',
  'Proximal Muscle Weakness',
  'Respiratory Distress / Failure',
  'Recurrent Facial / Laryngeal Edema',
  'Dark / Black Urine on Standing',
  'Kayser-Fleischer Corneal Rings',
  'Recurrent Unexplained Fever'
];

export const IntakeScreen: React.FC<Props> = ({ onDiagnosisComplete }) => {
  const [patientCode, setPatientCode] = useState(`PAT-VLP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [clinicName, setClinicName] = useState('Valparai Tribal PHC (Clinic Node 104)');
  const [healthWorkerName, setHealthWorkerName] = useState('Health Worker Mounish V');

  // Vitals
  const [heartRate, setHeartRate] = useState<number>(84);
  const [sysBP, setSysBP] = useState<number>(118);
  const [diaBP, setDiaBP] = useState<number>(76);
  const [oxygenSat, setOxygenSat] = useState<number>(98);
  const [temp, setTemp] = useState<number>(36.8);
  const [respRate, setRespRate] = useState<number>(16);

  // Labs
  const [platelets, setPlatelets] = useState<number>(82);
  const [altAst, setAltAst] = useState<number>(42);
  const [serumCreatinine, setSerumCreatinine] = useState<number>(0.9);
  const [proteinuria, setProteinuria] = useState<boolean>(false);

  // Symptoms & History
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Hepatosplenomegaly',
    'Severe Bone Pain (Bones/Joints)',
    'Easy Bruising / Petechiae'
  ]);
  const [customSymptomInput, setCustomSymptomInput] = useState<string>('');
  const [familyHistory, setFamilyHistory] = useState<boolean>(true);
  const [symptomDurationDays, setSymptomDurationDays] = useState<number>(120);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAddCustomSymptom = () => {
    if (customSymptomInput.trim() && !selectedSymptoms.includes(customSymptomInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptomInput.trim()]);
      setCustomSymptomInput('');
    }
  };

  const handleLoadSample = (sampleIndex: number) => {
    const sample = MOCK_PATIENT_SAMPLES[sampleIndex];
    if (!sample) return;

    setPatientCode(sample.patientCode);
    setAge(sample.age);
    setGender(sample.gender);
    setClinicName(sample.clinicName);
    setHealthWorkerName(sample.healthWorkerName);
    setHeartRate(sample.vitals.heartRate);
    setSysBP(sample.vitals.sysBP);
    setDiaBP(sample.vitals.diaBP);
    setOxygenSat(sample.vitals.oxygenSat);
    setTemp(sample.vitals.temp);
    setRespRate(sample.vitals.respRate);

    if (sample.labs.platelets) setPlatelets(sample.labs.platelets);
    if (sample.labs.altAst) setAltAst(sample.labs.altAst);
    if (sample.labs.serumCreatinine) setSerumCreatinine(sample.labs.serumCreatinine);
    setProteinuria(!!sample.labs.proteinuria);

    setSelectedSymptoms(sample.symptoms);
    setFamilyHistory(sample.familyHistory);
    setSymptomDurationDays(sample.symptomDurationDays);
  };

  const handleSubmitInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    const intake: PatientIntake = {
      id: `intake-${Date.now()}`,
      patientCode,
      age,
      gender,
      clinicId: 'PHC-VALPARAI-01',
      clinicName,
      healthWorkerName,
      timestamp: new Date().toISOString(),
      vitals: { heartRate, sysBP, diaBP, oxygenSat, temp, respRate },
      labs: { platelets, altAst, serumCreatinine, proteinuria },
      symptoms: selectedSymptoms,
      medications: ['Iron Supplement', 'Paracetamol'],
      familyHistory,
      symptomDurationDays
    };

    const result = await InferenceService.runDiagnosisInference(intake);
    LocalStoreService.saveDiagnosisCase(result, intake);

    setIsEvaluating(false);
    onDiagnosisComplete(result, intake);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                Step 1: Point-of-Care Clinical Intake
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/80 text-[11px] font-mono font-semibold text-slate-300">
                Engine: Offline Edge AI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Patient Intake &amp; Biomarker Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Captures clinical markers offline in remote health posts. Evaluates rare genetic storage and metabolic conditions in under 2 seconds without requiring an internet connection.
            </p>
          </div>

          {/* Quick Pre-fill triggers */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400 font-semibold block">Load Sample:</span>
            <button
              type="button"
              onClick={() => handleLoadSample(0)}
              className="px-3.5 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-mono font-semibold transition-colors"
            >
              Gaucher Case (PAT-8821)
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample(1)}
              className="px-3.5 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-mono font-semibold transition-colors"
            >
              Fabry Case (PAT-4412)
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitInference} className="space-y-6">
        {/* Section 1: Demographic & Location Info */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-teal-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              [01] Patient Identification &amp; Clinic Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] font-mono">Patient Code / ID</label>
              <input
                type="text"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 font-mono text-white text-xs font-bold focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] font-mono">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                min={0}
                max={110}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-white font-mono text-xs font-bold focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] font-mono">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-white font-mono text-xs font-bold focus:outline-none focus:border-teal-400"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[10px] font-mono">Rural Clinic Sub-Center</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-white font-mono text-xs font-bold focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vitals & Key Lab Biomarkers */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              [02] Point-of-Care Vitals &amp; Lab Biomarkers
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-slate-400 block mb-1 text-[10px] font-mono font-semibold uppercase">Heart Rate (bpm)</span>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-slate-400 block mb-1 text-[10px] font-mono font-semibold uppercase">BP Systolic (mmHg)</span>
              <input
                type="number"
                value={sysBP}
                onChange={(e) => setSysBP(Number(e.target.value))}
                className={`w-full bg-transparent font-mono font-bold text-base focus:outline-none ${
                  sysBP > 180 || sysBP < 80 ? 'text-rose-400' : 'text-white'
                }`}
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-slate-400 block mb-1 text-[10px] font-mono font-semibold uppercase">O2 Saturation (%)</span>
              <input
                type="number"
                value={oxygenSat}
                onChange={(e) => setOxygenSat(Number(e.target.value))}
                className={`w-full bg-transparent font-mono font-bold text-base focus:outline-none ${
                  oxygenSat < 88 ? 'text-rose-400' : 'text-teal-400'
                }`}
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-slate-400 block mb-1 text-[10px] font-mono font-semibold uppercase">Platelets (x10^3/µL)</span>
              <input
                type="number"
                value={platelets}
                onChange={(e) => setPlatelets(Number(e.target.value))}
                className={`w-full bg-transparent font-mono font-bold text-base focus:outline-none ${
                  platelets < 100 ? 'text-amber-400' : 'text-white'
                }`}
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-slate-400 block mb-1 text-[10px] font-mono font-semibold uppercase">ALT / AST (U/L)</span>
              <input
                type="number"
                value={altAst}
                onChange={(e) => setAltAst(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-slate-400 block mb-1 text-[10px] font-mono font-semibold uppercase">Serum Creatinine</span>
              <input
                type="number"
                step="0.1"
                value={serumCreatinine}
                onChange={(e) => setSerumCreatinine(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rare Symptom Checklist & History */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                [03] Rare Disease Phenotype &amp; Symptom Checklist
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-xs text-teal-300 font-mono font-semibold">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {COMMON_RARE_SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  type="button"
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                    isSelected
                      ? 'border-teal-500/50 bg-teal-500/15 text-white font-semibold shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-xs leading-tight">{symptom}</span>
                  <span
                    className={`w-4 h-4 rounded border shrink-0 ml-2 flex items-center justify-center text-[10px] font-mono ${
                      isSelected ? 'border-teal-400 bg-teal-400 text-slate-950 font-black' : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-slate-950 stroke-[3]" /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add custom symptom input */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={customSymptomInput}
              onChange={(e) => setCustomSymptomInput(e.target.value)}
              placeholder="Enter additional clinical phenotype or symptom..."
              className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-teal-400"
            />
            <button
              type="button"
              onClick={handleAddCustomSymptom}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono font-semibold text-xs transition-colors"
            >
              Add Symptom
            </button>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <input
                type="checkbox"
                id="familyHistory"
                checked={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.checked)}
                className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
              />
              <label htmlFor="familyHistory" className="text-slate-300 font-medium cursor-pointer text-xs">
                Family History of Unexplained Consanguinity or Rare Symptoms
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">Symptom Duration:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={symptomDurationDays}
                  onChange={(e) => setSymptomDurationDays(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center font-mono font-bold text-white"
                />
                <span className="text-slate-300 font-semibold">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
            <Zap className="w-4 h-4 text-teal-400" />
            <span>Local TFLite model active • ~12.4 MB • Zero Cloud Latency</span>
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 text-slate-950 hover:brightness-105 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-teal-500/20"
          >
            {isEvaluating ? (
              <>
                <HeartPulse className="w-4 h-4 animate-spin" />
                <span>Running Edge AI Diagnostic Engine...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>Execute Local Edge AI Diagnosis &amp; Proceed →</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
