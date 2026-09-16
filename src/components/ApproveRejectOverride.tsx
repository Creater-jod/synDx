import React, { useState } from 'react';
import { DoctorCaseReview } from '../types/syndx';
import { RARE_DISEASES_DB } from '../services/mockData';
import { CheckCircle2, XCircle, Edit3, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  reviewCase: DoctorCaseReview;
  onUpdate: (
    id: string,
    status: 'Approved' | 'Rejected' | 'Overridden',
    notes?: string,
    overrideDiagnosis?: string
  ) => void;
}

export const ApproveRejectOverride: React.FC<Props> = ({ reviewCase, onUpdate }) => {
  const [isOverriding, setIsOverriding] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState(reviewCase.doctorNotes || '');
  const [selectedOverride, setSelectedOverride] = useState(reviewCase.overrideDiagnosis || RARE_DISEASES_DB[1].name);

  const handleApprove = () => {
    onUpdate(reviewCase.id, 'Approved', doctorNotes);
  };

  const handleReject = () => {
    onUpdate(reviewCase.id, 'Rejected', doctorNotes);
  };

  const handleOverrideSubmit = () => {
    onUpdate(reviewCase.id, 'Overridden', doctorNotes, selectedOverride);
    setIsOverriding(false);
  };

  if (reviewCase.status !== 'Pending Review') {
    return (
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400">Doctor Review Status:</span>
          <span
            className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border uppercase ${
              reviewCase.status === 'Approved'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : reviewCase.status === 'Overridden'
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {reviewCase.status}
          </span>
        </div>

        {reviewCase.overrideDiagnosis && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
            <span className="text-cyan-400 font-mono font-bold">Overridden Diagnosis: </span>
            <span className="text-slate-100 font-semibold">{reviewCase.overrideDiagnosis}</span>
          </div>
        )}

        {reviewCase.doctorNotes && (
          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            <span className="font-mono font-bold text-slate-400">Doctor Notes: </span>
            {reviewCase.doctorNotes}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          Doctor Authorization Controls
        </h4>
        <span className="text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Action Required
        </span>
      </div>

      <div>
        <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
          Clinical Review Notes & Observations (Optional):
        </label>
        <textarea
          rows={2}
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Add clinical remarks, confirmatory lab requests, or patient history updates..."
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-colors"
        />
      </div>

      {!isOverriding ? (
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleApprove}
            className="flex-1 min-w-[130px] min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-4 py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Approve Diagnosis
          </button>

          <button
            onClick={handleReject}
            className="flex-1 min-w-[130px] min-h-[44px] bg-rose-600/90 hover:bg-rose-600 text-white font-mono font-bold px-4 py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40"
          >
            <XCircle className="w-4 h-4 text-rose-200" />
            Reject / Dismiss
          </button>

          <button
            onClick={() => setIsOverriding(true)}
            className="min-h-[44px] bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-mono font-bold px-4 py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all"
          >
            <Edit3 className="w-4 h-4 text-teal-400" />
            Override Model Prediction
          </button>
        </div>
      ) : (
        <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>Select Physician Override Clinical Impression:</span>
          </div>

          <select
            value={selectedOverride}
            onChange={(e) => setSelectedOverride(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
          >
            {RARE_DISEASES_DB.map((d) => (
              <option key={d.id} value={d.name} className="bg-slate-900 text-slate-100">
                {d.name} ({d.icdCode})
              </option>
            ))}
            <option value="Non-Rare Common Etiology" className="bg-slate-900 text-slate-100">Non-Rare Common Etiology (e.g. Chronic Malaria Splenomegaly)</option>
            <option value="Inconclusive / Needs Tertiary Biopsy" className="bg-slate-900 text-slate-100">Inconclusive / Needs Tertiary Biopsy</option>
          </select>

          <div className="flex items-center gap-2 justify-end font-mono text-xs pt-1">
            <button
              onClick={() => setIsOverriding(false)}
              className="min-h-[40px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold uppercase transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleOverrideSubmit}
              className="min-h-[40px] px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold uppercase rounded-xl transition-all shadow-md"
            >
              Confirm Override
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
