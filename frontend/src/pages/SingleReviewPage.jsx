import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Calendar, 
  Info, 
  RefreshCw,
  Zap,
  Tag
} from 'lucide-react';
import { predictSingle } from '../services/api';

export default function SingleReviewPage() {
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const samplePresets = [
    {
      title: "Genuine Detailed Tech Review",
      type: "real",
      text: "The noise cancelling on these headphones is decent for office chatter, though low-frequency engine rumbles on airplanes still leak through somewhat. Battery life lasted around 28 hours on my cross-country flight. The earcups get slightly warm after 3 hours of continuous wear."
    },
    {
      title: "Suspicious Bot / Promo Review",
      type: "fake",
      text: "BEST PRODUCT EVER ON THE INTERNET!!!! DO NOT WAIT JUST BUY IT NOW IMMEDIATELY!!! 100 STARS AMAZING PERFECT FLAWLESS WOW CLICK BUY RIGHT NOW YOU WILL NOT REGRET IT BEST DEAL EVER!!!!!"
    },
    {
      title: "Subtle Incentivized Review",
      type: "fake",
      text: "Totally free promotional product received in exchange for an honest five star review! Best seller best item ever order 10 more right away!!"
    },
    {
      title: "Critical Authentic Kitchen Experience",
      type: "real",
      text: "The ceramic non-stick skillet works well on medium heat; eggs slide off with minimal butter. Note that it is not dishwasher safe according to the manual care card, and metal utensils will scratch the coating."
    }
  ];

  const handleAnalyze = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictSingle(reviewText);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Prediction failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const isFake = result?.prediction === 'Fake';
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Test a Single Review
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform immediate on-demand authenticity inference and linguistic signal analysis on any customer review.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
        
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Review Text Content
          </label>
          <textarea
            rows={5}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Paste your customer review here..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed font-sans placeholder:text-slate-600 transition-colors"
          />
          <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5 px-1">
            <span>{reviewText.split(/\s+/).filter(Boolean).length} words • {reviewText.length} characters</span>
            {reviewText && (
              <button 
                onClick={() => setReviewText('')} 
                className="hover:text-slate-300 transition-colors"
              >
                Clear text
              </button>
            )}
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Or test with one of these real-world presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReviewText(preset.text)}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left transition-all group flex items-start gap-2.5"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${preset.type === 'fake' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-300 group-hover:text-sky-400 transition-colors">
                    {preset.title}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={loading || !reviewText.trim()}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Analyze Review</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Analysis Failed</div>
              <div className="text-xs text-rose-300/80">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Result Display Card */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isFake 
              ? 'bg-gradient-to-b from-rose-950/20 via-slate-900 to-slate-950 border-rose-500/30' 
              : 'bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/30'
          }`}>
            
            {/* Top Badge & Prediction */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${
                  isFake ? 'bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10' : 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                }`}>
                  {isFake ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Model Prediction
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-4xl font-black tracking-tight ${isFake ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.prediction.toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isFake ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isFake ? '🔴 Highly Suspicious' : '🟢 Verified Authentic'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Counter */}
              <div className="sm:text-right">
                <span className="text-xs font-medium text-slate-400 block mb-1">Model Confidence</span>
                <span className="text-3xl font-black text-slate-100 font-mono">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Probability Breakdown Bar */}
            <div className="py-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span className="text-emerald-400">Real Probability: {((result.probabilities?.Real || 0) * 100).toFixed(1)}%</span>
                <span className="text-rose-400">Fake Probability: {((result.probabilities?.Fake || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-700" 
                  style={{ width: `${(result.probabilities?.Real || 0) * 100}%` }}
                />
                <div 
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-700" 
                  style={{ width: `${(result.probabilities?.Fake || 0) * 100}%` }}
                />
              </div>
            </div>

            {/* Signal Indicators */}
            {result.features && result.features.length > 0 && (
              <div className="py-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Detected Linguistic & Stylistic Cues
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.features.map((feature, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        feature.impact === 'suspicious'
                          ? 'bg-rose-950/20 border-rose-800/30 text-rose-200'
                          : feature.impact === 'authentic'
                            ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <Tag className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        feature.impact === 'suspicious' ? 'text-rose-400' : 'text-emerald-400'
                      }`} />
                      <div>
                        <div className="font-bold">{feature.signal}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{feature.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Footer Bar */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Model Version: <strong className="text-slate-200 font-mono">{result.model_version}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Processing Latency: <strong className="text-slate-200 font-mono">{result.latency_ms} ms</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Timestamp: <strong className="text-slate-200 font-mono">{new Date(result.timestamp).toLocaleTimeString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Model Safety Guidance:</strong> Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity. Always consider overall seller history, platform verification badges, and repeat transaction patterns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
