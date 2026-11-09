import React from 'react';
import { X, Sparkles, Wind, Eye, Flame } from 'lucide-react';
import { ParticleConfig } from '../types';

interface VisualSettingsModalProps {
  isOpen: boolean;
  config: ParticleConfig;
  onClose: () => void;
  onUpdateConfig: (updated: Partial<ParticleConfig>) => void;
}

export const VisualSettingsModal: React.FC<VisualSettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 p-6 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-serif font-bold text-white">Atmospheric Effects</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Samurai Artwork Visibility */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Samurai Backdrop Presence
              </span>
              <span className="text-[11px] font-mono text-cyan-300 uppercase">
                {config.backdropBrightness}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['dim', 'balanced', 'vivid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateConfig({ backdropBrightness: mode })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border capitalize transition-all cursor-pointer ${
                    config.backdropBrightness === mode
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold shadow-sm'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Sakura Cherry Blossom Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="text-sm font-medium text-white block">Floating Sakura Petals</span>
              <span className="text-xs text-slate-400">Drifting cherry blossoms with gentle wind physics</span>
            </div>
            <button
              onClick={() => onUpdateConfig({ sakuraEnabled: !config.sakuraEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                config.sakuraEnabled ? 'bg-pink-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  config.sakuraEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Luminous Embers Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="text-sm font-medium text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Luminous Spirit Embers
              </span>
              <span className="text-xs text-slate-400">Pulsating golden spirit particles & fireflies</span>
            </div>
            <button
              onClick={() => onUpdateConfig({ embersEnabled: !config.embersEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                config.embersEnabled ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  config.embersEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Density Selector */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Particle Density
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateConfig({ density: d })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border capitalize transition-all cursor-pointer ${
                    config.density === d
                      ? 'bg-pink-500/20 border-pink-400 text-white font-semibold shadow-sm'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Drift Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                Wind Drift Speed
              </span>
              <span className="text-xs font-mono text-slate-400">{config.speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={config.speed}
              onChange={(e) => onUpdateConfig({ speed: parseFloat(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
