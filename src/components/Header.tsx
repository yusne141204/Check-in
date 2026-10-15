import { ActiveTab } from '../types';
import { Plus, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNewEvent: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  todayStreak: number;
}

export function Header({
  activeTab,
  onTabChange,
  onNewEvent,
  soundEnabled,
  onToggleSound,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('calendar');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors"
        >
          DayFlow
        </a>
      </div>

      {/* Zone 2: Navigation Links (single-line, concise) */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onTabChange('calendar')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'calendar'
              ? 'text-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Calendar
        </button>
        <button
          type="button"
          onClick={() => onTabChange('checkin')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'checkin'
              ? 'text-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Daily Check-in
        </button>
        <button
          type="button"
          onClick={() => onTabChange('clock')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'clock'
              ? 'text-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Clock & Timers
        </button>
        <button
          type="button"
          onClick={() => onTabChange('agenda')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'agenda'
              ? 'text-blue-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Schedule
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action (with sound toggle beside it) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <button
          type="button"
          onClick={onNewEvent}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>
    </header>
  );
}
