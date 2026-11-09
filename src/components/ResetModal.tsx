import React from 'react';
import { X, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToDefaults: () => void;
  onClearAll: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onResetToDefaults,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 p-6 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-serif font-bold text-white">Reset Exam Tracker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Choose whether to reset back to the default sample syllabus or completely clear all 6 exams to empty templates.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onResetToDefaults();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-cyan-600/80 hover:bg-cyan-600 border border-cyan-400/40 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Reset to Curated Sample Exams</span>
          </button>

          <button
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Everything (Blank 6 Slots)</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
