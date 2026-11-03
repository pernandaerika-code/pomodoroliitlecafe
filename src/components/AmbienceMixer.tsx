import React from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { AmbienceChannelId, AmbienceChannelState } from '../types';

interface AmbienceMixerProps {
  isPlaying: boolean;
  channels: AmbienceChannelState[];
  onToggleMaster: () => void;
  onToggleChannel: (id: AmbienceChannelId) => void;
  onChangeVolume: (id: AmbienceChannelId, volume: number) => void;
  onApplyPreset: (preset: 'rainLofi' | 'deepQuiet' | 'cozyCafe') => void;
}

export const AmbienceMixer: React.FC<AmbienceMixerProps> = ({
  isPlaying,
  channels,
  onToggleMaster,
  onToggleChannel,
  onChangeVolume,
  onApplyPreset,
}) => {
  return (
    <section className="pixel-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#3C2B22]">
        <div>
          <h2 className="font-pixel text-sm tracking-wide text-[#F5EBE1]">
            Musik & Suasana Kafe
          </h2>
          <p className="text-xs text-[#B8A292] mt-0.5">
            Racik suara latar langsung di browser tanpa koneksi eksternal
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleMaster}
          className={`pixel-btn inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap shrink-0 ${
            isPlaying
              ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77]'
              : 'bg-[#2E2019] text-[#F5EBE1] border-[#523B2F] hover:border-[#D98236]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Hentikan Audio
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Putar Suasana
            </>
          )}
        </button>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2 py-3 border-b border-[#3C2B22]">
        <span className="text-xs text-[#A89182] mr-1">Racikan Cepat:</span>
        <button
          type="button"
          onClick={() => onApplyPreset('rainLofi')}
          className="px-2.5 py-1 text-xs font-medium bg-[#18110D] hover:bg-[#2E2019] text-[#E8D8C8] border border-[#473328] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Hujan & Lo-Fi
        </button>
        <button
          type="button"
          onClick={() => onApplyPreset('cozyCafe')}
          className="px-2.5 py-1 text-xs font-medium bg-[#18110D] hover:bg-[#2E2019] text-[#E8D8C8] border border-[#473328] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Sore di Kafe
        </button>
        <button
          type="button"
          onClick={() => onApplyPreset('deepQuiet')}
          className="px-2.5 py-1 text-xs font-medium bg-[#18110D] hover:bg-[#2E2019] text-[#E8D8C8] border border-[#473328] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Perapian & Fokus
        </button>
      </div>

      {/* Individual Channels */}
      <div className="divide-y divide-[#31231B] mt-1">
        {channels.map((ch) => (
          <div key={ch.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => onToggleChannel(ch.id)}
                aria-label={`Aktifkan ${ch.name}`}
                className={`w-9 h-9 flex items-center justify-center border-2 transition-colors cursor-pointer shrink-0 ${
                  ch.enabled
                    ? 'bg-[#3A271C] border-[#D98236] text-[#F4B43A]'
                    : 'bg-[#18110D] border-[#3C2B22] text-[#7D685A]'
                }`}
              >
                {ch.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <div className="min-w-0">
                <div className="text-sm font-medium text-[#F5EBE1] truncate">{ch.name}</div>
                <div className="text-xs text-[#9E8879] truncate">{ch.subtitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:w-44 shrink-0">
              <input
                type="range"
                min={0}
                max={100}
                value={ch.enabled ? ch.volume : 0}
                onChange={(e) => onChangeVolume(ch.id, Number(e.target.value))}
                aria-label={`Volume ${ch.name}`}
                className="pixel-slider w-full"
              />
              <span className="font-mono tabular-nums text-xs text-[#C7B2A3] w-9 text-right">
                {ch.enabled ? `${ch.volume}%` : 'Mati'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
