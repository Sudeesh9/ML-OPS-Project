import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  GitBranch, 
  Database, 
  Terminal, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  AlertCircle,
  BarChart2,
  Server,
  Layers,
  Code
} from 'lucide-react';
import { getSystemMetrics, getMlopsInfo, getModelInfo } from '../services/api';

export default function MlopsDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [mlopsInfo, setMlopsInfo] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawView, setRawView] = useState(false);

  const fetchData = async () => {
    try {
      const [m, mlops, mdl] = await Promise.all([
        getSystemMetrics(),
        getMlopsInfo(),
        getModelInfo()
      ]);
      setMetrics(m);
      setMlopsInfo(mlops);
      setModelInfo(mdl);
    } catch (err) {
      console.error("MLOps data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            MLOps & System Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline monitoring, MLflow experiment tracking, DVC dataset versioning, and runtime metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRawView(!rawView)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>{rawView ? 'Standard View' : 'Raw JSON / Prometheus'}</span>
          </button>
          
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sky-400 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Connecting to MLOps Telemetry Stream...</span>
        </div>
      ) : rawView ? (
        /* Raw Metrics View */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-sky-400 font-bold">GET /metrics Response (JSON)</span>
            <span className="text-slate-500">Live API dump</span>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto leading-relaxed text-slate-200">
            {JSON.stringify({ metrics, mlopsInfo, modelInfo }, null, 2)}
          </pre>
        </div>
      ) : (
        /* Standard Dashboard View */
        <div className="space-y-8">
          
          {/* Top Monitoring Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Total Predictions Served</span>
              <div className="text-3xl font-black text-slate-100 font-mono">
                {metrics?.total_predictions.toLocaleString() || 0}
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                <CheckCircle className="w-3 h-3" /> Live Requests Logged
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <span className="text-xs font-medium text-rose-400 block mb-1">Fake Predictions Rate</span>
              <div className="text-3xl font-black text-rose-400 font-mono">
                {metrics?.fake_rate_percentage || 0}%
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                {metrics?.fake_predictions || 0} Fake vs {metrics?.real_predictions || 0} Real
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Avg Inference Latency</span>
              <div className="text-3xl font-black text-cyan-400 font-mono">
                {metrics?.avg_latency_ms || 0} <span className="text-sm font-normal text-slate-400">ms</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Sub-second response time
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Application Uptime</span>
              <div className="text-3xl font-black text-indigo-400 font-mono">
                {Math.round((metrics?.uptime_seconds || 0) / 60)} <span className="text-sm font-normal text-slate-400">min</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                {metrics?.uptime_seconds}s total
              </span>
            </div>
          </div>

          {/* Model Information & Architecture Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Model Registry & Metadata</h3>
                  <p className="text-xs text-slate-400">Active machine learning artifact specifications</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {modelInfo?.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Model Name</span>
                <span className="text-sm font-bold text-slate-200">{modelInfo?.model_name || 'Fake Review Classifier'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Release Version</span>
                <span className="text-sm font-bold text-sky-400 font-mono">{modelInfo?.version || 'v1.0'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Framework</span>
                <span className="text-sm font-bold text-slate-200">{modelInfo?.framework || 'Scikit-learn / NLP'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Algorithm Architecture</span>
                <span className="text-sm font-bold text-slate-200">{modelInfo?.algorithm || 'TF-IDF + Calibrated Classifier'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Vocabulary Size</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{modelInfo?.vocabulary_size?.toLocaleString() || 973} features</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">BERT Upgrade Ready</span>
                <span className="text-sm font-bold text-indigo-400">
                  {modelInfo?.bert_compatible ? 'Yes (Adapter Configured)' : 'No'}
                </span>
              </div>
            </div>

            {/* Model Evaluation Metrics from real training */}
            {modelInfo?.metrics && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Verified Held-out Test Set Performance (Actual Computed Metrics)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Accuracy</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {(modelInfo.metrics.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Precision</span>
                    <span className="text-base font-bold text-sky-400 font-mono">
                      {(modelInfo.metrics.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Recall</span>
                    <span className="text-base font-bold text-indigo-400 font-mono">
                      {(modelInfo.metrics.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">F1-Score</span>
                    <span className="text-base font-bold text-violet-400 font-mono">
                      {(modelInfo.metrics.f1_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Fit Time</span>
                    <span className="text-base font-bold text-slate-200 font-mono">
                      {modelInfo.metrics.training_duration_seconds}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MLflow & DVC Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MLflow Experiment Tracking Card */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">MLflow Experiment Tracking</h4>
                    <p className="text-[11px] text-slate-400">Artifacts, params, and metric logging</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {mlopsInfo?.mlflow?.status || 'Active'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Experiment Name</span>
                  <span className="font-mono text-slate-200 font-semibold">{mlopsInfo?.mlflow?.experiment_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Latest Run ID</span>
                  <span className="font-mono text-sky-400 truncate max-w-[200px]">{mlopsInfo?.mlflow?.run_id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Artifact Storage</span>
                  <span className="font-mono text-slate-300">{mlopsInfo?.mlflow?.artifact_store}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Tracked Metrics</span>
                  <span className="text-slate-200">accuracy, precision, recall, f1, duration</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500"># Start local MLflow UI:</span><br />
                <span className="text-sky-300">mlflow ui --port 5000</span>
              </div>
            </div>

            {/* DVC Dataset Versioning Card */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">DVC Dataset Versioning</h4>
                    <p className="text-[11px] text-slate-400">Reproducible pipeline & data provenance</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Configured
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Tracked Dataset</span>
                  <span className="font-mono text-slate-200">{mlopsInfo?.dvc?.tracked_dataset}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Dataset Version</span>
                  <span className="font-mono text-indigo-400 font-semibold">{mlopsInfo?.dvc?.dataset_version}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Pipeline Stages</span>
                  <span className="font-mono text-slate-300">preprocess → train → evaluate</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Config Files</span>
                  <span className="font-mono text-slate-200">dvc.yaml, params.yaml</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500"># Reproduce pipeline:</span><br />
                <span className="text-indigo-300">dvc repro</span>
              </div>
            </div>
          </div>

          {/* Recent Prediction Activity Log Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Live Prediction Activity Stream</h3>
                <p className="text-xs text-slate-400">Rolling window of recent inference requests handled by the FastAPI service</p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {metrics?.recent_activity?.length || 0} events
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[10px] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3 w-40">Timestamp</th>
                    <th className="p-3">Review Snippet</th>
                    <th className="p-3 w-28">Prediction</th>
                    <th className="p-3 w-24">Confidence</th>
                    <th className="p-3 w-24 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {!metrics?.recent_activity || metrics.recent_activity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No prediction activity recorded yet in current session. Run a single review or dataset analysis to stream logs.
                      </td>
                    </tr>
                  ) : (
                    metrics.recent_activity.map((item, idx) => {
                      const isFake = item.prediction === 'Fake';
                      return (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-mono text-slate-400">{item.timestamp}</td>
                          <td className="p-3 text-slate-200 truncate max-w-xs">{item.review_snippet}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isFake ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {isFake ? '🔴 FAKE' : '🟢 REAL'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-200">
                            {Math.round(item.confidence * 100)}%
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-right">
                            {item.latency_ms} ms
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
