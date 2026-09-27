import React from 'react';
import { X, CheckCircle, AlertTriangle, Cpu, Tag, Clock, FileText, Info } from 'lucide-react';

export default function ReviewDetailModal({ review, onClose }) {
  if (!review) return null;

  const isFake = review.prediction === 'Fake';
  const confidencePercent = Math.round(review.confidence * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isFake ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Review Analysis Detail</h3>
              <p className="text-xs text-slate-400">Row #{review.row_id || 'N/A'} • Authenticity Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Review Text */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Review Content
            </label>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              "{review.review}"
            </div>
          </div>

          {/* Model Assessment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Prediction Card */}
            <div className={`p-4 rounded-xl border ${
              isFake 
                ? 'bg-rose-500/5 border-rose-500/30 text-rose-300' 
                : 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className="text-xs font-medium text-slate-400 block mb-1">Model Prediction</span>
              <div className="flex items-center gap-2">
                {isFake ? (
                  <>
                    <span className="text-2xl font-black text-rose-400">FAKE</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                      🔴 Suspicious
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black text-emerald-400">REAL</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      🟢 Authentic
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Confidence Card */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Model Confidence</span>
                <span className="text-base font-bold text-slate-100 font-mono">{confidencePercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isFake ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                Probability score: {review.confidence.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Metadata Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Cpu className="w-3 h-3 text-sky-400" /> Model Version
              </span>
              <span className="text-xs font-semibold text-slate-200 font-mono">v1.0 (NLP Pipeline)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Status
              </span>
              <span className="text-xs font-semibold text-emerald-400">Completed</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Tag className="w-3 h-3 text-indigo-400" /> Word Count
              </span>
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {review.word_count || review.review.split(/\s+/).length} words
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Exclamations
              </span>
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {review.exclamation_count || (review.review.match(/!/g) || []).length}
              </span>
            </div>
          </div>

          {/* Explainability Signals */}
          {review.signals && review.signals.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Extracted Linguistic Indicators
              </label>
              <div className="flex flex-wrap gap-2">
                {review.signals.map((sig, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ground Truth comparison if available */}
          {review.ground_truth && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Ground Truth Label:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{review.ground_truth}</span>
                {review.is_correct !== undefined && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    review.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {review.is_correct ? 'Matched ✓' : 'Mismatch ✗'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-950/20 border border-sky-800/30 text-sky-300 text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
            <p className="leading-relaxed">
              <strong>Model Safety Note:</strong> Predictions are model-generated statistical estimates and should not be treated as definitive proof of review authenticity.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
