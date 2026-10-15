import { useState } from 'react';
import { PlannerEvent, EventCategory } from '../types';
import {
  formatTime12,
  formatIsoDate,
  CATEGORY_METADATA,
} from '../utils/dateUtils';
import {
  CheckCircle2,
  Circle,
  Timer,
  Calendar,
  Clock,
  MapPin,
  Check,
  Search,
} from 'lucide-react';

interface ScheduleListViewProps {
  events: PlannerEvent[];
  selectedCategories: Set<EventCategory>;
  onSelectEvent: (event: PlannerEvent) => void;
  onToggleCompleteEvent: (eventId: string) => void;
  onCheckInEvent: (eventId: string) => void;
  onStartPostTaskTimer: (event: PlannerEvent) => void;
  onNewEvent: () => void;
}

export function ScheduleListView({
  events,
  selectedCategories,
  onSelectEvent,
  onToggleCompleteEvent,
  onCheckInEvent,
  onStartPostTaskTimer,
  onNewEvent,
}: ScheduleListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const todayIso = formatIsoDate(new Date());

  // Filter events
  const filtered = events.filter((e) => {
    if (!selectedCategories.has(e.category)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      const matchLoc = e.location?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc;
    }
    return true;
  });

  // Group events by date
  const grouped = filtered.reduce<Record<string, PlannerEvent[]>>((acc, evt) => {
    if (!acc[evt.date]) acc[evt.date] = [];
    acc[evt.date].push(evt);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Top Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Chronological Schedule
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Linear timeline of all planned events, check-in markers, and buffer logs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search schedule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
              />
            </div>

            <button
              type="button"
              onClick={onNewEvent}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              + Add Event
            </button>
          </div>
        </div>

        {/* Schedule List */}
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <Calendar className="w-8 h-8 text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">
              No matching events found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Adjust your category filters or create a new event for your day.
            </p>
            <button
              type="button"
              onClick={onNewEvent}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Schedule First Event
            </button>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dateEvents = grouped[dateStr].sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );
            const isToday = dateStr === todayIso;

            const dateObj = new Date(dateStr + 'T00:00:00');
            const formattedDateLabel = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={dateStr}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Date header */}
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isToday ? 'text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      {isToday ? 'Today · ' : ''}
                      {formattedDateLabel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Event list */}
                <div className="divide-y divide-slate-100">
                  {dateEvents.map((evt) => {
                    const meta = CATEGORY_METADATA[evt.category];

                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer ${
                          evt.completed ? 'opacity-70 bg-slate-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleCompleteEvent(evt.id);
                            }}
                            className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {evt.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-semibold truncate ${
                                  evt.completed
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900'
                                }`}
                              >
                                {evt.title}
                              </span>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${meta.lightBg} ${meta.text}`}
                              >
                                {meta.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {formatTime12(evt.startTime)} – {formatTime12(evt.endTime)}
                              </span>

                              {evt.location && (
                                <span className="font-sans flex items-center gap-1 truncate text-slate-500">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {evt.location}
                                </span>
                              )}

                              {evt.checkedIn && (
                                <span className="text-emerald-700 font-sans font-medium flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                  Checked in
                                </span>
                              )}
                            </div>

                            {evt.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {evt.description}
                              </p>
                            )}

                            {/* Subtask count */}
                            {evt.subtasks && evt.subtasks.length > 0 && (
                              <div className="text-[11px] text-slate-400 mt-1">
                                {evt.subtasks.filter((s) => s.done).length} of{' '}
                                {evt.subtasks.length} subtasks done
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Right */}
                        <div
                          className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!evt.checkedIn && !evt.completed && (
                            <button
                              type="button"
                              onClick={() => onCheckInEvent(evt.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                            >
                              Check In
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onStartPostTaskTimer(evt)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Timer className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {evt.postTaskSession
                                ? `${Math.round(evt.postTaskSession.durationSeconds / 60)}m Buffer`
                                : 'Buffer Timer'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
