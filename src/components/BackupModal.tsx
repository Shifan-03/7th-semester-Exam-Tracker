import React, { useState } from 'react';
import { X, Copy, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { Exam } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  exams: Exam[];
  onClose: () => void;
  onRestore: (importedExams: Exam[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  exams,
  onClose,
  onRestore,
}) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentJson = JSON.stringify({ version: 2, timestamp: new Date().toISOString(), exams }, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg('Failed to copy automatically. Please select text manually.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samurai-exam-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const parsed = JSON.parse(importText.trim());
      let candidateExams: any[] = [];

      if (Array.isArray(parsed)) {
        candidateExams = parsed;
      } else if (parsed && Array.isArray(parsed.exams)) {
        candidateExams = parsed.exams;
      } else {
        throw new Error('JSON must contain an "exams" array or list of exams.');
      }

      if (candidateExams.length !== 6) {
        throw new Error(`Expected exactly 6 exams, found ${candidateExams.length}.`);
      }

      // Normalize into Exam structure (supports legacy attachment schema too)
      const normalized: Exam[] = candidateExams.map((e, idx) => {
        const rawChapters = e.chapters || e.ch || [];
        const chapters = rawChapters.map((c: any, cIdx: number) => ({
          id: c.id ? String(c.id) : `ch-${idx}-${cIdx}`,
          title: c.title || c.t || `Chapter ${cIdx + 1}`,
          completed: Boolean(c.completed || c.c),
          revised: Boolean(c.revised || c.r),
          revisionCount: Number(c.revisionCount || c.n || 0),
        }));

        return {
          id: idx,
          name: e.name || `Exam ${idx + 1}`,
          subjectCode: e.subjectCode || '',
          date: e.date || '',
          targetScore: Number(e.targetScore || 90),
          color: e.color || '#38BDF8',
          notes: e.notes || '',
          chapters,
        };
      });

      onRestore(normalized);
      setSuccessMsg('Successfully restored all 6 exams!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-white/20 p-6 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h2 className="text-lg font-serif font-bold text-white">Backup & Restore</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Current Backup JSON (Export)
          </label>
          <div className="relative">
            <textarea
              readOnly
              value={currentJson}
              className="w-full h-32 bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-300 select-all resize-none focus:outline-none"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Import Backup
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your backup JSON here to restore..."
            className="w-full h-24 bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-400"
          />

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-400 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 mt-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
