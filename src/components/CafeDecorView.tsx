import React, { useState } from 'react';
import { Check, Sparkles, Eye, EyeOff } from 'lucide-react';
import { CafeDecoration } from '../types';
import { CAFE_INTERIOR_IMAGE } from '../data/initialData';
import { PixelCoinSprite, PixelDecorationSprite } from './PixelArtSprites';

interface CafeDecorViewProps {
  coins: number;
  decorations: CafeDecoration[];
  onBuyDecoration: (id: string) => void;
  onToggleEquipDecoration: (id: string) => void;
}

export const CafeDecorView: React.FC<CafeDecorViewProps> = ({
  coins,
  decorations,
  onBuyDecoration,
  onToggleEquipDecoration,
}) => {
  const [sceneBroken, setSceneBroken] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'Semua' | CafeDecoration['category']
  >('Semua');
  const [selectedDecId, setSelectedDecId] = useState<string | null>('dec-cat');

  const equippedList = decorations.filter((d) => d.owned && d.equipped);
  const filteredShop =
    selectedCategory === 'Semua'
      ? decorations
      : decorations.filter((d) => d.category === selectedCategory);

  const inspectedItem =
    decorations.find((d) => d.id === selectedDecId) || decorations[0];

  return (
    <div className="space-y-6">
      {/* Interactive Pixel Cafe Panorama */}
      <section className="pixel-panel overflow-hidden">
        <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#3C2B22]">
          <div>
            <h1 className="font-pixel text-base sm:text-lg text-[#F5EBE1]">
              Interior Little Café Pixel
            </h1>
            <p className="text-xs sm:text-sm text-[#B8A292] mt-0.5">
              Klik item di dalam ruangan atau pasang dekorasi baru menggunakan Koin hasil sesi fokusmu
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-[#C7B2A3] font-mono tabular-nums">
              Terpasang: {equippedList.length}/{decorations.length}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#160F0C] border border-[#473328]">
              <PixelCoinSprite size={18} />
              <span className="font-mono tabular-nums text-sm font-bold text-[#F4B43A]">
                {coins} Koin
              </span>
            </div>
          </div>
        </div>

        {/* 16:9 Interactive Room Viewport */}
        <div className="relative w-full aspect-[16/9] max-h-[520px] bg-[#160F0C] overflow-hidden select-none">
          {!sceneBroken ? (
            <img
              src={CAFE_INTERIOR_IMAGE}
              alt="Interior pixel art Little Café saat sore hujan"
              referrerPolicy="no-referrer"
              onError={() => setSceneBroken(true)}
              className="w-full h-full object-cover pixel-art"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#2A1B14] to-[#160E0A] flex items-center justify-center">
              <span className="font-pixel text-sm text-[#D98236]">
                Ruang Utama Little Café
              </span>
            </div>
          )}

          {/* Subtle evening vignette for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

          {/* Live Positioned Pixel Decorations */}
          {equippedList.map((dec) => {
            const isSelected = inspectedDecMatch(selectedDecId, dec.id);
            return (
              <button
                key={dec.id}
                type="button"
                onClick={() => setSelectedDecId(dec.id)}
                style={{
                  left: `${dec.xPercent}%`,
                  top: `${dec.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${dec.name} — Klik untuk detail`}
                className={`absolute group cursor-pointer p-1 transition-transform duration-150 hover:scale-110 focus:outline-none ${
                  isSelected ? 'ring-2 ring-[#F4B43A] bg-black/35' : ''
                }`}
              >
                <div className="animate-pixel-bob">
                  <PixelDecorationSprite slot={dec.slot} size={58} />
                </div>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-0.5 bg-[#18110D]/95 border border-[#523B2F] text-[11px] text-[#F5EBE1] whitespace-nowrap">
                  {dec.name}
                </span>
              </button>
            );
          })}

          {/* Bottom Inspector Caption Overlay */}
          {inspectedItem && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-[#18110D]/92 border-2 border-[#473328] px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-pixel text-[#F4B43A] truncate">
                  {inspectedItem.name}
                </div>
                <p className="text-xs text-[#D8C5B6] mt-0.5 line-clamp-2">
                  {inspectedItem.description}
                </p>
              </div>
              {inspectedItem.owned && (
                <button
                  type="button"
                  onClick={() => onToggleEquipDecoration(inspectedItem.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#2E2019] hover:bg-[#3E2B22] text-[#F5EBE1] border border-[#5C4438] cursor-pointer whitespace-nowrap shrink-0"
                >
                  {inspectedItem.equipped ? 'Simpan' : 'Pasang'}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Decoration Shop & Inventory */}
      <section className="pixel-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#3C2B22]">
          <div>
            <h2 className="font-pixel text-sm sm:text-base text-[#F5EBE1]">
              Katalog & Toko Dekorasi Kafe
            </h2>
            <p className="text-xs text-[#B8A292] mt-0.5">
              Semua dekorasi yang dimiliki bebas dipasang atau dilepas kapan saja
            </p>
          </div>

          {/* Category Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-[#160F0C] p-1 border border-[#3C2B22]">
            {(['Semua', 'Suasana', 'Furnitur', 'Barista', 'Teman Kafe'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#D98236] text-[#18110D] font-semibold'
                      : 'text-[#B8A292] hover:text-[#F5EBE1]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-5">
          {filteredShop.map((item) => {
            const canAfford = coins >= item.priceCoins;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedDecId(item.id)}
                className="bg-[#18110D] border-2 border-[#3C2B22] hover:border-[#5C4438] p-4 flex flex-col justify-between transition-colors cursor-pointer"
              >
                <div>
                  <div className="h-24 bg-[#211712] border border-[#33241C] flex items-center justify-center mb-3">
                    <PixelDecorationSprite slot={item.slot} size={56} />
                  </div>

                  <div className="text-xs text-[#9E8879]">
                    {item.category} ·{' '}
                    {item.owned
                      ? item.equipped
                        ? 'Terpasang di Kafe'
                        : 'Tersimpan'
                      : `${item.priceCoins} Koin`}
                  </div>

                  <h3 className="text-sm font-semibold text-[#F5EBE1] mt-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#B8A292] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2C1F18]">
                  {item.owned ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEquipDecoration(item.id);
                      }}
                      className={`pixel-btn w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap ${
                        item.equipped
                          ? 'bg-[#2E2019] text-[#F5EBE1] border-[#6BBF8A]'
                          : 'bg-[#1F1612] text-[#C7B2A3] border-[#473328] hover:text-[#F5EBE1]'
                      }`}
                    >
                      {item.equipped ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Lepas dari Ruang
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Pasang di Kafe
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuyDecoration(item.id);
                      }}
                      className={`pixel-btn w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap ${
                        canAfford
                          ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77]'
                          : 'bg-[#1F1612] text-[#786457] border-[#33241C] cursor-not-allowed'
                      }`}
                    >
                      <PixelCoinSprite size={14} />
                      {canAfford
                        ? `Beli (${item.priceCoins} Koin)`
                        : `Butuh ${item.priceCoins} Koin`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

function inspectedDecMatch(selectedId: string | null, id: string): boolean {
  return selectedId === id;
}
