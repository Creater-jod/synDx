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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#E4E3E0] border-2 border-[#141414] shadow-[8px_8px_0px_0px_#141414] w-full max-w-6xl max-h-[90vh] flex flex-col font-sans overflow-hidden">
        {/* Header */}
        <div className="bg-[#141414] text-white p-4 flex items-center justify-between border-b-2 border-[#141414]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF6321]" />
            <h2 className="font-mono font-bold text-sm uppercase tracking-wider">
              SynDx Rare Disease Reference Library (Essential Genetic & Metabolic Datasets)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#FF6321] text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Search & List Sidebar */}
          <div className="md:col-span-4 bg-white border-r border-[#141414] flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-[#141414] space-y-2 bg-[#F0EEE9]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search rare diseases, ICD-10, ORPHA codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#141414] text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#FF6321] uppercase text-[10px]">Essential Verified Library</span>
                <span className="text-[#141414]/60 font-bold">{filteredDiseases.length} Diseases</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#141414]/10">
              {filteredDiseases.map((disease) => {
                const isSelected = selectedDisease.name === disease.name;
                return (
                  <button
                    key={disease.name}
                    onClick={() => setSelectedDisease(disease)}
                    className={`w-full text-left p-3 transition-colors flex items-start justify-between gap-2 ${
                      isSelected ? 'bg-[#141414] text-white' : 'hover:bg-[#F0EEE9] text-[#141414]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs font-sans leading-tight">{disease.name}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#141414]/60'}`}>
                        {disease.category} {disease.icdCode && `• ${disease.icdCode}`}
                      </div>
                    </div>
                    {disease.isRare && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        isSelected ? 'bg-[#FF6321] text-white' : 'bg-[#FF6321]/20 text-[#FF6321]'
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
          <div className="md:col-span-8 p-6 overflow-y-auto bg-[#F0EEE9] space-y-5">
            {/* Title & Metadata */}
            <div className="bg-white p-5 border-2 border-[#141414] shadow-[3px_3px_0px_0px_#141414] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141414]/20 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#2A5C82]">{selectedDisease.category}</span>
                    {selectedDisease.icdCode && (
                      <span className="px-2 py-0.5 bg-[#141414] text-white font-mono text-[10px] font-bold">
                        ICD-10: {selectedDisease.icdCode}
                      </span>
                    )}
                    {selectedDisease.orphaCode && (
                      <span className="px-2 py-0.5 bg-[#FF6321] text-white font-mono text-[10px] font-bold">
                        {selectedDisease.orphaCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-[#141414] font-sans mt-1">
                    {selectedDisease.name}
                  </h3>
                </div>

                {selectedDisease.prevalence && (
                  <div className="bg-[#E4E3E0] p-2.5 border border-[#141414] text-right font-mono text-xs">
                    <div className="text-[10px] font-bold text-[#141414]/60 uppercase">Prevalence</div>
                    <div className="font-bold text-[#FF6321]">{selectedDisease.prevalence.figure}</div>
                    {selectedDisease.prevalence.inheritance_pattern && (
                      <div className="text-[10px] text-[#141414]/80">{selectedDisease.prevalence.inheritance_pattern}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Paraphrased Cited Clinical Summary */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-[#141414]/70 mb-1">
                  Paraphrased Sourced Clinical Summary (150-250 words)
                </h4>
                <p className="text-xs text-[#141414] font-serif leading-relaxed italic bg-[#F0EEE9] p-3 border border-[#141414]/30">
                  "{selectedDisease.clinical_summary}"
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="font-bold text-[#141414]/60">Verified Medical Sources:</span>
                  {selectedDisease.summary_sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2A5C82] underline hover:text-[#FF6321] flex items-center gap-0.5"
                    >
                      <span>[Source {idx + 1}]</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnostic / Blood Test Markers */}
            {selectedDisease.lab_markers.length > 0 && (
              <div className="bg-white p-5 border-2 border-[#141414] space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-[#141414] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#2A5C82]" />
                  <span>Sourced Diagnostic / Blood Test Markers</span>
                </h4>
                <div className="divide-y divide-[#141414]/20 font-mono text-xs">
                  {selectedDisease.lab_markers.map((marker, i) => (
                    <div key={i} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#141414]">{marker.test_name} ({marker.marker})</span>
                        <span className="text-[#FF6321] text-[11px]">{marker.typical_pattern_in_disease}</span>
                      </div>
                      <div className="text-[11px] text-[#141414]/70 flex items-center justify-between">
                        <span>Normal Reference Range: <strong className="text-[#141414]">{marker.normal_range}</strong></span>
                        <a href={marker.range_source} target="_blank" rel="noreferrer" className="text-[#2A5C82] underline text-[10px]">
                          Range Ref Source ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Imaging Datasets or Visual Alternative */}
            <div className="bg-white p-5 border-2 border-[#141414] space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-[#141414] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#FF6321]" />
                <span>Verified Medical Image Datasets & Visual References</span>
              </h4>

              {selectedDisease.imaging_datasets && selectedDisease.imaging_datasets.length > 0 ? (
                <div className="space-y-2 font-mono text-xs">
                  {selectedDisease.imaging_datasets.map((img, idx) => (
                    <div key={idx} className="p-3 bg-[#F0EEE9] border border-[#141414] space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#141414]">
                        <span>{img.dataset_name} ({img.host})</span>
                        <span className="px-1.5 py-0.5 bg-[#141414] text-white text-[9px]">{img.license}</span>
                      </div>
                      <p className="text-[11px] text-[#141414]/80 font-sans">{img.relevance_note}</p>
                      <a href={img.url} target="_blank" rel="noreferrer" className="text-[#2A5C82] underline text-[10px] font-mono flex items-center gap-1">
                        <span>Access Open Dataset: {img.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : selectedDisease.visual_alternative ? (
                <div className="p-3 bg-[#F0EEE9] border border-[#141414] text-xs font-mono space-y-1">
                  <div className="font-bold text-[#141414] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#2A5C82]" />
                    <span>Recommended Vector Graphic / Diagrammatic Approach:</span>
                  </div>
                  <p className="text-[11px] text-[#141414]/80 font-sans italic">{selectedDisease.visual_alternative}</p>
                </div>
              ) : null}

              {/* Additional Genomic / Clinical Research Datasets */}
              {selectedDisease.additional_datasets && selectedDisease.additional_datasets.length > 0 && (
                <div className="pt-2 border-t border-[#141414]/20 space-y-2">
                  <h5 className="text-[11px] font-mono font-bold text-[#141414] uppercase">
                    Genomic, Transcriptomic & Clinical Trial Registries:
                  </h5>
                  <div className="space-y-1.5">
                    {selectedDisease.additional_datasets.map((dataset, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-[#141414] text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-[#141414]">{dataset.name}</span>
                          <span className="px-1.5 py-0.5 bg-[#2A5C82] text-white text-[9px]">{dataset.license}</span>
                        </div>
                        <p className="text-[11px] text-[#141414]/70 font-sans">{dataset.notes}</p>
                        <a href={dataset.url} target="_blank" rel="noreferrer" className="text-[#2A5C82] underline text-[10px] flex items-center gap-1">
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
