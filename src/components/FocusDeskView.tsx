import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  SkipForward,
} from 'lucide-react';
import {
  AmbienceChannelId,
  AmbienceChannelState,
  CustomDrink,
  StudySubject,
  TaskPriority,
  TimerMode,
  TimerSettings,
  TodoTask,
} from '../types';
import { BARISTA_CAT_IMAGE } from '../data/initialData';
import { PixelCoinSprite, PixelDrinkSprite } from './PixelArtSprites';
import { AmbienceMixer } from './AmbienceMixer';

interface FocusDeskViewProps {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  completedFocusCount: number;
  settings: TimerSettings;
  coins: number;
  todayMinutes: number;
  subjects: StudySubject[];
  activeSubjectId: string;
  drinks: CustomDrink[];
  activeDrinkId: string;
  todos: TodoTask[];
  activeTaskId: string | null;
  ambiencePlaying: boolean;
  ambienceChannels: AmbienceChannelState[];
  onSelectMode: (mode: TimerMode) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onCompleteEarly: () => void;
  onOpenDurationModal: () => void;
  onQuickAdjustMinutes: (delta: number) => void;
  onSelectSubject: (id: string) => void;
  onSelectDrink: (id: string) => void;
  onNavigateTab: (tab: 'cafe' | 'drinks') => void;
  onAddTask: (
    title: string,
    subjectId: string,
    priority: TaskPriority,
    targetPomodoros: number
  ) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectActiveTask: (id: string | null) => void;
  onClearCompletedTasks: () => void;
  onToggleAmbienceMaster: () => void;
  onToggleAmbienceChannel: (id: AmbienceChannelId) => void;
  onChangeAmbienceVolume: (id: AmbienceChannelId, vol: number) => void;
  onApplyAmbiencePreset: (preset: 'rainLofi' | 'deepQuiet' | 'cozyCafe') => void;
}

export const FocusDeskView: React.FC<FocusDeskViewProps> = ({
  mode,
  secondsLeft,
  isRunning,
  completedFocusCount,
  settings,
  coins,
  todayMinutes,
  subjects,
  activeSubjectId,
  drinks,
  activeDrinkId,
  todos,
  activeTaskId,
  ambiencePlaying,
  ambienceChannels,
  onSelectMode,
  onToggleTimer,
  onResetTimer,
  onCompleteEarly,
  onOpenDurationModal,
  onQuickAdjustMinutes,
  onSelectSubject,
  onSelectDrink,
  onNavigateTab,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSelectActiveTask,
  onClearCompletedTasks,
  onToggleAmbienceMaster,
  onToggleAmbienceChannel,
  onChangeAmbienceVolume,
  onApplyAmbiencePreset,
}) => {
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(activeSubjectId);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Normal');
  const [taskPomodoros, setTaskPomodoros] = useState(2);
  const [todoFilter, setTodoFilter] = useState<'all' | 'active' | 'done'>('all');

  const totalModeSeconds =
    (mode === 'focus'
      ? settings.focusMinutes
      : mode === 'shortBreak'
      ? settings.shortBreakMinutes
      : settings.longBreakMinutes) * 60;

  const progressPct =
    totalModeSeconds > 0
      ? Math.min(100, Math.max(0, ((totalModeSeconds - secondsLeft) / totalModeSeconds) * 100))
      : 0;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedClock = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const activeDrink =
    drinks.find((d) => d.id === activeDrinkId) || drinks[0];
  const unlockedDrinks = drinks.filter((d) => d.unlocked);
  const activeTask = todos.find((t) => t.id === activeTaskId && !t.completed);

  const dailyGoalPct = Math.min(
    100,
    Math.round((todayMinutes / Math.max(1, settings.dailyGoalMinutes)) * 100)
  );

  const filteredTodos = todos.filter((t) => {
    if (todoFilter === 'active') return !t.completed;
    if (todoFilter === 'done') return t.completed;
    return true;
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = taskTitle.trim();
    if (!clean) return;
    onAddTask(clean, taskSubjectId || subjects[0]?.id || 'subj-algo', taskPriority, taskPomodoros);
    setTaskTitle('');
    setTaskPomodoros(2);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Barista Greeting & Coin / Goal HUD Strip */}
      <div className="pixel-panel p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 border-2 border-[#523B2F] bg-[#18110D] overflow-hidden shrink-0 flex items-center justify-center">
            {!avatarBroken ? (
              <img
                src={BARISTA_CAT_IMAGE}
                alt="Mochi si Kucing Barista Little Café"
                referrerPolicy="no-referrer"
                onError={() => setAvatarBroken(true)}
                className="w-full h-full object-cover pixel-art"
              />
            ) : (
              <span className="font-pixel text-xs text-[#E08A3C]">MOCHI</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-pixel text-base sm:text-lg text-[#F5EBE1] text-balance">
              Selamat datang di meja sudut Little Café
            </h1>
            <p className="text-xs sm:text-sm text-[#BBA596] mt-0.5 truncate">
              {activeTask
                ? `Sedang mengerjakan: ${activeTask.title}`
                : 'Pilih racikan minuman hangatmu, nyalakan suara hujan, dan mulai sesi fokus.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#3C2B22] shrink-0">
          <div>
            <div className="text-xs text-[#A89182]">Target Hari Ini</div>
            <div className="font-mono tabular-nums text-sm font-semibold text-[#F5EBE1] mt-0.5">
              {todayMinutes} / {settings.dailyGoalMinutes} mnt ({dailyGoalPct}%)
            </div>
          </div>

          <div className="h-8 w-px bg-[#3C2B22] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <PixelCoinSprite size={24} />
            <div>
              <div className="text-xs text-[#A89182]">Koin Kafe</div>
              <div className="font-mono tabular-nums text-base font-bold text-[#F4B43A]">
                {coins} Koin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Study Desk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Pomodoro Timer + Ambience Mixer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Focal Anchor: Pixel Pomodoro Timer */}
          <section className="pixel-panel p-6">
            {/* Mode Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#3C2B22]">
              <div className="inline-flex bg-[#160F0C] p-1 border border-[#3C2B22]">
                <button
                  type="button"
                  onClick={() => onSelectMode('focus')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'focus'
                      ? 'bg-[#D98236] text-[#18110D]'
                      : 'text-[#C7B2A3] hover:text-[#F5EBE1]'
                  }`}
                >
                  Fokus ({settings.focusMinutes}m)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMode('shortBreak')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'shortBreak'
                      ? 'bg-[#6BBF8A] text-[#18110D]'
                      : 'text-[#C7B2A3] hover:text-[#F5EBE1]'
                  }`}
                >
                  Istirahat ({settings.shortBreakMinutes}m)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMode('longBreak')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'longBreak'
                      ? 'bg-[#6CA6D9] text-[#18110D]'
                      : 'text-[#C7B2A3] hover:text-[#F5EBE1]'
                  }`}
                >
                  Rehat Panjang ({settings.longBreakMinutes}m)
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenDurationModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#18110D] hover:bg-[#2E2019] text-[#E8D8C8] border border-[#473328] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Ubah Durasi
              </button>
            </div>

            {/* Central Clock + Steaming Pixel Companion Drink */}
            <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="text-xs text-[#B8A292] flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    {mode === 'focus'
                      ? 'Sesi Fokus Aktif'
                      : mode === 'shortBreak'
                      ? 'Waktunya Peregangan Singkat'
                      : 'Istirahat Panjang & Minum Hangat'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Siklus #{completedFocusCount + 1}
                  </span>
                </div>

                <div className="font-mono tabular-nums text-6xl sm:text-7xl font-bold tracking-tight text-[#FFF8F0] my-3">
                  {formattedClock}
                </div>

                {/* Quick -5m / +5m inline duration buttons when paused */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => onQuickAdjustMinutes(-5)}
                    className="px-2.5 py-1 text-xs font-mono tabular-nums bg-[#18110D] text-[#C7B2A3] hover:text-[#F5EBE1] border border-[#3C2B22] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    -5 mnt
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => onQuickAdjustMinutes(-1)}
                    className="px-2.5 py-1 text-xs font-mono tabular-nums bg-[#18110D] text-[#C7B2A3] hover:text-[#F5EBE1] border border-[#3C2B22] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    -1 mnt
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => onQuickAdjustMinutes(1)}
                    className="px-2.5 py-1 text-xs font-mono tabular-nums bg-[#18110D] text-[#C7B2A3] hover:text-[#F5EBE1] border border-[#3C2B22] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    +1 mnt
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => onQuickAdjustMinutes(5)}
                    className="px-2.5 py-1 text-xs font-mono tabular-nums bg-[#18110D] text-[#C7B2A3] hover:text-[#F5EBE1] border border-[#3C2B22] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    +5 mnt
                  </button>
                </div>
              </div>

              {/* Active Companion Drink Coaster */}
              <div className="flex flex-col items-center p-4 bg-[#18110D] border-2 border-[#3C2B22] min-w-[168px]">
                <PixelDrinkSprite
                  drink={activeDrink}
                  size={68}
                  animateSteam={isRunning || activeDrink.temperature === 'Panas'}
                />
                <div className="text-xs font-semibold text-[#F5EBE1] mt-2 text-center truncate max-w-[148px]">
                  {activeDrink.name}
                </div>
                <div className="text-[11px] text-[#9E8879] mt-0.5">
                  {activeDrink.temperature} · Manis {activeDrink.sweetness}%
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('drinks')}
                  className="mt-2 text-xs text-[#E08A3C] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  Ganti / Racik Menu
                </button>
              </div>
            </div>

            {/* Pixel Progress Track */}
            <div className="w-full h-3 bg-[#140E0B] border border-[#3C2B22] overflow-hidden mb-6">
              <div
                className="h-full bg-[#D98236] transition-transform duration-200 origin-left"
                style={{ transform: `scaleX(${progressPct / 100})` }}
              />
            </div>

            {/* Primary Timer Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#3C2B22]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onToggleTimer}
                  className="pixel-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-[#D98236] hover:bg-[#E79247] text-[#18110D] border-2 border-[#FAD09C] cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      Jeda Timer
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      {mode === 'focus' ? 'Mulai Fokus' : 'Mulai Istirahat'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onResetTimer}
                  className="pixel-btn inline-flex items-center gap-1.5 px-4 py-3 text-xs font-semibold bg-[#18110D] hover:bg-[#2E2019] text-[#D8C5B6] border-2 border-[#473328] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ulangi
                </button>
              </div>

              <button
                type="button"
                onClick={onCompleteEarly}
                title="Catat sesi ini selesai sekarang dan klaim koin"
                className="pixel-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium bg-[#18110D] hover:bg-[#2E2019] text-[#C7B2A3] hover:text-[#F5EBE1] border border-[#473328] cursor-pointer whitespace-nowrap shrink-0"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Selesaikan Sesi
              </button>
            </div>

            {/* Active Study Subject & Quick Drink Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
              <div>
                <label className="block text-xs text-[#A89182] mb-1.5">
                  Topik Study Tracker Saat Ini
                </label>
                <select
                  value={activeSubjectId}
                  onChange={(e) => onSelectSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#160F0C] border border-[#473328] text-[#F5EBE1] focus:border-[#D98236] focus:outline-none"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#A89182] mb-1.5">
                  Minuman Meja Saat Ini
                </label>
                <select
                  value={activeDrink.id}
                  onChange={(e) => onSelectDrink(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#160F0C] border border-[#473328] text-[#F5EBE1] focus:border-[#D98236] focus:outline-none"
                >
                  {unlockedDrinks.map((drink) => (
                    <option key={drink.id} value={drink.id}>
                      {drink.name} ({drink.temperature})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Ambience Sound Mixer */}
          <AmbienceMixer
            isPlaying={ambiencePlaying}
            channels={ambienceChannels}
            onToggleMaster={onToggleAmbienceMaster}
            onToggleChannel={onToggleAmbienceChannel}
            onChangeVolume={onChangeAmbienceVolume}
            onApplyPreset={onApplyAmbiencePreset}
          />
        </div>

        {/* Right Column (5 cols): To-Do List + Quick Cafe Shortcut */}
        <div className="lg:col-span-5 space-y-6">
          <section className="pixel-panel p-5">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#3C2B22]">
              <div>
                <h2 className="font-pixel text-sm text-[#F5EBE1]">Daftar Tugas Fokus</h2>
                <p className="text-xs text-[#B8A292] mt-0.5">
                  Selesaikan tugas untuk bonus +10 Koin Kafe
                </p>
              </div>
              <span className="font-mono tabular-nums text-xs text-[#C7B2A3]">
                {todos.filter((t) => t.completed).length}/{todos.length} selesai
              </span>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleTaskSubmit} className="py-4 border-b border-[#3C2B22] space-y-3">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Tulis target belajar atau tugas baru..."
                className="w-full px-3 py-2 text-sm bg-[#160F0C] border-2 border-[#473328] focus:border-[#D98236] focus:outline-none text-[#F5EBE1] placeholder:text-[#786457]"
              />

              <div className="grid grid-cols-12 gap-2">
                <select
                  value={taskSubjectId}
                  onChange={(e) => setTaskSubjectId(e.target.value)}
                  aria-label="Pilih topik tugas"
                  className="col-span-6 px-2.5 py-2 text-xs bg-[#160F0C] border border-[#473328] text-[#E8D8C8] focus:border-[#D98236] focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  aria-label="Prioritas tugas"
                  className="col-span-3 px-2 py-2 text-xs bg-[#160F0C] border border-[#473328] text-[#E8D8C8] focus:border-[#D98236] focus:outline-none"
                >
                  <option value="Utama">Utama</option>
                  <option value="Normal">Normal</option>
                  <option value="Santai">Santai</option>
                </select>

                <div className="col-span-3 flex items-center bg-[#160F0C] border border-[#473328] px-2">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={taskPomodoros}
                    onChange={(e) => setTaskPomodoros(Math.max(1, Number(e.target.value)))}
                    aria-label="Target sesi Pomodoro"
                    className="w-full text-xs font-mono tabular-nums bg-transparent text-[#F5EBE1] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#9E8879] ml-1">sesi</span>
                </div>
              </div>

              <button
                type="submit"
                className="pixel-btn w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2E2019] hover:bg-[#3B2920] text-[#F5EBE1] border-2 border-[#594033] cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah ke Daftar Tugas
              </button>
            </form>

            {/* Filter Controls */}
            <div className="flex items-center justify-between gap-2 py-3 border-b border-[#31231B]">
              <div className="inline-flex bg-[#160F0C] p-0.5 border border-[#3C2B22]">
                {(
                  [
                    { key: 'all', label: 'Semua' },
                    { key: 'active', label: 'Aktif' },
                    { key: 'done', label: 'Selesai' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTodoFilter(item.key)}
                    className={`px-2.5 py-1 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                      todoFilter === item.key
                        ? 'bg-[#3A271C] text-[#F5EBE1]'
                        : 'text-[#9E8879] hover:text-[#E8D8C8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {todos.some((t) => t.completed) && (
                <button
                  type="button"
                  onClick={onClearCompletedTasks}
                  className="text-xs text-[#A89182] hover:text-[#F5EBE1] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Bersihkan Selesai
                </button>
              )}
            </div>

            {/* Task Items */}
            {filteredTodos.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[#B8A292]">
                  Belum ada tugas pada tampilan ini.
                </p>
                <p className="text-xs text-[#8A7567] mt-1">
                  Tambahkan target belajarmu di atas untuk mulai melacak sesi fokus.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#31231B] max-h-[390px] overflow-y-auto pr-1">
                {filteredTodos.map((task) => {
                  const subj = subjects.find((s) => s.id === task.subjectId);
                  const isFocused = activeTaskId === task.id && !task.completed;

                  return (
                    <div
                      key={task.id}
                      className={`py-3.5 px-2 flex items-start justify-between gap-3 transition-colors ${
                        isFocused ? 'bg-[#2C1F18]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Tandai ${task.title}`}
                          className={`mt-0.5 w-5 h-5 flex items-center justify-center border-2 transition-colors cursor-pointer shrink-0 ${
                            task.completed
                              ? 'bg-[#6BBF8A] border-[#6BBF8A] text-[#18110D]'
                              : 'bg-[#160F0C] border-[#5C4438] hover:border-[#D98236]'
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium leading-snug ${
                              task.completed
                                ? 'line-through text-[#806C5F]'
                                : 'text-[#F5EBE1]'
                            }`}
                          >
                            {task.title}
                          </div>

                          {/* Clean unboxed metadata with typographic separators */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#9E8879] mt-1">
                            <span style={{ color: subj?.color || '#C7B2A3' }}>
                              {subj?.name || 'Umum'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Prioritas {task.priority}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {task.completedPomodoros}/{task.targetPomodoros} sesi
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!task.completed && (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectActiveTask(isFocused ? null : task.id)
                            }
                            className={`px-2 py-1 text-xs border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isFocused
                                ? 'bg-[#D98236] text-[#18110D] border-[#F6BA77] font-semibold'
                                : 'bg-[#18110D] text-[#B8A292] border-[#3C2B22] hover:text-[#F5EBE1]'
                            }`}
                          >
                            {isFocused ? 'Aktif' : 'Fokus'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          aria-label={`Hapus ${task.title}`}
                          className="p-1.5 text-[#8A7567] hover:text-[#E56B6F] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Reward Explanation & Quick Link to Cafe Decor */}
          <section className="pixel-panel p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-pixel text-xs text-[#F4B43A]">
                Hadiah Fokus & Dekorasi Kafe
              </h3>
              <p className="text-xs text-[#B8A292] mt-1 leading-relaxed">
                Setiap menit fokus menghasilkan 1 Koin Kafe. Gunakan koin untuk menata lampu, tanaman, dan pemutar vinyl di Ruang Kafe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('cafe')}
              className="pixel-btn px-3.5 py-2 text-xs font-semibold bg-[#2E2019] hover:bg-[#3B2920] text-[#F5EBE1] border-2 border-[#594033] cursor-pointer whitespace-nowrap shrink-0"
            >
              Lihat Kafe
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
