import React, { useEffect, useRef, useState } from 'react';
import {
  AmbienceChannelId,
  AmbienceChannelState,
  CafeDecoration,
  CustomDrink,
  JournalEntry,
  JournalMood,
  NavTab,
  StudySession,
  StudySubject,
  TaskPriority,
  TimerMode,
  TimerSettings,
  TodoTask,
} from './types';
import {
  DEFAULT_TIMER_SETTINGS,
  INITIAL_AMBIENCE,
  INITIAL_DECORATIONS,
  INITIAL_DRINKS,
  INITIAL_JOURNALS,
  INITIAL_SESSIONS,
  INITIAL_SUBJECTS,
  INITIAL_TODOS,
  formatLocalDateKey,
} from './data/initialData';
import { cafeAudio } from './utils/audioEngine';
import { FocusDeskView } from './components/FocusDeskView';
import { CafeDecorView } from './components/CafeDecorView';
import { DrinkMenuView } from './components/DrinkMenuView';
import { StudyJournalView } from './components/StudyJournalView';
import { StatsView } from './components/StatsView';
import { TimerDurationModal } from './components/TimerDurationModal';
import { DownloadGuideModal } from './components/DownloadGuideModal';
import { Download } from 'lucide-react';

const STORAGE_KEY = 'little_cafe_pomodoro_v2_state';

function loadSavedState<T>(field: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed[field] !== undefined ? parsed[field] : fallback;
  } catch {
    return fallback;
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('desk');
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Persisted User Data
  const [settings, setSettings] = useState<TimerSettings>(() =>
    loadSavedState('settings', DEFAULT_TIMER_SETTINGS)
  );
  const [coins, setCoins] = useState<number>(() => loadSavedState('coins', 95));
  const [subjects, setSubjects] = useState<StudySubject[]>(() =>
    loadSavedState('subjects', INITIAL_SUBJECTS)
  );
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() =>
    loadSavedState('activeSubjectId', INITIAL_SUBJECTS[0].id)
  );
  const [drinks, setDrinks] = useState<CustomDrink[]>(() =>
    loadSavedState('drinks', INITIAL_DRINKS)
  );
  const [activeDrinkId, setActiveDrinkId] = useState<string>(() =>
    loadSavedState('activeDrinkId', INITIAL_DRINKS[0].id)
  );
  const [decorations, setDecorations] = useState<CafeDecoration[]>(() =>
    loadSavedState('decorations', INITIAL_DECORATIONS)
  );
  const [todos, setTodos] = useState<TodoTask[]>(() =>
    loadSavedState('todos', INITIAL_TODOS)
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() =>
    loadSavedState('activeTaskId', INITIAL_TODOS[0]?.id || null)
  );
  const [sessions, setSessions] = useState<StudySession[]>(() =>
    loadSavedState('sessions', INITIAL_SESSIONS)
  );
  const [journals, setJournals] = useState<JournalEntry[]>(() =>
    loadSavedState('journals', INITIAL_JOURNALS)
  );
  const [ambienceChannels, setAmbienceChannels] = useState<AmbienceChannelState[]>(() =>
    loadSavedState('ambienceChannels', INITIAL_AMBIENCE)
  );
  const [ambiencePlaying, setAmbiencePlaying] = useState(false);

  // Timer Runtime State
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedFocusCount, setCompletedFocusCount] = useState<number>(() =>
    loadSavedState('completedFocusCount', 2)
  );

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3600);
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      const payload = {
        settings,
        coins,
        subjects,
        activeSubjectId,
        drinks,
        activeDrinkId,
        decorations,
        todos,
        activeTaskId,
        sessions,
        journals,
        ambienceChannels,
        completedFocusCount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    settings,
    coins,
    subjects,
    activeSubjectId,
    drinks,
    activeDrinkId,
    decorations,
    todos,
    activeTaskId,
    sessions,
    journals,
    ambienceChannels,
    completedFocusCount,
  ]);

  // Sync Web Audio Ambience Engine
  useEffect(() => {
    cafeAudio.syncAmbience(ambiencePlaying, ambienceChannels);
  }, [ambiencePlaying, ambienceChannels]);

  useEffect(() => {
    return () => {
      cafeAudio.stopAmbience();
    };
  }, []);

  // Update browser tab title while timer runs
  useEffect(() => {
    if (!isRunning) {
      document.title = 'Little Café Pomodoro v2 — Pixel Study & Cozy Focus Space';
      return;
    }
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    const label = mode === 'focus' ? 'Fokus' : 'Istirahat';
    document.title = `${m}:${s} (${label}) · Little Café v2`;
  }, [isRunning, secondsLeft, mode]);

  const getModeDurationSeconds = (targetMode: TimerMode, cfg: TimerSettings = settings) => {
    if (targetMode === 'focus') return cfg.focusMinutes * 60;
    if (targetMode === 'shortBreak') return cfg.shortBreakMinutes * 60;
    return cfg.longBreakMinutes * 60;
  };

  const handleSessionFinished = () => {
    if (settings.soundNotification) {
      cafeAudio.playTimerCompleteBell();
    }

    if (mode === 'focus') {
      const earnedCoins = Math.max(5, settings.focusMinutes);
      const nextCount = completedFocusCount + 1;
      setCompletedFocusCount(nextCount);
      setCoins((prev) => prev + earnedCoins);

      const activeTask = todos.find((t) => t.id === activeTaskId && !t.completed);
      const newSession: StudySession = {
        id: `sess-${Date.now()}`,
        subjectId: activeSubjectId || subjects[0]?.id || 'subj-algo',
        durationMinutes: settings.focusMinutes,
        completedAt: new Date().toISOString(),
        dateKey: formatLocalDateKey(),
        drinkId: activeDrinkId,
        note: activeTask ? `Tugas: ${activeTask.title}` : 'Sesi fokus Pomodoro selesai',
        coinsEarned: earnedCoins,
      };
      setSessions((prev) => [newSession, ...prev]);

      // Increment drink brew counter
      setDrinks((prev) =>
        prev.map((d) =>
          d.id === activeDrinkId ? { ...d, timesBrewed: d.timesBrewed + 1 } : d
        )
      );

      // Increment active task pomodoro progress
      if (activeTask) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === activeTask.id
              ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
              : t
          )
        );
      }

      const nextBreakMode: TimerMode =
        nextCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextBreakMode);
      setSecondsLeft(getModeDurationSeconds(nextBreakMode));
      setIsRunning(settings.autoStartBreaks);

      showToast(
        `Sesi fokus ${settings.focusMinutes} menit selesai! Kamu mendapat +${earnedCoins} Koin Kafe.`
      );
    } else {
      setMode('focus');
      setSecondsLeft(getModeDurationSeconds('focus'));
      setIsRunning(settings.autoStartFocus);
      showToast('Waktu istirahat selesai. Siap melanjutkan sesi fokus berikutnya!');
    }
  };

  // Timer interval tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          handleSessionFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  });

  const handleSelectMode = (nextMode: TimerMode) => {
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(getModeDurationSeconds(nextMode));
  };

  const handleSaveSettings = (updated: TimerSettings) => {
    setSettings(updated);
    setIsRunning(false);
    setSecondsLeft(getModeDurationSeconds(mode, updated));
    showToast('Durasi semua timer berhasil diperbarui.');
  };

  const handleQuickAdjustMinutes = (deltaMinutes: number) => {
    if (isRunning) return;
    setSettings((prev) => {
      const next = { ...prev };
      if (mode === 'focus') {
        next.focusMinutes = Math.max(1, Math.min(180, prev.focusMinutes + deltaMinutes));
        setSecondsLeft(next.focusMinutes * 60);
      } else if (mode === 'shortBreak') {
        next.shortBreakMinutes = Math.max(
          1,
          Math.min(60, prev.shortBreakMinutes + deltaMinutes)
        );
        setSecondsLeft(next.shortBreakMinutes * 60);
      } else {
        next.longBreakMinutes = Math.max(
          1,
          Math.min(120, prev.longBreakMinutes + deltaMinutes)
        );
        setSecondsLeft(next.longBreakMinutes * 60);
      }
      return next;
    });
  };

  // To-Do Handlers
  const handleAddTask = (
    title: string,
    subjectId: string,
    priority: TaskPriority,
    targetPomodoros: number
  ) => {
    const created: TodoTask = {
      id: `todo-${Date.now()}`,
      title,
      subjectId,
      priority,
      targetPomodoros,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [created, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(created.id);
    }
  };

  const handleToggleTask = (id: string) => {
    setTodos((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const nextCompleted = !task.completed;
        if (nextCompleted) {
          setCoins((c) => c + 10);
          if (settings.soundNotification) cafeAudio.playCoinChime();
          showToast(`Tugas selesai! Bonus +10 Koin Kafe ditambahkan.`);
        }
        return { ...task, completed: nextCompleted };
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const handleClearCompletedTasks = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  // Ambience Handlers
  const handleToggleAmbienceChannel = (id: AmbienceChannelId) => {
    setAmbienceChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  const handleChangeAmbienceVolume = (id: AmbienceChannelId, volume: number) => {
    setAmbienceChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, volume, enabled: volume > 0 } : ch
      )
    );
  };

  const handleApplyAmbiencePreset = (
    preset: 'rainLofi' | 'deepQuiet' | 'cozyCafe'
  ) => {
    setAmbienceChannels((prev) =>
      prev.map((ch) => {
        if (preset === 'rainLofi') {
          if (ch.id === 'rain') return { ...ch, enabled: true, volume: 60 };
          if (ch.id === 'lofi') return { ...ch, enabled: true, volume: 45 };
          return { ...ch, enabled: false };
        }
        if (preset === 'cozyCafe') {
          if (ch.id === 'cafe') return { ...ch, enabled: true, volume: 55 };
          if (ch.id === 'lofi') return { ...ch, enabled: true, volume: 40 };
          if (ch.id === 'rain') return { ...ch, enabled: true, volume: 25 };
          return { ...ch, enabled: false };
        }
        // deepQuiet
        if (ch.id === 'fire') return { ...ch, enabled: true, volume: 55 };
        if (ch.id === 'keyboard') return { ...ch, enabled: true, volume: 30 };
        return { ...ch, enabled: false };
      })
    );
    setAmbiencePlaying(true);
  };

  // Cafe Decoration Handlers
  const handleBuyDecoration = (id: string) => {
    const target = decorations.find((d) => d.id === id);
    if (!target || target.owned || coins < target.priceCoins) return;
    setCoins((prev) => prev - target.priceCoins);
    setDecorations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, owned: true, equipped: true } : d))
    );
    if (settings.soundNotification) cafeAudio.playCoinChime();
    showToast(`${target.name} berhasil dibeli dan dipasang di Ruang Kafe!`);
  };

  const handleToggleEquipDecoration = (id: string) => {
    setDecorations((prev) =>
      prev.map((d) => (d.id === id && d.owned ? { ...d, equipped: !d.equipped } : d))
    );
  };

  // Custom Drink Menu Handlers
  const handleUnlockDrink = (id: string) => {
    const target = drinks.find((d) => d.id === id);
    if (!target || target.unlocked || coins < target.priceCoins) return;
    setCoins((prev) => prev - target.priceCoins);
    setDrinks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, unlocked: true } : d))
    );
    setActiveDrinkId(id);
    if (settings.soundNotification) cafeAudio.playCoinChime();
    showToast(`Resep ${target.name} terbuka dan disajikan di Meja Fokus!`);
  };

  const handleCreateCustomDrink = (
    draft: Omit<
      CustomDrink,
      'id' | 'priceCoins' | 'unlocked' | 'isUserCreated' | 'timesBrewed'
    >
  ) => {
    const newDrink: CustomDrink = {
      ...draft,
      id: `drink-custom-${Date.now()}`,
      priceCoins: 0,
      unlocked: true,
      isUserCreated: true,
      timesBrewed: 1,
    };
    setDrinks((prev) => [newDrink, ...prev]);
    setActiveDrinkId(newDrink.id);
    if (settings.soundNotification) cafeAudio.playCoinChime();
    showToast(`Racikan "${newDrink.name}" ditambahkan ke menu dan disajikan di meja!`);
  };

  const handleDeleteCustomDrink = (id: string) => {
    setDrinks((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDrinkId === id && remaining.length > 0) {
        setActiveDrinkId(remaining[0].id);
      }
      return remaining;
    });
    showToast('Menu minuman kustom dihapus.');
  };

  // Study Tracker & Journal Handlers
  const handleAddSubject = (
    name: string,
    color: string,
    weeklyTargetMinutes: number
  ) => {
    const created: StudySubject = {
      id: `subj-${Date.now()}`,
      name,
      color,
      weeklyTargetMinutes,
    };
    setSubjects((prev) => [...prev, created]);
    showToast(`Topik "${name}" ditambahkan ke Study Tracker.`);
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) return;
    const remaining = subjects.filter((s) => s.id !== id);
    setSubjects(remaining);
    if (activeSubjectId === id) {
      setActiveSubjectId(remaining[0].id);
    }
  };

  const handleLogManualSession = (
    subjectId: string,
    durationMinutes: number,
    note: string
  ) => {
    const reward = Math.max(5, Math.round(durationMinutes));
    const entry: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId,
      durationMinutes,
      completedAt: new Date().toISOString(),
      dateKey: formatLocalDateKey(),
      drinkId: activeDrinkId,
      note: note || 'Pencatatan sesi belajar manual',
      coinsEarned: reward,
    };
    setSessions((prev) => [entry, ...prev]);
    setCoins((prev) => prev + reward);
    if (settings.soundNotification) cafeAudio.playCoinChime();
    showToast(`Sesi ${durationMinutes} menit tercatat! Kamu memperoleh +${reward} Koin.`);
  };

  const handleSaveJournal = (
    entryData: { title: string; content: string; mood: JournalMood },
    editingId?: string
  ) => {
    const todayKey = formatLocalDateKey();
    if (editingId) {
      setJournals((prev) =>
        prev.map((j) =>
          j.id === editingId
            ? { ...j, title: entryData.title, content: entryData.content, mood: entryData.mood }
            : j
        )
      );
      showToast('Catatan jurnal berhasil diperbarui.');
      return;
    }

    const alreadyWroteToday = journals.some((j) => j.dateKey === todayKey);
    const created: JournalEntry = {
      id: `jour-${Date.now()}`,
      dateKey: todayKey,
      createdAt: new Date().toISOString(),
      title: entryData.title,
      content: entryData.content,
      mood: entryData.mood,
      focusMinutesSnapshot: todayMinutes,
    };
    setJournals((prev) => [created, ...prev]);

    if (!alreadyWroteToday) {
      setCoins((c) => c + 15);
      if (settings.soundNotification) cafeAudio.playCoinChime();
      showToast('Jurnal harian tersimpan! Bonus refleksi +15 Koin Kafe.');
    } else {
      showToast('Catatan jurnal baru berhasil disimpan.');
    }
  };

  const handleDeleteJournal = (id: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== id));
  };

  const handleExportData = () => {
    const backup = {
      appName: 'Little Café Pomodoro v2',
      exportDate: new Date().toISOString(),
      settings,
      coins,
      subjects,
      activeSubjectId,
      drinks,
      activeDrinkId,
      decorations,
      todos,
      activeTaskId,
      sessions,
      journals,
      ambienceChannels,
      completedFocusCount,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `little-cafe-cadangan-${formatLocalDateKey()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('File cadangan (.json) berhasil diunduh!');
  };

  const handleImportData = (rawJson: string): boolean => {
    try {
      const data = JSON.parse(rawJson);
      if (data.settings) setSettings(data.settings);
      if (typeof data.coins === 'number') setCoins(data.coins);
      if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (data.activeSubjectId) setActiveSubjectId(data.activeSubjectId);
      if (Array.isArray(data.drinks)) setDrinks(data.drinks);
      if (data.activeDrinkId) setActiveDrinkId(data.activeDrinkId);
      if (Array.isArray(data.decorations)) setDecorations(data.decorations);
      if (Array.isArray(data.todos)) setTodos(data.todos);
      if (Array.isArray(data.sessions)) setSessions(data.sessions);
      if (Array.isArray(data.journals)) setJournals(data.journals);
      if (typeof data.completedFocusCount === 'number') {
        setCompletedFocusCount(data.completedFocusCount);
      }
      showToast('Data cadangan berhasil dipulihkan!');
      return true;
    } catch {
      return false;
    }
  };

  const todayKey = formatLocalDateKey();
  const todayMinutes = sessions
    .filter((s) => s.dateKey === todayKey)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'desk', label: 'Meja Fokus' },
    { id: 'cafe', label: 'Ruang Kafe' },
    { id: 'drinks', label: 'Menu Minuman' },
    { id: 'study', label: 'Jurnal & Studi' },
    { id: 'stats', label: 'Statistik' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#18110D] text-[#F5EBE1]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-[#201611] border-b-2 border-[#3C2B22]">
        <button
          type="button"
          onClick={() => setActiveTab('desk')}
          className="font-pixel text-base sm:text-lg tracking-tight text-[#F5EBE1] hover:text-[#F4B43A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Little Café v2
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#C7B2A3]">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === item.id
                  ? 'text-[#F5EBE1] border-[#D98236] font-semibold'
                  : 'border-transparent hover:text-[#F5EBE1] hover:border-[#5C4438]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="pixel-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2E2019] hover:bg-[#3B2920] text-[#F5EBE1] border-2 border-[#523B2F] hover:border-[#D98236] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#F4B43A]" />
            <span>Pasang / Unduh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDurationModalOpen(true)}
            className="pixel-btn px-4 py-2 text-xs font-semibold bg-[#D98236] hover:bg-[#E79247] text-[#18110D] border-2 border-[#FAD09C] cursor-pointer whitespace-nowrap shrink-0"
          >
            Atur Timer
          </button>
        </div>
      </header>

      {/* Mobile Tab Navigation Strip (below header, non-sticky so viewport stays spacious) */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2.5 bg-[#1D140F] border-b border-[#33241C]">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === item.id
                ? 'bg-[#D98236] text-[#18110D] font-semibold'
                : 'text-[#C7B2A3] hover:text-[#F5EBE1]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-40 max-w-sm bg-[#261B15] border-2 border-[#D98236] px-4 py-3 text-xs font-medium text-[#F5EBE1] shadow-lg"
        >
          {toastMessage}
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'desk' && (
          <FocusDeskView
            mode={mode}
            secondsLeft={secondsLeft}
            isRunning={isRunning}
            completedFocusCount={completedFocusCount}
            settings={settings}
            coins={coins}
            todayMinutes={todayMinutes}
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            drinks={drinks}
            activeDrinkId={activeDrinkId}
            todos={todos}
            activeTaskId={activeTaskId}
            ambiencePlaying={ambiencePlaying}
            ambienceChannels={ambienceChannels}
            onSelectMode={handleSelectMode}
            onToggleTimer={() => setIsRunning((r) => !r)}
            onResetTimer={() => {
              setIsRunning(false);
              setSecondsLeft(getModeDurationSeconds(mode));
            }}
            onCompleteEarly={handleSessionFinished}
            onOpenDurationModal={() => setIsDurationModalOpen(true)}
            onQuickAdjustMinutes={handleQuickAdjustMinutes}
            onSelectSubject={setActiveSubjectId}
            onSelectDrink={setActiveDrinkId}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onSelectActiveTask={setActiveTaskId}
            onClearCompletedTasks={handleClearCompletedTasks}
            onToggleAmbienceMaster={() => setAmbiencePlaying((p) => !p)}
            onToggleAmbienceChannel={handleToggleAmbienceChannel}
            onChangeAmbienceVolume={handleChangeAmbienceVolume}
            onApplyAmbiencePreset={handleApplyAmbiencePreset}
          />
        )}

        {activeTab === 'cafe' && (
          <CafeDecorView
            coins={coins}
            decorations={decorations}
            onBuyDecoration={handleBuyDecoration}
            onToggleEquipDecoration={handleToggleEquipDecoration}
          />
        )}

        {activeTab === 'drinks' && (
          <DrinkMenuView
            coins={coins}
            drinks={drinks}
            activeDrinkId={activeDrinkId}
            onSelectDrink={(id) => {
              setActiveDrinkId(id);
              showToast('Minuman disajikan di Meja Fokus!');
            }}
            onUnlockDrink={handleUnlockDrink}
            onCreateCustomDrink={handleCreateCustomDrink}
            onDeleteCustomDrink={handleDeleteCustomDrink}
          />
        )}

        {activeTab === 'study' && (
          <StudyJournalView
            subjects={subjects}
            sessions={sessions}
            journals={journals}
            todayMinutes={todayMinutes}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onLogManualSession={handleLogManualSession}
            onSaveJournal={handleSaveJournal}
            onDeleteJournal={handleDeleteJournal}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            sessions={sessions}
            subjects={subjects}
            drinks={drinks}
            todos={todos}
            coins={coins}
            settings={settings}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#2E2019] py-4 px-6 text-center text-xs text-[#8A7567]">
        Little Café Pomodoro v2 · Semua progres tersimpan otomatis di browser lokalmu
      </footer>

      {/* Custom Timer Duration Modal */}
      {isDurationModalOpen && (
        <TimerDurationModal
          isOpen={isDurationModalOpen}
          settings={settings}
          onClose={() => setIsDurationModalOpen(false)}
          onSave={handleSaveSettings}
        />
      )}

      {/* Download and PWA Install Guide Modal */}
      {isDownloadModalOpen && (
        <DownloadGuideModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      )}
    </div>
  );
}

export default App;
