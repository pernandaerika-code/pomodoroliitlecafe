import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Clock, Search, Pencil } from 'lucide-react';
import {
  JournalEntry,
  JournalMood,
  StudySession,
  StudySubject,
} from '../types';
import { STUDY_DESK_IMAGE } from '../data/initialData';

interface StudyJournalViewProps {
  subjects: StudySubject[];
  sessions: StudySession[];
  journals: JournalEntry[];
  todayMinutes: number;
  onAddSubject: (name: string, color: string, weeklyTargetMinutes: number) => void;
  onDeleteSubject: (id: string) => void;
  onLogManualSession: (subjectId: string, durationMinutes: number, note: string) => void;
  onSaveJournal: (
    entry: { title: string; content: string; mood: JournalMood },
    editingId?: string
  ) => void;
  onDeleteJournal: (id: string) => void;
}

const SUBJECT_COLORS = ['#E08A3C', '#6BBF8A', '#6CA6D9', '#D9728F', '#B686E0', '#E2B448'];
const MOODS: JournalMood[] = ['Fokus', 'Tenang', 'Semangat', 'Bersyukur', 'Lelah'];

export const StudyJournalView: React.FC<StudyJournalViewProps> = ({
  subjects,
  sessions,
  journals,
  todayMinutes,
  onAddSubject,
  onDeleteSubject,
  onLogManualSession,
  onSaveJournal,
  onDeleteJournal,
}) => {
  const [deskImgBroken, setDeskImgBroken] = useState(false);

  // Study Subject Form
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState(SUBJECT_COLORS[0]);
  const [newSubjTarget, setNewSubjTarget] = useState(180);

  // Manual Study Session Log Form
  const [manualSubjectId, setManualSubjectId] = useState(subjects[0]?.id || '');
  const [manualDuration, setManualDuration] = useState(30);
  const [manualNote, setManualNote] = useState('');

  // Journal Editor State
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<JournalMood>('Tenang');
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalSearch, setJournalSearch] = useState('');

  // Calculate last 7 days minutes per subject
  const sevenDaysCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter(
    (s) => new Date(s.completedAt).getTime() >= sevenDaysCutoff
  );

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    onAddSubject(newSubjName.trim(), newSubjColor, Math.max(30, newSubjTarget));
    setNewSubjName('');
  };

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSubj = manualSubjectId || subjects[0]?.id;
    if (!targetSubj || manualDuration < 1) return;
    onLogManualSession(targetSubj, Math.min(360, manualDuration), manualNote.trim());
    setManualNote('');
  };

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;
    onSaveJournal(
      {
        title: journalTitle.trim(),
        content: journalContent.trim(),
        mood: journalMood,
      },
      editingJournalId || undefined
    );
    setJournalTitle('');
    setJournalContent('');
    setEditingJournalId(null);
  };

  const startEditJournal = (entry: JournalEntry) => {
    setEditingJournalId(entry.id);
    setJournalTitle(entry.title);
    setJournalContent(entry.content);
    setJournalMood(entry.mood);
  };

  const filteredJournals = journals.filter((j) => {
    const q = journalSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      j.title.toLowerCase().includes(q) ||
      j.content.toLowerCase().includes(q) ||
      j.mood.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 5 Columns: Study Tracker & Manual Study Logger */}
      <div className="lg:col-span-5 space-y-6">
        <section className="pixel-panel p-6">
          <div className="pb-4 border-b border-[#3C2B22]">
            <h1 className="font-pixel text-base text-[#F5EBE1]">
              Study Tracker Mingguan
            </h1>
            <p className="text-xs text-[#B8A292] mt-1">
              Pantau progres jam belajar tiap mata pelajaran atau proyek
            </p>
          </div>

          {/* Subject Progress List */}
          <div className="divide-y divide-[#31231B] py-2">
            {subjects.map((subj) => {
              const loggedMins = recentSessions
                .filter((s) => s.subjectId === subj.id)
                .reduce((acc, cur) => acc + cur.durationMinutes, 0);
              const pct = Math.min(
                100,
                Math.round((loggedMins / Math.max(1, subj.weeklyTargetMinutes)) * 100)
              );

              return (
                <div key={subj.id} className="py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 shrink-0"
                        style={{ backgroundColor: subj.color }}
                      />
                      <span className="text-sm font-medium text-[#F5EBE1] truncate">
                        {subj.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums text-xs text-[#C7B2A3]">
                        {loggedMins}/{subj.weeklyTargetMinutes} mnt ({pct}%)
                      </span>
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteSubject(subj.id)}
                          aria-label={`Hapus topik ${subj.name}`}
                          className="p-1 text-[#7D685A] hover:text-[#E56B6F] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-[#140E0B] border border-[#3C2B22] mt-2 overflow-hidden">
                    <div
                      className="h-full transition-transform duration-200 origin-left"
                      style={{
                        backgroundColor: subj.color,
                        transform: `scaleX(${pct / 100})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Subject Form */}
          <form
            onSubmit={handleCreateSubject}
            className="pt-4 mt-2 border-t border-[#3C2B22] space-y-3"
          >
            <div className="text-xs font-semibold text-[#D8C5B6]">
              Tambah Mata Pelajaran / Topik Baru
            </div>
            <input
              type="text"
              value={newSubjName}
              onChange={(e) => setNewSubjName(e.target.value)}
              placeholder="Contoh: Kalkulus Lanjut atau Skripsi"
              className="w-full px-3 py-2 text-sm bg-[#140E0B] border border-[#473328] focus:border-[#D98236] focus:outline-none text-[#F5EBE1] placeholder:text-[#786457]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewSubjColor(c)}
                    aria-label={`Pilih warna ${c}`}
                    className={`w-6 h-6 border-2 cursor-pointer ${
                      newSubjColor === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={2000}
                  step={30}
                  value={newSubjTarget}
                  onChange={(e) => setNewSubjTarget(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 text-xs font-mono tabular-nums bg-[#140E0B] border border-[#473328] text-[#F5EBE1]"
                />
                <span className="text-xs text-[#9E8879]">mnt/mgg</span>
              </div>
            </div>

            <button
              type="submit"
              className="pixel-btn w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2E2019] hover:bg-[#3B2920] text-[#F5EBE1] border-2 border-[#594033] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Simpan Topik Studi
            </button>
          </form>
        </section>

        {/* Manual Study Log Box */}
        <section className="pixel-panel p-6">
          <div className="pb-3 border-b border-[#3C2B22]">
            <h2 className="font-pixel text-sm text-[#F5EBE1]">
              Catat Sesi Belajar Manual
            </h2>
            <p className="text-xs text-[#B8A292] mt-0.5">
              Belajar tanpa menyalakan timer? Catat durasinya di sini dan tetap peroleh Koin
            </p>
          </div>

          <form onSubmit={handleManualLog} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#A89182] mb-1">Topik Studi</label>
                <select
                  value={manualSubjectId || subjects[0]?.id}
                  onChange={(e) => setManualSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#140E0B] border border-[#473328] text-[#F5EBE1]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#A89182] mb-1">Durasi (Mnt)</label>
                <input
                  type="number"
                  min={5}
                  max={360}
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-[#140E0B] border border-[#473328] text-[#F5EBE1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A89182] mb-1">
                Ringkasan Materi (Opsional)
              </label>
              <input
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Contoh: Merangkum bab 3 dan latihan soal..."
                className="w-full px-3 py-2 text-sm bg-[#140E0B] border border-[#473328] text-[#F5EBE1] placeholder:text-[#786457]"
              />
            </div>

            <button
              type="submit"
              className="pixel-btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#D98236] text-[#18110D] border-2 border-[#F6BA77] cursor-pointer whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              Catat ke Study Tracker (+{Math.max(5, Math.round(manualDuration))} Koin)
            </button>
          </form>
        </section>
      </div>

      {/* Right 7 Columns: Catatan & Jurnal Harian */}
      <section className="lg:col-span-7 pixel-panel overflow-hidden">
        {/* Visual Pixel Study Desk Banner with Contrast Scrim */}
        <div className="relative h-44 bg-[#18110D] overflow-hidden border-b border-[#3C2B22]">
          {!deskImgBroken ? (
            <img
              src={STUDY_DESK_IMAGE}
              alt="Meja kayu belajar di tepi jendela hujan dengan buku catatan terbuka"
              referrerPolicy="no-referrer"
              onError={() => setDeskImgBroken(true)}
              className="w-full h-full object-cover pixel-art"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#2B1D15] to-[#18110D]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#231914] via-black/55 to-black/20" />
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-pixel text-base sm:text-lg text-[#FFF8F0]">
                Catatan & Jurnal Harian
              </h2>
              <p className="text-xs text-[#E5D4C3] mt-0.5">
                Abadikan refleksi belajar, ide, dan suasana hatimu (+15 Koin jurnal pertama hari ini)
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs text-[#F4B43A]">
              Fokus hari ini: {todayMinutes} menit
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Journal Entry Composer */}
          <form onSubmit={handleJournalSubmit} className="space-y-4 pb-6 border-b border-[#3C2B22]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#D8C5B6]">
                Suasana Hati Saat Ini:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setJournalMood(m)}
                    className={`px-3 py-1 text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0 ${
                      journalMood === m
                        ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77] font-semibold'
                        : 'bg-[#160F0C] text-[#B8A292] border-[#3C2B22] hover:text-[#F5EBE1]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              required
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Judul catatan atau highlight hari ini..."
              className="w-full px-3.5 py-2.5 text-sm font-medium bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none text-[#F5EBE1] placeholder:text-[#786457]"
            />

            <textarea
              rows={4}
              required
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Tulis apa yang sudah dipelajari, hal yang disyukuri, atau rencana untuk besok..."
              className="w-full px-3.5 py-2.5 text-sm leading-relaxed bg-[#140E0B] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none text-[#F5EBE1] placeholder:text-[#786457]"
            />

            <div className="flex items-center justify-end gap-2">
              {editingJournalId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingJournalId(null);
                    setJournalTitle('');
                    setJournalContent('');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#18110D] text-[#C7B2A3] border border-[#473328] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal Edit
                </button>
              )}
              <button
                type="submit"
                className="pixel-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#D98236] text-[#18110D] border-2 border-[#FAD09C] cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {editingJournalId ? 'Perbarui Catatan' : 'Simpan Jurnal Harian'}
              </button>
            </div>
          </form>

          {/* Journal Archive & Search */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-pixel text-xs text-[#F5EBE1]">
                Arsip Jurnal ({filteredJournals.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8A7567] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder="Cari catatan atau mood..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#140E0B] border border-[#3C2B22] focus:border-[#D98236] focus:outline-none text-[#F5EBE1]"
                />
              </div>
            </div>

            {filteredJournals.length === 0 ? (
              <div className="py-10 text-center bg-[#18110D] border border-[#31231B]">
                <p className="text-sm text-[#B8A292]">
                  Belum ada catatan jurnal yang cocok.
                </p>
                <p className="text-xs text-[#8A7567] mt-1">
                  Mulai tulis refleksi pertamamu di formulir atas untuk menyimpannya di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#31231B]">
                {filteredJournals.map((entry) => (
                  <article key={entry.id} className="py-4 first:pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-[#9E8879] font-mono tabular-nums">
                          {entry.dateKey} · Suasana {entry.mood} · {entry.focusMinutesSnapshot} mnt fokus
                        </div>
                        <h4 className="text-base font-semibold text-[#F5EBE1] mt-1">
                          {entry.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditJournal(entry)}
                          aria-label={`Edit ${entry.title}`}
                          className="p-1.5 text-[#9E8879] hover:text-[#F5EBE1] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteJournal(entry.id)}
                          aria-label={`Hapus ${entry.title}`}
                          className="p-1.5 text-[#8A7567] hover:text-[#E56B6F] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[#D8C5B6] mt-2 leading-relaxed whitespace-pre-line">
                      {entry.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
