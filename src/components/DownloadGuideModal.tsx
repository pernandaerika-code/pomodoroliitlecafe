import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  Apple,
  FileJson,
  Code2,
  Check,
  Upload,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => void;
  onImportData: (dataJson: string) => boolean;
}

type GuideTab = 'app' | 'backup' | 'source';

export const DownloadGuideModal: React.FC<DownloadGuideModalProps> = ({
  isOpen,
  onClose,
  onExportData,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('app');
  const [deviceFilter, setDeviceFilter] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = onImportData(text);
        if (success) {
          setImportStatus('Data berhasil dipulihkan!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Format file tidak valid.');
        }
      } catch {
        setImportStatus('Gagal membaca file cadangan.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div className="pixel-panel w-full max-w-2xl p-6 bg-[#231914] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3C2B22] shrink-0">
          <div>
            <h2 id="download-modal-title" className="font-pixel text-base text-[#F5EBE1]">
              Pusat Unduhan & Pemasangan Little Café
            </h2>
            <p className="text-xs text-[#B8A292] mt-1">
              Pasang sebagai aplikasi di laptop/HP, cadangkan data sesi, atau unduh kode sumber
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan unduhan"
            className="w-9 h-9 flex items-center justify-center bg-[#18110D] border border-[#473328] text-[#D8C5B6] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-[#31231B] shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('app')}
            className={`px-3.5 py-1.5 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'app'
                ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77]'
                : 'bg-[#18110D] text-[#C7B2A3] border-[#3C2B22] hover:text-[#F5EBE1]'
            }`}
          >
            1. Pasang di Laptop / HP (App)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-1.5 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'backup'
                ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77]'
                : 'bg-[#18110D] text-[#C7B2A3] border-[#3C2B22] hover:text-[#F5EBE1]'
            }`}
          >
            2. Unduh Data (.json)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`px-3.5 py-1.5 text-xs font-semibold border-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'source'
                ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77]'
                : 'bg-[#18110D] text-[#C7B2A3] border-[#3C2B22] hover:text-[#F5EBE1]'
            }`}
          >
            3. Unduh Kode Sumber (Code)
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-5 text-sm">
          {activeTab === 'app' && (
            <div className="space-y-5">
              {/* Direct PWA Install Button if browser supports beforeinstallprompt */}
              <div className="p-4 bg-[#18110D] border-2 border-[#523B2F] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-pixel text-xs text-[#F4B43A]">
                    {isInstalled
                      ? 'Aplikasi Sudah Terpasang'
                      : 'Pasang Langsung Sebagai Aplikasi PWA'}
                  </div>
                  <p className="text-xs text-[#B8A292] mt-1 leading-relaxed">
                    {isInstalled
                      ? 'Little Café sudah berjalan sebagai aplikasi terpisah di layar komputermu/HP.'
                      : 'Jalankan Little Café seperti aplikasi asli tanpa bar browser, ringan, cepat, dan siap pakai offline.'}
                  </p>
                </div>

                {!isInstalled && isInstallable && (
                  <button
                    type="button"
                    onClick={install}
                    className="pixel-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#D98236] hover:bg-[#E79247] text-[#18110D] border-2 border-[#FAD09C] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    Pasang Sekarang
                  </button>
                )}
              </div>

              {/* Platform Filter Buttons */}
              <div>
                <div className="text-xs text-[#A89182] mb-2 font-medium">
                  Pilih Panduan Sesuai Perangkatmu:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeviceFilter('desktop')}
                    className={`py-2 px-2 text-xs font-medium border cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                      deviceFilter === 'desktop'
                        ? 'bg-[#3A271C] text-[#F5EBE1] border-[#D98236]'
                        : 'bg-[#18110D] text-[#9E8879] border-[#3C2B22]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Laptop / PC
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeviceFilter('android')}
                    className={`py-2 px-2 text-xs font-medium border cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                      deviceFilter === 'android'
                        ? 'bg-[#3A271C] text-[#F5EBE1] border-[#D98236]'
                        : 'bg-[#18110D] text-[#9E8879] border-[#3C2B22]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    HP Android
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeviceFilter('ios')}
                    className={`py-2 px-2 text-xs font-medium border cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                      deviceFilter === 'ios'
                        ? 'bg-[#3A271C] text-[#F5EBE1] border-[#D98236]'
                        : 'bg-[#18110D] text-[#9E8879] border-[#3C2B22]'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5" />
                    iPhone / iPad
                  </button>
                </div>
              </div>

              {/* Device-Specific Steps */}
              {deviceFilter === 'desktop' && (
                <div className="p-4 bg-[#18110D] border border-[#3C2B22] space-y-3">
                  <h3 className="text-xs font-semibold text-[#F5EBE1] flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#D98236]" />
                    Cara Pasang di Laptop / Komputer (Google Chrome & Microsoft Edge):
                  </h3>
                  <ol className="text-xs text-[#D8C5B6] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      Lihat ke ujung kanan <strong>Bilah Alamat (Address Bar / URL)</strong> browser.
                    </li>
                    <li>
                      Klik ikon <strong>Install / Pasang Aplikasi</strong> (biasanya berupa ikon komputer kecil dengan tanda panah ke bawah).
                    </li>
                    <li>
                      Pilih <strong>"Install"</strong> atau <strong>"Pasang"</strong> pada jendela konfirmasi.
                    </li>
                    <li>
                      Ikon Little Café akan otomatis muncul di desktop dan menu start laptopmu!
                    </li>
                  </ol>
                </div>
              )}

              {deviceFilter === 'android' && (
                <div className="p-4 bg-[#18110D] border border-[#3C2B22] space-y-3">
                  <h3 className="text-xs font-semibold text-[#F5EBE1] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#6BBF8A]" />
                    Cara Pasang di HP Android (Google Chrome):
                  </h3>
                  <ol className="text-xs text-[#D8C5B6] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Buka tautan aplikasi ini di browser Chrome Android.</li>
                    <li>
                      Ketuk menu titik tiga <strong>(⋮)</strong> di pojok kanan atas browser.
                    </li>
                    <li>
                      Pilih <strong>"Tambahkan ke Layar Utama"</strong> (atau <strong>"Instal Aplikasi"</strong>).
                    </li>
                    <li>
                      Ketuk <strong>"Instal"</strong>. Aplikasi akan terpasang di menu aplikasi HP dengan ikon pixel kopi.
                    </li>
                  </ol>
                </div>
              )}

              {deviceFilter === 'ios' && (
                <div className="p-4 bg-[#18110D] border border-[#3C2B22] space-y-3">
                  <h3 className="text-xs font-semibold text-[#F5EBE1] flex items-center gap-2">
                    <Apple className="w-4 h-4 text-[#6CA6D9]" />
                    Cara Pasang di iPhone atau iPad (Safari):
                  </h3>
                  <ol className="text-xs text-[#D8C5B6] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Buka tautan aplikasi ini menggunakan peramban <strong>Safari</strong>.</li>
                    <li>
                      Tekan tombol <strong>Bagikan / Share</strong> (ikon kotak dengan tanda panah mengarah ke atas di bagian bawah layar).
                    </li>
                    <li>
                      Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                    </li>
                    <li>
                      Tekan <strong>"Tambah"</strong> di pojok kanan atas.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#18110D] border border-[#3C2B22]">
                <h3 className="text-xs font-semibold text-[#F5EBE1] flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-[#F4B43A]" />
                  Unduh File Cadangan Data Belajar (JSON)
                </h3>
                <p className="text-xs text-[#B8A292] mt-1 leading-relaxed">
                  Semua catatan jurnal, daftar tugas, menu racikan kustom, koin kafe, dan riwayat belajar yang tersimpan di browser dapat kamu unduh ke komputermu sebagai arsip aman.
                </p>

                <div className="mt-4 pt-3 border-t border-[#31231B] flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="pixel-btn inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#D98236] hover:bg-[#E79247] text-[#18110D] border-2 border-[#FAD09C] cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File Cadangan (.json)
                  </button>

                  <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#2E2019] hover:bg-[#3B2920] text-[#E8D8C8] border border-[#523B2F] cursor-pointer whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    Pulihkan dari File JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus && (
                  <div className="mt-3 text-xs text-[#6BBF8A] font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {importStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#18110D] border border-[#3C2B22] space-y-3">
                <h3 className="text-xs font-semibold text-[#F5EBE1] flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#D98236]" />
                  Cara Mengunduh Kode Sumber (Source Code) dari Google AI Studio:
                </h3>
                <p className="text-xs text-[#B8A292] leading-relaxed">
                  Jika kamu ingin mengedit atau menjalankan proyek ini di komputermu sendiri menggunakan VS Code dan Node.js:
                </p>
                <ol className="text-xs text-[#D8C5B6] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Di antarmuka <strong>Google AI Studio</strong> (di atas atau samping tampilan aplikasi), cari menu <strong>Project Options</strong> atau tombol <strong>Export / Sync to GitHub</strong>.
                  </li>
                  <li>
                    Pilih opsi <strong>"Export to GitHub"</strong> untuk menyimpan seluruh kode ke repositori GitHub pribadimu, atau salin file-filenya.
                  </li>
                  <li>
                    Setelah di-clone ke laptopmu, buka terminal dan jalankan:
                    <pre className="mt-1.5 p-2.5 bg-[#140E0B] border border-[#3C2B22] text-[#E08A3C] font-mono text-[11px] overflow-x-auto">
                      npm install&#10;npm run dev
                    </pre>
                  </li>
                  <li>Aplikasi akan berjalan di <code>http://localhost:3000</code>!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#3C2B22] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="pixel-btn px-5 py-2 text-xs font-semibold bg-[#2E2019] text-[#F5EBE1] border-2 border-[#523B2F] hover:border-[#6B4E3E] cursor-pointer whitespace-nowrap"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
