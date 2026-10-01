const facilityRepository = require('../repositories/facilityRepository');

class ReferralService {
  async getFacilities() {
    return await facilityRepository.findAll();
  }

  async matchFacilities(condition, is_emergency) {
    const facilities = await facilityRepository.findAll();

    const scored = facilities.map(f => {
      let score = 100 - (f.distance_km * 4); // base distance penalty
      if (is_emergency && f.emergency_level === 'Level 1 Trauma') score += 55;
      if (f.icu_beds > 5) score += 15;
      if (f.drug_stock === 'yes') score += 20;

      // Condition specialty matching
      const condLower = (condition || '').toLowerCase();
      if ((condLower.includes('wilson') || condLower.includes('hepatic') || condLower.includes('liver')) && f.specialty.includes('Hepatology')) {
        score += 35;
      } else if ((condLower.includes('porphyria') || condLower.includes('crisis')) && f.specialty.includes('Emergency')) {
        score += 45;
      } else if ((condLower.includes('marfan') || condLower.includes('aortic')) && f.specialty.includes('Cardiology')) {
        score += 35;
      } else if ((condLower.includes('ehlers') || condLower.includes('hypermobility')) && f.specialty.includes('Rheumatology')) {
        score += 35;
      } else if (condLower.includes('cystic') && f.specialty.includes('Pulmonology')) {
        score += 35;
      } else if (condLower.includes('rare') && f.specialty.includes('Genetics')) {
        score += 30;
      }

      return { ...f, match_score: Math.max(15, Math.min(99, Math.round(score))) };
    });

    scored.sort((a, b) => b.match_score - a.match_score);
    const recommended = scored[0] || { name: 'District Referral Hospital', distance_km: 3.5, drug_stock: 'yes', specialty: 'General Referral' };

    return {
      recommended: {
        id: recommended.id,
        name: recommended.name,
        specialty: recommended.specialty,
        distance: `${recommended.distance_km} km`,
        stock: recommended.drug_stock,
        icu_beds: recommended.icu_beds,
        match_score: recommended.match_score
      },
      alternatives: scored.slice(1, 4).map(s => ({
        id: s.id,
        name: s.name,
        specialty: s.specialty,
        distance: `${s.distance_km} km`,
        stock: s.drug_stock,
        match_score: s.match_score
      }))
    };
  }

  getSpecialists() {
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      recommended_centers: [
        {
          id: 'cmc_vellore',
          name: 'Christian Medical College (CMC)',
          city: 'Vellore, Tamil Nadu',
          distance_km: 118,
          match_score: 98,
          coe_status: 'Accredited Center of Excellence for Rare Diseases',
          icu_beds_available: 18,
          waiting_days: 2,
          specialist: {
            name: 'Dr. Ananya Sen, MD, DM',
            title: 'Professor & Chief of Pediatric Hepatology',
            experience_years: 19,
            procedure_volume: '450+ Rare Metabolic Cases',
            publications: '38 Peer-Reviewed Studies in Hepatology & Wilson Disease',
            availability: 'Mon, Wed, Fri (09:00 - 15:00 IST)',
            contact: '+91 416 228 2010 (Ext 402)'
          }
        },
        {
          id: 'nimhans_blr',
          name: 'NIMHANS Institute of Mental Health & Neurosciences',
          city: 'Bengaluru, Karnataka',
          distance_km: 142,
          match_score: 94,
          coe_status: 'National Institute of Excellence in Neurogenetics',
          icu_beds_available: 12,
          waiting_days: 4,
          specialist: {
            name: 'Dr. Rajesh K. Varma, MD, DM',
            title: 'Senior Consultant Movement Disorder Neurologist',
            experience_years: 22,
            procedure_volume: '600+ Neuro-Degenerative & Basal Ganglia Consults',
            publications: '45 Papers in Movement Disorders & Deep Brain Stimulation',
            availability: 'Tue, Thu, Sat (10:00 - 16:00 IST)',
            contact: '+91 80 2699 5000'
          }
        },
        {
          id: 'aiims_delhi',
          name: 'All India Institute of Medical Sciences (AIIMS)',
          city: 'New Delhi',
          distance_km: 1750,
          match_score: 92,
          coe_status: 'Apex Rare Disease Center of Excellence',
          icu_beds_available: 24,
          waiting_days: 5,
          specialist: {
            name: 'Dr. Meenakshi Sundaram, MD, PhD',
            title: 'Director of Clinical Biochemical Genetics',
            experience_years: 26,
            procedure_volume: '1,200+ Rare Pediatric & Metabolic Ensembles',
            publications: '64 International Genetic Consortia Publications',
            availability: 'Mon to Fri (11:00 - 17:00 IST)',
            contact: '+91 11 2658 8500'
          }
        }
      ]
    };
  }

  estimateCost(conditionQuery, insurancePctQuery) {
    const condition = (conditionQuery || 'wilson_disease').toLowerCase();
    const insurancePct = Math.min(100, Math.max(0, parseInt(insurancePctQuery || '60', 10)));

    const baseCost = 75000;
    const insCovered = Math.round((baseCost * insurancePct) / 100);
    const outOfPocket = baseCost - insCovered;

    return {
      condition: 'Wilson Disease (ATP7B Hepato-Lenticular Degeneration)',
      total_estimated_cost: baseCost,
      currency: 'INR (₹)',
      insurance_coverage_pct: insurancePct,
      insurance_covered_amount: insCovered,
      estimated_out_of_pocket: outOfPocket,
      cost_breakdown: {
        diagnostic_assays: { name: 'Diagnostic & Molecular Assays', cost: 12000, description: 'Ceruloplasmin, 24h urinary copper, hepatic profile' },
        chelation_meds: { name: 'Chelation & Zinc Therapy', cost: 18000, description: 'D-penicillamine / Trientine induction dose' },
        inpatient_care: { name: 'Tertiary Inpatient Observation', cost: 35000, description: 'Neurological ICU observation & vital stabilization' },
        follow_up: { name: 'Clinical Genetics Follow-up', cost: 10000, description: 'Follow-up consultation & family pedigree screening' }
      },
      government_schemes: {
        nprd_2021: {
          scheme_name: 'National Policy for Rare Diseases (NPRD 2021)',
          eligible: true,
          max_grant_amount: 5000000,
          grant_formatted: '₹50,00,000 (₹50 Lakhs)',
          centers: 'Designated Accredited Centres of Excellence (CoEs)'
        },
        pmjay: {
          scheme_name: 'Ayushman Bharat (PM-JAY)',
          eligible: true,
          annual_coverage: 500000,
          coverage_formatted: '₹5,00,000 / year'
        }
      }
    };
  }
}

module.exports = new ReferralService();
