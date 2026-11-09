import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Target, FileText } from 'lucide-react';
import { Exam } from '../types';

interface EditExamModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Exam) => void;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [date, setDate] = useState('');
  const [targetScore, setTargetScore] = useState(90);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (exam) {
      setName(exam.name || '');
      setSubjectCode(exam.subjectCode || '');
      setDate(exam.date || '');
      setTargetScore(exam.targetScore || 90);
      setNotes(exam.notes || '');
    }
  }, [exam]);

  if (!isOpen || !exam) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...exam,
      name: name.trim(),
      subjectCode: subjectCode.trim(),
      date,
      targetScore: Number(targetScore),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/20 p-6 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Exam #{exam.id + 1}
            </span>
            <h2 className="text-lg font-serif font-bold text-white">Configure Exam</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Exam Name / Title
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Advanced Physics III"
                className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="e.g. PHY-301"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Score (%)
              </label>
              <div className="relative">
                <Target className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Exam Date & Time (Countdown Target)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Live countdown calculates hours, minutes, and seconds until this instant.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Strategy & Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Key formulas, venue details, revision priorities..."
                className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shadow-lg"
            >
              Save Exam Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
