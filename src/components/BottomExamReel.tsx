import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Exam } from '../types';
import { calculateCountdown, calculateProgress } from '../utils/examCalculations';

interface BottomExamReelProps {
  exams: Exam[];
  activeIndex: number;
  onSelectExam: (index: number) => void;
}

export const BottomExamReel: React.FC<BottomExamReelProps> = ({
  exams,
  activeIndex,
  onSelectExam,
}) => {
  const reelRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active card into view when activeIndex changes
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    const activeCard = reel.children[activeIndex] as HTMLElement;
    if (activeCard) {
      activeCard.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  // Support mouse wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (!reelRef.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // already horizontal
    reelRef.current.scrollLeft += e.deltaY * 0.9;
  };

  const scrollLeft = () => {
    if (reelRef.current) {
      reelRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (reelRef.current) {
      reelRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative z-20 mt-10">
      {/* Reel Header & Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Battle Roster — All 6 Exams
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            (Scroll or click card to switch main view)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={scrollLeft}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Container */}
      <div
        ref={reelRef}
        onWheel={handleWheel}
        tabIndex={0}
        aria-label="Exam carousel"
        className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar focus:outline-none"
      >
        {exams.map((exam, idx) => {
          const isActive = idx === activeIndex;
          const countdown = calculateCountdown(exam.date);
          const progress = calculateProgress(exam);

          const getStatusText = () => {
            if (!countdown.hasDate) return 'No Date';
            if (countdown.isOverdue) return 'Completed';
            if (countdown.totalHours <= 72) return `${countdown.totalHours}h left`;
            return `${countdown.days}d ${countdown.hours}h left`;
          };

          return (
            <div
              key={exam.id}
              onClick={() => onSelectExam(idx)}
              className={`flex-shrink-0 w-64 sm:w-72 snap-center rounded-xl p-4 transition-all duration-300 cursor-pointer text-left select-none border relative overflow-hidden group backdrop-blur-md ${
                isActive
                  ? 'bg-slate-950/85 border-amber-400/90 shadow-xl shadow-orange-500/20 scale-[1.02]'
                  : 'bg-slate-950/60 hover:bg-slate-950/80 border-white/15 hover:border-white/30 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Active Glow Accent Strip */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />
              )}

              {/* Card Header: Number & Code */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  {exam.subjectCode && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {exam.subjectCode}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <Clock
                    className={`w-3 h-3 ${
                      countdown.urgency === 'urgent'
                        ? 'text-rose-400'
                        : countdown.urgency === 'mid'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={
                      countdown.urgency === 'urgent'
                        ? 'text-rose-400 font-bold'
                        : countdown.urgency === 'mid'
                        ? 'text-amber-400 font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    {getStatusText()}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold font-serif text-white truncate mb-3 group-hover:text-cyan-300 transition-colors">
                {exam.name || `Exam 0${idx + 1}`}
              </h3>

              {/* Mini Progress Bars */}
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>Done</span>
                    <span>{progress.completionPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress.completionPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>Revised</span>
                    <span>{progress.revisionPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress.revisionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Chapters summary & indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2.5 border-t border-white/5">
                <span>
                  {progress.completed}/{progress.total} chapters
                </span>
                {isActive ? (
                  <span className="text-cyan-400 flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    Focused
                  </span>
                ) : (
                  <span className="text-slate-500 group-hover:text-slate-300 text-[10px] uppercase">
                    Click to view
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
