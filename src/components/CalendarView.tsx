import { useState, useEffect, useRef } from 'react';
import {
  PlannerEvent,
  EventCategory,
  CalendarViewMode,
} from '../types';
import {
  formatIsoDate,
  formatTime12,
  timeToMinutes,
  isSameDay,
  getDaysOfWeek,
  getDaysForThreeDay,
  getStartOfWeek,
  getMonthMatrix,
  CATEGORY_METADATA,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Timer,
  Check,
  MapPin,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (d: Date) => void;
  events: PlannerEvent[];
  selectedCategories: Set<EventCategory>;
  onSelectEvent: (event: PlannerEvent) => void;
  onAddEventAt: (date: string, startTime: string) => void;
  onToggleCompleteEvent: (eventId: string) => void;
  onCheckInEvent: (eventId: string) => void;
  onStartPostTaskTimer: (event: PlannerEvent) => void;
}

export function CalendarView({
  currentDate,
  onDateChange,
  events,
  selectedCategories,
  onSelectEvent,
  onAddEventAt,
  onToggleCompleteEvent,
  onCheckInEvent,
  onStartPostTaskTimer,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentMinutesFromMidnight, setCurrentMinutesFromMidnight] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keep current time red bar updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutesFromMidnight(now.getHours() * 60 + now.getMinutes());
    };
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to roughly 8:00 AM on initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      // 8 AM = 8 * 60 = 480px - scroll to ~420px
      scrollContainerRef.current.scrollTop = 420;
    }
  }, [viewMode]);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === '3-day') {
      d.setDate(d.getDate() - 3);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    }
    onDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === '3-day') {
      d.setDate(d.getDate() + 3);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    }
    onDateChange(d);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Determine displayed columns
  let columnDates: Date[] = [];
  if (viewMode === 'day') {
    columnDates = [currentDate];
  } else if (viewMode === '3-day') {
    columnDates = getDaysForThreeDay(currentDate);
  } else if (viewMode === 'week') {
    const startOfWeek = getStartOfWeek(currentDate, false);
    columnDates = getDaysOfWeek(startOfWeek);
  }

  // Filter events by category
  const filteredEvents = events.filter((e) => selectedCategories.has(e.category));

  // Calendar title label
  const headerDateLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 60; // 60px per hour -> 1px per minute

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      {/* Calendar Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 tracking-tight ml-2">
            {headerDateLabel}
          </h2>
        </div>

        {/* View Switcher Tabs (Segmented Button Control) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          {(['day', '3-day', 'week', 'month'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer capitalize whitespace-nowrap ${
                viewMode === mode
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === '3-day' ? '3 Days' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View Content */}
      {viewMode === 'month' ? (
        <MonthCalendarView
          currentDate={currentDate}
          events={filteredEvents}
          onSelectDate={(d) => {
            onDateChange(d);
            setViewMode('day');
          }}
          onSelectEvent={onSelectEvent}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header Row for Day Names & Dates */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 shrink-0">
            {/* Time ruler spacer */}
            <div className="w-16 shrink-0 border-r border-slate-200 text-right pr-2 py-2 text-[11px] font-medium text-slate-400">
              GMT
            </div>

            {/* Column Days */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${columnDates.length}, minmax(0, 1fr))` }}>
              {columnDates.map((d, index) => {
                const isToday = isSameDay(d, new Date());
                const isSelected = isSameDay(d, currentDate);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = d.getDate();

                return (
                  <div
                    key={index}
                    onClick={() => onDateChange(new Date(d))}
                    className={`py-2 px-3 text-center border-r border-slate-200 last:border-r-0 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {dayName}
                    </div>
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 mt-0.5 rounded-full text-sm font-bold ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Time Grid */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative bg-white">
            <div className="flex min-h-[1440px] relative">
              {/* Left Time Ruler (00:00 - 23:00) */}
              <div className="w-16 shrink-0 border-r border-slate-200 select-none bg-white">
                {hours.map((hour) => {
                  const displayTime = hour === 0 ? '' : formatTime12(`${String(hour).padStart(2, '0')}:00`);
                  return (
                    <div
                      key={hour}
                      className="relative h-[60px] text-right pr-2.5 text-[11px] text-slate-400 font-medium"
                    >
                      <span className="relative -top-2.5 block">{displayTime}</span>
                    </div>
                  );
                })}
              </div>

              {/* Day Columns */}
              <div
                className="flex-1 grid relative"
                style={{ gridTemplateColumns: `repeat(${columnDates.length}, minmax(0, 1fr))` }}
              >
                {/* Horizontal hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-slate-100 pointer-events-none"
                    style={{ top: `${hour * hourHeight}px` }}
                  />
                ))}

                {/* Columns */}
                {columnDates.map((colDate, colIndex) => {
                  const iso = formatIsoDate(colDate);
                  const isToday = isSameDay(colDate, new Date());
                  const dayEvents = filteredEvents.filter((e) => e.date === iso);

                  return (
                    <div
                      key={colIndex}
                      className="relative border-r border-slate-200/80 last:border-r-0 h-[1440px] group"
                      onClick={(e) => {
                        // Click on background to create event at clicked time
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickY = e.clientY - rect.top;
                        const totalMins = Math.floor(clickY / (hourHeight / 60));
                        const roundedMins = Math.floor(totalMins / 30) * 30; // Snap to 30 min
                        const startH = Math.floor(roundedMins / 60);
                        const startM = roundedMins % 60;
                        const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
                        onAddEventAt(iso, timeStr);
                      }}
                    >
                      {/* Current Time Red Line Indicator (if today) */}
                      {isToday && (
                        <div
                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                          style={{ top: `${currentMinutesFromMidnight}px` }}
                        >
                          <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-red-500 ring-2 ring-white" />
                          <div className="flex-1 border-t-2 border-red-500" />
                        </div>
                      )}

                      {/* Event Blocks */}
                      {dayEvents.map((evt) => {
                        const startM = timeToMinutes(evt.startTime);
                        const endM = timeToMinutes(evt.endTime);
                        const durationM = Math.max(25, endM - startM);
                        const topPx = startM;
                        const heightPx = Math.max(30, durationM);
                        const meta = CATEGORY_METADATA[evt.category];

                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(evt);
                            }}
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`,
                            }}
                            className={`absolute left-1 right-1 rounded-md p-2 text-xs transition-all shadow-xs hover:shadow-md cursor-pointer overflow-hidden z-10 flex flex-col justify-between border ${
                              evt.completed
                                ? 'bg-slate-100/95 border-slate-300 text-slate-500 opacity-80'
                                : `${meta.lightBg} ${meta.border} text-slate-900`
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 overflow-hidden">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      evt.completed ? 'bg-slate-400' : meta.bg
                                    }`}
                                  />
                                  <span
                                    className={`font-semibold truncate text-[11.5px] leading-tight ${
                                      evt.completed ? 'line-through text-slate-500' : 'text-slate-900'
                                    }`}
                                  >
                                    {evt.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                                  <span>{formatTime12(evt.startTime)}</span>
                                  <span>–</span>
                                  <span>{formatTime12(evt.endTime)}</span>
                                </div>
                              </div>

                              {/* Completed / Checked in quick status icon */}
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => onToggleCompleteEvent(evt.id)}
                                  title={evt.completed ? 'Mark incomplete' : 'Mark complete (starts buffer timer)'}
                                  className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                                >
                                  {evt.completed ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Bottom row badges (unboxed text discipline) */}
                            <div className="flex items-center justify-between text-[10px] pt-1">
                              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                                {evt.checkedIn && (
                                  <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                                    <Check className="w-3 h-3" />
                                    <span>Checked in</span>
                                  </span>
                                )}
                                {evt.location && (
                                  <span className="truncate flex items-center gap-0.5 text-slate-500">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    {evt.location}
                                  </span>
                                )}
                              </div>

                              {/* If completed, show post-task timer shortcut button */}
                              {evt.completed && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartPostTaskTimer(evt);
                                  }}
                                  title="Post-Task Rest/Buffer Timer"
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0"
                                >
                                  <Timer className="w-3 h-3" />
                                  <span>{evt.postTaskSession ? 'Buffer Logged' : 'Buffer Timer'}</span>
                                </button>
                              )}

                              {/* If not checked in & not completed, show check in shortcut */}
                              {!evt.checkedIn && !evt.completed && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCheckInEvent(evt.id);
                                  }}
                                  className="text-[10px] font-medium text-slate-600 hover:text-blue-600 hover:underline shrink-0"
                                >
                                  Check In
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Month Calendar View
 */
function MonthCalendarView({
  currentDate,
  events,
  onSelectDate,
  onSelectEvent,
}: {
  currentDate: Date;
  events: PlannerEvent[];
  onSelectDate: (d: Date) => void;
  onSelectEvent: (event: PlannerEvent) => void;
}) {
  const monthMatrix = getMonthMatrix(currentDate.getFullYear(), currentDate.getMonth());
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Month Day Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {dayHeaders.map((dh) => (
          <div key={dh}>{dh}</div>
        ))}
      </div>

      {/* 6x7 Month Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 border-b border-slate-200">
        {monthMatrix.flat().map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(date, new Date());
          const iso = formatIsoDate(date);
          const dayEvents = events.filter((e) => e.date === iso);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(date)}
              className={`border-r border-b border-slate-100 p-1.5 flex flex-col min-h-0 overflow-hidden cursor-pointer transition-colors ${
                isCurrentMonth ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold'
                      : isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dayEvents.length} {dayEvents.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Event chips */}
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((evt) => {
                  const meta = CATEGORY_METADATA[evt.category];
                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center gap-1 ${
                        evt.completed
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : `${meta.lightBg} ${meta.text}`
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.bg}`} />
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-medium px-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
