import React, { useState } from 'react';
import { PatientIntake, DiagnosisResult } from '../types/syndx';
import { InferenceService } from '../services/inferenceService';
import { LocalStoreService } from '../services/localStore';
import { MOCK_PATIENT_SAMPLES } from '../services/mockData';
import { Stethoscope, Activity, FileText, Zap, User, AlertCircle, HeartPulse } from 'lucide-react';

interface Props {
  onDiagnosisComplete: (result: DiagnosisResult, intake: PatientIntake) => void;
}

const COMMON_RARE_SYMPTOMS = [
  'Hepatosplenomegaly',
  'Severe Bone Pain (Bones/Joints)',
  'Persistent Fatigue',
  'Easy Bruising / Petechiae',
  'Acroparesthesia (Burning sensation in palms & soles)',
  'Dark reddish skin spots (Angiokeratomas)',
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
      <div className="card-3d p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="btn-3d px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                Layer 1: Point-of-Care Offline Intake
              </span>
              <span className="badge-3d px-3 py-1 text-[10px] font-mono font-bold text-slate-800">
                Latent Engine: TFLite Edge 3D
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 drop-shadow-xs">
              Rural Clinic Rare Disease Intake & Vitals Assessment
            </h1>
            <p className="text-xs font-serif italic text-slate-600 mt-1 max-w-2xl">
              Captures clinical markers offline in remote sub-centers. Evaluates 20+ rare genetic storage and metabolic conditions in under 2 seconds without requiring internet.
            </p>
          </div>

          {/* Quick Demo Pre-fill triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-700 block w-full md:w-auto">Load Sample Case:</span>
            <button
              type="button"
              onClick={() => handleLoadSample(0)}
              className="btn-3d px-3.5 py-2 text-xs font-mono font-bold shadow-md"
            >
              Gaucher Case (PAT-8821)
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample(1)}
              className="btn-3d-orange px-3.5 py-2 text-xs font-mono font-bold shadow-md"
            >
              Fabry Case (PAT-4412)
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitInference} className="space-y-6">
        {/* Section 1: Demographic & Location Info */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <User className="w-4 h-4 text-[#2A5C82]" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
              [01] Patient Identification & Clinic Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] font-mono">Patient Code / ID</label>
              <input
                type="text"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                required
                className="w-full input-3d p-2.5 font-mono text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] font-mono">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                min={0}
                max={110}
                className="w-full input-3d p-2.5 text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] font-mono">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full input-3d p-2.5 text-slate-900 font-mono font-bold focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] font-mono">Rural Clinic Sub-Center</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full input-3d p-2.5 text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vitals & Key Lab Biomarkers */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Activity className="w-4 h-4 text-[#FF6321]" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
              [02] Point-of-Care Vitals & Lab Biomarkers
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="input-3d p-3">
              <span className="text-slate-600 block mb-1 text-[10px] font-mono font-bold uppercase">Heart Rate (bpm)</span>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-black text-slate-900 text-sm focus:outline-none"
              />
            </div>

            <div className="input-3d p-3">
              <span className="text-slate-600 block mb-1 text-[10px] font-mono font-bold uppercase">BP Systolic (mmHg)</span>
              <input
                type="number"
                value={sysBP}
                onChange={(e) => setSysBP(Number(e.target.value))}
                className={`w-full bg-transparent font-mono font-black text-sm focus:outline-none ${
                  sysBP > 180 || sysBP < 80 ? 'text-[#FF6321]' : 'text-slate-900'
                }`}
              />
            </div>

            <div className="input-3d p-3">
              <span className="text-slate-600 block mb-1 text-[10px] font-mono font-bold uppercase">O2 Saturation (%)</span>
              <input
                type="number"
                value={oxygenSat}
                onChange={(e) => setOxygenSat(Number(e.target.value))}
                className={`w-full bg-transparent font-mono font-black text-sm focus:outline-none ${
                  oxygenSat < 88 ? 'text-[#FF6321]' : 'text-[#2A5C82]'
                }`}
              />
            </div>

            <div className="input-3d p-3">
              <span className="text-slate-600 block mb-1 text-[10px] font-mono font-bold uppercase">Platelets (x10^3/µL)</span>
              <input
                type="number"
                value={platelets}
                onChange={(e) => setPlatelets(Number(e.target.value))}
                className={`w-full bg-transparent font-mono font-black text-sm focus:outline-none ${
                  platelets < 100 ? 'text-[#FF6321]' : 'text-slate-900'
                }`}
              />
            </div>

            <div className="input-3d p-3">
              <span className="text-slate-600 block mb-1 text-[10px] font-mono font-bold uppercase">ALT / AST (U/L)</span>
              <input
                type="number"
                value={altAst}
                onChange={(e) => setAltAst(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-black text-slate-900 text-sm focus:outline-none"
              />
            </div>

            <div className="input-3d p-3">
              <span className="text-slate-600 block mb-1 text-[10px] font-mono font-bold uppercase">Serum Creatinine</span>
              <input
                type="number"
                step="0.1"
                value={serumCreatinine}
                onChange={(e) => setSerumCreatinine(Number(e.target.value))}
                className="w-full bg-transparent font-mono font-black text-slate-900 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rare Symptom Checklist & History */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2A5C82]" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                [03] Rare Disease Phenotype & Symptom Checklist
              </h2>
            </div>
            <span className="badge-3d px-3 py-1 text-xs text-[#2A5C82] font-mono font-bold">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {COMMON_RARE_SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  type="button"
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all shadow-sm ${
                    isSelected
                      ? 'btn-3d text-white font-bold'
                      : 'bg-white/80 border-slate-200 text-slate-800 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <span className="text-[11px] leading-tight font-sans">{symptom}</span>
                  <span
                    className={`w-4 h-4 rounded-md border shrink-0 ml-1.5 flex items-center justify-center text-[10px] font-mono ${
                      isSelected ? 'border-white bg-white text-slate-900 font-black' : 'border-slate-400'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
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
              className="flex-1 input-3d p-2.5 text-xs text-slate-900 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomSymptom}
              className="btn-3d px-4 py-2.5 font-mono font-bold text-xs"
            >
              Add Symptom
            </button>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-3 input-3d p-3">
              <input
                type="checkbox"
                id="familyHistory"
                checked={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.checked)}
                className="w-4 h-4 accent-slate-900 rounded"
              />
              <label htmlFor="familyHistory" className="text-slate-800 font-bold cursor-pointer text-xs">
                Family History of Unexplained Consanguinity or Similar Rare Symptoms
              </label>
            </div>

            <div className="flex items-center justify-between input-3d p-3">
              <span className="text-slate-600 font-bold uppercase text-[10px]">Symptom Duration:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={symptomDurationDays}
                  onChange={(e) => setSymptomDurationDays(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-300 rounded p-1 text-center font-mono font-bold text-slate-900 shadow-inner"
                />
                <span className="text-slate-800 font-bold">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="card-3d-dark p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Local TFLite model active • Memory footprint: ~12.4 MB • Zero Cloud Dependency</span>
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full sm:w-auto btn-3d-emerald px-8 py-3.5 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl"
          >
            {isEvaluating ? (
              <>
                <HeartPulse className="w-4 h-4 animate-spin" />
                <span>Running Edge AI Diagnostic Engine...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-teal-300" />
                <span>Execute Local Edge AI Diagnosis & Push to Step 2 →</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
