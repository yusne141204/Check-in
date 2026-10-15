import { useState } from 'react';
import { EventCategory, DailyCheckIn, PlannerEvent } from '../types';
import {
  getMonthMatrix,
  formatIsoDate,
  isSameDay,
  CATEGORY_METADATA,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  selectedCategories: Set<EventCategory>;
  onToggleCategory: (cat: EventCategory) => void;
  todayCheckIn?: DailyCheckIn;
  onOpenCheckIn: () => void;
  events: PlannerEvent[];
  streakCount: number;
}

export function Sidebar({
  selectedDate,
  onSelectDate,
  selectedCategories,
  onToggleCategory,
  todayCheckIn,
  onOpenCheckIn,
  events,
  streakCount,
}: SidebarProps) {
  const [viewMonthDate, setViewMonthDate] = useState<Date>(new Date(selectedDate));

  const monthMatrix = getMonthMatrix(
    viewMonthDate.getFullYear(),
    viewMonthDate.getMonth()
  );

  const monthLabel = viewMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setViewMonthDate(
      new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setViewMonthDate(
      new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    const today = new Date();
    setViewMonthDate(new Date(today));
    onSelectDate(today);
  };

  // Event dates set for dots
  const eventDateSet = new Set(events.map((e) => e.date));

  // Today stats
  const todayIso = formatIsoDate(new Date());
  const todayEvents = events.filter((e) => e.date === todayIso);
  const completedToday = todayEvents.filter((e) => e.completed).length;
  const totalToday = todayEvents.length;
  const totalRestSeconds = todayEvents.reduce(
    (acc, e) => acc + (e.postTaskSession?.durationSeconds || 0),
    0
  );

  return (
    <aside className="w-68 shrink-0 flex flex-col gap-6 p-4 border-r border-slate-200 bg-white select-none">
      {/* Mini Calendar Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToday}
              className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day name headers */}
        <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {monthMatrix.flat().map((date, idx) => {
            const isCurrentMonth =
              date.getMonth() === viewMonthDate.getMonth();
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const iso = formatIsoDate(date);
            const hasEvents = eventDateSet.has(iso);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDate(new Date(date))}
                className={`relative h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold'
                    : isToday
                    ? 'bg-blue-100 text-blue-700 font-bold'
                    : isCurrentMonth
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{date.getDate()}</span>
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Daily Check-in Card */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Daily Check-in
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono tabular-nums">{streakCount}d streak</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Morning Intention</span>
            {todayCheckIn?.morningCheckedIn ? (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Done
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Pending</span>
            )}
          </div>

          {todayCheckIn?.intention ? (
            <p className="text-xs text-slate-700 italic line-clamp-2 leading-relaxed">
              &ldquo;{todayCheckIn.intention}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-slate-400">Set today&apos;s guiding focus & priority.</p>
          )}

          <button
            type="button"
            onClick={onOpenCheckIn}
            className="mt-1 w-full py-1.5 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{todayCheckIn?.morningCheckedIn ? 'Update Check-in' : 'Start Check-in'}</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Categories Filter */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Categories
        </span>

        <div className="flex flex-col gap-1 text-xs">
          {(Object.keys(CATEGORY_METADATA) as EventCategory[]).map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const isChecked = selectedCategories.has(cat);

            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCategory(cat)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                />
                <span className={`w-2.5 h-2.5 rounded-sm ${meta.bg}`} />
                <span className="font-medium">{meta.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Today's Focus Metrics */}
      <div className="flex flex-col gap-2 text-xs text-slate-600">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Today&apos;s Momentum
        </span>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-500">Scheduled events</span>
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {completedToday} / {totalToday}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-500">Post-task rest buffer</span>
          <span className="font-semibold text-slate-800 font-mono tabular-nums flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {Math.round(totalRestSeconds / 60)} min
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </aside>
  );
}
