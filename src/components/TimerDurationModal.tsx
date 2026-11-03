import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { TimerSettings } from '../types';
import { DEFAULT_TIMER_SETTINGS } from '../data/initialData';

interface TimerDurationModalProps {
  isOpen: boolean;
  settings: TimerSettings;
  onClose: () => void;
  onSave: (updated: TimerSettings) => void;
}

export const TimerDurationModal: React.FC<TimerDurationModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<TimerSettings>(settings);

  if (!isOpen) return null;

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(val || min)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...draft,
      focusMinutes: clamp(draft.focusMinutes, 1, 180),
      shortBreakMinutes: clamp(draft.shortBreakMinutes, 1, 60),
      longBreakMinutes: clamp(draft.longBreakMinutes, 1, 120),
      longBreakInterval: clamp(draft.longBreakInterval, 2, 10),
      dailyGoalMinutes: clamp(draft.dailyGoalMinutes, 15, 720),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-modal-title"
    >
      <div className="pixel-panel w-full max-w-lg p-6 bg-[#231914]">
        <div className="flex items-center justify-between pb-4 border-b border-[#3C2B22]">
          <div>
            <h2 id="timer-modal-title" className="font-pixel text-base text-[#F5EBE1]">
              Atur Durasi Semua Timer
            </h2>
            <p className="text-xs text-[#B8A292] mt-1">
              Sesuaikan menit fokus, istirahat pendek, istirahat panjang, dan target harian
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan timer"
            className="w-9 h-9 flex items-center justify-center bg-[#18110D] border border-[#473328] text-[#D8C5B6] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Fokus (Menit)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={draft.focusMinutes}
                onChange={(e) =>
                  setDraft({ ...draft, focusMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none font-mono tabular-nums text-base text-[#F5EBE1]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Istirahat Pendek
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={draft.shortBreakMinutes}
                onChange={(e) =>
                  setDraft({ ...draft, shortBreakMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none font-mono tabular-nums text-base text-[#F5EBE1]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Istirahat Panjang
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={draft.longBreakMinutes}
                onChange={(e) =>
                  setDraft({ ...draft, longBreakMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none font-mono tabular-nums text-base text-[#F5EBE1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#33241C]">
            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Interval Istirahat Panjang (Sesi)
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={draft.longBreakInterval}
                onChange={(e) =>
                  setDraft({ ...draft, longBreakInterval: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none font-mono tabular-nums text-sm text-[#F5EBE1]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Target Fokus Harian (Menit)
              </label>
              <input
                type="number"
                min={15}
                max={720}
                step={5}
                value={draft.dailyGoalMinutes}
                onChange={(e) =>
                  setDraft({ ...draft, dailyGoalMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none font-mono tabular-nums text-sm text-[#F5EBE1]"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#33241C]">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm text-[#E8D8C8]">
                Mulai otomatis waktu istirahat setelah sesi fokus
              </span>
              <input
                type="checkbox"
                checked={draft.autoStartBreaks}
                onChange={(e) =>
                  setDraft({ ...draft, autoStartBreaks: e.target.checked })
                }
                className="w-4 h-4 accent-[#D98236]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm text-[#E8D8C8]">
                Mulai otomatis sesi fokus berikutnya setelah istirahat
              </span>
              <input
                type="checkbox"
                checked={draft.autoStartFocus}
                onChange={(e) =>
                  setDraft({ ...draft, autoStartFocus: e.target.checked })
                }
                className="w-4 h-4 accent-[#D98236]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm text-[#E8D8C8]">
                Bunyikan lonceng pixel saat timer selesai
              </span>
              <input
                type="checkbox"
                checked={draft.soundNotification}
                onChange={(e) =>
                  setDraft({ ...draft, soundNotification: e.target.checked })
                }
                className="w-4 h-4 accent-[#D98236]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#3C2B22]">
            <button
              type="button"
              onClick={() => setDraft(DEFAULT_TIMER_SETTINGS)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B8A292] hover:text-[#F5EBE1] cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kembalikan Standar (25/5/15)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-[#18110D] text-[#D8C5B6] border-2 border-[#473328] hover:border-[#6B4E3E] cursor-pointer whitespace-nowrap shrink-0"
              >
                Batal
              </button>
              <button
                type="submit"
                className="pixel-btn px-5 py-2 text-xs font-semibold bg-[#D98236] text-[#18110D] border-2 border-[#F6BA77] cursor-pointer whitespace-nowrap shrink-0"
              >
                Simpan Durasi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
