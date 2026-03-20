import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { BEHAVIOR_GUIDE } from '@/lib/behaviorGuide';

export default function BehaviorDetailPopup({ behavior, onClose }) {
  if (!behavior) return null;
  const guide = BEHAVIOR_GUIDE[behavior.code] || {};

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-end sm:items-center justify-center p-4"
      onPointerDown={onClose}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-700">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              {behavior.code}
            </p>
            <h2 className="text-white font-bold text-lg">{behavior.name_it}</h2>
            {behavior.definition_it && (
              <p className="text-slate-400 text-sm mt-1">{behavior.definition_it}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors ml-4 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {guide.positive && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">
                  Segnali Positivi (2–3)
                </h3>
              </div>
              <ul className="space-y-2">
                {guide.positive.map((clue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                    {clue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guide.negative && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-400" />
                <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wide">
                  Segnali Negativi (0–1)
                </h3>
              </div>
              <ul className="space-y-2">
                {guide.negative.map((clue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-500 mt-0.5 shrink-0">−</span>
                    {clue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!guide.positive && !guide.negative && (
            <p className="text-slate-500 text-sm">Nessuna guida disponibile per questo comportamento.</p>
          )}
        </div>
      </div>
    </div>
  );
}