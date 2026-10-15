export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayIso(): string {
  return formatIsoDate(new Date());
}

export function getStartOfWeek(date: Date, startOnMonday = false): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (startOnMonday ? (day === 0 ? -6 : 1) : 0);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getDaysOfWeek(startDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(startDate);
    next.setDate(startDate.getDate() + i);
    days.push(next);
  }
  return days;
}

export function getDaysForThreeDay(centerDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 3; i++) {
    const next = new Date(centerDate);
    next.setDate(centerDate.getDate() + i);
    days.push(next);
  }
  return days;
}

export function getMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0 is Sunday
  const startDate = new Date(year, month, 1 - startDay);
  
  const matrix: Date[][] = [];
  let curr = new Date(startDate);

  for (let row = 0; row < 6; row++) {
    const week: Date[] = [];
    for (let col = 0; col < 7; col++) {
      week.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    matrix.push(week);
  }
  return matrix;
}

export function formatTime12(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatStopwatch(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const hundredths = Math.floor((milliseconds % 1000) / 10);

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const ms = String(hundredths).padStart(2, '0');

  return `${mm}:${ss}.${ms}`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, minutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export const CATEGORY_METADATA = {
  work: { label: 'Work & Projects', bg: 'bg-blue-500', lightBg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  focus: { label: 'Deep Focus', bg: 'bg-indigo-600', lightBg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  meeting: { label: 'Meetings & Syncs', bg: 'bg-amber-500', lightBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  health: { label: 'Health & Wellness', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  personal: { label: 'Personal & Routine', bg: 'bg-purple-500', lightBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  learning: { label: 'Study & Reading', bg: 'bg-teal-500', lightBg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};
