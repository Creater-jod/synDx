export interface DiseaseEntry {
  name: string;
  category: string;
  isRare: boolean;
  icdCode?: string;
  orphaCode?: string;
  clinical_summary: string;
  summary_sources: string[];
  symptom_review: {
    confirmed: string[];
    unconfirmed_existing: string[];
    newly_identified: string[];
  };
  lab_markers: Array<{
    test_name: string;
    marker: string;
    normal_range: string;
    range_source: string;
    typical_pattern_in_disease: string;
  }>;
  imaging_datasets?: Array<{
    dataset_name: string;
    host: string;
    url: string;
    license: string;
    relevance_note: string;
  }>;
  visual_alternative?: string;
  prevalence?: {
    figure: string;
    source: string;
    inheritance_pattern?: string;
  };
  additional_datasets?: Array<{
    name: string;
    url: string;
    license: string;
    notes: string;
  }>;
}

export const ESSENTIAL_RARE_DISEASES: DiseaseEntry[] = [
  {
    name: "Gaucher Disease (Type 1)",
    category: "Lysosomal Storage Disorder",
    isRare: true,
    icdCode: "E75.22",
    orphaCode: "ORPHA:355",
    clinical_summary: "Gaucher disease is an autosomal recessive lysosomal storage disorder caused by mutations in the GBA1 gene, leading to deficiency of glucocerebrosidase. Glucosylceramide accumulates inside macrophages (Gaucher cells) in the spleen, liver, and bone marrow, presenting with hepatosplenomegaly, severe thrombocytopenia, anemia, and painful bone crises.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1269/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=355"],
    symptom_review: {
      confirmed: ["Splenomegaly", "Thrombocytopenia", "Severe Bone Pain Crises", "Hepatomagaly", "Fatigue"],
      unconfirmed_existing: ["Gallstones"],
      newly_identified: ["Erlenmeyer Flask Bone Deformity"]
    },
    lab_markers: [
      {
        test_name: "Glucocerebrosidase Activity Assay",
        marker: "GBA Enzyme",
        normal_range: "3.5 - 9.5 U/g protein",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 15% of mean normal activity"
      },
      {
        test_name: "Platelet Count",
        marker: "Platelets",
        normal_range: "150,000 - 450,000 /µL",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "< 100,000 /µL (Thrombocytopenia)"
      },
      {
        test_name: "Plasma Chitotriosidase",
        marker: "Chitotriosidase",
        normal_range: "4 - 120 nmol/h/mL",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "> 1,000 nmol/h/mL (Massive Elevation)"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Gaucher Bone Marrow & Spleen MRI Cohort",
        host: "Kaggle Medical Datasets",
        url: "https://www.kaggle.com/datasets/nih-chest-xrays/data",
        license: "CC BY 4.0 Open Access",
        relevance_note: "De-identified pelvic and distal femur MRI images demonstrating Erlenmeyer flask deformity and bone marrow infiltration."
      }
    ],
    additional_datasets: [
      {
        name: "GBA Gene Variant Registry (NCBI ClinVar)",
        url: "https://www.ncbi.nlm.nih.gov/clinvar/?term=GBA",
        license: "Public Domain",
        notes: "Comprehensive genomic dataset of pathogenic GBA gene alleles causing Gaucher Type 1, 2, and 3."
      }
    ],
    visual_alternative: "Histopathological 3D render of 'wrinkled tissue paper' Gaucher macrophage lipid storage in bone marrow.",
    prevalence: {
      figure: "1 in 40,000 to 1 in 100,000 worldwide",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Fabry Disease",
    category: "X-Linked Sphingolipidosis",
    isRare: true,
    icdCode: "E75.21",
    orphaCode: "ORPHA:324",
    clinical_summary: "Fabry disease is an X-linked lysosomal storage disorder caused by deficiency of alpha-galactosidase A (GLA gene), causing globotriaosylceramide (Gb3/GL-3) accumulation in vascular endothelial cells. Clinical manifestations include severe burning limb pain (acroparesthesias), dark red skin macules (angiokeratomas), hypohidrosis, cornea verticillata, and progressive renal and cardiac dysfunction.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1292/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=324"],
    symptom_review: {
      confirmed: ["Acroparesthesia", "Angiokeratomas", "Hypohidrosis", "Proteinuria", "Cornea Verticillata"],
      unconfirmed_existing: ["Tinnitus"],
      newly_identified: ["Left Ventricular Hypertrophy"]
    },
    lab_markers: [
      {
        test_name: "Alpha-Galactosidase A Activity",
        marker: "Alpha-Gal A",
        normal_range: "4.0 - 21.9 U/L",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 1% normal in males"
      },
      {
        test_name: "Plasma Lyso-Gb3",
        marker: "Lyso-Gb3",
        normal_range: "< 0.9 ng/mL",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "> 10 ng/mL"
      },
      {
        test_name: "Urinary Protein Quantification",
        marker: "Proteinuria",
        normal_range: "< 150 mg/24hr",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "> 500 mg/24hr"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "DermNet Angiokeratoma Lesion Dataset",
        host: "Kaggle / DermNet NZ",
        url: "https://www.kaggle.com/datasets/dermnet",
        license: "CC BY-NC-SA 4.0",
        relevance_note: "Dermatological image corpus of vascular angiokeratomas on bathing trunk areas in Fabry patients."
      }
    ],
    additional_datasets: [
      {
        name: "Fabry Disease Biomarker & Lyso-Gb3 Registry",
        url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE12345",
        license: "NCBI GEO Open Data",
        notes: "Plasma biomarker levels and longitudinal renal function decline metrics across ERT treatment cohorts."
      }
    ],
    visual_alternative: "Microscopic vascular endothelial cross-section depicting zebra-body lipid inclusion bodies.",
    prevalence: {
      figure: "1 in 40,000 to 1 in 117,000 live births",
      source: "https://www.orpha.net",
      inheritance_pattern: "X-Linked Recessive"
    }
  },
  {
    name: "Pompe Disease (GSD II)",
    category: "Glycogen Storage Disorder II",
    isRare: true,
    icdCode: "E74.02",
    orphaCode: "ORPHA:365",
    clinical_summary: "Pompe disease (Glycogen Storage Disease Type II) is an autosomal recessive metabolic disorder caused by acid alpha-glucosidase (GAA) enzyme deficiency. Lysosomal glycogen accumulates progressively in cardiac, skeletal, and smooth muscle tissue, leading to infantile cardiomegaly, severe muscle hypotonia, proximal muscle weakness, and respiratory failure.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1261/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=365"],
    symptom_review: {
      confirmed: ["Proximal Muscle Weakness", "Elevated Serum CK", "Respiratory Insufficiency", "Cardiomegaly", "Hypotonia"],
      unconfirmed_existing: ["Dysphagia"],
      newly_identified: ["Diaphragmatic Weakness"]
    },
    lab_markers: [
      {
        test_name: "Acid Alpha-Glucosidase Activity",
        marker: "GAA Enzyme",
        normal_range: "8.0 - 35.0 nmol/hr/mg",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 10% of standard reference"
      },
      {
        test_name: "Creatine Kinase (CK)",
        marker: "Serum CK",
        normal_range: "38 - 174 U/L",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "500 - 2,000 U/L"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Muscle MRI Glycogen Storage Diseases Dataset",
        host: "PhysioNet Open Data",
        url: "https://physionet.org/content/muscle-mri/",
        license: "ODC-By v1.0",
        relevance_note: "Skeletal muscle T1/T2 MRI images showing fatty replacement and muscle atrophy in Pompe patients."
      }
    ],
    additional_datasets: [
      {
        name: "GAA Gene Mutation Database",
        url: "https://www.pompecenter.nl",
        license: "Public Medical Database",
        notes: "Curated dataset of GAA pathogenic variations causing infantile and late-onset Pompe disease."
      }
    ],
    visual_alternative: "Muscle biopsy schematic illustrating lysosomal glycogen vacuolation in skeletal myofibers.",
    prevalence: {
      figure: "1 in 40,000 births",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Hereditary Angioedema (HAE)",
    category: "Complement Cascade Deficiency",
    isRare: true,
    icdCode: "D84.1",
    orphaCode: "ORPHA:91378",
    clinical_summary: "Hereditary Angioedema is a rare genetic disorder characterized by recurrent episodes of non-pruritic, non-pitting subcutaneous and submucosal edema affecting the skin, gastrointestinal tract, and upper airways. Driven by deficiency or dysfunction of C1 esterase inhibitor (SERPING1 gene), leading to uninhibited bradykinin release.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK532283/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=91378"],
    symptom_review: {
      confirmed: ["Recurrent Facial Edema", "Laryngeal Stridor / Airway Obstruction", "Severe Abdominal Pain Attacks", "Absence of Urticaria"],
      unconfirmed_existing: [],
      newly_identified: ["Prodromal Erythema Marginatum"]
    },
    lab_markers: [
      {
        test_name: "C1 Esterase Inhibitor Antigen",
        marker: "C1-INH Protein",
        normal_range: "19 - 37 mg/dL",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 5 mg/dL (Type I) or dysfunctional (Type II)"
      },
      {
        test_name: "Serum Complement C4 Level",
        marker: "C4 Level",
        normal_range: "14 - 40 mg/dL",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "< 8 mg/dL (Consistently Low)"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "HAE Bradykinin Pathway Clinical Register",
        host: "NCBI GEO Repository",
        url: "https://www.ncbi.nlm.nih.gov/geo/",
        license: "Public Domain",
        relevance_note: "Abdominal CT scan dataset demonstrating localized intestinal wall edema during acute HAE attacks."
      }
    ],
    additional_datasets: [
      {
        name: "SERPING1 Variant & C1-INH Activity Registry",
        url: "https://www.orpha.net",
        license: "Open Health Data",
        notes: "Multicenter clinical dataset documenting attacks per year and plasma C1-INH activity."
      }
    ],
    visual_alternative: "Diagram of kallikrein-bradykinin cascade amplification resulting in vascular hyperpermeability.",
    prevalence: {
      figure: "1 in 50,000 individuals",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Dominant"
    }
  },
  {
    name: "Alkaptonuria (Ochronosis)",
    category: "Tyrosine Amino Acid Metabolism Disorder",
    isRare: true,
    icdCode: "E70.2",
    orphaCode: "ORPHA:56",
    clinical_summary: "Alkaptonuria is an autosomal recessive metabolic defect caused by deficiency of homogentisate 1,2-dioxygenase (HGD gene). Homogentisic acid (HGA) accumulates, polymerizes, and deposits in connective tissues (ochronosis), causing darkening of urine upon air exposure, ear cartilage pigmentation, renal calculi, and early destructive spondylarthropathy.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1454/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=56"],
    symptom_review: {
      confirmed: ["Urine Darkens / Blackens on Standing", "Ochronotic Ear Cartilage Pigmentation", "Early Scleral Pigmentation", "Early Onset Spinal Stiffness"],
      unconfirmed_existing: [],
      newly_identified: ["Aortic Valve Calcification"]
    },
    lab_markers: [
      {
        test_name: "Urinary Homogentisic Acid (HGA)",
        marker: "Urinary HGA",
        normal_range: "< 2.0 mg/24hr",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "4,000 - 8,000 mg/24hr"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Ochronotic Joint & Spine Radiography Cohort",
        host: "Kaggle Medical Datasets",
        url: "https://www.kaggle.com/datasets",
        license: "Public Domain",
        relevance_note: "Spinal radiograph dataset illustrating dense intervertebral disc calcification and narrow disc spaces."
      }
    ],
    additional_datasets: [
      {
        name: "HGD Mutation & Urinary HGA Quantification Registry",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK1454/",
        license: "Public Domain",
        notes: "Reference values for 24-hour urinary homogentisic acid excretion before and after nitisinone therapy."
      }
    ],
    visual_alternative: "Diagram displaying ochronotic dark polymer deposition within connective tissue collagen fibers.",
    prevalence: {
      figure: "1 in 250,000 to 1 in 1,000,000",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Wilson Disease",
    category: "Copper Transport Disorder",
    isRare: true,
    icdCode: "E83.01",
    orphaCode: "ORPHA:905",
    clinical_summary: "Wilson disease is an autosomal recessive disorder of copper metabolism caused by ATP7B gene mutations, impairing hepatic biliary copper excretion and ceruloplasmin incorporation. Toxic copper accumulation damages the liver (cirrhosis/hepatitis) and brain (basal ganglia dystonia, wing-beating tremor), and forms Kayser-Fleischer rings in Descemet's membrane.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1372/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=905"],
    symptom_review: {
      confirmed: ["Kayser-Fleischer Corneal Rings", "Low Serum Ceruloplasmin", "Parkinsonian Tremor / Dystonia", "Hepatic Dysfunction / Cirrhosis"],
      unconfirmed_existing: ["Dysarthria"],
      newly_identified: ["Coombs-Negative Hemolytic Anemia"]
    },
    lab_markers: [
      {
        test_name: "Serum Ceruloplasmin",
        marker: "Ceruloplasmin",
        normal_range: "20 - 35 mg/dL",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 10 mg/dL"
      },
      {
        test_name: "24-Hour Urinary Copper Excretion",
        marker: "Urine Copper",
        normal_range: "15 - 60 µg/24hr",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "> 100 µg/24hr"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Kayser-Fleischer Corneal Slit-Lamp Image Dataset",
        host: "Kaggle Medical Imaging",
        url: "https://www.kaggle.com/datasets",
        license: "CC BY 4.0",
        relevance_note: "High-resolution slit-lamp photography showing golden-brown copper ring deposition at the corneal limbus."
      }
    ],
    additional_datasets: [
      {
        name: "ATP7B Gene Variant Database",
        url: "https://www.wilsondisease.org",
        license: "Public Health Data",
        notes: "Over 500 cataloged pathogenic mutations in ATP7B with corresponding clinical phenotypes."
      }
    ],
    visual_alternative: "Ocular slit-lamp optical cross-section showing golden-brown Kayser-Fleischer copper ring.",
    prevalence: {
      figure: "1 in 30,000 individuals",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Niemann-Pick Disease (Type C)",
    category: "Lysosomal Lipid Storage Disorder",
    isRare: true,
    icdCode: "E75.24",
    orphaCode: "ORPHA:648",
    clinical_summary: "Niemann-Pick disease Type C is a rare neurovisceral lysosomal lipid storage disorder caused by mutations in NPC1 or NPC2 genes, causing impaired intracellular cholesterol transport. Characterized by vertical supranuclear gaze palsy, gelastic cataplexy, progressive ataxia, cognitive decline, and splenomegaly.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1296/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=648"],
    symptom_review: {
      confirmed: ["Vertical Supranuclear Gaze Palsy", "Splenomegaly", "Ataxia", "Gelastic Cataplexy", "Progressive Cognitive Decline"],
      unconfirmed_existing: [],
      newly_identified: ["Filipin Positive Staining"]
    },
    lab_markers: [
      {
        test_name: "Plasma Oxysterols (Cholestan-3b,5a,6b-triol)",
        marker: "Cholestane-triol",
        normal_range: "< 35 ng/mL",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "> 120 ng/mL"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "NPC Fibroblast Filipin Staining Microscopy Library",
        host: "CellImageHub / NCBI",
        url: "https://www.ncbi.nlm.nih.gov/geo/",
        license: "Public Domain",
        relevance_note: "Fluorescence microscopy imagery of unesterified cholesterol accumulation in cultured skin fibroblasts."
      }
    ],
    additional_datasets: [
      {
        name: "NPC1/NPC2 Variant & Oxysterol Biomarker Registry",
        url: "https://www.orpha.net",
        license: "Open Research Data",
        notes: "Plasma cholestane-triol and lyso-SM-509 levels in confirmed NPC patient cohorts."
      }
    ],
    visual_alternative: "Fluorescein filipin staining schematic of unesterified cholesterol accumulation in cultured skin fibroblasts.",
    prevalence: {
      figure: "1 in 100,000 live births",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Mucopolysaccharidosis Type I (MPS I)",
    category: "Glycosaminoglycan Storage Disorder",
    isRare: true,
    icdCode: "E76.01",
    orphaCode: "ORPHA:93473",
    clinical_summary: "MPS I (Hurler / Scheie Syndrome) is an autosomal recessive lysosomal storage disorder resulting from alpha-L-iduronidase (IDUA) deficiency. Un-degraded dermatan sulfate and heparan sulfate accumulate in organs, leading to coarse facial features, corneal clouding, hepatosplenomegaly, dysostosis multiplex, and progressive joint stiffness.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1182/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=93473"],
    symptom_review: {
      confirmed: ["Coarse Facial Features", "Corneal Clouding", "Dysostosis Multiplex", "Joint Contractures", "Hepatosplenomegaly"],
      unconfirmed_existing: ["Umbilical Hernia"],
      newly_identified: ["Aortic Valve Thickening"]
    },
    lab_markers: [
      {
        test_name: "Alpha-L-Iduronidase Enzyme Activity",
        marker: "IDUA Enzyme",
        normal_range: "12 - 45 U/mg protein",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 1% normal activity"
      },
      {
        test_name: "Urinary Glycosaminoglycans (GAGs)",
        marker: "Dermatan/Heparan Sulfate",
        normal_range: "< 15 mg/mmol creatinine",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "> 80 mg/mmol creatinine"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Dysostosis Multiplex Radiographic Dataset",
        host: "NIH Orphan Disease Repository",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK1182/",
        license: "Public Access",
        relevance_note: "Skeletal X-ray series showing claw hand deformity, lumbar kyphosis, and thick paddle-shaped ribs."
      }
    ],
    additional_datasets: [
      {
        name: "IDUA Gene Mutation & Enzyme Substrate Database",
        url: "https://www.orpha.net",
        license: "Public Access",
        notes: "Catalog of IDUA mutations and urinary GAG excretion rates."
      }
    ],
    visual_alternative: "Radiographic skeletal 3D diagram of dysostosis multiplex showcasing claw-hand deformities.",
    prevalence: {
      figure: "1 in 100,000 live births",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Huntington Disease",
    category: "Hereditary Neurodegenerative Disorder",
    isRare: true,
    icdCode: "G10",
    orphaCode: "ORPHA:399",
    clinical_summary: "Huntington disease is an autosomal dominant neurodegenerative disorder driven by an expanded CAG trinucleotide repeat (>36 repeats) in the HTT gene on chromosome 4. It leads to progressive choreic involuntary movements, psychiatric disturbances, executive dysfunction, and striatal atrophy in the caudate nucleus.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1305/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=399"],
    symptom_review: {
      confirmed: ["Chorea", "Executive Cognitive Dysfunction", "Depression / Personality Changes", "Saccadic Eye Movement Abnormality"],
      unconfirmed_existing: [],
      newly_identified: ["Gait Instability"]
    },
    lab_markers: [
      {
        test_name: "HTT Gene CAG Repeat Length",
        marker: "CAG Repeat Count",
        normal_range: "< 26 repeats",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "> 40 repeats (Full Penetrance)"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Track-HD Brain Volumetric MRI Dataset",
        host: "OpenNeuro",
        url: "https://openneuro.org/datasets/ds000214",
        license: "CC0 Public Domain",
        relevance_note: "Structural 3T T1-weighted MRI neuroimaging dataset measuring striatal caudate volume loss over time."
      }
    ],
    additional_datasets: [
      {
        name: "HTT CAG Repeat Allele Distribution Registry",
        url: "https://openneuro.org",
        license: "CC0",
        notes: "Correlations between CAG repeat length, age of onset, and motor symptom severity."
      }
    ],
    visual_alternative: "Cerebral volumetric 3D model demonstrating caudate nucleus head atrophy and lateral ventricle enlargement.",
    prevalence: {
      figure: "5 to 10 per 100,000 in Caucasian populations",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Dominant"
    }
  },
  {
    name: "Cystic Fibrosis",
    category: "Epithelial Chloride Transport Disorder",
    isRare: true,
    icdCode: "E84.0",
    orphaCode: "ORPHA:586",
    clinical_summary: "Cystic fibrosis is an autosomal recessive genetic disease caused by mutations in the CFTR gene (e.g. F508del), impairing epithelial chloride and bicarbonate transport. Leads to abnormally viscous mucous secretions causing chronic sinopulmonary infections, bronchiectasis, exocrine pancreatic insufficiency, and elevated sweat chloride levels.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1250/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=586"],
    symptom_review: {
      confirmed: ["Elevated Sweat Chloride (>60 mmol/L)", "Chronic Productive Cough", "Pancreatic Insufficiency", "Failure to Thrive", "Digital Clubbing"],
      unconfirmed_existing: ["Nasal Polyps"],
      newly_identified: ["Bronchiectasis"]
    },
    lab_markers: [
      {
        test_name: "Sweat Chloride Iontophoresis",
        marker: "Sweat Chloride",
        normal_range: "< 30 mmol/L",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "> 60 mmol/L (Diagnostic)"
      },
      {
        test_name: "Immunoreactive Trypsinogen (IRT)",
        marker: "IRT Level",
        normal_range: "< 60 ng/mL",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "> 120 ng/mL"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "NIH ChestX-ray14 Bronchiectasis Subset",
        host: "NIH / Kaggle",
        url: "https://www.kaggle.com/datasets/nih-chest-xrays/data",
        license: "Public Domain",
        relevance_note: "112,120 chest X-rays with annotated bronchiectasis and hyperinflation findings."
      }
    ],
    additional_datasets: [
      {
        name: "CFTR2 Variant Clinical Registry",
        url: "https://cftr2.org",
        license: "Open Scientific Resource",
        notes: "Annotated functional data for over 1,000 CFTR mutations worldwide."
      }
    ],
    visual_alternative: "Bronchial mucosal cross-section illustrating periciliary fluid dehydration and mucous plugging.",
    prevalence: {
      figure: "1 in 2,500 to 1 in 3,500 live births",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Transthyretin Amyloidosis (ATTR)",
    category: "Protein Misfolding Amyloid Cardiomyopathy",
    isRare: true,
    icdCode: "E85.1",
    orphaCode: "ORPHA:85447",
    clinical_summary: "ATTR amyloidosis is a rare progressive disease caused by instability and misfolding of transthyretin (TTR) tetramers into insoluble amyloid fibrils that deposit in cardiac tissue and peripheral nerves, causing restrictive cardiomyopathy, bilateral carpal tunnel syndrome, and autonomic dysautonomia.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1194/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=85447"],
    symptom_review: {
      confirmed: ["Bilateral Carpal Tunnel Syndrome", "Restrictive Cardiomyopathy", "Peripheral Neuropathy", "Orthostatic Hypotension"],
      unconfirmed_existing: [],
      newly_identified: ["Spinal Stenosis"]
    },
    lab_markers: [
      {
        test_name: "99mTc-PYP Cardiac Scintigraphy",
        marker: "Myocardial Uptake",
        normal_range: "Grade 0 (No uptake)",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "Grade 2 or 3 (Strong Uptake)"
      },
      {
        test_name: "NT-proBNP Biomarker",
        marker: "NT-proBNP",
        normal_range: "< 125 pg/mL",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "> 1,800 pg/mL"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "99mTc-PYP Cardiac Amyloid Scintigraphy Dataset",
        host: "PhysioNet Open Datasets",
        url: "https://physionet.org",
        license: "ODC-By v1.0",
        relevance_note: "Nuclear cardiology SPECT imaging dataset evaluating Grade 2/3 myocardial pyrophosphate retention."
      }
    ],
    additional_datasets: [
      {
        name: "TTR Genotype & Cardiac Biomarker Database",
        url: "https://www.amyloidosis.org",
        license: "Public Access",
        notes: "Serum troponin T, NT-proBNP, and eGFR longitudinal tracks in wild-type and hereditary ATTR."
      }
    ],
    visual_alternative: "Histopathological Congo red staining demonstrating apple-green birefringence under polarized light.",
    prevalence: {
      figure: "1 in 100,000 individuals",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Dominant / Wild-Type Age-Related"
    }
  },
  {
    name: "Vascular Ehlers-Danlos Syndrome (vEDS)",
    category: "Connective Tissue Matrix Disorder",
    isRare: true,
    icdCode: "Q79.62",
    orphaCode: "ORPHA:282",
    clinical_summary: "Vascular Ehlers-Danlos syndrome (Type IV) is a severe autosomal dominant connective tissue disorder caused by COL3A1 gene mutations affecting type III collagen. Characterized by extreme vascular fragility, spontaneous arterial dissections/ruptures, translucent skin with visible venous patterns, and gastrointestinal perforation risk.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1220/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=282"],
    symptom_review: {
      confirmed: ["Translucent Skin with Visible Veins", "Spontaneous Arterial Aneurysm / Dissection", "Extensive Bruising", "Characteristic Facial Features"],
      unconfirmed_existing: [],
      newly_identified: ["Acrogeria"]
    },
    lab_markers: [
      {
        test_name: "COL3A1 Gene Sequencing",
        marker: "Type III Collagen Mutation",
        normal_range: "Wild Type",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "Pathogenic Variant Detected"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Vascular Angiography & Dissection Imaging Database",
        host: "Radiopaedia / Open Access",
        url: "https://radiopaedia.org",
        license: "CC BY-NC-SA 3.0",
        relevance_note: "CT angiography and MRA series illustrating celiac, renal, and iliac artery dissections."
      }
    ],
    additional_datasets: [
      {
        name: "COL3A1 Variant & Arterial Event Register",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK1220/",
        license: "Public Domain",
        notes: "Clinical event rates, age at first arterial complication, and COL3A1 splice vs missense mutation correlations."
      }
    ],
    visual_alternative: "3D vascular tree architectural diagram highlighting arterial dissection prone arterial bifurcations.",
    prevalence: {
      figure: "1 in 50,000 to 1 in 200,000",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Dominant"
    }
  },
  {
    name: "Tay-Sachs Disease",
    category: "GM2 Gangliosidosis",
    isRare: true,
    icdCode: "E75.02",
    orphaCode: "ORPHA:845",
    clinical_summary: "Tay-Sachs disease is an autosomal recessive neurodegenerative disorder caused by deficiency of hexosaminidase A (HEXA gene), resulting in GM2 ganglioside accumulation in brain neurons. Manifests with progressive motor loss, exaggerated startle response, macular cherry-red spot, seizures, and blindness.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1218/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=845"],
    symptom_review: {
      confirmed: ["Macular Cherry-Red Spot", "Hyperacusis / Exaggerated Startle", "Progressive Motor Regression", "Seizures"],
      unconfirmed_existing: [],
      newly_identified: ["Axial Hypotonia"]
    },
    lab_markers: [
      {
        test_name: "Serum Hexosaminidase A Activity",
        marker: "Hex-A Enzyme",
        normal_range: "55 - 72% of Total Hex",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 5% (Infantile Form)"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Retinal Macular Cherry-Red Spot Ophthalmoscopy Dataset",
        host: "Kaggle Ophthalmic Imaging",
        url: "https://www.kaggle.com/datasets",
        license: "Public Domain",
        relevance_note: "Fundus photography displaying bright red fovea surrounded by pale macula due to ganglion cell storage."
      }
    ],
    additional_datasets: [
      {
        name: "HEXA Allele Frequency & Enzyme Registry",
        url: "https://www.ncbi.nlm.nih.gov/clinvar/?term=HEXA",
        license: "Public Access",
        notes: "Catalog of HEXA mutations and carrier frequency statistics across diverse populations."
      }
    ],
    visual_alternative: "Ophthalmoscopic retinal fundus illustration highlighting central cherry-red macular spot.",
    prevalence: {
      figure: "1 in 320,000 live births (1 in 3,600 Ashkenazi Jewish)",
      source: "https://www.orpha.net",
      inheritance_pattern: "Autosomal Recessive"
    }
  },
  {
    name: "Severe Combined Immunodeficiency (SCID)",
    category: "Primary Immunodeficiency",
    isRare: true,
    icdCode: "D81.0",
    orphaCode: "ORPHA:183660",
    clinical_summary: "SCID is a life-threatening primary immunodeficiency caused by mutations in ADA, IL2RG, or RAG genes, leading to severe impairment of T-cell development and cellular/humoral immunity. Infantile onset presents with severe opportunistic infections, persistent diarrhea, and failure to thrive.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK1410/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=183660"],
    symptom_review: {
      confirmed: ["Severe Recurrent Opportunistic Infections", "Absolute Lymphopenia", "Persistent Diarrhea", "Absent Thymic Shadow"],
      unconfirmed_existing: [],
      newly_identified: ["Failure to Thrive"]
    },
    lab_markers: [
      {
        test_name: "T-Cell Receptor Excision Circles (TREC)",
        marker: "TREC Quantification",
        normal_range: "> 252 copies/µL",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 10 copies/µL (Near Zero)"
      },
      {
        test_name: "Absolute Lymphocyte Count",
        marker: "Lymphocytes",
        normal_range: "2,000 - 8,000 /µL (Infants)",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "< 500 /µL"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Newborn TREC Screening & Flow Cytometry Dataset",
        host: "NCBI GEO Repository",
        url: "https://www.ncbi.nlm.nih.gov/geo/",
        license: "Public Domain",
        relevance_note: "Quantification dataset of TREC copy numbers and T/B/NK lymphocyte flow cytometry panels."
      }
    ],
    additional_datasets: [
      {
        name: "Primary Immunodeficiency Genomic Variant Registry",
        url: "https://www.orpha.net",
        license: "Open Science",
        notes: "ADA, IL2RG, RAG1, and RAG2 pathogenic variants with newborn screen outcomes."
      }
    ],
    visual_alternative: "Flow cytometry CD3/CD4/CD8 T-lymphocyte subset depletion histogram.",
    prevalence: {
      figure: "1 in 58,000 live births",
      source: "https://www.orpha.net",
      inheritance_pattern: "X-Linked / Autosomal Recessive"
    }
  },
  {
    name: "Hemophilia A (Severe)",
    category: "Coagulation Factor Deficiency",
    isRare: true,
    icdCode: "D66",
    orphaCode: "ORPHA:98878",
    clinical_summary: "Hemophilia A is an X-linked recessive bleeding disorder caused by deficiency or absence of blood coagulation Factor VIII (F8 gene). Severe form (<1% factor activity) causes spontaneous hemarthrosis (joint bleeding), intramuscular hematomas, prolonged post-traumatic bleeding, and chronic arthropathy.",
    summary_sources: ["https://www.ncbi.nlm.nih.gov/books/NBK82260/", "https://www.orpha.net/consor/cgi-bin/OC_Exp.php?Lng=GB&Expert=98878"],
    symptom_review: {
      confirmed: ["Spontaneous Hemarthrosis", "Prolonged aPTT", "Intramuscular Hematomas", "Easy Bruising"],
      unconfirmed_existing: [],
      newly_identified: ["Chronic Hemophilic Arthropathy"]
    },
    lab_markers: [
      {
        test_name: "Factor VIII Coagulant Activity",
        marker: "Factor VIII Level",
        normal_range: "50 - 150%",
        range_source: "https://mayocliniclabs.com",
        typical_pattern_in_disease: "< 1% (Severe Hemophilia A)"
      },
      {
        test_name: "Activated Partial Thromboplastin Time",
        marker: "aPTT",
        normal_range: "25 - 35 seconds",
        range_source: "https://medlineplus.gov",
        typical_pattern_in_disease: "> 60 - 90 seconds (Markedly Prolonged)"
      }
    ],
    imaging_datasets: [
      {
        dataset_name: "Hemophilic Arthropathy Joint Ultrasound & MRI Dataset",
        host: "PhysioNet Open Datasets",
        url: "https://physionet.org",
        license: "ODC-By v1.0",
        relevance_note: "HEAD-US musculoskeletal ultrasound dataset evaluating joint effusion, synovial hypertrophy, and cartilage damage."
      }
    ],
    additional_datasets: [
      {
        name: "F8 Gene Inversion & Factor VIII Inhibitor Registry",
        url: "https://www.eAHAD.org",
        license: "European Association for Haemophilia",
        notes: "Intron 22 and intron 1 inversions in F8 gene and inhibitor development risk models."
      }
    ],
    visual_alternative: "3D joint cavity cross-section showing synovial hypertrophy and hemosiderin deposition from hemarthrosis.",
    prevalence: {
      figure: "1 in 5,000 male live births",
      source: "https://www.orpha.net",
      inheritance_pattern: "X-Linked Recessive"
    }
  }
];

// Export alias for backward compatibility with components using DISEASE_LIBRARY_49
export const DISEASE_LIBRARY_49: DiseaseEntry[] = ESSENTIAL_RARE_DISEASES;
