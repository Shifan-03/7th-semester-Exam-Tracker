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
import { supabase } from './supabaseClient';

const ACTIVE_INDEX_KEY = 'examTracker.activeIndex';

export default function App() {
  const [exams, setExams] = useState<Exam[]>(getInitialExams());

  // Supabase থেকে ডাটা ফেচ করা
  const fetchFromSupabase = useCallback(async () => {
    try {
      const { data: dbExams, error: errExams } = await supabase.from('exams').select('*');
      const { data: dbChapters, error: errChapters } = await supabase.from('chapters').select('*');

      if (errExams || errChapters) {
        console.error('Error fetching from Supabase:', errExams || errChapters);
        return;
      }

      if (dbExams && dbExams.length > 0) {
        const loadedExams = Array.from({ length: 6 }, (_, i) => {
          const found = dbExams.find((e: any) => Number(e.id) === i);
          const chs = dbChapters 
            ? dbChapters.filter((c: any) => Number(c.exam_id) === i).map((c: any) => ({
                id: String(c.id),
                title: c.title || '',
                completed: Boolean(c.completed),
                revised: Boolean(c.revised),
                revisionCount: Number(c.revision_count || 0),
              }))
            : [];
          
          return {
            id: i,
            name: found ? found.name || '' : '',
            subjectCode: found?.subject_code || '',
            date: found && found.date ? found.date.substring(0, 16) : '',
            targetScore: found?.target_score || 90,
            color: found?.color || '#38BDF8',
            notes: found?.notes || '',
            chapters: chs,
          };
        });
        setExams(loadedExams);
      }
    } catch (e) {
      console.error('Failed to load from Supabase', e);
    }
  }, []);

  // পেজ লোড হওয়ার সময় Supabase থেকে ডাটা ফেচ করা
  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // Active Index Persist
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

  // Supabase-এ ডাটা সেভ ও সিঙ্ক করার সেফ লজিক (BigInt Safe integer ID)
  const persistToSupabase = useCallback(async (updatedExams: Exam[]) => {
    try {
      for (const exam of updatedExams) {
        // 1. Upsert Exam
        await supabase.from('exams').upsert({
          id: exam.id,
          name: exam.name,
          subject_code: exam.subjectCode,
          date: exam.date ? new Date(exam.date).toISOString() : null,
          target_score: exam.targetScore,
          color: exam.color,
          notes: exam.notes,
        });

        // 2. Delete and insert fresh chapters with valid BigInt IDs
        await supabase.from('chapters').delete().eq('exam_id', exam.id);
        
        if (exam.chapters && exam.chapters.length > 0) {
          const chapterRows = exam.chapters.map((c, index) => {
            // দশমিক মুক্ত পূর্ণসংখ্যা আইডি জেনারেট করা হচ্ছে
            const parsedId = parseInt(c.id, 10);
            const safeId = !isNaN(parsedId) 
              ? parsedId 
              : Math.floor(Date.now() + index + Math.random() * 1000);

            return {
              id: safeId,
              exam_id: exam.id,
              title: c.title,
              completed: c.completed,
              revised: c.revised,
              revision_count: c.revisionCount,
            };
          });
          
          await supabase.from('chapters').upsert(chapterRows);
        }
      }
      setLastSaved(new Date());
    } catch (e) {
      console.error('Failed to sync with Supabase', e);
    }
  }, []);

  // Exam Update Handler
  const handleUpdateExam = useCallback((updated: Exam) => {
    setExams((prev) => {
      const next = prev.map((e) => (e.id === updated.id ? updated : e));
      persistToSupabase(next);
      return next;
    });
  }, [persistToSupabase]);

  // Exam Select Handler
  const handleSelectExam = useCallback((idx: number) => {
    setActiveIndex(idx);
    try {
      localStorage.setItem(ACTIVE_INDEX_KEY, String(idx));
    } catch {
      // ignore
    }
  }, []);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  
  const [samuraiFocusView, setSamuraiFocusView] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Keyboard navigation
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
    persistToSupabase(defaults);
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
    persistToSupabase(blank);
    handleSelectExam(0);
    showToast('Cleared all 6 exam slots.');
  };

  const handleRestore = (imported: Exam[]) => {
    setExams(imported);
    persistToSupabase(imported);
    handleSelectExam(0);
    showToast('Backup restored successfully.');
  };

  const activeExam = exams[activeIndex] || exams[0];
  const activeCountdown = calculateCountdown(activeExam.date, currentTime);
  const activeProgress = calculateProgress(activeExam);

  return (
    <div className="min-h-screen text-slate-100 relative selection:bg-cyan-500/30 selection:text-white">
      <ParticleBackground config={particleConfig} />

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

      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10 flex flex-col min-h-[calc(100vh-4rem)] justify-between">
        
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

        <div className="flex-1 flex flex-col justify-center">
          {!samuraiFocusView ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

              <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 2xl:col-span-5 flex-col items-end justify-between self-stretch pointer-events-none pr-4">
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

                <div className="p-3 rounded-xl bg-slate-950/30 border border-white/10 backdrop-blur-sm pointer-events-auto text-xs text-slate-400 font-mono">
                  <span>Scroll bottom cards to change target</span>
                </div>
              </div>
            </div>
          ) : (
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

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 border border-white/20 text-white text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
