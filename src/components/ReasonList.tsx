import React, { useState } from 'react';
import { FeatureImportance } from '../types/syndx';
import { HelpCircle, Layers, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  shapReasons: FeatureImportance[];
  limeReasons?: FeatureImportance[];
  title?: string;
}

export const ReasonList: React.FC<Props> = ({ shapReasons, limeReasons = [], title = 'XAI Explainability Breakdown (SHAP & LIME)' }) => {
  const [activeTab, setActiveTab] = useState<'SHAP' | 'LIME'>('SHAP');

  const currentList = activeTab === 'SHAP' ? shapReasons : limeReasons;

  return (
    <div className="bg-[#F0EEE9] border border-[#141414] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#141414]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2A5C82]" />
          <h3 className="text-sm font-black uppercase tracking-tight text-[#141414]">{title}</h3>
        </div>

        <div className="flex items-center bg-white border border-[#141414] p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('SHAP')}
            className={`px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              activeTab === 'SHAP' ? 'bg-[#141414] text-white' : 'text-[#141414] hover:bg-[#E4E3E0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            SHAP (Global Importance)
          </button>
          {limeReasons.length > 0 && (
            <button
              onClick={() => setActiveTab('LIME')}
              className={`px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'LIME' ? 'bg-[#141414] text-white' : 'text-[#141414] hover:bg-[#E4E3E0]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              LIME (Local Surrogate)
            </button>
          )}
        </div>
      </div>

      <p className="text-xs font-serif italic text-[#141414]/80 mb-4">
        {activeTab === 'SHAP'
          ? 'Shapley Additive Explanations calculate the exact mathematical contribution of each patient vital and lab marker toward the model decision.'
          : 'LIME fits an interpretable local linear surrogate around this specific patient profile to verify edge model consistency.'}
      </p>

      <div className="space-y-3">
        {currentList.map((item, idx) => {
          const isPositive = item.impact >= 0;
          const absImpact = Math.abs(item.impact);

          return (
            <div key={idx} className="bg-white border border-[#141414] p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <span className="p-1 bg-[#141414] text-white">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 bg-[#2A5C82] text-white">
                      <TrendingDown className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#141414] uppercase tracking-wide">{item.feature}</span>
                </div>
                <span className={`text-xs font-mono font-black ${isPositive ? 'text-[#141414]' : 'text-[#2A5C82]'}`}>
                  {isPositive ? `+${absImpact}%` : `-${absImpact}%`}
                </span>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full bg-[#E4E3E0] h-3 border border-[#141414] mb-2 relative">
                <div
                  className={`h-full ${isPositive ? 'bg-[#141414]' : 'bg-[#2A5C82]'}`}
                  style={{ width: `${Math.min(100, absImpact * 2.5)}%` }}
                />
              </div>

              <p className="text-xs font-serif italic text-[#141414]/90 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
