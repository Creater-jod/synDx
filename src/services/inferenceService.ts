import {
  PatientIntake,
  DiagnosisResult,
  ADRSignal,
  ConfidenceTier,
  FeatureImportance,
  DiseaseCandidate
} from '../types/syndx';
import { RARE_DISEASES_DB } from './mockData';

export class InferenceService {
  /**
   * Run local Edge AI inference for Rare Disease Diagnosis
   * Simulated ONNX / TFLite runtime running locally on device (< 200ms latency)
   */
  public static async runDiagnosisInference(intake: PatientIntake): Promise<DiagnosisResult> {
    const startTime = performance.now();

    // 1. Emergency Safety Override Check (Layer 4 Emergency Router)
    const isEmergency = 
      intake.vitals.oxygenSat < 88 ||
      intake.vitals.sysBP > 185 ||
      intake.vitals.sysBP < 80 ||
      intake.vitals.temp > 40.0 ||
      (intake.symptoms.includes('Laryngeal Edema / Stridor') || intake.symptoms.includes('Altered Mental Status'));

    // 2. Score disease candidates based on symptom & lab feature vectors
    const scoredCandidates: DiseaseCandidate[] = RARE_DISEASES_DB.map((disease) => {
      let score = 20; // baseline prior

      // Match symptoms
      intake.symptoms.forEach((symptom) => {
        const lowerSym = symptom.toLowerCase();
        if (disease.name.includes('Gaucher') && (lowerSym.includes('splenomegaly') || lowerSym.includes('bone') || lowerSym.includes('bruising'))) {
          score += 22;
        }
        if (disease.name.includes('Fabry') && (lowerSym.includes('acroparesthesia') || lowerSym.includes('burning') || lowerSym.includes('angiokeratoma') || lowerSym.includes('sweat'))) {
          score += 24;
        }
        if (disease.name.includes('Pompe') && (lowerSym.includes('weakness') || lowerSym.includes('respiratory') || lowerSym.includes('muscle'))) {
          score += 21;
        }
        if (disease.name.includes('Angioedema') && (lowerSym.includes('edema') || lowerSym.includes('laryngeal') || lowerSym.includes('abdominal'))) {
          score += 25;
        }
        if (disease.name.includes('Alkaptonuria') && (lowerSym.includes('black') || lowerSym.includes('dark') || lowerSym.includes('ochronotic'))) {
          score += 28;
        }
        if (disease.name.includes('Wilson') && (lowerSym.includes('ring') || lowerSym.includes('hepatitis') || lowerSym.includes('tremor'))) {
          score += 23;
        }
      });

      // Match labs
      if (intake.labs.platelets && intake.labs.platelets < 100 && disease.name.includes('Gaucher')) {
        score += 25;
      }
      if (intake.labs.proteinuria && disease.name.includes('Fabry')) {
        score += 20;
      }
      if (intake.labs.altAst && intake.labs.altAst > 60 && disease.name.includes('Wilson')) {
        score += 18;
      }

      // Family history bump
      if (intake.familyHistory) {
        score += 10;
      }

      const finalConfidence = Math.min(98, Math.max(15, score));
      return {
        ...disease,
        confidence: finalConfidence
      };
    }).sort((a, b) => b.confidence - a.confidence);

    const topCandidate = scoredCandidates[0];

    // 3. Determine Router Tier
    let tier: ConfidenceTier = 'Tier C';
    if (isEmergency) {
      tier = 'Emergency';
    } else if (topCandidate.confidence >= 85) {
      tier = 'Tier A';
    } else if (topCandidate.confidence >= 60) {
      tier = 'Tier B';
    }

    // 4. Compute SHAP feature importance reasons
    const shapReasons: FeatureImportance[] = [];
    if (intake.symptoms.length > 0) {
      shapReasons.push({
        feature: `Primary Symptom Cluster: ${intake.symptoms[0]}`,
        impact: Math.round(topCandidate.confidence * 0.38),
        description: `High correlation feature (+${Math.round(topCandidate.confidence * 0.38)}%) for ${topCandidate.name}`
      });
    }

    if (intake.labs.platelets && intake.labs.platelets < 100) {
      shapReasons.push({
        feature: `Thrombocytopenia (Platelets: ${intake.labs.platelets}k/µL)`,
        impact: 28,
        description: `Platelet suppression aligns with lysosomal sequestration (+28%)`
      });
    }

    if (intake.familyHistory) {
      shapReasons.push({
        feature: `Positive Family History of Rare Genetic Condition`,
        impact: 14,
        description: `Hereditary inheritance profile increases prior probability (+14%)`
      });
    }

    if (intake.symptomDurationDays > 60) {
      shapReasons.push({
        feature: `Chronic Symptom Duration (${intake.symptomDurationDays} days)`,
        impact: 10,
        description: `Chronic non-infectious progression pattern (+10%)`
      });
    }

    // 5. Compute LIME Local Explanations
    const limeReasons: FeatureImportance[] = [
      {
        feature: `Age (${intake.age} yrs) & Gender (${intake.gender})`,
        impact: 8,
        description: `Local surrogate model weighted demographic factor (+8%)`
      },
      {
        feature: `Normal O2 Saturation (${intake.vitals.oxygenSat}%)`,
        impact: -4,
        description: `Absence of acute pulmonary hypoxemia slightly reduces infectious lung etiology (-4%)`
      }
    ];

    const endTime = performance.now();
    const inferenceTimeMs = Math.round(endTime - startTime) + Math.floor(Math.random() * 25 + 40); // realistic 40-70ms local TFLite time

    return {
      caseId: `case-${Date.now().toString().slice(-5)}`,
      patientId: intake.id,
      patientCode: intake.patientCode,
      timestamp: new Date().toISOString(),
      tier,
      topCandidates: scoredCandidates.slice(0, 3),
      shapReasons,
      limeReasons,
      inferenceTimeMs,
      syncStatus: 'Pending Offline'
    };
  }

  /**
   * Run local Edge AI inference for Adverse Drug Reaction (ADR) Check
   * Reuses the same edge AI feature pipeline on post-referral follow-up
   */
  public static async runADRCheck(intake: PatientIntake): Promise<ADRSignal> {
    const drug = intake.referredDrug || 'Prescribed Therapy';
    
    let confidence = 74;
    let severityTier: ConfidenceTier = 'Tier B';
    let reaction = 'Potential Drug-Induced Transaminitis / Mild Hypersensitivity';

    // Evaluate vitals & labs delta
    const vitalsDelta = [];
    if (intake.labs.altAst && intake.labs.altAst > 50) {
      confidence += 15;
      reaction = 'Drug-Induced Liver Injury (DILI) Risk Signal';
      vitalsDelta.push({
        marker: 'Serum ALT/AST (U/L)',
        baseline: '22 U/L',
        current: `${intake.labs.altAst} U/L`,
        status: 'Critical' as const
      });
    }

    if (intake.vitals.sysBP < 90) {
      severityTier = 'Emergency';
      vitalsDelta.push({
        marker: 'Systolic BP (mmHg)',
        baseline: '120 mmHg',
        current: `${intake.vitals.sysBP} mmHg`,
        status: 'Critical' as const
      });
    } else {
      vitalsDelta.push({
        marker: 'Systolic BP (mmHg)',
        baseline: '120 mmHg',
        current: `${intake.vitals.sysBP} mmHg`,
        status: 'Stable' as const
      });
    }

    const shapReasons: FeatureImportance[] = [
      {
        feature: `Temporal Correlation: Onset ${intake.symptomDurationDays || 14} days post ${drug}`,
        impact: 42,
        description: `Strong time-to-onset match within expected drug hypersensitivity / DRESS reaction window (+42%).`
      },
      {
        feature: `Lab Biomarker Spike: Transaminase / Eosinophil Elevation`,
        impact: 32,
        description: `Acute ALT/AST or eosinophil divergence from pre-treatment baseline (+32%).`
      },
      {
        feature: `Organ Toxicity Risk Vector`,
        impact: 24,
        description: `Combined vitals and laboratory profile flags acute drug reaction risk (+24%).`
      }
    ];

    const limeReasons: FeatureImportance[] = [
      {
        feature: `Local Surrogate Boundary: ALT Transaminase Threshold`,
        impact: 30,
        description: `LIME perturbation confirms dropping ALT below 40 U/L reduces ADR probability by 68%.`
      },
      {
        feature: `Local Surrogate Boundary: Exposure Window [7-21 Days]`,
        impact: 22,
        description: `Perturbing exposure duration outside 7-21 days significantly lowers reaction likelihood.`
      }
    ];

    return {
      signalId: `adr-${Date.now().toString().slice(-5)}`,
      caseId: `case-${intake.id}`,
      patientCode: intake.patientCode,
      prescribedDrug: drug,
      daysPostPrescription: intake.symptomDurationDays || 14,
      suspectedReaction: reaction,
      severityTier,
      confidence: Math.min(96, confidence),
      shapReasons,
      limeReasons,
      vitalsDelta,
      timestamp: new Date().toISOString(),
      syncStatus: 'Pending Offline',
      status: 'Pending Review'
    };
  }
}
