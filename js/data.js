/**
 * Case Data & API Manager
 * synDx Review Console — UI/UX Pro Max Enhanced
 */

export const initialCases = [
  { 
    id: "CASE-8F3A1C", condition: "Acute Porphyria — crisis pattern", tier: "A", confidence: 88, emergency: true, day: "today", time: "2 min ago", status: "pending", note: "",
    features: [{ label: "Systolic BP deviation", value: 34 }, { label: "Heart rate elevation", value: 28 }, { label: "Abdominal pain severity score", value: 22 }, { label: "Reported neuro symptoms", value: 16 }],
    referral: { name: "City General — Emergency Dept.", distance: "1.8 km", stock: "yes" },
    audit: { case_hash: "8f3a1c9e3b91a7d204", diagnosis_hash: "4b7e02aa68c091f6", model: "syndx-edge-v2.3" } 
  },
  { 
    id: "CASE-2D91EE", condition: "Ehlers-Danlos Syndrome", tier: "A", confidence: 92, emergency: false, day: "today", time: "14 min ago", status: "pending", note: "",
    features: [{ label: "Joint hypermobility score", value: 41 }, { label: "Skin elasticity index", value: 27 }, { label: "Chronic pain duration", value: 19 }, { label: "Family history flag", value: 13 }],
    referral: { name: "District Rheumatology Centre", distance: "4.2 km", stock: "yes" },
    audit: { case_hash: "2d91ee4010b97a3c", diagnosis_hash: "9c1f88de45a10b12", model: "syndx-edge-v2.3" } 
  },
  { 
    id: "CASE-6B0C77", condition: "Wilson's Disease", tier: "B", confidence: 71, emergency: false, day: "today", time: "26 min ago", status: "pending", note: "",
    features: [{ label: "Ceruloplasmin deviation", value: 33 }, { label: "Hepatic enzyme pattern", value: 25 }, { label: "Tremor onset age", value: 21 }, { label: "Kayser-Fleischer indicator", value: 11 }],
    referral: { name: "City Multi-specialty — Hepatology", distance: "7.0 km", stock: "low" },
    audit: { case_hash: "6b0c771239c4f890", diagnosis_hash: "aa73c501980ade44", model: "syndx-edge-v2.2" } 
  },
  { 
    id: "CASE-A417F2", condition: "Marfan Syndrome", tier: "B", confidence: 76, emergency: false, day: "today", time: "41 min ago", status: "confirmed",
    note: "Confirmed per echo report attached; scheduled cardiology follow-up.",
    features: [{ label: "Limb-to-height ratio", value: 30 }, { label: "Lens dislocation flag", value: 24 }, { label: "Aortic root measurement trend", value: 22 }],
    referral: { name: "District Cardiology Unit", distance: "5.4 km", stock: "yes" },
    audit: { case_hash: "a417f28821043c9a", diagnosis_hash: "115e9b0a726177d3", model: "syndx-edge-v2.2" } 
  },
  { 
    id: "CASE-C503B8", condition: "Fabry Disease", tier: "C", confidence: 54, emergency: false, day: "today", time: "1 hr ago", status: "pending", note: "",
    features: [{ label: "Acroparesthesia pattern", value: 19 }, { label: "Angiokeratoma presence", value: 12 }, { label: "Renal marker trend", value: 10 }],
    referral: { name: "Nephrology Referral Pool", distance: "9.1 km", stock: "low" },
    audit: { case_hash: "c503b84519bc6f21", diagnosis_hash: "22b6ff10a824c9e2", model: "syndx-edge-v2.1" } 
  },
  { 
    id: "CASE-F19A0D", condition: "Gaucher Disease", tier: "C", confidence: 48, emergency: false, day: "today", time: "2 hr ago", status: "pending", note: "",
    features: [{ label: "Splenomegaly indicator", value: 17 }, { label: "Bone pain pattern", value: 14 }, { label: "Fatigue score deviation", value: 9 }],
    referral: { name: "Regional Genetics Clinic", distance: "11.6 km", stock: "low" },
    audit: { case_hash: "f19a0d3381a488ab", diagnosis_hash: "5e0c41f7129cb310", model: "syndx-edge-v2.1" } 
  },
  { 
    id: "CASE-11B4D2", condition: "Cystic Fibrosis — atypical presentation", tier: "B", confidence: 68, emergency: false, day: "yesterday", time: "yesterday, 3:12 PM", status: "more-tests",
    note: "Sweat chloride test requested before confirmation.",
    features: [{ label: "Respiratory pattern score", value: 26 }, { label: "Growth curve deviation", value: 20 }, { label: "Family history flag", value: 14 }],
    referral: { name: "Pediatric Pulmonology Unit", distance: "6.3 km", stock: "yes" },
    audit: { case_hash: "11b4d2aa80145e77", diagnosis_hash: "77dd0c1290aef4a1", model: "syndx-edge-v2.1" } 
  },
  { 
    id: "CASE-93AE60", condition: "Hereditary Angioedema", tier: "A", confidence: 85, emergency: true, day: "yesterday", time: "yesterday, 11:04 AM", status: "confirmed",
    note: "C1-inhibitor confirmed low; started prophylaxis.",
    features: [{ label: "Airway swelling episodes", value: 32 }, { label: "Family history flag", value: 24 }, { label: "Trigger pattern match", value: 18 }],
    referral: { name: "City General — Emergency Dept.", distance: "1.8 km", stock: "yes" },
    audit: { case_hash: "93ae60710a3922bc", diagnosis_hash: "88f10a3e5122dd90", model: "syndx-edge-v2.2" } 
  },
  { 
    id: "CASE-D027F5", condition: "Pompe Disease", tier: "C", confidence: 51, emergency: false, day: "yesterday", time: "yesterday, 9:47 AM", status: "overridden",
    note: "Clinical picture inconsistent with model output; referred for muscle biopsy instead.",
    features: [{ label: "Muscle weakness pattern", value: 15 }, { label: "Respiratory involvement score", value: 12 }, { label: "CK enzyme deviation", value: 9 }],
    referral: { name: "Regional Genetics Clinic", distance: "11.6 km", stock: "low" },
    audit: { case_hash: "d027f51280fa6a3d", diagnosis_hash: "330bcd44018e19ef", model: "syndx-edge-v2.0" } 
  },
  { 
    id: "CASE-77CE19", condition: "Alkaptonuria", tier: "B", confidence: 73, emergency: false, day: "yesterday", time: "yesterday, 8:15 AM", status: "pending", note: "",
    features: [{ label: "Urine darkening pattern", value: 24 }, { label: "Joint stiffness onset age", value: 19 }, { label: "Cartilage pigmentation flag", value: 13 }],
    referral: { name: "District Rheumatology Centre", distance: "4.2 km", stock: "yes" },
    audit: { case_hash: "77ce19904bb6b642", diagnosis_hash: "e4f6a21820497c05", model: "syndx-edge-v2.0" } 
  }
];

let currentCases = [...initialCases];
const decisionHistory = [];

export async function fetchCases() {
  try {
    const res = await fetch('/api/cases');
    if (res.ok) {
      currentCases = await res.json();
    }
  } catch (err) {
    console.log('Using in-memory case data (standalone mode)');
  }
  return currentCases;
}

export function getCasesSync() {
  return currentCases;
}

export async function updateCaseDecision(id, status, note) {
  const targetCase = currentCases.find(c => c.id === id);
  if (!targetCase) return null;

  // Save previous state for Undo
  const previousState = {
    id: targetCase.id,
    status: targetCase.status,
    note: targetCase.note
  };
  decisionHistory.push(previousState);

  targetCase.status = status;
  targetCase.note = note;

  try {
    await fetch(`/api/cases/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
  } catch (err) {
    // Fallback in-memory update
  }

  return { targetCase, previousState };
}

export async function revertLastDecision(id) {
  const historyIdx = decisionHistory.findLastIndex(h => h.id === id);
  if (historyIdx === -1) return null;

  const previousState = decisionHistory[historyIdx];
  decisionHistory.splice(historyIdx, 1);

  const targetCase = currentCases.find(c => c.id === id);
  if (!targetCase) return null;

  targetCase.status = previousState.status;
  targetCase.note = previousState.note;

  try {
    await fetch(`/api/cases/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: previousState.status, note: previousState.note })
    });
  } catch (err) {
    // Local update fallback
  }

  return targetCase;
}

export const tierLabel = t => t === "A" ? "high confidence" : t === "B" ? "medium confidence" : "low confidence";
export const statusLabel = s => ({
  pending: "pending review",
  confirmed: "confirmed",
  overridden: "overridden",
  "more-tests": "more tests"
}[s] || s);
