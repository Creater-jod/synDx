import { RareDiseaseCsvRecord, RARE_DISEASE_MASTER_CSV } from '../data/rareDiseasesMasterDataset';

export class RareDiseaseCsvService {
  /**
   * Parse raw CSV text string into typed RareDiseaseCsvRecord array.
   * Handles quoted cells with internal commas and quotes.
   */
  public static parseCsvString(csvText: string): RareDiseaseCsvRecord[] {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) return [];

    // Parse CSV line acknowledging quoted strings
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const records: RareDiseaseCsvRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length < 3) continue;

      const record: RareDiseaseCsvRecord = {
        orphaCode: values[0] || `ORPHA:${Math.floor(10000 + Math.random() * 90000)}`,
        icd10Code: values[1] || 'Q89.9',
        icd11Code: values[2] || 'LD90.Y',
        diseaseName: values[3] || 'Unassigned Rare Condition',
        synonyms: values[4] || 'N/A',
        category: values[5] || 'Genetic / Metabolic',
        geneSymbol: values[6] || 'UNKNOWN',
        omimId: values[7] || 'N/A',
        gardId: values[8] || 'GARD:0000',
        prevalence: values[9] || '1 / 100,000',
        hpoSymptomTerms: values[10] || 'HP:0000118 (Phenotypic abnormality)',
        labMarkers: values[11] || 'Atypical biomarker profile',
        orphanTreatments: values[12] || 'Symptomatic supportive care',
        sourceDatasetUrl: values[13] || 'User Imported CSV'
      };

      records.push(record);
    }

    return records;
  }

  /**
   * Load default authentic master dataset
   */
  public static getDefaultDataset(): RareDiseaseCsvRecord[] {
    return this.parseCsvString(RARE_DISEASE_MASTER_CSV);
  }

  /**
   * Export array of records into formatted CSV string
   */
  public static exportToCsvString(records: RareDiseaseCsvRecord[]): string {
    const headers = [
      'OrphaCode',
      'ICD10Code',
      'ICD11Code',
      'DiseaseName',
      'Synonyms',
      'Category',
      'GeneSymbol',
      'OMIMCode',
      'GARD_ID',
      'PrevalenceEstimate',
      'HPO_Symptom_Terms',
      'PrimaryLabMarkers',
      'OrphanDrugAvailability',
      'SourceDataset'
    ];

    const escapeCsv = (str: string) => {
      const val = str || '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = records.map((r) => [
      escapeCsv(r.orphaCode),
      escapeCsv(r.icd10Code),
      escapeCsv(r.icd11Code),
      escapeCsv(r.diseaseName),
      escapeCsv(r.synonyms),
      escapeCsv(r.category),
      escapeCsv(r.geneSymbol),
      escapeCsv(r.omimId),
      escapeCsv(r.gardId),
      escapeCsv(r.prevalence),
      escapeCsv(r.hpoSymptomTerms),
      escapeCsv(r.labMarkers),
      escapeCsv(r.orphanTreatments),
      escapeCsv(r.sourceDatasetUrl)
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Trigger browser file download of CSV dataset
   */
  public static downloadCsvFile(records: RareDiseaseCsvRecord[], filename = 'synDx_rare_diseases_master_dataset.csv') {
    const csvContent = this.exportToCsvString(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Merge new incoming CSV records with existing ones deduplicating by ORPHA code / Disease Name
   */
  public static mergeDataset(existing: RareDiseaseCsvRecord[], incoming: RareDiseaseCsvRecord[]): RareDiseaseCsvRecord[] {
    const map = new Map<string, RareDiseaseCsvRecord>();

    existing.forEach((item) => {
      const key = (item.orphaCode || item.diseaseName).toLowerCase().trim();
      map.set(key, item);
    });

    incoming.forEach((item) => {
      const key = (item.orphaCode || item.diseaseName).toLowerCase().trim();
      map.set(key, item); // Overwrite / update with incoming
    });

    return Array.from(map.values());
  }

  /**
   * Search dataset by term matching ORPHA code, ICD-10, Gene, Disease name, HPO term, category or drugs
   */
  public static searchDataset(records: RareDiseaseCsvRecord[], query: string): RareDiseaseCsvRecord[] {
    if (!query.trim()) return records;
    const q = query.toLowerCase().trim();

    return records.filter((r) =>
      r.diseaseName.toLowerCase().includes(q) ||
      r.orphaCode.toLowerCase().includes(q) ||
      r.icd10Code.toLowerCase().includes(q) ||
      r.icd11Code.toLowerCase().includes(q) ||
      r.geneSymbol.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.hpoSymptomTerms.toLowerCase().includes(q) ||
      r.labMarkers.toLowerCase().includes(q) ||
      r.orphanTreatments.toLowerCase().includes(q) ||
      r.omimId.toLowerCase().includes(q) ||
      r.gardId.toLowerCase().includes(q)
    );
  }
}
