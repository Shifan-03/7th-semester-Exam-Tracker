import React from 'react';
import { Sparkles, Database, RotateCcw, Timer, Moon, Sun } from 'lucide-react';
import { ThemeType } from '../types';

interface NavbarProps {
  activeExamIndex: number;
  totalExams: number;
  lastSaved?: Date;
  theme: ThemeType;
  onToggleTheme: () => void;
  onOpenVisualSettings: () => void;
  onOpenBackup: () => void;
  onOpenReset: () => void;
  onOpenFocusTimer: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeExamIndex,
  totalExams,
  lastSaved,
  theme,
  onToggleTheme,
  onOpenVisualSettings,
  onOpenBackup,
  onOpenReset,
  onOpenFocusTimer,
  zenMode,
  onToggleZenMode,
}) => {
  if (zenMode) {
    return (
      <div className="fixed top-4 right-4 z-50 transition-opacity duration-300">
        <button
          onClick={onToggleZenMode}
          className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-md shadow-lg transition-all"
        >
          Exit Zen Mode
        </button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-slate-950/40 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 font-serif font-black text-sm shadow-inner">
            侍
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-serif uppercase">
                Samurai Tracker
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-Saved</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">
              Exam #{activeExamIndex + 1} of {totalExams} Active · Preserved
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 clean single-line nav actions */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-slate-300">
          <button
            onClick={onOpenFocusTimer}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Timer className="w-4 h-4 text-amber-400" />
            <span>Zen Timer</span>
          </button>

          <button
            onClick={onOpenVisualSettings}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Samurai FX</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Backup Data</span>
          </button>

          <button
            onClick={onOpenReset}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + quick toggles */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-300 hover:text-white rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-300" />
            )}
          </button>

          <button
            onClick={onToggleZenMode}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600/90 hover:bg-red-500 text-white shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Focus Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
