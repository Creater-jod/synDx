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
      <div className="bg-[#F0EEE9] border border-[#141414] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#141414]/80">Doctor Review Status:</span>
          <span
            className={`px-3 py-1 text-xs font-mono font-black border uppercase ${
              reviewCase.status === 'Approved'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : reviewCase.status === 'Overridden'
                ? 'bg-[#2A5C82] text-white border-[#2A5C82]'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {reviewCase.status}
          </span>
        </div>

        {reviewCase.overrideDiagnosis && (
          <div className="bg-white p-2.5 border border-[#141414] text-xs">
            <span className="text-[#2A5C82] font-mono font-bold">Overridden Diagnosis: </span>
            <span className="text-[#141414] font-bold">{reviewCase.overrideDiagnosis}</span>
          </div>
        )}

        {reviewCase.doctorNotes && (
          <p className="text-xs font-serif italic text-[#141414] bg-white p-2.5 border border-[#141414]">
            <span className="font-mono font-bold not-italic text-[#141414]/80">Doctor Notes: </span>
            {reviewCase.doctorNotes}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#141414] p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#141414] pb-2">
        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2A5C82]" />
          Doctor Authorization Controls
        </h4>
        <span className="text-[10px] font-mono font-bold uppercase text-white bg-[#FF6321] px-2 py-0.5 border border-[#FF6321]">
          Action Required
        </span>
      </div>

      <div>
        <label className="block text-xs font-mono font-bold text-[#141414] uppercase mb-1">
          Clinical Review Notes & Observations (Optional):
        </label>
        <textarea
          rows={2}
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Add clinical remarks, confirmatory lab requests, or patient history updates..."
          className="w-full bg-[#F0EEE9] border border-[#141414] p-2.5 text-xs text-[#141414] focus:outline-none"
        />
      </div>

      {!isOverriding ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleApprove}
            className="flex-1 min-w-[120px] bg-[#141414] hover:bg-emerald-600 text-white font-mono font-bold px-3 py-2 text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Approve Diagnosis
          </button>

          <button
            onClick={handleReject}
            className="flex-1 min-w-[120px] bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold px-3 py-2 text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
          >
            <XCircle className="w-4 h-4" />
            Reject / Dismiss
          </button>

          <button
            onClick={() => setIsOverriding(true)}
            className="bg-[#2A5C82] hover:bg-[#141414] text-white font-mono font-bold px-3 py-2 text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Override Model Prediction
          </button>
        </div>
      ) : (
        <div className="bg-[#F0EEE9] border border-[#141414] p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2A5C82]">
            <AlertCircle className="w-4 h-4 text-[#2A5C82]" />
            <span>Select Physician Override Clinical Impression:</span>
          </div>

          <select
            value={selectedOverride}
            onChange={(e) => setSelectedOverride(e.target.value)}
            className="w-full bg-white border border-[#141414] p-2 text-xs text-[#141414] font-mono font-bold focus:outline-none"
          >
            {RARE_DISEASES_DB.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.icdCode})
              </option>
            ))}
            <option value="Non-Rare Common Etiology">Non-Rare Common Etiology (e.g. Chronic Malaria Splenomegaly)</option>
            <option value="Inconclusive / Needs Tertiary Biopsy">Inconclusive / Needs Tertiary Biopsy</option>
          </select>

          <div className="flex items-center gap-2 justify-end font-mono text-xs">
            <button
              onClick={() => setIsOverriding(false)}
              className="px-3 py-1.5 bg-white text-[#141414] border border-[#141414] font-bold uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleOverrideSubmit}
              className="px-3 py-1.5 bg-[#2A5C82] text-white font-bold uppercase hover:bg-[#141414]"
            >
              Confirm Override
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
