import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Database, 
  GitBranch, 
  Activity, 
  UploadCloud, 
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { predictSingle } from '../services/api';

export default function HomePage({ setActiveTab }) {
  const [quickReview, setQuickReview] = useState(
    "Unbelievable quality! 1000% the best purchase ever made on this planet! Free gift card received, BUY BUY BUY NOW!!"
  );
  const [quickResult, setQuickResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuickTest = async () => {
    if (!quickReview.trim()) return;
    setLoading(true);
    try {
      const res = await predictSingle(quickReview);
      setQuickResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pipelineSteps = [
    { title: "Upload Dataset", desc: "Batch CSV / XLSX customer feedback", icon: UploadCloud, color: "text-sky-400" },
    { title: "Preprocess Reviews", desc: "Clean text, strip URLs, extract signals", icon: Layers, color: "text-cyan-400" },
    { title: "ML Model", desc: "Calibrated NLP / BERT inference engine", icon: Cpu, color: "text-indigo-400" },
    { title: "Fake / Real", desc: "Authenticity probability scoring", icon: ShieldCheck, color: "text-emerald-400" },
    { title: "Analytics", desc: "Interactive distributions & metrics", icon: Activity, color: "text-violet-400" },
  ];

  const highlights = [
    {
      title: "NLP Powered",
      desc: "Sublinear TF-IDF n-grams with linguistic feature extraction to capture stylistic cues and hype markers.",
      icon: Sparkles,
      tag: "Feature Extraction"
    },
    {
      title: "ML Classification",
      desc: "Calibrated probabilistic classification model with modular transformer/BERT upgrade compatibility.",
      icon: Cpu,
      tag: "Dual Architecture"
    },
    {
      title: "MLOps Pipeline",
      desc: "End-to-end continuous integration, automated model retraining, and containerized deployment workflow.",
      icon: GitBranch,
      tag: "Automation"
    },
    {
      title: "Dataset Versioning",
      desc: "DVC integration with reproducible pipeline stages (`preprocess`, `train`, `evaluate`) and data tracking.",
      icon: Database,
      tag: "DVC Integrated"
    },
    {
      title: "Model Monitoring",
      desc: "Real-time inference latency tracking, Prometheus exposition metrics, and MLflow experiment telemetry.",
      icon: Activity,
      tag: "Live Telemetry"
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-10 text-center overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>End-to-End MLOps Machine Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 mb-6">
            Fake Review Detection
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            “Detect suspicious and potentially fake customer reviews using NLP and Machine Learning.”
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('dataset')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Analyze Reviews</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('single')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <FileSearch className="w-4 h-4 text-sky-400" />
              <span>Try Single Review</span>
            </button>
          </div>
        </div>
      </section>

      {/* Visual Workflow Diagram */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            How The Pipeline Works
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            End-to-end data processing and inference lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col items-center text-center group"
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform ${step.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Step 0{idx + 1}
                </div>
                <div className="font-bold text-slate-200 text-sm mb-1">{step.title}</div>
                <div className="text-xs text-slate-400">{step.desc}</div>

                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Quick Try Preview */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Interactive Playground
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5">
                Quick Authenticity Check
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Live FastAPI backend test
            </span>
          </div>

          <div className="space-y-4">
            <textarea
              rows={3}
              value={quickReview}
              onChange={(e) => setQuickReview(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="Paste a review text here..."
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickReview("After testing this blender for 2 weeks, the motor crushed frozen strawberries nicely. However, the lid seal requires firm pressure to avoid drips.")}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                >
                  Load Real Review
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setQuickReview("BEST ITEM EVER ON AMAZON!!! 1000 STARS MUST BUY NOW CLICK BUY FAST FIVE STARS DO NOT MISS OUT!!!")}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
                >
                  Load Fake Review
                </button>
              </div>

              <button
                onClick={handleQuickTest}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                <span>Check Authenticity</span>
              </button>
            </div>

            {quickResult && (
              <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn ${
                quickResult.prediction === 'Fake'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${quickResult.prediction === 'Fake' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {quickResult.prediction === 'Fake' ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Model Prediction</div>
                    <div className="text-xl font-black tracking-tight">
                      {quickResult.prediction === 'Fake' ? '🔴 FAKE REVIEW' : '🟢 REAL REVIEW'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Confidence</div>
                    <div className="font-bold text-slate-100 font-mono text-base">
                      {Math.round(quickResult.confidence * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Latency</div>
                    <div className="font-bold text-slate-100 font-mono text-base">
                      {quickResult.latency_ms} ms
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Key Architecture Highlights
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Built following enterprise MLOps & NLP best practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety Notice Footer banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            <strong>Disclaimer:</strong> Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity.
          </span>
          <button
            onClick={() => setActiveTab('architecture')}
            className="text-sky-400 hover:underline shrink-0 ml-4 font-medium"
          >
            System Architecture →
          </button>
        </div>
      </section>
    </div>
  );
}
