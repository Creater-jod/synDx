import {
  DiseaseCandidate,
  ReferralFacility,
  DoctorCaseReview,
  AuditBlock,
  FLRoundState,
  PatientIntake
} from '../types/syndx';
import { DR_RATHIESH_PFP_DATA_URL } from '../assets/drRathieshPhoto';

export const RARE_DISEASES_DB: DiseaseCandidate[] = [
  {
    id: 'rd-01',
    name: 'Gaucher Disease (Type 1)',
    category: 'Lysosomal Storage Disorder',
    confidence: 91,
    icdCode: 'E75.22',
    orphaCode: 'ORPHA:355',
    description: 'Glucocerebrosidase enzyme deficiency leading to sphingolipid accumulation in macrophages. Presents with hepatosplenomegaly, thrombocytopenia, and bone pain.',
    keyMarkers: ['Thrombocytopenia (<100k)', 'Splenomegaly', 'Bone Crisis Pain', 'Anemia', 'Glucosylceramide accumulation']
  },
  {
    id: 'rd-02',
    name: 'Fabry Disease',
    category: 'X-Linked Sphingolipidosis',
    confidence: 84,
    icdCode: 'E75.21',
    orphaCode: 'ORPHA:324',
    description: 'Alpha-galactosidase A deficiency causing globotriaosylceramide accumulation in vascular endothelium. Causes acroparesthesias, angiokeratomas, hypohidrosis, and early renal involvement.',
    keyMarkers: ['Burning extremity pain (Acroparesthesia)', 'Angiokeratomas', 'Proteinuria', 'Unexplained Heat Intolerance', 'Cornea verticillata']
  },
  {
    id: 'rd-03',
    name: 'Pompe Disease (Infantile/Late-Onset)',
    category: 'Glycogen Storage Disorder II',
    confidence: 78,
    icdCode: 'E74.02',
    orphaCode: 'ORPHA:365',
    description: 'Acid alpha-glucosidase (GAA) deficiency leading to glycogen buildup in muscle tissues, causing progressive proximal muscle weakness and respiratory distress.',
    keyMarkers: ['Proximal muscle weakness', 'Elevated Serum CK', 'Respiratory effort failure', 'Cardiomegaly']
  },
  {
    id: 'rd-04',
    name: 'Hereditary Angioedema (HAE Type I/II)',
    category: 'Complement Cascade Disorder',
    confidence: 72,
    icdCode: 'D84.1',
    orphaCode: 'ORPHA:91378',
    description: 'C1 esterase inhibitor deficiency causing unprovoked bradykinin-mediated recurrent non-pruritic subcutaneous and submucosal edema without urticaria.',
    keyMarkers: ['Recurrent facial/laryngeal edema', 'Abdominal pain attacks', 'C1-INH low level', 'Absence of hives/urticaria']
  },
  {
    id: 'rd-05',
    name: 'Alkaptonuria (Ochronosis)',
    category: 'Tyrosine Metabolism Disorder',
    confidence: 68,
    icdCode: 'E70.2',
    orphaCode: 'ORPHA:56',
    description: 'Homogentisate 1,2-dioxygenase deficiency causing homogentisic acid buildup, darkening of urine upon standing, ochronotic pigmentation, and early osteoarthropathy.',
    keyMarkers: ['Urine turns black on standing', 'Ochronotic ear cartilage pigmentation', 'Early onset spinal stiffness']
  },
  {
    id: 'rd-06',
    name: 'Wilson Disease',
    category: 'Copper Transport Disorder',
    confidence: 65,
    icdCode: 'E83.01',
    orphaCode: 'ORPHA:905',
    description: 'ATP7B gene mutation impairing hepatic copper excretion, causing toxic copper accumulation in liver, brain, and cornea.',
    keyMarkers: ['Kayser-Fleischer rings', 'Low Serum Ceruloplasmin', 'Unexplained hepatitis/cirrhosis', 'Tremor/Dystonia']
  }
];

export const REFERRAL_FACILITIES: ReferralFacility[] = [
  {
    id: 'fac-01',
    name: 'Coimbatore Medical College Hospital (CMCH)',
    distanceKm: 34,
    type: 'Tertiary Medical College',
    lat: 11.0028,
    lng: 76.9634,
    districtNode: 'Coimbatore Metro North Node',
    roadType: 'Paved Highway (NH-83)',
    emergencyPhone: '+91 422 230 1393',
    ambulanceHelpline: '108 (CMCH ER Express Dispatch)',
    contactPhone: '+91 422 230 1393',
    icuBeds: 24,
    has24x7Emergency: true,
    travelTimeMinutes: { ambulance: 28, car: 42, bus: 65 },
    offlineWaypoints: [
      'Depart Vedapatti Rural PHC (Node 0.0 km)',
      'Merge onto Perur Main Road (4.2 km)',
      'Take NH-83 Expressway Bypass (18.5 km)',
      'Arrive CMCH ER Trauma Block, Trichy Road (34.0 km)'
    ],
    specialistsAvailable: [
      'Dr. Rathiesh, MD, FECSM (Sex Educator & Sexual Health Specialist)',
      'Dr. Mounish V, MD (Rare Hematology & Lysosomal Disorders)',
      'Dr. Terrance Adrian, MD (Gay Health & LGBTQ+ Specialist)'
    ],
    specialistDetails: [
      {
        name: 'Dr. Rathiesh, MD, FECSM',
        role: 'Sex Educator & Sexual Health Specialist',
        avatar: DR_RATHIESH_PFP_DATA_URL,
        phone: '+91 94421 99001',
        slot: 'Today, 2:30 PM',
        badges: ['MBBS', 'MD', 'FECSM', 'Sex Educator', 'Sexual Health Specialist']
      },
      {
        name: 'Dr. Mounish V, MD',
        role: 'Rare Hematology & Lysosomal Disorders Specialist',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        phone: '+91 98422 10982',
        slot: 'Today, 3:30 PM',
        badges: ['MBBS', 'MD Hematology', 'Lysosomal Care']
      },
      {
        name: 'Dr. Terrance Adrian, MD',
        role: 'Gay Health & LGBTQ+ Specialist',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        phone: '+91 94431 88201',
        slot: 'Tomorrow, 10:00 AM',
        badges: ['MBBS', 'MD', 'LGBTQ+ Care']
      }
    ],
    bedAvailability: 14,
    drugStockStatus: [
      { drugName: 'Imiglucerase (ERTI)', status: 'In Stock' },
      { drugName: 'Agalsidase Beta', status: 'In Stock' },
      { drugName: 'C1-INH Concentrate', status: 'Low Stock' },
      { drugName: 'Eculizumab', status: 'Out of Stock' }
    ],
    nextAvailableSlot: 'Today, 2:30 PM'
  },
  {
    id: 'fac-02',
    name: 'Central Health & Research Centre - Vedapatti',
    distanceKm: 18,
    type: 'Specialty Rare Disease Hub',
    lat: 10.9850,
    lng: 76.9120,
    districtNode: 'Vedapatti West Sector Node',
    roadType: 'Suburban Arterial',
    emergencyPhone: '+91 422 257 0170',
    ambulanceHelpline: '+91 98422 00108',
    contactPhone: '+91 422 257 0170',
    icuBeds: 12,
    has24x7Emergency: true,
    travelTimeMinutes: { ambulance: 16, car: 22, bus: 35 },
    offlineWaypoints: [
      'Depart Vedapatti Rural PHC (0.0 km)',
      'Head West on Sundapalayam Link Road (5.1 km)',
      'Arrive Central Health Hub Gate 2 (18.0 km)'
    ],
    specialistsAvailable: [
      'Dr. Vance, MS, MCh (Neuromuscular & Metabolic Medicine)',
      'Dr. Thorne, MD (Immunology & Rheumatology)'
    ],
    bedAvailability: 8,
    drugStockStatus: [
      { drugName: 'Imiglucerase (ERTI)', status: 'In Stock' },
      { drugName: 'Agalsidase Beta', status: 'In Stock' },
      { drugName: 'C1-INH Concentrate', status: 'In Stock' }
    ],
    nextAvailableSlot: 'Today, 4:00 PM'
  },
  {
    id: 'fac-03',
    name: 'Pollachi Government District Headquarter Hospital',
    distanceKm: 12,
    type: 'District Hospital',
    lat: 10.6608,
    lng: 77.0089,
    districtNode: 'Pollachi South District HQ',
    roadType: 'Paved Highway (NH-83)',
    emergencyPhone: '+91 4259 223 344',
    ambulanceHelpline: '+91 4259 10800',
    contactPhone: '+91 4259 223 344',
    icuBeds: 18,
    has24x7Emergency: true,
    travelTimeMinutes: { ambulance: 11, car: 15, bus: 25 },
    offlineWaypoints: [
      'Depart Vedapatti PHC (0.0 km)',
      'Take Pollachi Main Bypass Road (7.8 km)',
      'Arrive Pollachi District HQ ER Wing (12.0 km)'
    ],
    specialistsAvailable: [
      'Dr. Jayawanth J, MBBS, DNB (Tele-Genetics & Node Officer)'
    ],
    bedAvailability: 22,
    drugStockStatus: [
      { drugName: 'Imiglucerase (ERTI)', status: 'Low Stock' },
      { drugName: 'C1-INH Concentrate', status: 'Out of Stock' }
    ],
    nextAvailableSlot: 'Tomorrow, 9:30 AM'
  },
  {
    id: 'fac-04',
    name: 'Kovai Apex Specialty Hospital & Inclusive Care Centre',
    distanceKm: 22,
    type: 'Specialty Rare Disease Hub',
    lat: 11.0180,
    lng: 76.9550,
    districtNode: 'Kovai East Medical Corridor',
    roadType: 'Suburban Arterial',
    emergencyPhone: '+91 422 268 9000',
    ambulanceHelpline: '+91 422 268 9108',
    contactPhone: '+91 422 268 9000',
    icuBeds: 16,
    has24x7Emergency: true,
    travelTimeMinutes: { ambulance: 19, car: 26, bus: 40 },
    offlineWaypoints: [
      'Depart Vedapatti PHC (0.0 km)',
      'Proceed on Thondamuthur Road East (12.0 km)',
      'Turn Right at Apex Square to Kovai ER (22.0 km)'
    ],
    specialistsAvailable: [
      'Dr. Shailesh, MS (Proctology & Piles Specialist)',
      'Dr. Dhaanu Varshan, MD, DNB (Transgender Care & Gender Affirming Specialist)',
      'Dr. Sudarshan Kumar, MS, DO (Ophthalmology & Ocular Care Specialist)'
    ],
    bedAvailability: 16,
    drugStockStatus: [
      { drugName: 'Imiglucerase (ERTI)', status: 'In Stock' },
      { drugName: 'Agalsidase Beta', status: 'In Stock' },
      { drugName: 'C1-INH Concentrate', status: 'In Stock' }
    ],
    nextAvailableSlot: 'Today, 3:15 PM'
  },
  {
    id: 'fac-05',
    name: 'Anaimalai Tribal & Rural Primary Health Center',
    distanceKm: 28,
    type: 'Rural Primary Health Center',
    lat: 10.5820,
    lng: 76.9320,
    districtNode: 'Anamalai Foothills Sector',
    roadType: 'Hilly Forest Route',
    emergencyPhone: '+91 4253 288 112',
    ambulanceHelpline: '108 (4x4 Off-Road Tribal Ambulance)',
    contactPhone: '+91 4253 288 112',
    icuBeds: 4,
    has24x7Emergency: true,
    travelTimeMinutes: { ambulance: 35, car: 45, bus: 75 },
    offlineWaypoints: [
      'Depart Vedapatti PHC (0.0 km)',
      'Southbound on SH-78 Anamalai Highway (18.0 km)',
      'Follow Tribal Forest Post Marker 4 (28.0 km)'
    ],
    specialistsAvailable: [
      'Dr. K. Arumugam, MBBS (Rural Emergency & Snakebite Care)'
    ],
    bedAvailability: 6,
    drugStockStatus: [
      { drugName: 'C1-INH Concentrate', status: 'In Stock' },
      { drugName: 'Antivenom Polyvalent', status: 'In Stock' }
    ],
    nextAvailableSlot: 'Today, 1:00 PM'
  }
];

export const INITIAL_AUDIT_BLOCKS: AuditBlock[] = [
  {
    blockNumber: 1048291,
    txHash: '0x8f3a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2',
    caseHash: '0xa412bc7819ef381d63914a2b10931d8e72fa',
    recordType: 'Diagnosis Record',
    clinicId: 'PHC-VALPARAI-01',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    polygonGasUsed: 0.0021,
    verified: true
  },
  {
    blockNumber: 1048292,
    txHash: '0x1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4',
    caseHash: '0xb523cd8920fa492e74025b3c21042e9f83ab',
    recordType: 'ADR Signal',
    clinicId: 'PHC-ANAMALAI-02',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    polygonGasUsed: 0.0019,
    verified: true
  },
  {
    blockNumber: 1048293,
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    caseHash: '0xc634de9031fb503f85136c4d32153fa094bc',
    recordType: 'Referral Authorization',
    clinicId: 'PHC-VALPARAI-01',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    polygonGasUsed: 0.0024,
    verified: true
  }
];

export const INITIAL_FL_ROUNDS: FLRoundState = {
  roundNumber: 14,
  globalAccuracy: 93.8,
  loss: 0.142,
  participatingClinics: 4,
  privacyBudgetEpsilon: 0.72,
  timestamp: new Date().toISOString(),
  nodes: [
    { clinicId: 'PHC-VALPARAI-01', name: 'Valparai Tribal PHC', location: 'Anamalai Hills', localCasesCount: 42, status: 'Active Training', lastGradNorm: 0.024 },
    { clinicId: 'PHC-ANAMALAI-02', name: 'Anamalai Rural Health Post', location: 'Pollachi South', localCasesCount: 38, status: 'Active Training', lastGradNorm: 0.019 },
    { clinicId: 'PHC-METTUPALAYAM-03', name: 'Mettupalayam Foothills PHC', location: 'Nilgiri Base', localCasesCount: 51, status: 'Aggregating', lastGradNorm: 0.031 },
    { clinicId: 'PHC-KARAMADAI-04', name: 'Karamadai Community Health Center', location: 'Coimbatore North', localCasesCount: 29, status: 'Idle', lastGradNorm: 0.015 }
  ]
};

export const MOCK_PATIENT_SAMPLES: PatientIntake[] = [
  {
    id: 'case-101',
    patientCode: 'PAT-VLP-8821',
    age: 28,
    gender: 'Female',
    clinicId: 'PHC-VALPARAI-01',
    clinicName: 'Valparai Tribal PHC',
    healthWorkerName: 'Health Worker Mounish V',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    vitals: { heartRate: 84, sysBP: 118, diaBP: 76, oxygenSat: 98, temp: 36.8, respRate: 16 },
    labs: { platelets: 82, altAst: 42, serumCreatinine: 0.9, wbc: 4.8, hemoglobin: 10.2 },
    symptoms: ['Hepatosplenomegaly', 'Severe Bone Pain (Bones/Joints)', 'Persistent Fatigue', 'Easy Bruising / Petechiae'],
    medications: ['Iron Supplement', 'Paracetamol'],
    familyHistory: true,
    symptomDurationDays: 120,
    notes: 'Patient reports severe deep bone aching in knees and hips. Palpable spleen 4cm below costal margin.'
  },
  {
    id: 'case-102',
    patientCode: 'PAT-ANM-4412',
    age: 34,
    gender: 'Male',
    clinicId: 'PHC-ANAMALAI-02',
    clinicName: 'Anamalai Rural Health Post',
    healthWorkerName: 'Health Worker Nikil Vardhan',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    vitals: { heartRate: 92, sysBP: 142, diaBP: 88, oxygenSat: 97, temp: 37.1, respRate: 18 },
    labs: { proteinuria: true, serumCreatinine: 1.8, altAst: 68 },
    symptoms: ['Acroparesthesia (Burning sensation in palms & soles)', 'Dark reddish skin spots (Angiokeratomas)', 'Hypohidrosis (Inability to sweat in heat)', 'Proteinuria'],
    medications: ['Imiglucerase ERT (2 weeks post-start)', 'ACE Inhibitor'],
    familyHistory: true,
    symptomDurationDays: 240,
    isFollowUp: true,
    referredDrug: 'Imiglucerase ERT',
    notes: 'Follow-up check 14 days after referral therapy start. Patient reports ALT elevation and facial flush.'
  }
];

export const MOCK_DOCTOR_CASES: DoctorCaseReview[] = [
  {
    id: 'doc-rev-01',
    caseId: 'case-101',
    type: 'Diagnosis',
    patientCode: 'PAT-VLP-8821',
    clinicName: 'Valparai Tribal PHC',
    date: 'Today, 10:15 AM',
    tier: 'Tier A',
    summary: 'High risk match for Gaucher Disease Type 1 (Confidence 91%). Platelets 82k, Splenomegaly, Bone Crises.',
    details: {
      caseId: 'case-101',
      patientId: 'PAT-VLP-8821',
      patientCode: 'PAT-VLP-8821',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      tier: 'Tier A',
      topCandidates: RARE_DISEASES_DB.slice(0, 3),
      shapReasons: [
        { feature: 'Thrombocytopenia (Platelets 82k)', impact: 34, description: 'Platelet count significantly below normal threshold increases Gaucher probability by +34%' },
        { feature: 'Palpable Splenomegaly', impact: 28, description: 'Spleen enlargement is a primary hallmark feature of Gaucher lysosomal storage (+28%)' },
        { feature: 'Deep Bone Pain Crises', impact: 21, description: 'Aseptic bone necrosis and severe skeletal pain aligns with Type 1 (+21%)' },
        { feature: 'Symptom Duration > 90 Days', impact: 8, description: 'Chronic progression without acute infection (+8%)' }
      ],
      limeReasons: [
        { feature: 'Age = 28 years', impact: 12, description: 'Adult onset presentation matches Type 1 Gaucher profile (+12%)' },
        { feature: 'Normal O2 Saturation (98%)', impact: -3, description: 'Rules out primary pulmonary hypoxemia (-3%)' }
      ],
      inferenceTimeMs: 142,
      blockchainTxHash: '0x8f3a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2',
      syncStatus: 'Synced'
    },
    status: 'Pending Review',
    blockchainTxHash: '0x8f3a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2'
  },
  {
    id: 'doc-rev-02',
    caseId: 'case-102',
    type: 'ADR Alert',
    patientCode: 'PAT-ANM-4412',
    clinicName: 'Anamalai Rural Health Post',
    date: 'Today, 08:30 AM',
    tier: 'Tier B',
    summary: 'ADR Warning: Onset of ALT/AST elevation (68 U/L) + Eosinophilia 14 days post Imiglucerase ERT.',
    details: {
      signalId: 'adr-201',
      caseId: 'case-102',
      patientCode: 'PAT-ANM-4412',
      prescribedDrug: 'Imiglucerase ERT',
      daysPostPrescription: 14,
      suspectedReaction: 'Mild Hypersensitivity & Transient Hepatic Transaminitis',
      severityTier: 'Tier B',
      confidence: 76,
      shapReasons: [
        { feature: 'ALT elevation from 22 to 68 U/L', impact: 38, description: '3x baseline ALT jump within 14 days post drug start (+38% ADR confidence)' },
        { feature: 'New-onset Facial Flush & Mild Pruritus', impact: 26, description: 'Infusion-related hypersensitivity cluster (+26%)' }
      ],
      vitalsDelta: [
        { marker: 'ALT Serum (U/L)', baseline: '22 U/L', current: '68 U/L', status: 'Elevated' },
        { marker: 'Systolic BP (mmHg)', baseline: '118 mmHg', current: '142 mmHg', status: 'Elevated' },
        { marker: 'O2 Saturation (%)', baseline: '98%', current: '97%', status: 'Stable' }
      ],
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      syncStatus: 'Synced',
      status: 'Pending Review'
    },
    status: 'Pending Review',
    blockchainTxHash: '0x1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4'
  }
];
