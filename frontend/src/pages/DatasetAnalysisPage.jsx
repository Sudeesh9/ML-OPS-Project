import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Filter, 
  Search, 
  BarChart3, 
  PieChart as PieIcon, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Trash2,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { previewFile, predictDataset, getSampleFileUrl } from '../services/api';
import ReviewDetailModal from '../components/ReviewDetailModal';

export default function DatasetAnalysisPage() {
  // File state
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Column mapping & options
  const [selectedReviewCol, setSelectedReviewCol] = useState('');
  const [selectedLabelCol, setSelectedLabelCol] = useState('');
  const [cleanEmpty, setCleanEmpty] = useState(true);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0); // 1: upload, 2: preprocess, 3: ML model, 4: analytics
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Table filtering & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, REAL, FAKE
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected review for modal
  const [activeReviewDetail, setActiveReviewDetail] = useState(null);

  const fileInputRef = useRef(null);

  // Handle file selection / drop
  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewError(null);
    setAnalysisResult(null);
    setLoadingPreview(true);

    try {
      const data = await previewFile(selectedFile);
      setFilePreview(data);
      setSelectedReviewCol(data.suggested_review_column || data.columns[0] || '');
      setSelectedLabelCol(data.suggested_label_column || '');
    } catch (err) {
      setPreviewError(err.message || 'Failed to parse dataset.');
      setFilePreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Load sample dataset
  const handleLoadSample = async () => {
    try {
      setLoadingPreview(true);
      setPreviewError(null);
      const res = await fetch(getSampleFileUrl());
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample_reviews.csv', { type: 'text/csv' });
      await handleFileChange(sampleFile);
    } catch (err) {
      setPreviewError("Could not load sample dataset: " + err.message);
      setLoadingPreview(false);
    }
  };

  // Run full analysis
  const handleAnalyze = async () => {
    if (!file || !selectedReviewCol) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setProgressStep(1);

    try {
      // Step 1: Uploading
      setTimeout(() => setProgressStep(2), 500); // Step 2: Preprocessing
      setTimeout(() => setProgressStep(3), 1100); // Step 3: ML Model
      setTimeout(() => setProgressStep(4), 1800); // Step 4: Analytics

      const res = await predictDataset(file, selectedReviewCol, selectedLabelCol || null, cleanEmpty);
      
      // Delay slightly for smooth animation
      setTimeout(() => {
        setAnalysisResult(res);
        setAnalyzing(false);
        setProgressStep(0);
        setCurrentPage(1);
      }, 2000);
    } catch (err) {
      setAnalysisError(err.message || "Prediction execution failed.");
      setAnalyzing(false);
      setProgressStep(0);
    }
  };

  // Export predictions as CSV
  const handleDownloadCsv = () => {
    if (!analysisResult || !analysisResult.results) return;
    
    const headers = ["row_id", "review", "prediction", "confidence", "ground_truth", "signals"];
    const rows = analysisResult.results.map(item => [
      item.row_id,
      `"${item.review.replace(/"/g, '""')}"`,
      item.prediction,
      item.confidence,
      item.ground_truth || "",
      `"${(item.signals || []).join('; ')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prediction_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows for table
  const filteredResults = analysisResult?.results.filter(item => {
    const matchesFilter = 
      filterType === 'ALL' || 
      (filterType === 'REAL' && item.prediction === 'Real') ||
      (filterType === 'FAKE' && item.prediction === 'Fake');

    const matchesSearch = 
      !searchQuery || 
      item.review.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  }) || [];

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedRows = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Chart data preparation
  const pieData = analysisResult ? [
    { name: 'Real Reviews', value: analysisResult.summary.real_count, color: '#10b981' },
    { name: 'Fake Reviews', value: analysisResult.summary.fake_count, color: '#f43f5e' }
  ] : [];

  const distData = analysisResult ? [
    { range: '50-60%', count: analysisResult.summary.confidence_distribution['50-60%'] || 0 },
    { range: '60-70%', count: analysisResult.summary.confidence_distribution['60-70%'] || 0 },
    { range: '70-80%', count: analysisResult.summary.confidence_distribution['70-80%'] || 0 },
    { range: '80-90%', count: analysisResult.summary.confidence_distribution['80-90%'] || 0 },
    { range: '90-100%', count: analysisResult.summary.confidence_distribution['90-100%'] || 0 }
  ] : [];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Batch Dataset Analysis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload customer review datasets to run automated NLP authenticity scoring and batch analytics.
        </p>
      </div>

      {/* Upload & Configuration Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
        
        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-1">
            Drop your dataset here, or click to browse
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Supports CSV and XLSX spreadsheets (up to 50MB)
          </p>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Bundled Sample Dataset (30 Reviews)</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loadingPreview && (
          <div className="flex items-center justify-center gap-3 py-6 text-sky-400 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Parsing file structure and previewing records...</span>
          </div>
        )}

        {/* Preview Error */}
        {previewError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">File Parsing Issue</div>
              <div className="text-xs text-rose-300/80">{previewError}</div>
            </div>
          </div>
        )}

        {/* Dataset Preview & Column Selectors */}
        {filePreview && (
          <div className="space-y-6 pt-2 border-t border-slate-800">
            
            {/* File Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">File Name</span>
                <span className="text-sm font-bold text-slate-200 truncate block font-mono">
                  {filePreview.filename}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">Total Rows</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {filePreview.total_rows.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">Total Columns</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {filePreview.total_columns}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">File Size</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {filePreview.file_size_kb} KB
                </span>
              </div>
            </div>

            {/* Validation Notification */}
            {filePreview.missing_counts && Object.values(filePreview.missing_counts).some(v => v > 0) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Dataset contains missing/empty values in some columns.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={cleanEmpty}
                    onChange={(e) => setCleanEmpty(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Auto-clean empty reviews</span>
                </label>
              </div>
            )}

            {/* Column Mapping Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Select Review / Text Column <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedReviewCol}
                  onChange={(e) => setSelectedReviewCol(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono focus:border-sky-500 focus:outline-none"
                >
                  <option value="">-- Choose Review Column --</option>
                  {filePreview.columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Column containing customer feedback to analyze.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Select Ground Truth Label Column (Optional)
                </label>
                <select
                  value={selectedLabelCol}
                  onChange={(e) => setSelectedLabelCol(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono focus:border-sky-500 focus:outline-none"
                >
                  <option value="">-- None (Unlabeled / Blind Inference) --</option>
                  {filePreview.columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  If selected, computes accuracy, precision, and recall.
                </span>
              </div>
            </div>

            {/* Table Preview (First 10 rows) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data Preview (First 10 Rows)
                </span>
                <span className="text-[11px] text-slate-500">
                  Showing sample records from {filePreview.filename}
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-56">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[10px] text-slate-400 font-semibold sticky top-0">
                    <tr>
                      {filePreview.columns.map((col) => (
                        <th key={col} className={`p-2.5 whitespace-nowrap ${col === selectedReviewCol ? 'text-sky-400 bg-sky-950/30' : ''}`}>
                          {col} {col === selectedReviewCol ? '★' : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filePreview.preview_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        {filePreview.columns.map((col) => (
                          <td key={col} className="p-2.5 max-w-xs truncate font-sans">
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !selectedReviewCol}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Analyze Reviews</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicator Card */}
        {analyzing && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Pipeline Execution in Progress</span>
            </h4>

            <div className="space-y-3">
              {[
                { step: 1, label: "Uploading dataset" },
                { step: 2, label: "Preprocessing reviews (tokenization, regex cleaning)" },
                { step: 3, label: "Running ML model inference & calibration" },
                { step: 4, label: "Generating analytics & distribution metrics" }
              ].map(({ step, label }) => {
                const isDone = progressStep > step;
                const isCurrent = progressStep === step;
                return (
                  <div key={step} className="flex items-center gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <span className={isDone ? 'text-slate-300' : isCurrent ? 'text-sky-400 font-semibold' : 'text-slate-500'}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analysis Error */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Prediction Failed</div>
              <div className="text-xs text-rose-300/80">{analysisError}</div>
            </div>
          </div>
        )}
      </div>

      {/* Results Dashboard Section */}
      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                Prediction Analytics & Results
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Processed {analysisResult.summary.total_reviews} reviews in {analysisResult.processing_time_ms} ms using model {analysisResult.model_version}
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download Results (CSV)</span>
            </button>
          </div>

          {/* 4 Top Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Total Reviews</span>
              <div className="text-3xl font-black text-slate-100 font-mono">
                {analysisResult.summary.total_reviews.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {analysisResult.summary.empty_removed > 0 ? `(${analysisResult.summary.empty_removed} empty removed)` : 'All records valid'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-xs font-medium text-emerald-400 block mb-1">Real Reviews</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {analysisResult.summary.real_count.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-500/80 mt-1 block font-mono">
                {((analysisResult.summary.real_count / Math.max(1, analysisResult.summary.total_reviews)) * 100).toFixed(1)}% of total
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <span className="text-xs font-medium text-rose-400 block mb-1">Fake Reviews</span>
              <div className="text-3xl font-black text-rose-400 font-mono">
                {analysisResult.summary.fake_count.toLocaleString()}
              </div>
              <span className="text-[11px] text-rose-500/80 mt-1 block font-mono">
                {analysisResult.summary.fake_percentage}% of total
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-1">Avg Confidence</span>
              <div className="text-3xl font-black text-sky-400 font-mono">
                {(analysisResult.summary.avg_confidence * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Probability certainty
              </span>
            </div>
          </div>

          {/* Ground Truth Validation Box if label was provided */}
          {analysisResult.summary.accuracy !== null && (
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-200">
                    Evaluation Against Ground Truth Labels
                  </h4>
                </div>
                <span className="text-[11px] text-indigo-300 font-mono">
                  Label: {analysisResult.label_column}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Accuracy</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {(analysisResult.summary.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Precision</span>
                  <span className="text-lg font-bold text-sky-400 font-mono">
                    {(analysisResult.summary.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Recall</span>
                  <span className="text-lg font-bold text-indigo-400 font-mono">
                    {(analysisResult.summary.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">F1-Score</span>
                  <span className="text-lg font-bold text-violet-400 font-mono">
                    {(analysisResult.summary.f1_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Donut Chart: Real vs Fake */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-sky-400" />
                <span>Class Proportion (Real vs Fake)</span>
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Review Counts */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Distribution Counts</span>
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confidence Histogram */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Confidence Ranges</span>
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Review Analysis Table */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {['ALL', 'REAL', 'FAKE'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filterType === type 
                        ? 'bg-slate-800 text-slate-100 shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type === 'ALL' ? 'All Reviews' : type === 'REAL' ? '🟢 Real' : '🔴 Fake'}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[11px] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3 w-16">Row</th>
                    <th className="p-3">Review</th>
                    <th className="p-3 w-28">Prediction</th>
                    <th className="p-3 w-24">Confidence</th>
                    <th className="p-3 w-20 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No reviews matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((item) => {
                      const isFake = item.prediction === 'Fake';
                      return (
                        <tr 
                          key={item.row_id} 
                          onClick={() => setActiveReviewDetail(item)}
                          className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                        >
                          <td className="p-3 font-mono text-slate-500">#{item.row_id}</td>
                          <td className="p-3 max-w-md">
                            <p className="line-clamp-2 text-slate-200 font-sans">
                              {item.review}
                            </p>
                            {item.signals && item.signals.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.signals.slice(0, 2).map((sig, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                    {sig}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {isFake ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                                🔴 FAKE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                🟢 REAL
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-200">
                            {Math.round(item.confidence * 100)}%
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveReviewDetail(item);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                              title="Inspect Review Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>
                Showing {filteredResults.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length} reviews
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {activeReviewDetail && (
        <ReviewDetailModal
          review={activeReviewDetail}
          onClose={() => setActiveReviewDetail(null)}
        />
      )}
    </div>
  );
}
