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
import { Eye, EyeOff, Sparkles, FileText, ChevronLeft, ChevronRight, X, Upload, Calendar } from 'lucide-react';
import { supabase } from './supabaseClient';

const ACTIVE_INDEX_KEY = 'examTracker.activeIndex';

export default function App() {
  const [exams, setExams] = useState<Exam[]>(getInitialExams());
  const [selectedPdfChapter, setSelectedPdfChapter] = useState<{ examIndex: number; chapterIndex: number } | null>(null);

  // Supabase থেকে ডাটা ফেচ
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
                pdfUrl: c.pdf_url || '',
              }))
            : [];
          
          return {
            id: i,
            name: found ? found.name || '' : '',
            subjectCode: found?.subject_code || '',
            date: found && found.date ? found.date : '',
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

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  const [activeIndex, setActiveIndex] = useState<number>(() => {
    try {
      const savedIdx = localStorage.getItem(ACTIVE_INDEX_KEY);
      if (savedIdx !== null) {
        const idx = parseInt(savedIdx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < 6) return idx;
      }
    } catch {}
    return 0;
  });

  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Supabase-এ সিঙ্ক ও সেভ লজিক
  const persistToSupabase = useCallback(async (updatedExams: Exam[]) => {
    try {
      for (const exam of updatedExams) {
        await supabase.from('exams').upsert({
          id: exam.id,
          name: exam.name,
          subject_code: exam.subjectCode,
          date: exam.date || null,
          target_score: exam.targetScore,
          color: exam.color,
          notes: exam.notes,
        });

        await supabase.from('chapters').delete().eq('exam_id', exam.id);
        
        if (exam.chapters && exam.chapters.length > 0) {
          const chapterRows = exam.chapters.map((c, index) => ({
            id: String(c.id || `${exam.id}-${index}-${Date.now()}`),
            exam_id: exam.id,
            title: c.title,
            completed: c.completed,
            revised: c.revised,
            revision_count: c.revisionCount,
            pdf_url: (c as any).pdfUrl || null,
          }));
          
          await supabase.from('chapters').upsert(chapterRows);
        }
      }
      setLastSaved(new Date());
    } catch (e) {
      console.error('Failed to sync with Supabase', e);
    }
  }, []);

  const handleUpdateExam = useCallback((updated: Exam) => {
    setExams((prev) => {
      const next = prev.map((e) => (e.id === updated.id ? updated : e));
      persistToSupabase(next);
      return next;
    });
  }, [persistToSupabase]);

  const handleSelectExam = useCallback((idx: number) => {
    setActiveIndex(idx);
    try {
      localStorage.setItem(ACTIVE_INDEX_KEY, String(idx));
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2500);
  }, []);

  // PDF Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, examIdx: number, chapterId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please upload a valid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Pdf = event.target?.result as string;
      setExams((prevExams) => {
        const nextExams = [...prevExams];
        const targetExam = { ...nextExams[examIdx] };
        targetExam.chapters = targetExam.chapters.map((ch) => 
          ch.id === chapterId ? { ...ch, pdfUrl: base64Pdf } : ch
        );
        nextExams[examIdx] = targetExam;
        persistToSupabase(nextExams);
        return nextExams;
      });
      showToast('PDF Attached Successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (selectedPdfChapter) {
        if (e.key === 'ArrowLeft') handlePrevPdf();
        if (e.key === 'ArrowRight') handleNextPdf();
        if (e.key === 'Escape') setSelectedPdfChapter(null);
        return;
      }

      if (e.key === 'ArrowLeft') handleSelectExam(activeIndex > 0 ? activeIndex - 1 : 5);
      if (e.key === 'ArrowRight') handleSelectExam(activeIndex < 5 ? activeIndex + 1 : 0);
      if (e.key === 'v' || e.key === 'V') setSamuraiFocusView((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, selectedPdfChapter, handleSelectExam]);

  const handlePrevPdf = () => {
    if (!selectedPdfChapter) return;
    const { examIndex, chapterIndex } = selectedPdfChapter;
    if (chapterIndex > 0) {
      setSelectedPdfChapter({ examIndex, chapterIndex: chapterIndex - 1 });
    } else if (examIndex > 0) {
      const prevExam = exams[examIndex - 1];
      if (prevExam.chapters.length > 0) {
        setSelectedPdfChapter({ examIndex: examIndex - 1, chapterIndex: prevExam.chapters.length - 1 });
      }
    }
  };

  const handleNextPdf = () => {
    if (!selectedPdfChapter) return;
    const { examIndex, chapterIndex } = selectedPdfChapter;
    const currentExam = exams[examIndex];
    if (chapterIndex < currentExam.chapters.length - 1) {
      setSelectedPdfChapter({ examIndex, chapterIndex: chapterIndex + 1 });
    } else if (examIndex < exams.length - 1) {
      if (exams[examIndex + 1].chapters.length > 0) {
        setSelectedPdfChapter({ examIndex: examIndex + 1, chapterIndex: 0 });
      }
    }
  };

  const activeExam = exams[activeIndex] || exams[0];
  const activeCountdown = calculateCountdown(activeExam.date, currentTime);
  const activeProgress = calculateProgress(activeExam);

  const currentPdfChapter = selectedPdfChapter 
    ? exams[selectedPdfChapter.examIndex]?.chapters[selectedPdfChapter.chapterIndex] 
    : null;

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

      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10 flex flex-col min-h-[calc(100vh-4rem)] justify-between">
        
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSamuraiFocusView((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                samuraiFocusView
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-white/20 text-slate-200'
              }`}
            >
              {samuraiFocusView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{samuraiFocusView ? 'Show Exam Dashboard' : 'Gaze at Samurai & Particles'}</span>
            </button>
          </div>

          <button
            onClick={() => setIsVisualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Particles & Motion</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {!samuraiFocusView ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 w-full">
                <HeroExamView
                  exam={activeExam}
                  countdown={activeCountdown}
                  progress={activeProgress}
                  totalExams={exams.length}
                  onPrevExam={() => handleSelectExam(activeIndex > 0 ? activeIndex - 1 : 5)}
                  onNextExam={() => handleSelectExam(activeIndex < 5 ? activeIndex + 1 : 0)}
                  onUpdateExam={handleUpdateExam}
                  onOpenEditModal={() => setIsEditModalOpen(true)}
                />

                {/* Quick Date Select & Calendar Bar */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Exam Schedule Date:</span>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <input
                      type="datetime-local"
                      value={activeExam.date || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const updated = { ...activeExam, date: newDate };
                        handleUpdateExam(updated);
                      }}
                      className="bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-mono"
                    />
                  </div>
                </div>

                {/* Chapter PDFs List */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Chapter PDFs & Notes
                  </h3>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {activeExam.chapters.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center">No chapters added yet.</p>
                    ) : (
                      activeExam.chapters.map((ch, idx) => (
                        <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                            <span className="text-xs font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                            <span className="text-xs text-slate-200 truncate">{ch.title}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs text-slate-300 cursor-pointer transition-colors flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{ch.pdfUrl ? 'Replace PDF' : 'Attach PDF'}</span>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, activeIndex, ch.id)}
                              />
                            </label>

                            {ch.pdfUrl && (
                              <button
                                onClick={() => setSelectedPdfChapter({ examIndex: activeIndex, chapterIndex: idx })}
                                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-medium flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-900/40 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" /> Read PDF
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-4 flex-col items-end justify-between self-stretch pointer-events-none">
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/20 backdrop-blur-md max-w-xs text-right pointer-events-auto">
                  <div className="flex items-center justify-end gap-2 text-amber-300 text-xs font-mono font-bold mb-1">
                    <span>REALISTIC FLAME SAMURAI</span>
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                    "Realistic warrior with blazing fire katana and wind-billowing hair & cape."
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <button
                onClick={() => setSamuraiFocusView(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Return to Dashboard
              </button>
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

      {/* Fullscreen PDF Reader Modal with Arrow Navigation */}
      {selectedPdfChapter && currentPdfChapter && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">{currentPdfChapter.title}</h3>
                <p className="text-[11px] text-slate-400">{exams[selectedPdfChapter.examIndex]?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-white/10">
                <button
                  onClick={handlePrevPdf}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Previous Chapter PDF"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300">
                  Ch {selectedPdfChapter.chapterIndex + 1} / {exams[selectedPdfChapter.examIndex]?.chapters.length}
                </span>
                <button
                  onClick={handleNextPdf}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Next Chapter PDF"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setSelectedPdfChapter(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-slate-900/50 p-2 sm:p-4">
            <button
              onClick={handlePrevPdf}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-cyan-600 transition-all shadow-2xl backdrop-blur-md cursor-pointer"
              title="Previous PDF"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextPdf}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-cyan-600 transition-all shadow-2xl backdrop-blur-md cursor-pointer"
              title="Next PDF"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {currentPdfChapter.pdfUrl ? (
              <iframe
                src={currentPdfChapter.pdfUrl}
                className="w-full h-full rounded-xl border border-white/10 bg-white"
                title={currentPdfChapter.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-12 h-12 mb-2 opacity-50" />
                <p>No PDF uploaded for this chapter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <EditExamModal exam={activeExam} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateExam} />
      <VisualSettingsModal isOpen={isVisualModalOpen} config={particleConfig} onClose={() => setIsVisualModalOpen(false)} onUpdateConfig={(p) => setParticleConfig((prev) => ({ ...prev, ...p }))} />
      <BackupModal isOpen={isBackupModalOpen} exams={exams} onClose={() => setIsBackupModalOpen(false)} onRestore={(imp) => { setExams(imp); persistToSupabase(imp); }} />
      <ResetModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onResetToDefaults={() => setExams(getInitialExams())} onClearAll={() => setExams([])} />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/
