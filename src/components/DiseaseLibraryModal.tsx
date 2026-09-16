import React, { useState } from 'react';
import { DISEASE_LIBRARY_49, DiseaseEntry } from '../data/diseaseLibrary';
import { Search, BookOpen, X, ExternalLink, Activity, Database, Sparkles, ShieldCheck } from 'lucide-react';

interface DiseaseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
}

export const DiseaseLibraryModal: React.FC<DiseaseLibraryModalProps> = ({ isOpen, onClose, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseEntry>(DISEASE_LIBRARY_49[0]);
  const [filterRareOnly, setFilterRareOnly] = useState(false);

  if (!isOpen) return null;

  const filteredDiseases = DISEASE_LIBRARY_49.filter(d => {
    if (filterRareOnly && !d.isRare) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(term) ||
        (d.category && d.category.toLowerCase().includes(term)) ||
        (d.icdCode && d.icdCode.toLowerCase().includes(term)) ||
        d.clinical_summary.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900/95 border border-slate-800/90 shadow-2xl rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-slate-950/90 border-b border-slate-800/90 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-slate-100">
                SynDx Rare Disease Reference Library
              </h2>
              <p className="text-[11px] font-mono text-slate-400">Essential Genetic & Metabolic Benchmark Datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Search & List Sidebar */}
          <div className="md:col-span-4 bg-slate-950/50 border-r border-slate-800/80 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search rare diseases, ICD-10, ORPHA codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-teal-400 uppercase text-[10px]">Verified Core DB</span>
                <span className="text-slate-400">{filteredDiseases.length} Diseases Available</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredDiseases.map((disease) => {
                const isSelected = selectedDisease.name === disease.name;
                return (
                  <button
                    key={disease.name}
                    onClick={() => setSelectedDisease(disease)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 border ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500/40 text-white shadow-sm'
                        : 'border-transparent hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs leading-tight text-slate-100">{disease.name}</div>
                      <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-teal-300' : 'text-slate-400'}`}>
                        {disease.category} {disease.icdCode && `• ${disease.icdCode}`}
                      </div>
                    </div>
                    {disease.isRare && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                        isSelected ? 'bg-teal-400 text-slate-950' : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      }`}>
                        Rare
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Disease Inspector */}
          <div className="md:col-span-8 p-6 overflow-y-auto bg-slate-900/40 space-y-5">
            {/* Title & Metadata */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold text-teal-400">{selectedDisease.category}</span>
                    {selectedDisease.icdCode && (
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700/80 rounded-md font-mono text-[10px] font-bold">
                        ICD-10: {selectedDisease.icdCode}
                      </span>
                    )}
                    {selectedDisease.orphaCode && (
                      <span className="px-2.5 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md font-mono text-[10px] font-bold">
                        {selectedDisease.orphaCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-slate-100">
                    {selectedDisease.name}
                  </h3>
                </div>

                {selectedDisease.prevalence && (
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-right font-mono text-xs">
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Prevalence</div>
                    <div className="font-bold text-teal-400 text-sm">{selectedDisease.prevalence.figure}</div>
                    {selectedDisease.prevalence.inheritance_pattern && (
                      <div className="text-[10px] text-slate-400">{selectedDisease.prevalence.inheritance_pattern}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Paraphrased Cited Clinical Summary */}
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Clinical Summary & Presentation
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  "{selectedDisease.clinical_summary}"
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="text-slate-400">Verified Medical Sources:</span>
                  {selectedDisease.summary_sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-400 hover:text-teal-300 underline flex items-center gap-1"
                    >
                      <span>Source {idx + 1}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnostic / Blood Test Markers */}
            {selectedDisease.lab_markers.length > 0 && (
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Sourced Diagnostic / Blood Test Markers</span>
                </h4>
                <div className="divide-y divide-slate-800/80 font-mono text-xs">
                  {selectedDisease.lab_markers.map((marker, i) => (
                    <div key={i} className="py-3 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-100">{marker.test_name} ({marker.marker})</span>
                        <span className="text-amber-400 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{marker.typical_pattern_in_disease}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Normal Reference Range: <strong className="text-slate-200 font-mono">{marker.normal_range}</strong></span>
                        <a href={marker.range_source} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline text-[10px] flex items-center gap-1">
                          <span>Ref Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Imaging Datasets or Visual Alternative */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Verified Medical Image Datasets & Visual References</span>
              </h4>

              {selectedDisease.imaging_datasets && selectedDisease.imaging_datasets.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {selectedDisease.imaging_datasets.map((img, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-100">
                        <span>{img.dataset_name} ({img.host})</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-teal-300 border border-teal-500/20 rounded text-[9px]">{img.license}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans">{img.relevance_note}</p>
                      <a href={img.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline text-[10px] font-mono flex items-center gap-1.5 pt-1">
                        <span>Access Open Dataset: {img.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : selectedDisease.visual_alternative ? (
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1.5">
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Recommended Vector Graphic / Diagrammatic Approach:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans italic">{selectedDisease.visual_alternative}</p>
                </div>
              ) : null}

              {/* Additional Genomic / Clinical Research Datasets */}
              {selectedDisease.additional_datasets && selectedDisease.additional_datasets.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <h5 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Genomic, Transcriptomic & Clinical Trial Registries:
                  </h5>
                  <div className="space-y-2">
                    {selectedDisease.additional_datasets.map((dataset, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-100">{dataset.name}</span>
                          <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded text-[9px]">{dataset.license}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans">{dataset.notes}</p>
                        <a href={dataset.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline text-[10px] flex items-center gap-1.5 pt-1">
                          <span>Data Registry Repository: {dataset.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
