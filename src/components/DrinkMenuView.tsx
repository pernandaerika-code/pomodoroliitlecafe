import React, { useState } from 'react';
import { Plus, Check, Trash2, Coffee } from 'lucide-react';
import {
  CupStyle,
  CustomDrink,
  DrinkTemp,
  DrinkTopping,
} from '../types';
import { PixelCoinSprite, PixelDrinkSprite } from './PixelArtSprites';

interface DrinkMenuViewProps {
  coins: number;
  drinks: CustomDrink[];
  activeDrinkId: string;
  onSelectDrink: (id: string) => void;
  onUnlockDrink: (id: string) => void;
  onCreateCustomDrink: (
    drink: Omit<
      CustomDrink,
      'id' | 'priceCoins' | 'unlocked' | 'isUserCreated' | 'timesBrewed'
    >
  ) => void;
  onDeleteCustomDrink: (id: string) => void;
}

const LIQUID_PRESETS = [
  { label: 'Espresso Roast', primary: '#6E3B1E', secondary: '#E5CFAF' },
  { label: 'Uji Matcha', primary: '#569458', secondary: '#EFE5D1' },
  { label: 'Thai Tea', primary: '#D4742C', secondary: '#F5DEC4' },
  { label: 'Berry Velvet', primary: '#C85A76', secondary: '#F7DFEA' },
  { label: 'Telang Biru', primary: '#4B79B8', secondary: '#DCE8F7' },
  { label: 'Cokelat Klasik', primary: '#4D2B1A', secondary: '#B68665' },
];

export const DrinkMenuView: React.FC<DrinkMenuViewProps> = ({
  coins,
  drinks,
  activeDrinkId,
  onSelectDrink,
  onUnlockDrink,
  onCreateCustomDrink,
  onDeleteCustomDrink,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cupStyle, setCupStyle] = useState<CupStyle>('mug');
  const [liquidColor, setLiquidColor] = useState('#6E3B1E');
  const [secondaryColor, setSecondaryColor] = useState('#E5CFAF');
  const [temperature, setTemperature] = useState<DrinkTemp>('Panas');
  const [topping, setTopping] = useState<DrinkTopping>('Foam Krim');
  const [sweetness, setSweetness] = useState<0 | 25 | 50 | 75 | 100>(50);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    onCreateCustomDrink({
      name: cleanName,
      description:
        description.trim() ||
        `Racikan spesial ${temperature.toLowerCase()} dengan topping ${topping.toLowerCase()}.`,
      cupStyle,
      liquidColor,
      secondaryColor,
      temperature,
      topping,
      sweetness,
    });

    setName('');
    setDescription('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Columns: Bar Menu & User Custom Drinks */}
      <section className="lg:col-span-7 pixel-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#3C2B22]">
          <div>
            <h1 className="font-pixel text-base sm:text-lg text-[#F5EBE1]">
              Daftar Menu Minuman Kafe
            </h1>
            <p className="text-xs sm:text-sm text-[#B8A292] mt-0.5">
              Pilih minuman pendamping untuk disajikan di sebelah timer fokusmu
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#160F0C] border border-[#473328]">
            <PixelCoinSprite size={18} />
            <span className="font-mono tabular-nums text-sm font-bold text-[#F4B43A]">
              {coins} Koin
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
          {drinks.map((drink) => {
            const isActive = drink.id === activeDrinkId;
            const canAfford = coins >= drink.priceCoins;

            return (
              <div
                key={drink.id}
                className={`p-4 bg-[#18110D] border-2 flex flex-col justify-between transition-colors ${
                  isActive ? 'border-[#D98236]' : 'border-[#3C2B22]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-16 h-16 bg-[#221813] border border-[#382820] flex items-center justify-center shrink-0">
                      <PixelDrinkSprite drink={drink} size={52} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[#F5EBE1] leading-snug">
                          {drink.name}
                        </h3>
                        {drink.isUserCreated && (
                          <button
                            type="button"
                            onClick={() => onDeleteCustomDrink(drink.id)}
                            aria-label={`Hapus menu ${drink.name}`}
                            className="p-1 text-[#8A7567] hover:text-[#E56B6F] cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-[#9E8879] mt-1">
                        {drink.temperature} · {drink.topping} · Manis {drink.sweetness}%
                      </div>
                      <div className="text-[11px] text-[#857062] font-mono tabular-nums mt-0.5">
                        Diseduh {drink.timesBrewed}x
                        {drink.isUserCreated ? ' · Racikan Sendiri' : ''}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#B8A292] mt-3 leading-relaxed">
                    {drink.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2C1F18]">
                  {drink.unlocked ? (
                    <button
                      type="button"
                      onClick={() => onSelectDrink(drink.id)}
                      className={`pixel-btn w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77]'
                          : 'bg-[#2E2019] hover:bg-[#3B2920] text-[#F5EBE1] border-[#523B2F]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Tersaji di Meja Fokus
                        </>
                      ) : (
                        <>
                          <Coffee className="w-3.5 h-3.5" />
                          Sajikan di Meja
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onUnlockDrink(drink.id)}
                      className={`pixel-btn w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap ${
                        canAfford
                          ? 'bg-[#2E2019] hover:bg-[#3E2B22] text-[#F4B43A] border-[#D98236]'
                          : 'bg-[#1D1511] text-[#786457] border-[#33241C] cursor-not-allowed'
                      }`}
                    >
                      <PixelCoinSprite size={14} />
                      {canAfford
                        ? `Buka Resep (${drink.priceCoins} Koin)`
                        : `Terkunci (${drink.priceCoins} Koin)`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right 5 Columns: Custom Drink Creator Studio */}
      <section className="lg:col-span-5 pixel-panel p-6">
        <div className="pb-4 border-b border-[#3C2B22]">
          <h2 className="font-pixel text-sm sm:text-base text-[#F5EBE1]">
            Tambah & Racik Menu Sendiri
          </h2>
          <p className="text-xs text-[#B8A292] mt-1">
            Kreasikan minuman khasmu gratis dan simpan permanen ke buku menu kafe
          </p>
        </div>

        {/* Live Pixel Preview Coaster */}
        <div className="my-5 p-5 bg-[#160F0C] border-2 border-[#3C2B22] flex items-center gap-5">
          <div className="w-24 h-24 bg-[#221712] border border-[#473328] flex items-center justify-center shrink-0">
            <PixelDrinkSprite
              drink={{
                cupStyle,
                liquidColor,
                secondaryColor,
                temperature,
                topping,
              }}
              size={76}
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-[#A89182]">Pratinjau Sprite Pixel</div>
            <div className="text-base font-semibold text-[#F5EBE1] mt-0.5 truncate">
              {name.trim() || 'Racikan Spesial Baru'}
            </div>
            <div className="text-xs text-[#B8A292] mt-1">
              {temperature} · {topping} · Manis {sweetness}%
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
              Nama Menu Minuman
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Es Kopi Pandan Senja"
              className="w-full px-3 py-2 text-sm bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none text-[#F5EBE1] placeholder:text-[#786457]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
              Catatan Rasa / Deskripsi Singkat
            </label>
            <input
              type="text"
              maxLength={90}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Harum daun pandan asli dengan espresso lembut"
              className="w-full px-3 py-2 text-sm bg-[#140E0B] border border-[#473328] focus:border-[#D98236] focus:outline-none text-[#F5EBE1] placeholder:text-[#786457]"
            />
          </div>

          {/* Cup Style */}
          <div>
            <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
              Bentuk Gelas / Cangkir
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(
                [
                  { id: 'mug', label: 'Mug' },
                  { id: 'tallGlass', label: 'Gelas Es' },
                  { id: 'teacup', label: 'Cangkir' },
                  { id: 'boba', label: 'Boba' },
                  { id: 'pourover', label: 'V60' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCupStyle(c.id)}
                  className={`px-2 py-2 text-xs font-medium border cursor-pointer whitespace-nowrap ${
                    cupStyle === c.id
                      ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77] font-semibold'
                      : 'bg-[#160F0C] text-[#C7B2A3] border-[#3C2B22] hover:text-[#F5EBE1]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Base Color Presets + Custom Picker */}
          <div>
            <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
              Warna Seduhan & Lapisan Susu
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {LIQUID_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setLiquidColor(preset.primary);
                    setSecondaryColor(preset.secondary);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#160F0C] hover:bg-[#2A1D16] border border-[#3C2B22] text-[#D8C5B6] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span
                    className="w-3 h-3 border border-white/30 shrink-0"
                    style={{ backgroundColor: preset.primary }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between px-3 py-1.5 bg-[#140E0B] border border-[#3C2B22] text-xs text-[#C7B2A3] cursor-pointer">
                <span>Warna Dasar</span>
                <input
                  type="color"
                  value={liquidColor}
                  onChange={(e) => setLiquidColor(e.target.value)}
                  className="w-6 h-6 bg-transparent border-0 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between px-3 py-1.5 bg-[#140E0B] border border-[#3C2B22] text-xs text-[#C7B2A3] cursor-pointer">
                <span>Warna Lapisan</span>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-6 h-6 bg-transparent border-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Temperature & Topping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Suhu Penyajian
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Panas', 'Dingin'] as const).map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setTemperature(temp)}
                    className={`py-2 text-xs font-medium border cursor-pointer whitespace-nowrap ${
                      temperature === temp
                        ? 'bg-[#3A271C] text-[#F5EBE1] border-[#D98236]'
                        : 'bg-[#160F0C] text-[#9E8879] border-[#3C2B22]'
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
                Topping Atas
              </label>
              <select
                value={topping}
                onChange={(e) => setTopping(e.target.value as DrinkTopping)}
                className="w-full px-3 py-2 text-xs bg-[#140E0B] border border-[#473328] text-[#F5EBE1] focus:border-[#D98236] focus:outline-none"
              >
                <option value="Foam Krim">Foam Krim</option>
                <option value="Boba Hitam">Boba Hitam</option>
                <option value="Daun Mint">Daun Mint</option>
                <option value="Kayu Manis">Kayu Manis</option>
                <option value="Tanpa Topping">Tanpa Topping</option>
              </select>
            </div>
          </div>

          {/* Sweetness */}
          <div>
            <label className="block text-xs font-medium text-[#D8C5B6] mb-1.5">
              Takaran Gula / Tingkat Manis
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([0, 25, 50, 75, 100] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSweetness(lvl)}
                  className={`py-1.5 text-xs font-mono tabular-nums border cursor-pointer whitespace-nowrap ${
                    sweetness === lvl
                      ? 'bg-[#3A271C] text-[#F4B43A] border-[#D98236] font-semibold'
                      : 'bg-[#160F0C] text-[#9E8879] border-[#3C2B22]'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="pixel-btn w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold bg-[#D98236] hover:bg-[#E79247] text-[#18110D] border-2 border-[#FAD09C] cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Tambahkan ke Menu Kafe
          </button>
        </form>
      </section>
    </div>
  );
};
