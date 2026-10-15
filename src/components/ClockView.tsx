import { useState, useEffect, useRef } from 'react';
import { LapTime, PlannerEvent } from '../types';
import { formatStopwatch, formatIsoDate } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Clock,
  Timer as TimerIcon,
  Hourglass,
  Globe,
  Plus,
  Volume2,
} from 'lucide-react';

interface ClockViewProps {
  events: PlannerEvent[];
  onAssignTimeToEvent?: (eventId: string, durationSeconds: number) => void;
}

export function ClockView({ events, onAssignTimeToEvent }: ClockViewProps) {
  const [subTab, setSubTab] = useState<'clock' | 'stopwatch' | 'countdown'>('stopwatch');

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Top Segmented Sub-tab Switcher */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Time Studio</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Precision stopwatch, custom countdown timers, and live world clocks
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-200/70 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setSubTab('clock')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                subTab === 'clock'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>World Clock</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('stopwatch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                subTab === 'stopwatch'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              <span>Stopwatch</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('countdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                subTab === 'countdown'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>Countdown</span>
            </button>
          </div>
        </div>

        {/* Render Tab Contents */}
        {subTab === 'clock' && <LiveClockPanel />}
        {subTab === 'stopwatch' && (
          <StopwatchPanel events={events} onAssignTimeToEvent={onAssignTimeToEvent} />
        )}
        {subTab === 'countdown' && (
          <CountdownPanel events={events} onAssignTimeToEvent={onAssignTimeToEvent} />
        )}
      </div>
    </div>
  );
}

/**
 * 1. Live Clock & World Time Panel
 */
function LiveClockPanel() {
  const [time, setTime] = useState(new Date());
  const [use24h, setUse24h] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Analog hands angles
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const displayHours = use24h
    ? String(hours).padStart(2, '0')
    : String(hours % 12 || 12).padStart(2, '0');
  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(seconds).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timezones = [
    { city: 'London', tz: 'Europe/London' },
    { city: 'New York', tz: 'America/New_York' },
    { city: 'San Francisco', tz: 'America/Los_Angeles' },
    { city: 'Tokyo', tz: 'Asia/Tokyo' },
    { city: 'Sydney', tz: 'Australia/Sydney' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Clock Display */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-xs relative">
        <button
          type="button"
          onClick={() => setUse24h(!use24h)}
          className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          {use24h ? '24h format' : '12h format'}
        </button>

        {/* Modern Minimalist SVG Analog Clock */}
        <div className="relative w-44 h-44 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Clock Face */}
            <circle cx="50" cy="50" r="47" className="fill-slate-50 stroke-slate-200" strokeWidth="2" />
            {/* Hour ticks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30 * (Math.PI / 180);
              const x1 = 50 + 40 * Math.sin(angle);
              const y1 = 50 - 40 * Math.cos(angle);
              const x2 = 50 + 44 * Math.sin(angle);
              const y2 = 50 - 44 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={i % 3 === 0 ? 'stroke-slate-800' : 'stroke-slate-300'}
                  strokeWidth={i % 3 === 0 ? '2' : '1'}
                />
              );
            })}
            {/* Hour Hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="28"
              className="stroke-slate-900"
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                transformOrigin: '50px 50px',
                transform: `rotate(${hourDeg}deg)`,
              }}
            />
            {/* Minute Hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              className="stroke-slate-700"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                transformOrigin: '50px 50px',
                transform: `rotate(${minuteDeg}deg)`,
              }}
            />
            {/* Second Hand */}
            <line
              x1="50"
              y1="55"
              x2="50"
              y2="12"
              className="stroke-red-500"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                transformOrigin: '50px 50px',
                transform: `rotate(${secondDeg}deg)`,
              }}
            />
            {/* Center Pin */}
            <circle cx="50" cy="50" r="3" className="fill-red-500" />
          </svg>
        </div>

        {/* Digital display */}
        <div className="flex items-baseline gap-2 font-mono tabular-nums text-5xl md:text-6xl font-bold text-slate-900">
          <span>{displayHours}</span>
          <span className="text-slate-400">:</span>
          <span>{displayMinutes}</span>
          <span className="text-slate-400">:</span>
          <span>{displaySeconds}</span>
          {!use24h && (
            <span className="text-xl font-sans font-semibold text-slate-500 ml-2">
              {ampm}
            </span>
          )}
        </div>

        <div className="text-sm font-medium text-slate-500 mt-2">
          {dateStr}
        </div>
      </div>

      {/* World Clock Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Major Timezones
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {timezones.map((tz) => {
            const tzTime = new Intl.DateTimeFormat('en-US', {
              timeZone: tz.tz,
              hour: '2-digit',
              minute: '2-digit',
              hour12: !use24h,
            }).format(time);

            const tzDate = new Intl.DateTimeFormat('en-US', {
              timeZone: tz.tz,
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }).format(time);

            return (
              <div
                key={tz.city}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col"
              >
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {tz.city}
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {tzTime}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">{tzDate}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Precision Stopwatch Panel
 */
function StopwatchPanel({
  events,
  onAssignTimeToEvent,
}: {
  events: PlannerEvent[];
  onAssignTimeToEvent?: (eventId: string, durationSeconds: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const startTimeRef = useRef<number>(0);
  const prevElapsedRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const update = () => {
        const now = performance.now();
        setElapsed(prevElapsedRef.current + (now - startTimeRef.current));
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      prevElapsedRef.current = elapsed;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    prevElapsedRef.current = 0;
    setLaps([]);
  };

  const handleLap = () => {
    soundManager.playLapTick();
    const lastOverall = laps.length > 0 ? laps[0].overallTime : 0;
    const lapDuration = elapsed - lastOverall;
    const newLap: LapTime = {
      lapNumber: laps.length + 1,
      lapTime: lapDuration,
      overallTime: elapsed,
    };
    setLaps([newLap, ...laps]);
  };

  const handleSaveToTask = () => {
    if (!selectedEventId || !onAssignTimeToEvent) return;
    const secs = Math.round(elapsed / 1000);
    onAssignTimeToEvent(selectedEventId, secs);
    setAssignedSuccess(true);
    setTimeout(() => setAssignedSuccess(false), 2500);
  };

  // Find min and max lap times for styling
  let minLap = Infinity;
  let maxLap = -1;
  if (laps.length > 1) {
    laps.forEach((l) => {
      if (l.lapTime < minLap) minLap = l.lapTime;
      if (l.lapTime > maxLap) maxLap = l.lapTime;
    });
  }

  // Today's events for assigning
  const todayIso = formatIsoDate(new Date());
  const todayTasks = events.filter((e) => e.date === todayIso);

  return (
    <div className="flex flex-col gap-6">
      {/* Stopwatch Hero Display */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Precision Stopwatch
        </span>

        {/* Digital Time readout */}
        <div className="text-6xl md:text-7xl font-extrabold font-mono tabular-nums tracking-wider text-slate-900 py-4">
          {formatStopwatch(elapsed)}
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleReset}
            disabled={elapsed === 0 && !isRunning}
            className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleStartStop}
            className={`px-8 py-3.5 rounded-full text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{elapsed > 0 ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLap}
            disabled={!isRunning}
            className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Record Lap"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>

        {/* Assign to Task Row */}
        {elapsed > 0 && todayTasks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 w-full max-w-md flex items-center gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="">Select task to log {Math.round(elapsed / 1000)}s into...</option>
              {todayTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.startTime} - {t.endTime})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedEventId}
              onClick={handleSaveToTask}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              {assignedSuccess ? 'Saved!' : 'Log to Task'}
            </button>
          </div>
        )}
      </div>

      {/* Laps Table */}
      {laps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Recorded Laps ({laps.length})
            </span>
            <span className="text-xs text-slate-400 font-mono">Split · Overall</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {laps.map((lap) => {
              const isFastest = laps.length > 1 && lap.lapTime === minLap;
              const isSlowest = laps.length > 1 && lap.lapTime === maxLap;

              return (
                <div
                  key={lap.lapNumber}
                  className="px-6 py-2.5 flex items-center justify-between text-xs font-mono tabular-nums"
                >
                  <span className="text-slate-500 font-sans font-medium">
                    Lap {lap.lapNumber}
                  </span>

                  <div className="flex items-center gap-6">
                    <span
                      className={`font-semibold ${
                        isFastest
                          ? 'text-emerald-600'
                          : isSlowest
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      +{formatStopwatch(lap.lapTime)}
                      {isFastest && <span className="ml-1 text-[10px] font-sans text-emerald-600">(Fastest)</span>}
                      {isSlowest && <span className="ml-1 text-[10px] font-sans text-amber-600">(Slowest)</span>}
                    </span>

                    <span className="text-slate-400">{formatStopwatch(lap.overallTime)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 3. Countdown Timer Panel
 */
function CountdownPanel({
  events,
  onAssignTimeToEvent,
}: {
  events: PlannerEvent[];
  onAssignTimeToEvent?: (eventId: string, durationSeconds: number) => void;
}) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60); // Default Pomodoro 25m
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customHours, setCustomHours] = useState('0');
  const [customMins, setCustomMins] = useState('25');
  const [customSecs, setCustomSecs] = useState('0');
  const [presetLabel, setPresetLabel] = useState('Pomodoro Focus (25m)');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            soundManager.playChime();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  const handleApplyPreset = (minutes: number, label: string) => {
    setIsRunning(false);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setPresetLabel(label);
  };

  const handleApplyCustom = () => {
    const h = parseInt(customHours, 10) || 0;
    const m = parseInt(customMins, 10) || 0;
    const s = parseInt(customSecs, 10) || 0;
    const secs = h * 3600 + m * 60 + s;
    if (secs <= 0) return;
    setIsRunning(false);
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setPresetLabel(`${h > 0 ? `${h}h ` : ''}${m}m ${s > 0 ? `${s}s` : ''}`);
  };

  const handleTogglePlay = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  // Format remaining
  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;

  const displayTime =
    hrs > 0
      ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const pct = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;
  const strokeDashoffset = 283 - (283 * pct) / 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Countdown Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-xs">
        {/* Presets Row */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center mb-6">
          {[
            { mins: 5, label: '5m Break' },
            { mins: 10, label: '10m Reset' },
            { mins: 15, label: '15m Recess' },
            { mins: 25, label: '25m Pomodoro' },
            { mins: 45, label: '45m Deep Work' },
            { mins: 60, label: '60m Hour Sprint' },
          ].map((p) => (
            <button
              key={p.mins}
              type="button"
              onClick={() => handleApplyPreset(p.mins, p.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                totalSeconds === p.mins * 60
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none stroke-slate-100"
              strokeWidth="5"
            />
            {/* Active progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none stroke-blue-600 transition-all duration-300"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              {presetLabel}
            </span>
            <div className="text-4xl md:text-5xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
              {displayTime}
            </div>
            {remainingSeconds === 0 && (
              <span className="text-xs font-bold text-emerald-600 mt-1">
                Completed!
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-full text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{remainingSeconds === 0 ? 'Restart' : remainingSeconds < totalSeconds ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => soundManager.playChime()}
            className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Test Chime Sound"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Duration Selector */}
        <div className="mt-8 pt-6 border-t border-slate-100 w-full max-w-sm flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="24"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              className="w-14 px-2 py-1.5 text-center text-xs font-mono border border-slate-200 rounded-md"
            />
            <span className="text-xs text-slate-500">h</span>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="59"
              value={customMins}
              onChange={(e) => setCustomMins(e.target.value)}
              className="w-14 px-2 py-1.5 text-center text-xs font-mono border border-slate-200 rounded-md"
            />
            <span className="text-xs text-slate-500">m</span>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="59"
              value={customSecs}
              onChange={(e) => setCustomSecs(e.target.value)}
              className="w-14 px-2 py-1.5 text-center text-xs font-mono border border-slate-200 rounded-md"
            />
            <span className="text-xs text-slate-500">s</span>
          </div>

          <button
            type="button"
            onClick={handleApplyCustom}
            className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-md transition-colors cursor-pointer ml-1"
          >
            Set Custom
          </button>
        </div>
      </div>
    </div>
  );
}
