import React, { useState } from 'react';
import {
  CustomDrink,
  StudySession,
  StudySubject,
  TimerSettings,
  TodoTask,
} from '../types';
import { getOffsetDateKey } from '../data/initialData';

interface StatsViewProps {
  sessions: StudySession[];
  subjects: StudySubject[];
  drinks: CustomDrink[];
  todos: TodoTask[];
  coins: number;
  settings: TimerSettings;
}

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const StatsView: React.FC<StatsViewProps> = ({
  sessions,
  subjects,
  drinks,
  todos,
  coins,
  settings,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const totalFocusMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.floor(totalFocusMinutes / 60);
  const remMinutes = totalFocusMinutes % 60;
  const completedTasksCount = todos.filter((t) => t.completed).length;

  // Compute Streak (consecutive days up to today/yesterday with at least 1 session)
  const sessionDateSet = new Set(sessions.map((s) => s.dateKey));
  let streakDays = 0;
  for (let i = 0; i < 60; i++) {
    const key = getOffsetDateKey(i);
    if (sessionDateSet.has(key)) {
      streakDays++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  // Last 7 days bar chart data
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const daysAgo = 6 - idx;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const key = getOffsetDateKey(daysAgo);
    const mins = sessions
      .filter((s) => s.dateKey === key)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      key,
      label: daysAgo === 0 ? 'Hari Ini' : DAY_NAMES_ID[d.getDay()],
      shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
      minutes: mins,
    };
  });

  const maxDayMinutes = Math.max(
    settings.dailyGoalMinutes,
    ...last7Days.map((d) => d.minutes),
    60
  );

  // Subject breakdown
  const subjectBreakdown = subjects
    .map((subj) => {
      const mins = sessions
        .filter((s) => s.subjectId === subj.id)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      const count = sessions.filter((s) => s.subjectId === subj.id).length;
      const share =
        totalFocusMinutes > 0 ? Math.round((mins / totalFocusMinutes) * 100) : 0;
      return { ...subj, mins, count, share };
    })
    .sort((a, b) => b.mins - a.mins);

  const filteredSessions =
    subjectFilter === 'all'
      ? sessions
      : sessions.filter((s) => s.subjectId === subjectFilter);

  return (
    <div className="space-y-6">
      {/* Top 4-KPI Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="pixel-panel p-5">
          <div className="text-xs text-[#A89182]">Total Waktu Fokus</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#F5EBE1] mt-1.5">
            {totalHours}j {remMinutes}m
          </div>
          <div className="text-xs text-[#9E8879] mt-1 font-mono tabular-nums">
            {totalFocusMinutes} menit tercatat
          </div>
        </div>

        <div className="pixel-panel p-5">
          <div className="text-xs text-[#A89182]">Sesi Belajar Selesai</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#E08A3C] mt-1.5">
            {sessions.length} Sesi
          </div>
          <div className="text-xs text-[#9E8879] mt-1 font-mono tabular-nums">
            Rata-rata{' '}
            {sessions.length > 0 ? Math.round(totalFocusMinutes / sessions.length) : 0}{' '}
            mnt/sesi
          </div>
        </div>

        <div className="pixel-panel p-5">
          <div className="text-xs text-[#A89182]">Rentetan Fokus & Tugas</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#6BBF8A] mt-1.5">
            {streakDays} Hari
          </div>
          <div className="text-xs text-[#9E8879] mt-1 font-mono tabular-nums">
            {completedTasksCount} tugas diselesaikan
          </div>
        </div>

        <div className="pixel-panel p-5">
          <div className="text-xs text-[#A89182]">Saldo Koin Kafe</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#F4B43A] mt-1.5">
            {coins} Koin
          </div>
          <div className="text-xs text-[#9E8879] mt-1">
            Siap ditukar dekorasi & resep
          </div>
        </div>
      </section>

      {/* Middle 2-Column Analytics: 7-Day Bar Chart + Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 7-Day Bar Chart */}
        <section className="lg:col-span-7 pixel-panel p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#3C2B22]">
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-[#F5EBE1]">
                Grafik Fokus 7 Hari Terakhir
              </h2>
              <p className="text-xs text-[#B8A292] mt-0.5">
                Perbandingan menit fokus harian terhadap target {settings.dailyGoalMinutes} menit
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#C7B2A3]">
              Target: {settings.dailyGoalMinutes} mnt/hari
            </span>
          </div>

          <div className="pt-8 pb-2">
            <div className="grid grid-cols-7 gap-3 items-end h-52 px-2 border-b-2 border-[#3C2B22]">
              {last7Days.map((day) => {
                const heightPct = Math.max(
                  day.minutes > 0 ? 8 : 2,
                  Math.round((day.minutes / maxDayMinutes) * 100)
                );
                const metGoal = day.minutes >= settings.dailyGoalMinutes;

                return (
                  <div
                    key={day.key}
                    className="h-full flex flex-col items-center justify-end group"
                  >
                    <span className="font-mono tabular-nums text-[11px] text-[#D8C5B6] mb-1.5">
                      {day.minutes}m
                    </span>
                    <div className="w-full max-w-[42px] h-40 flex items-end bg-[#160F0C] border border-[#2F211A] p-0.5">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full transition-opacity duration-150 ${
                          metGoal
                            ? 'bg-[#6BBF8A]'
                            : day.minutes > 0
                            ? 'bg-[#D98236]'
                            : 'bg-[#2C1F18]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 gap-3 pt-2.5 px-2 text-center">
              {last7Days.map((day) => (
                <div key={day.key}>
                  <div className="text-xs font-medium text-[#E8D8C8] truncate">
                    {day.label}
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-[#8A7567]">
                    {day.shortDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subject Distribution */}
        <section className="lg:col-span-5 pixel-panel p-6">
          <div className="pb-4 border-b border-[#3C2B22]">
            <h2 className="font-pixel text-sm sm:text-base text-[#F5EBE1]">
              Proporsi Mata Pelajaran
            </h2>
            <p className="text-xs text-[#B8A292] mt-0.5">
              Distribusi waktu belajar berdasarkan topik Study Tracker
            </p>
          </div>

          <div className="divide-y divide-[#31231B] mt-2">
            {subjectBreakdown.map((item) => (
              <div key={item.id} className="py-3.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#F5EBE1] font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-xs text-[#D8C5B6] shrink-0">
                    {item.mins} mnt · {item.share}%
                  </span>
                </div>

                <div className="w-full h-2 bg-[#140E0B] border border-[#3C2B22] mt-2 overflow-hidden">
                  <div
                    className="h-full origin-left"
                    style={{
                      backgroundColor: item.color,
                      transform: `scaleX(${item.share / 100})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Detailed Session Log Table */}
      <section className="pixel-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#3C2B22]">
          <div>
            <h2 className="font-pixel text-sm sm:text-base text-[#F5EBE1]">
              Riwayat Sesi Fokus & Belajar
            </h2>
            <p className="text-xs text-[#B8A292] mt-0.5">
              Catatan lengkap setiap sesi Pomodoro maupun pencatatan manual
            </p>
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter riwayat berdasarkan topik"
            className="px-3 py-1.5 text-xs bg-[#160F0C] border border-[#473328] text-[#F5EBE1]"
          >
            <option value="all">Semua Topik ({sessions.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[#B8A292]">
              Belum ada sesi belajar pada filter ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3C2B22] text-xs text-[#9E8879]">
                  <th className="py-2.5 pr-4 font-medium">Tanggal</th>
                  <th className="py-2.5 px-4 font-medium">Topik Studi</th>
                  <th className="py-2.5 px-4 font-medium">Minuman Pendamping</th>
                  <th className="py-2.5 px-4 font-medium">Catatan</th>
                  <th className="py-2.5 pl-4 font-medium text-right">Durasi & Koin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2019] text-sm">
                {filteredSessions.slice(0, 25).map((sess) => {
                  const subj = subjects.find((s) => s.id === sess.subjectId);
                  const drink = drinks.find((d) => d.id === sess.drinkId);
                  return (
                    <tr key={sess.id} className="hover:bg-[#2A1E18]/60">
                      <td className="py-3 pr-4 font-mono tabular-nums text-xs text-[#C7B2A3] whitespace-nowrap">
                        {sess.dateKey}
                      </td>
                      <td className="py-3 px-4 text-[#F5EBE1] font-medium">
                        {subj?.name || 'Studi Umum'}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#C7B2A3]">
                        {drink?.name || 'Kopi Kafe'}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#A89182] max-w-xs truncate">
                        {sess.note || 'Sesi fokus Pomodoro'}
                      </td>
                      <td className="py-3 pl-4 text-right font-mono tabular-nums text-xs text-[#F4B43A] whitespace-nowrap">
                        {sess.durationMinutes} mnt · +{sess.coinsEarned} Koin
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
