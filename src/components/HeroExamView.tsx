import React, { useState } from 'react';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Flame,
  Minus,
} from 'lucide-react';
import { Chapter, Exam, ExamCountdown, ExamProgress } from '../types';
import { formatExamDate } from '../utils/examCalculations';

interface HeroExamViewProps {
  exam: Exam;
  countdown: ExamCountdown;
  progress: ExamProgress;
  totalExams: number;
  onPrevExam: () => void;
  onNextExam: () => void;
  onUpdateExam: (updated: Exam) => void;
  onOpenEditModal: () => void;
}

export const HeroExamView: React.FC<HeroExamViewProps> = ({
  exam,
  countdown,
  progress,
  totalExams,
  onPrevExam,
  onNextExam,
  onUpdateExam,
  onOpenEditModal,
}) => {
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterText, setEditingChapterText] = useState('');
  const [chapterFilter, setChapterFilter] = useState<'all' | 'pending' | 'completed' | 'revised'>('all');

  // Mini study timer for current exam
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);

  const toggleStudyTimer = () => {
    if (timerRunning) {
      if (timerIntervalId) clearInterval(timerIntervalId);
      setTimerRunning(false);
      setTimerIntervalId(null);
    } else {
      const id = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerIntervalId(id);
      setTimerRunning(true);
    }
  };

  const resetStudyTimer = (mins: number) => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    setTimerRunning(false);
    setTimerIntervalId(null);
    setTimerSeconds(mins * 60);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Chapter operations
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      completed: false,
      revised: false,
      revisionCount: 0,
    };
    onUpdateExam({
      ...exam,
      chapters: [...exam.chapters, newCh],
    });
    setNewChapterTitle('');
  };

  const toggleChapterCompleted = (chapterId: string) => {
    const updated = exam.chapters.map((c) => {
      if (c.id === chapterId) {
        const nextCompleted = !c.completed;
        return {
          ...c,
          completed: nextCompleted,
          revised: nextCompleted ? c.revised : false,
          revisionCount: nextCompleted ? Math.max(c.revisionCount, 0) : 0,
        };
      }
      return c;
    });
    onUpdateExam({ ...exam, chapters: updated });
  };

  // User specifically requested: "revised click korle jno bare"
  // Every click on Revised increments the revision count (R1 -> R2 -> R3...)
  const handleIncrementRevision = (chapterId: string) => {
    const updated = exam.chapters.map((c) => {
      if (c.id === chapterId) {
        const currentCount = c.revisionCount || 0;
        const nextCount = currentCount + 1;
        return {
          ...c,
          completed: true,
          revised: true,
          revisionCount: nextCount,
        };
      }
      return c;
    });
    onUpdateExam({ ...exam, chapters: updated });
  };

  // Decrement revision count if user wants to undo
  const handleDecrementRevision = (chapterId: string) => {
    const updated = exam.chapters.map((c) => {
      if (c.id === chapterId) {
        const currentCount = c.revisionCount || 0;
        const nextCount = Math.max(0, currentCount - 1);
        return {
          ...c,
          revised: nextCount > 0,
          revisionCount: nextCount,
        };
      }
      return c;
    });
    onUpdateExam({ ...exam, chapters: updated });
  };

  const handleDeleteChapter = (chapterId: string) => {
    const updated = exam.chapters.filter((c) => c.id !== chapterId);
    onUpdateExam({ ...exam, chapters: updated });
  };

  const handleStartRename = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterText(chapter.title);
  };

  const handleSaveRename = (chapterId: string) => {
    if (!editingChapterText.trim()) return;
    const updated = exam.chapters.map((c) =>
      c.id === chapterId ? { ...c, title: editingChapterText.trim() } : c
    );
    onUpdateExam({ ...exam, chapters: updated });
    setEditingChapterId(null);
  };

  // Filter chapters
  const filteredChapters = exam.chapters.filter((c) => {
    if (chapterFilter === 'completed') return c.completed;
    if (chapterFilter === 'revised') return c.revised || (c.revisionCount || 0) > 0;
    if (chapterFilter === 'pending') return !c.completed;
    return true;
  });

  const getUrgencyBadge = () => {
    switch (countdown.urgency) {
      case 'urgent':
        return { label: 'CRITICAL PRIORITY', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'mid':
        return { label: 'APPROACHING FAST', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'ok':
        return { label: 'ON TRACK', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'done':
        return { label: 'CONQUERED', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      default:
        return { label: 'NO TARGET DATE', color: 'bg-slate-500/20 text-slate-400 border-slate-500/40' };
    }
  };

  const urgencyBadge = getUrgencyBadge();

  return (
    <section className="w-full relative z-10 transition-all duration-500">
      {/* Translucent Glass HUD Card (sized to let the Samurai on the right be visible) */}
      <div className="rounded-2xl border border-white/20 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-5 sm:p-7 lg:p-8 transition-all">
        {/* Top Header & Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded bg-white/10 text-white border border-white/20">
              EXAM 0{exam.id + 1}
            </span>
            {exam.subjectCode && (
              <span className="text-xs font-mono text-cyan-300 tracking-wider">
                {exam.subjectCode}
              </span>
            )}
            <span
              className={`text-[11px] font-mono tracking-wider px-2 py-0.5 rounded border ${urgencyBadge.color}`}
            >
              {urgencyBadge.label}
            </span>
          </div>

          {/* Quick Switcher & Edit Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onPrevExam}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Exam"
              aria-label="Previous Exam"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">
              0{exam.id + 1} / 0{totalExams}
            </span>
            <button
              onClick={onNextExam}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next Exam"
              aria-label="Next Exam"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenEditModal}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Exam</span>
            </button>
          </div>
        </div>

        {/* Title & Core Hero Countdown Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-start">
          {/* Left Column: Big Title & Countdown HUD */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-serif mb-2">
                {exam.name || `Exam #${exam.id + 1}`}
              </h1>

              {exam.notes && (
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-4 max-w-xl">
                  {exam.notes}
                </p>
              )}
            </div>

            {/* Massive Hero Countdown Meter */}
            <div className="rounded-xl border border-white/15 bg-black/45 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  Target Countdown
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatExamDate(exam.date)}</span>
                </div>
              </div>

              {countdown.hasDate && !countdown.isOverdue ? (
                <div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-mono font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                      {countdown.totalHours}
                    </span>
                    <span className="text-xs sm:text-sm font-serif uppercase tracking-wider text-amber-300/90 font-semibold">
                      Hours Remaining
                    </span>
                  </div>

                  {/* Precision Clock Sub-Units */}
                  <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-base sm:text-xl font-mono font-bold text-white tabular-nums">
                        {String(countdown.days).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Days</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base sm:text-xl font-mono font-bold text-white tabular-nums">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Hours</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base sm:text-xl font-mono font-bold text-white tabular-nums">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Mins</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base sm:text-xl font-mono font-bold text-amber-400 tabular-nums">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Secs</span>
                    </div>
                  </div>
                </div>
              ) : countdown.isOverdue ? (
                <div className="py-3 text-center">
                  <span className="text-xl font-serif font-bold text-emerald-400">
                    Exam Completed or Passed
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Update the target date to restart the battle countdown.
                  </p>
                </div>
              ) : (
                <div className="py-3 text-center">
                  <span className="text-base font-serif text-slate-300">
                    No target date scheduled yet
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Edit Exam" above to configure your date and begin tracking.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Progress Meters & Zen Focus Timer */}
          <div className="md:col-span-5 flex flex-col gap-3">
            {/* Progress Gauges Box */}
            <div className="rounded-xl border border-white/15 bg-black/45 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Preparation Metrics
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
                  {progress.readinessScore}% Ready
                </span>
              </div>

              {/* Completion Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Syllabus Done</span>
                  <span className="font-mono text-white tabular-nums font-semibold">
                    {progress.completed}/{progress.total} ch ({progress.completionPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress.completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Revision Progress Bar with Total Revision Count Badge */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Revisions Mastered</span>
                  <span className="font-mono text-emerald-300 tabular-nums font-semibold flex items-center gap-1">
                    <span>{progress.totalRevisions} rounds</span>
                    <span className="text-slate-400 text-[11px]">({progress.revisionPercent}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, Math.max(progress.revisionPercent, (progress.totalRevisions / Math.max(1, progress.total)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Zen Study Timer Component */}
            <div className="rounded-xl border border-white/15 bg-black/45 p-4 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                    Focus Companion
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => resetStudyTimer(25)}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    25m
                  </button>
                  <button
                    onClick={() => resetStudyTimer(50)}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    50m
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-white">
                  {formatTimer(timerSeconds)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleStudyTimer}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Focus</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => resetStudyTimer(25)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters & Syllabus Section */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold font-serif text-white">
                Chapter Syllabus & Revision Status
              </h2>
              <span className="text-xs font-mono text-slate-400">
                ({exam.chapters.length} items)
              </span>
            </div>

            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-black/40 border border-white/10 rounded-lg text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setChapterFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  chapterFilter === 'all'
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({exam.chapters.length})
              </button>
              <button
                onClick={() => setChapterFilter('pending')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  chapterFilter === 'pending'
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending ({exam.chapters.filter((c) => !c.completed).length})
              </button>
              <button
                onClick={() => setChapterFilter('completed')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  chapterFilter === 'completed'
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Done ({progress.completed})
              </button>
              <button
                onClick={() => setChapterFilter('revised')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  chapterFilter === 'revised'
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Revised ({progress.revised})
              </button>
            </div>
          </div>

          {/* Quick Add Chapter Form */}
          <form onSubmit={handleAddChapter} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Add new chapter (e.g. 07. Wavepacket Dynamics)..."
              className="flex-1 bg-black/45 border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Chapter List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredChapters.length === 0 ? (
              <div className="py-8 text-center rounded-xl border border-dashed border-white/10 bg-black/20">
                <p className="text-xs text-slate-400">
                  {chapterFilter === 'all'
                    ? 'No chapters added yet. Add your first topic above.'
                    : `No chapters matching "${chapterFilter}" filter.`}
                </p>
              </div>
            ) : (
              filteredChapters.map((ch) => {
                const isEditing = editingChapterId === ch.id;
                const revCount = ch.revisionCount || 0;

                return (
                  <div
                    key={ch.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition-all ${
                      revCount > 0
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : ch.completed
                        ? 'bg-cyan-950/25 border-cyan-500/30'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Chapter Title or Inline Rename Field */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleChapterCompleted(ch.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                          ch.completed
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-white/30 hover:border-white/60 text-transparent'
                        }`}
                        title={ch.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editingChapterText}
                          onChange={(e) => setEditingChapterText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(ch.id);
                            if (e.key === 'Escape') setEditingChapterId(null);
                          }}
                          className="flex-1 bg-black/60 border border-cyan-400 rounded px-2 py-0.5 text-xs sm:text-sm text-white focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`text-xs sm:text-sm truncate cursor-pointer select-none ${
                            ch.completed
                              ? 'text-slate-300 line-through decoration-slate-500/80'
                              : 'text-white'
                          }`}
                          onClick={() => toggleChapterCompleted(ch.id)}
                        >
                          {ch.title}
                        </span>
                      )}
                    </div>

                    {/* Chapter Actions: Done toggle, Direct Increment Revised button, Minus button, Rename, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveRename(ch.id)}
                          className="px-2.5 py-1 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium cursor-pointer"
                        >
                          Save
                        </button>
                      ) : (
                        <>
                          {/* Completed Done Button */}
                          <button
                            onClick={() => toggleChapterCompleted(ch.id)}
                            className={`px-2 py-0.5 text-xs rounded font-medium border transition-colors cursor-pointer ${
                              ch.completed
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Done
                          </button>

                          {/* Primary "Revised" Button: Increments count on EVERY click as requested! */}
                          <button
                            onClick={() => handleIncrementRevision(ch.id)}
                            className={`flex items-center gap-1 px-2.5 py-0.5 text-xs rounded font-medium border transition-all cursor-pointer active:scale-95 ${
                              revCount > 0
                                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                            title="Click to increment revision count (+1)"
                          >
                            <span>Revised</span>
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 ml-0.5">
                              R{revCount}
                            </span>
                            <span className="text-[10px] text-emerald-300 font-bold">+1</span>
                          </button>

                          {/* Decrement Button: Allows decreasing revision count if clicked too many times */}
                          {revCount > 0 && (
                            <button
                              onClick={() => handleDecrementRevision(ch.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                              title="Decrease revision count (-1)"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}

                          {/* Rename */}
                          <button
                            onClick={() => handleStartRename(ch)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Rename chapter"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteChapter(ch.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete chapter"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
