import { PlannerEvent, DailyCheckIn } from '../types';
import { getTodayIso, formatIsoDate } from './dateUtils';

const STORAGE_EVENTS_KEY = 'dayflow_events_v2';
const STORAGE_CHECKINS_KEY = 'dayflow_checkins_v2';
const STORAGE_SOUND_KEY = 'dayflow_sound_enabled';

export function getInitialEvents(): PlannerEvent[] {
  const today = getTodayIso();
  const d = new Date();
  
  // Tomorrow
  const tomorrowDate = new Date(d);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatIsoDate(tomorrowDate);

  // Yesterday
  const yesterdayDate = new Date(d);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatIsoDate(yesterdayDate);

  return [
    {
      id: 'evt-1',
      title: 'Morning Kickoff & Day Planning',
      description: 'Review top 3 priorities, daily check-in, and calendar blocks',
      date: today,
      startTime: '08:30',
      endTime: '09:15',
      category: 'work',
      color: '#3b82f6',
      priority: 'high',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      checkedIn: true,
      checkedInAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      subtasks: [
        { id: 'st-1', text: 'Fill morning check-in', done: true },
        { id: 'st-2', text: 'Confirm schedule & buffer times', done: true },
      ],
      postTaskSession: {
        durationSeconds: 300,
        timerType: 'rest',
        completedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        notes: 'Refreshed with a glass of water before deep work',
      },
    },
    {
      id: 'evt-2',
      title: 'Deep Focus: Core Architecture Refactor',
      description: 'Sprint through complex state machines and component optimization',
      date: today,
      startTime: '09:30',
      endTime: '11:45',
      category: 'focus',
      color: '#6366f1',
      priority: 'high',
      completed: false,
      checkedIn: true,
      checkedInAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      subtasks: [
        { id: 'st-3', text: 'Refactor stopwatch and countdown hooks', done: true },
        { id: 'st-4', text: 'Integrate post-task buffer tracker', done: false },
        { id: 'st-5', text: 'Verify responsive grid alignment', done: false },
      ],
      location: 'Virtual Studio / Workspace A',
    },
    {
      id: 'evt-3',
      title: 'Nutritious Lunch & Mindful Walk',
      description: 'Step away from screen, hydrate, and get fresh air',
      date: today,
      startTime: '12:00',
      endTime: '13:00',
      category: 'health',
      color: '#10b981',
      priority: 'medium',
      completed: false,
      checkedIn: false,
      subtasks: [
        { id: 'st-6', text: '30-minute outdoor stroll', done: false },
        { id: 'st-7', text: 'Hydration check (500ml)', done: false },
      ],
    },
    {
      id: 'evt-4',
      title: 'Product Sync & Design Critique',
      description: 'Review interface prototypes and user flow milestones',
      date: today,
      startTime: '13:30',
      endTime: '14:30',
      category: 'meeting',
      color: '#f59e0b',
      priority: 'medium',
      completed: false,
      checkedIn: false,
      subtasks: [
        { id: 'st-8', text: 'Demo new time tracking features', done: false },
        { id: 'st-9', text: 'Gather feedback on calendar modes', done: false },
      ],
      location: 'Google Meet',
    },
    {
      id: 'evt-5',
      title: 'Skill Expansion & Reading',
      description: 'Explore high-performance UI patterns and audio synthesis in browser',
      date: today,
      startTime: '15:00',
      endTime: '16:15',
      category: 'learning',
      color: '#14b8a6',
      priority: 'low',
      completed: false,
      checkedIn: false,
      subtasks: [
        { id: 'st-10', text: 'Read chapter 4 of High Performance Web Audio', done: false },
      ],
    },
    {
      id: 'evt-6',
      title: 'Daily Evening Review & Reflection',
      description: 'Wrap up tasks, celebrate wins, and calibrate tomorrow',
      date: today,
      startTime: '17:00',
      endTime: '17:30',
      category: 'personal',
      color: '#a855f7',
      priority: 'high',
      completed: false,
      checkedIn: false,
      subtasks: [
        { id: 'st-11', text: 'Review completed tasks & buffer time', done: false },
        { id: 'st-12', text: 'Complete evening check-in log', done: false },
      ],
    },
    // Tomorrow preview
    {
      id: 'evt-7',
      title: 'Client Strategy & Sprint Planning',
      description: 'Sprint roadmap review for upcoming deliverables',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:30',
      category: 'meeting',
      color: '#f59e0b',
      priority: 'high',
      completed: false,
      checkedIn: false,
      subtasks: [],
    },
    {
      id: 'evt-8',
      title: 'Design System Documentation',
      description: 'Document zero-pill design rules and typography scales',
      date: tomorrow,
      startTime: '13:00',
      endTime: '15:00',
      category: 'work',
      color: '#3b82f6',
      priority: 'medium',
      completed: false,
      checkedIn: false,
      subtasks: [],
    },
    // Yesterday completed
    {
      id: 'evt-9',
      title: 'Sprint Retrospective',
      description: 'Weekly recap and process refinement',
      date: yesterday,
      startTime: '14:00',
      endTime: '15:00',
      category: 'work',
      color: '#3b82f6',
      priority: 'medium',
      completed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      checkedIn: true,
      subtasks: [],
    },
  ];
}

export function getInitialCheckIns(): Record<string, DailyCheckIn> {
  const today = getTodayIso();
  const yesterday = formatIsoDate(new Date(Date.now() - 86400000));
  const twoDaysAgo = formatIsoDate(new Date(Date.now() - 86400000 * 2));

  return {
    [today]: {
      date: today,
      morningCheckedIn: true,
      morningTime: '08:15 AM',
      intention: 'Maintain focused flow states and respect post-task recovery buffers.',
      mood: 'energized',
      energyLevel: 4,
      topPriorities: [
        'Complete Core Architecture Refactor',
        'Demo new time tracking features in product sync',
        'Evening review & 30 min recovery walk',
      ],
      eveningReviewed: false,
      wins: [],
    },
    [yesterday]: {
      date: yesterday,
      morningCheckedIn: true,
      morningTime: '08:30 AM',
      intention: 'Deliver high-quality user experiences with deep craftsmanship.',
      mood: 'focused',
      energyLevel: 5,
      topPriorities: ['Sprint Retrospective', 'Finish component styling', 'Run integration tests'],
      eveningReviewed: true,
      eveningTime: '06:10 PM',
      eveningReflection: 'Hit every target smoothly and kept post-task breaks consistent.',
      wins: ['Cleaned up legacy state', 'Zero build warnings', 'Maintained hydration streak'],
    },
    [twoDaysAgo]: {
      date: twoDaysAgo,
      morningCheckedIn: true,
      morningTime: '08:45 AM',
      intention: 'Stay curious and present in every technical decision.',
      mood: 'calm',
      energyLevel: 4,
      topPriorities: ['Audit design system', 'Draft specifications'],
      eveningReviewed: true,
      eveningTime: '05:45 PM',
      eveningReflection: 'Solid steady progress without friction.',
      wins: ['Completed specs early', 'Shared constructive feedback with peer'],
    },
  };
}

export function loadEvents(): PlannerEvent[] {
  if (typeof window === 'undefined') return getInitialEvents();
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (!raw) {
      const initial = getInitialEvents();
      saveEvents(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialEvents();
  }
}

export function saveEvents(events: PlannerEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage', err);
  }
}

export function loadCheckIns(): Record<string, DailyCheckIn> {
  if (typeof window === 'undefined') return getInitialCheckIns();
  try {
    const raw = localStorage.getItem(STORAGE_CHECKINS_KEY);
    if (!raw) {
      const initial = getInitialCheckIns();
      saveCheckIns(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialCheckIns();
  }
}

export function saveCheckIns(checkIns: Record<string, DailyCheckIn>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CHECKINS_KEY, JSON.stringify(checkIns));
  } catch (err) {
    console.error('Failed to save check-ins to localStorage', err);
  }
}

export function loadSoundSetting(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(STORAGE_SOUND_KEY);
  return raw !== null ? raw === 'true' : true;
}

export function saveSoundSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_SOUND_KEY, String(enabled));
}
