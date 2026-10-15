import { DailyCheckIn, PlannerEvent } from '../types';
import { formatIsoDate, formatTime12 } from '../utils/dateUtils';
import {
  Sparkles,
  Flame,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Calendar,
  Zap,
  Target,
  ArrowRight,
} from 'lucide-react';

interface CheckInTabProps {
  checkIns: Record<string, DailyCheckIn>;
  events: PlannerEvent[];
  todayCheckIn?: DailyCheckIn;
  onOpenCheckInModal: () => void;
  onCheckInEvent: (eventId: string) => void;
  onToggleCompleteEvent: (eventId: string) => void;
  streakCount: number;
}

export function CheckInTab({
  checkIns,
  events,
  todayCheckIn,
  onOpenCheckInModal,
  onCheckInEvent,
  onToggleCompleteEvent,
  streakCount,
}: CheckInTabProps) {
  const todayIso = formatIsoDate(new Date());
  const todayEvents = events.filter((e) => e.date === todayIso);
  const checkedInTasksCount = todayEvents.filter((e) => e.checkedIn).length;

  const pastCheckInList = Object.values(checkIns)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Daily Check-in & Intentions
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Start each morning with clarity, check into scheduled tasks, and reflect each evening
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              <div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-600">
                  Daily Streak
                </div>
                <div className="text-base font-bold font-mono tabular-nums leading-none">
                  {streakCount} {streakCount === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCheckInModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{todayCheckIn?.morningCheckedIn ? 'Edit Today&apos;s Check-in' : 'Check In Today'}</span>
            </button>
          </div>
        </div>

        {/* Today's Check-in Focus Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning Intention & Mindset Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Sun className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Morning Check-in
                  </span>
                </div>
                {todayCheckIn?.morningCheckedIn ? (
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Logged at {todayCheckIn.morningTime}</span>
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Pending</span>
                )}
              </div>

              {todayCheckIn?.morningCheckedIn ? (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Core Intention
                    </span>
                    <p className="text-sm font-medium text-slate-800 mt-1 italic leading-relaxed">
                      &ldquo;{todayCheckIn.intention}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Mindset</span>
                      <span className="font-semibold text-slate-800 capitalize mt-0.5 block">
                        {todayCheckIn.mood}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Energy Battery</span>
                      <span className="font-semibold font-mono text-blue-600 mt-0.5 block">
                        {todayCheckIn.energyLevel} / 5
                      </span>
                    </div>
                  </div>

                  {todayCheckIn.topPriorities && todayCheckIn.topPriorities.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Top 3 Priorities
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {todayCheckIn.topPriorities.map((pri, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md"
                          >
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{pri}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500 mb-3">
                    You haven&apos;t checked in for this morning yet. Set your tone for the day!
                  </p>
                  <button
                    type="button"
                    onClick={onOpenCheckInModal}
                    className="px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Complete Morning Check-in
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Evening Reflection Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Moon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Evening Reflection
                  </span>
                </div>
                {todayCheckIn?.eveningReviewed ? (
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reviewed at {todayCheckIn.eveningTime}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Available later</span>
                )}
              </div>

              {todayCheckIn?.eveningReviewed ? (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Daily Summary & Reflection
                    </span>
                    <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
                      {todayCheckIn.eveningReflection}
                    </p>
                  </div>

                  {todayCheckIn.wins && todayCheckIn.wins.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Wins & Breakthroughs
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {todayCheckIn.wins.map((win, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{win}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500 mb-3">
                    Reflect on your achievements and learning at the end of the day.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenCheckInModal}
                    className="px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Open Evening Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Task Check-In Roster */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Task-Level Check-in Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check in when you start working on a scheduled task to stay accountable
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500">
              <span className="font-bold text-slate-800 font-mono tabular-nums">
                {checkedInTasksCount}
              </span>{' '}
              of {todayEvents.length} tasks checked in
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No events scheduled for today. Add events from the calendar!
              </div>
            ) : (
              todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleCompleteEvent(evt.id)}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                    >
                      {evt.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          evt.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {evt.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatTime12(evt.startTime)} – {formatTime12(evt.endTime)}
                        {evt.checkedInAt && (
                          <span className="ml-2 text-emerald-700 font-sans font-medium">
                            · Checked in at{' '}
                            {new Date(evt.checkedInAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {evt.checkedIn ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Checked In</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCheckInEvent(evt.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                      >
                        Check In Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Previous Check-in History */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Past Check-in Log & Consistency
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pastCheckInList.slice(0, 3).map((item) => (
              <div
                key={item.date}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-800">{item.date}</span>
                    <span className="capitalize text-[11px]">{item.mood}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic line-clamp-3 leading-relaxed">
                    &ldquo;{item.intention}&rdquo;
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Energy: {item.energyLevel}/5</span>
                  {item.eveningReviewed && (
                    <span className="text-emerald-700 font-medium">Reviewed ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
