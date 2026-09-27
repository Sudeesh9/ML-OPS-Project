import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Search, 
  Activity, 
  GitBranch, 
  Sun, 
  Moon, 
  Menu, 
  X,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', model_loaded: false });

  useEffect(() => {
    async function fetchHealth() {
      const res = await checkHealth();
      setHealthStatus(res);
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Overview', icon: ShieldCheck },
    { id: 'dataset', label: 'Dataset Analysis', icon: Database },
    { id: 'single', label: 'Single Review Test', icon: Search },
    { id: 'mlops', label: 'MLOps & Monitoring', icon: Activity },
    { id: 'architecture', label: 'System Architecture', icon: GitBranch },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  FAKE REVIEW DETECTION
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  MLOps v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI-powered review authenticity analysis
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 shadow-sm shadow-sky-500/10 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right actions: Health indicator, Theme Toggle, Mobile Button */}
          <div className="flex items-center gap-3">
            
            {/* Live Health Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${
                healthStatus.status === 'healthy' 
                  ? 'bg-emerald-500 animate-pulse' 
                  : healthStatus.status === 'checking' 
                    ? 'bg-amber-400 animate-pulse' 
                    : 'bg-rose-500'
              }`} />
              <span className="font-mono text-[11px]">
                {healthStatus.status === 'healthy' ? 'API Online' : healthStatus.status === 'checking' ? 'Connecting...' : 'API Offline'}
              </span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 mt-2 px-1">
            <span>Backend Status:</span>
            <span className="font-mono text-emerald-400">{healthStatus.status}</span>
          </div>
        </div>
      )}
    </header>
  );
}
