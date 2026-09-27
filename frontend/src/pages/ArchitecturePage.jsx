import React from 'react';
import { 
  GitBranch, 
  Layers, 
  Cpu, 
  Database, 
  Activity, 
  Server, 
  Terminal, 
  CheckCircle,
  ArrowDown,
  Box,
  Share2,
  Workflow
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          System Architecture & Workflow
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete high-level architectural overview of the Fake Review Detection System and its MLOps components.
        </p>
      </div>

      {/* Visual Graphical Diagram */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">System Blueprint</span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">End-to-End Data & Model Flow</h2>
        </div>

        {/* Interactive Diagram Canvas */}
        <div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto text-xs">
          
          {/* Layer 1: User */}
          <div className="px-6 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>USER / CLIENT</span>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-600" />

          {/* Layer 2: Frontend */}
          <div className="w-full sm:w-96 p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 to-cyan-950/40 border border-sky-500/30 text-center shadow-lg">
            <div className="font-bold text-sky-300 text-sm mb-1">React Web Application</div>
            <div className="text-[11px] text-slate-400">Vite • Tailwind CSS • Recharts • Lucide Icons</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-600" />

          {/* Layer 3: API Gateway */}
          <div className="w-full sm:w-96 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-center shadow-lg">
            <div className="font-bold text-indigo-300 text-sm mb-1">FastAPI Backend Gateway</div>
            <div className="text-[11px] text-slate-400">Uvicorn • Pydantic Schemas • Async File Streaming</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-600" />

          {/* Layer 4: Processing & Model Split */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="font-bold text-cyan-400 text-sm mb-1">NLP Preprocessing</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                HTML unescape, contraction expander, regex cleaning, linguistic cue extraction (exclamations, caps, n-grams)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="font-bold text-indigo-400 text-sm mb-1">ML Inference Engine</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                TF-IDF sublinear vectorizer + Calibrated Logistic Regression (Ready for Hugging Face BERT hot-swap)
              </div>
            </div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-600" />

          {/* Layer 5: Output */}
          <div className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-slate-200">
            <span>Fake / Real Probability & Confidence Distribution</span>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-600" />

          {/* Layer 6: MLOps Triple Pillars */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-800/30 text-center">
              <Activity className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
              <div className="font-bold text-sky-300 mb-0.5">MLflow</div>
              <div className="text-[10px] text-slate-400">
                Experiment tracking, run parameters, metric curves, model registry
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/30 text-center">
              <Database className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
              <div className="font-bold text-indigo-300 mb-0.5">DVC</div>
              <div className="text-[10px] text-slate-400">
                Dataset versioning, pipeline staging (dvc.yaml), reproducible training
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-center">
              <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <div className="font-bold text-emerald-300 mb-0.5">Monitoring</div>
              <div className="text-[10px] text-slate-400">
                Live request counters, latency telemetry, Prometheus /metrics exposition
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-100">Component Architectural Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Box className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200">1. Modular Model Inference Architecture</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The model layer adheres to the <code className="text-sky-300 font-mono">BaseModelClassifier</code> interface. It currently utilizes an efficient NLP TF-IDF sublinear vectorizer paired with a calibrated probabilistic classifier. 
              The system is designed with a pluggable adapter for <strong>Hugging Face Transformers / BERT</strong>, allowing trained PyTorch weights to be dropped in without changing any API or frontend code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200">2. DVC Data Lineage</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dataset versioning is controlled through <code className="text-indigo-300 font-mono">dvc.yaml</code> and <code className="text-indigo-300 font-mono">params.yaml</code>. Changes to raw reviews or hyperparameters automatically flag pipeline stages for recalculation, maintaining strict data-model provenance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Workflow className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200">3. MLflow Experiment Management</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every execution of <code className="text-cyan-300 font-mono">model/train.py</code> logs training parameters (ngram ranges, max features, regularization constants) and authentic validation metrics (Accuracy, Precision, Recall, F1, ROC-AUC) into the MLflow tracking store.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200">4. CI/CD & Docker Orchestration</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              GitHub Actions workflow (<code className="text-emerald-300 font-mono">.github/workflows/ci.yml</code>) runs automated flake8 linting, model retraining verification, backend test suites, and multi-stage container builds. Deployable instantly with <code className="text-emerald-300 font-mono">docker compose up --build</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
