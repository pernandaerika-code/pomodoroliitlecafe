export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type NavTab = 'desk' | 'cafe' | 'drinks' | 'study' | 'stats';

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  dailyGoalMinutes: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundNotification: boolean;
}

export type TaskPriority = 'Utama' | 'Normal' | 'Santai';

export interface TodoTask {
  id: string;
  title: string;
  subjectId: string;
  priority: TaskPriority;
  targetPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: string;
}

export interface StudySubject {
  id: string;
  name: string;
  color: string;
  weeklyTargetMinutes: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  dateKey: string; // YYYY-MM-DD
  drinkId: string;
  note?: string;
  coinsEarned: number;
}

export type CupStyle = 'mug' | 'tallGlass' | 'teacup' | 'boba' | 'pourover';
export type DrinkTemp = 'Panas' | 'Dingin';
export type DrinkTopping = 'Foam Krim' | 'Boba Hitam' | 'Daun Mint' | 'Kayu Manis' | 'Tanpa Topping';

export interface CustomDrink {
  id: string;
  name: string;
  description: string;
  cupStyle: CupStyle;
  liquidColor: string;
  secondaryColor: string;
  temperature: DrinkTemp;
  topping: DrinkTopping;
  sweetness: 0 | 25 | 50 | 75 | 100;
  priceCoins: number;
  unlocked: boolean;
  isUserCreated: boolean;
  timesBrewed: number;
}

export type DecorationSlot =
  | 'cat'
  | 'lights'
  | 'vinyl'
  | 'plant'
  | 'aquarium'
  | 'neonSign'
  | 'espressoGold'
  | 'pastryCase';

export interface CafeDecoration {
  id: string;
  slot: DecorationSlot;
  name: string;
  category: 'Suasana' | 'Furnitur' | 'Barista' | 'Teman Kafe';
  description: string;
  priceCoins: number;
  owned: boolean;
  equipped: boolean;
  xPercent: number;
  yPercent: number;
}

export type JournalMood = 'Fokus' | 'Tenang' | 'Semangat' | 'Bersyukur' | 'Lelah';

export interface JournalEntry {
  id: string;
  dateKey: string;
  createdAt: string;
  title: string;
  content: string;
  mood: JournalMood;
  focusMinutesSnapshot: number;
}

export type AmbienceChannelId = 'rain' | 'cafe' | 'lofi' | 'fire' | 'keyboard';

export interface AmbienceChannelState {
  id: AmbienceChannelId;
  name: string;
  subtitle: string;
  enabled: boolean;
  volume: number; // 0 to 100
}
