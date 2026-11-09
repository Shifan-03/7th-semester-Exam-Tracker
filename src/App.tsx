import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroExamView } from './components/HeroExamView';
import { BottomExamReel } from './components/BottomExamReel';
import { ParticleBackground } from './components/ParticleBackground';
import { EditExamModal } from './components/EditExamModal';
import { BackupModal } from './components/BackupModal';
import { VisualSettingsModal } from './components/VisualSettingsModal';
import { ResetModal } from './components/ResetModal';
import { Exam, ParticleConfig, ThemeType } from './types';
import { getInitialExams } from './data/defaultExams';
import { calculateCountdown, calculateProgress } from './utils/examCalculations';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'examTracker.v2';
const BACKUP_KEY = 'examTracker.backup';
const ACTIVE_INDEX_KEY = 'examTracker.activeIndex';
const LEGACY_KEY = 'examTracker.v1';

export default function App() {
  // Helper to load persisted exams with fallback recovery
  const loadSavedExams = (): Exam[] => {
    try {
      // 1. Primary storage check
      const primary = localStorage.getItem(STORAGE_KEY);
      if (primary) {
        const parsed = JSON.parse(primary);
        if (Array.isArray(parsed) && parsed.length === 6) return parsed;
        if (parsed && Array.isArray(parsed.exams) && parsed.exams.length === 6) return parsed.exams;
      }

      // 2. Backup storage check
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length === 6) return parsed;
        if (parsed && Array.isArray(parsed.exams) && parsed.exams.length === 6) return parsed.exams;
      }

      // 3. Legacy storage check
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (parsedLegacy && parsedLegacy.exams && parsedLegacy.exams.length === 6) {
          return parsedLegacy.exams.map((e: any, idx: number) => ({
            id: idx,
            name: e.name || '',
            subjectCode: '',
            date: e.date || '',
            targetScore: 90,
            color: '#38BDF8',
            notes: '',
            chapters: (e.ch || []).map((c: any, cIdx: number) => ({
              id: String(c.id || cIdx),
              title: c.t || `Chapter ${cIdx + 1}`,
              completed: Boolean(c.c),
              revised: Boolean(c.r),
              revisionCount: Number(c.n || 0),
            })),
          }));
        }
      }
    } catch (e) {
      console.warn('Error reading stored exams', e);
    }
    return getInitialExams();
  };

  const [exams, setExams] = useState<Exam[]>(loadSavedExams);

  // Persist and restore active index so user returns to the exact exam after refresh
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    try {
      const savedIdx = localStorage.getItem(ACTIVE_INDEX_KEY);
      if (savedIdx !== null) {
        const idx = parseInt(savedIdx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < 6) return idx;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Direct synchronous save helper to guarantee zero data loss on instant refresh/unload
  const persistImmediately = useCallback((newExams: Exam[]) => {
    try {
      const serialized = JSON.stringify(newExams);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_KEY, serialized);
      setLastSaved(new Date());
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }, []);

  // Update active exam with instant persistence
  const handleUpdateExam = useCallback((updated: Exam) => {
    setExams((prev) => {
      const next = prev.map((e) => (e.id === updated.id ? updated : e));
      persistImmediately(next);
      return next;
    });
  }, [persistImmediately]);

  // Update active exam index with persistence
  const handleSelectExam = useCallback((idx: number) => {
    setActiveIndex(idx);
    try {
      localStorage.setItem(ACTIVE_INDEX_KEY, String(idx));
    } catch {
      // ignore
    }
  }, []);

  // Flush before window unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistImmediately(exams);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exams, persistImmediately]);

  // Live timer tick for countdown seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic safety flush
  useEffect(() => {
    persistImmediately(exams);
  }, [exams, persistImmediately]);

  const [theme, setTheme] = useState<ThemeType>('dark');
  useEffect(() => {
    if (theme === 'dark' || theme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [particleConfig, setParticleConfig] = useState<ParticleConfig>({
    sakuraEnabled: true,
    embersEnabled: true,
    density: 'high',
    speed: 1.2,
    backdropBrightness: 'vivid',
    backdropBlur: false,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  
  // Quick toggle to hide HUD and gaze directly at the Samurai on the cliff with drifting sakura
  const [samuraiFocusView, setSamuraiFocusView] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Keyboard navigation for Prev/Next exam
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowLeft') {
        handleSelectExam(activeIndex > 0 ? activeIndex - 1 : 5);
      } else if (e.key === 'ArrowRight') {
        handleSelectExam(activeIndex < 5 ? activeIndex + 1 : 0);
      } else if (e.key === 'v' || e.key === 'V') {
        setSamuraiFocusView((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleSelectExam]);

  const handlePrevExam = () => {
    handleSelectExam(activeIndex > 0 ? activeIndex - 1 : 5);
  };

  const handleNextExam = () => {
    handleSelectExam(activeIndex < 5 ? activeIndex + 1 : 0);
  };

  const handleResetToDefaults = () => {
    const defaults = getInitialExams();
    setExams(defaults);
    persistImmediately(defaults);
    handleSelectExam(0);
    showToast('Reset to curated syllabus successfully.');
  };

  const handleClearAll = () => {
    const blank: Exam[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      name: '',
      subjectCode: '',
      date: '',
      targetScore: 90,
      color: '#38BDF8',
      notes: '',
      chapters: [],
    }));
    setExams(blank);
    persistImmediately(blank);
    handleSelectExam(0);
    showToast('Cleared all 6 exam slots.');
  };

  const handleRestore = (imported: Exam[]) => {
    setExams(imported);
    persistImmediately(imported);
    handleSelectExam(0);
    showToast('Backup restored successfully.');
  };

  const activeExam = exams[activeIndex] || exams[0];
  const activeCountdown = calculateCountdown(activeExam.date, currentTime);
  const activeProgress = calculateProgress(activeExam);

  return (
    <div className="min-h-screen text-slate-100 relative selection:bg-cyan-500/30 selection:text-white">
      {/* Background with Samurai on Cliff and Floating Sakura Particle Animation */}
      <ParticleBackground config={particleConfig} />

      {/* Top Navigation */}
      <Navbar
        activeExamIndex={activeIndex}
        totalExams={exams.length}
        lastSaved={lastSaved}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenVisualSettings={() => setIsVisualModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenReset={() => setIsResetModalOpen(true)}
        onOpenFocusTimer={() => showToast('Use the Focus Companion on the right side of the hero card!')}
        zenMode={zenMode}
        onToggleZenMode={() => setZenMode((z) => !z)}
      />

      {/* Main Content Area */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10 flex flex-col min-h-[calc(100vh-4rem)] justify-between">
        
        {/* Quick View Controls Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSamuraiFocusView((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                samuraiFocusView
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-white/20 text-slate-200 hover:text-white'
              }`}
            >
              {samuraiFocusView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{samuraiFocusView ? 'Show Exam Dashboard' : 'Gaze at Samurai & Particles'}</span>
            </button>

            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              (Press "V" key or toggle to view warrior)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisualModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Particles & Motion</span>
            </button>
          </div>
        </div>

        {/* Content Section: Hero Card positioned on left, keeping the Samurai on the right cliff completely visible! */}
        <div className="flex-1 flex flex-col justify-center">
          {!samuraiFocusView ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Prominent Full-Screen Exam Card */}
              <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-7 transition-all duration-500">
                <HeroExamView
                  exam={activeExam}
                  countdown={activeCountdown}
                  progress={activeProgress}
                  totalExams={exams.length}
                  onPrevExam={handlePrevExam}
                  onNextExam={handleNextExam}
                  onUpdateExam={handleUpdateExam}
                  onOpenEditModal={() => setIsEditModalOpen(true)}
                />
              </div>

              {/* Right Column: Samurai Presence Vignette & Quick Stats */}
              <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 2xl:col-span-5 flex-col items-end justify-between self-stretch pointer-events-none pr-4">
                {/* Floating Samurai Warrior Badge */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/20 backdrop-blur-md max-w-xs text-right pointer-events-auto shadow-xl">
                  <div className="flex items-center justify-end gap-2 text-amber-300 text-xs font-mono font-bold mb-1">
                    <span>REALISTIC FLAME SAMURAI</span>
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
                    "Realistic warrior with blazing fire katana and wind-billowing hair & cape."
                  </p>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>Fire Blade</span>
                    <span className="text-orange-400 font-bold">Blazing</span>
                  </div>
                </div>

                {/* Bottom Callout hint */}
                <div className="p-3 rounded-xl bg-slate-950/30 border border-white/10 backdrop-blur-sm pointer-events-auto text-xs text-slate-400 font-mono">
                  <span>Scroll bottom cards to change target</span>
                </div>
              </div>
            </div>
          ) : (
            /* Samurai Focus Mode (cards hidden so user can admire the standing samurai, moon, and drifting sakura) */
            <div className="flex flex-col items-center justify-center py-24 text-center select-none">
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/20 backdrop-blur-md max-w-md shadow-2xl">
                <span className="text-2xl font-serif text-white font-bold block mb-2">
                  Samurai Contemplation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  The honorable warrior stands on the cliff amidst drifting sakura petals.
                  Take a deep breath and regain clarity.
                </p>
                <button
                  onClick={() => setSamuraiFocusView(false)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg"
                >
                  Return to Exam Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Horizontal Reel of 6 Exams with Live Scroll Sync */}
        {!zenMode && (
          <BottomExamReel
            exams={exams}
            activeIndex={activeIndex}
            onSelectExam={(idx) => {
              handleSelectExam(idx);
              setSamuraiFocusView(false);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <EditExamModal
        exam={activeExam}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          handleUpdateExam(updated);
          showToast(`Saved ${updated.name || 'Exam'}`);
        }}
      />

      <VisualSettingsModal
        isOpen={isVisualModalOpen}
        config={particleConfig}
        onClose={() => setIsVisualModalOpen(false)}
        onUpdateConfig={(partial) => {
          setParticleConfig((prev) => ({ ...prev, ...partial }));
        }}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        exams={exams}
        onClose={() => setIsBackupModalOpen(false)}
        onRestore={handleRestore}
      />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetToDefaults={handleResetToDefaults}
        onClearAll={handleClearAll}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 border border-white/20 text-white text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
