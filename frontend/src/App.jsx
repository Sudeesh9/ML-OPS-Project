import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DatasetAnalysisPage from './pages/DatasetAnalysisPage';
import SingleReviewPage from './pages/SingleReviewPage';
import MlopsDashboardPage from './pages/MlopsDashboardPage';
import ArchitecturePage from './pages/ArchitecturePage';
import { ShieldCheck, Github, ExternalLink, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true);

  // Sync dark mode class with root html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'dataset' && <DatasetAnalysisPage />}
        {activeTab === 'single' && <SingleReviewPage />}
        {activeTab === 'mlops' && <MlopsDashboardPage />}
        {activeTab === 'architecture' && <ArchitecturePage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-300">Fake Review Detection System</span>
            <span>•</span>
            <span>MLOps Production Blueprint</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
              FastAPI + React + DVC + MLflow
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>College Capstone & Enterprise Demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
