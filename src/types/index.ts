export type EventCategory = 'work' | 'focus' | 'meeting' | 'health' | 'personal' | 'learning';

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface PostTaskSession {
  durationSeconds: number;
  timerType: 'rest' | 'buffer' | 'reflection';
  completedAt: string;
  notes?: string;
}

export interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: EventCategory;
  color: string; // Tailwind color token or hex
  priority: PriorityLevel;
  completed: boolean;
  completedAt?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  subtasks: Subtask[];
  location?: string;
  postTaskSession?: PostTaskSession;
}

export type MoodType = 'energized' | 'focused' | 'calm' | 'tired' | 'stressed';

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  morningCheckedIn: boolean;
  morningTime?: string;
  intention: string;
  mood: MoodType;
  energyLevel: number; // 1 - 5
  topPriorities: string[];
  eveningReviewed: boolean;
  eveningTime?: string;
  eveningReflection?: string;
  wins?: string[];
}

export interface LapTime {
  lapNumber: number;
  lapTime: number; // in milliseconds
  overallTime: number; // in milliseconds
}

export interface ActivePostTaskTimer {
  eventId: string;
  eventTitle: string;
  category: EventCategory;
  startedAt: number; // epoch timestamp
  targetDurationSeconds: number; // 0 for countup, >0 for countdown
  isCountdown: boolean;
  elapsedSeconds: number;
  isRunning: boolean;
}

export type CalendarViewMode = 'day' | '3-day' | 'week' | 'month' | 'agenda';

export type ActiveTab = 'calendar' | 'checkin' | 'clock' | 'agenda';
