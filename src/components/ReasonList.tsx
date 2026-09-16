import React, { useState } from 'react';
import { FeatureImportance } from '../types/syndx';
import { HelpCircle, Layers, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  shapReasons: FeatureImportance[];
  limeReasons?: FeatureImportance[];
  title?: string;
}

export const ReasonList: React.FC<Props> = ({ 
  shapReasons, 
  limeReasons = [], 
  title = 'Explainable AI Biomarker Breakdown (SHAP & LIME)' 
}) => {
  const [activeTab, setActiveTab] = useState<'SHAP' | 'LIME'>('SHAP');

  const currentList = activeTab === 'SHAP' ? shapReasons : limeReasons;

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white font-heading tracking-wide uppercase">{title}</h3>
        </div>

        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setActiveTab('SHAP')}
            className={`px-3 py-1 font-mono font-semibold text-[11px] rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'SHAP' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            SHAP (Global Importance)
          </button>
          {limeReasons.length > 0 && (
            <button
              onClick={() => setActiveTab('LIME')}
              className={`px-3 py-1 font-mono font-semibold text-[11px] rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'LIME' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              LIME (Local Surrogate)
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {activeTab === 'SHAP'
          ? 'Shapley Additive Explanations calculate the exact mathematical contribution of each patient vital sign and biomarker toward the diagnostic decision.'
          : 'LIME fits an interpretable local linear surrogate around this specific patient profile to verify edge model decision boundaries.'}
      </p>

      <div className="space-y-2.5">
        {currentList.map((item, idx) => {
          const isPositive = item.impact >= 0;
          const absImpact = Math.abs(item.impact);

          return (
            <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1 rounded-md ${isPositive ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{item.feature}</span>
                </div>
                <span className={`text-xs font-mono font-bold ${isPositive ? 'text-teal-400' : 'text-rose-400'}`}>
                  {isPositive ? `+${absImpact}%` : `-${absImpact}%`}
                </span>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full bg-slate-900 h-2 rounded-full border border-slate-800 mb-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-teal-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.min(100, absImpact * 2.5)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
