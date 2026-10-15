import { useState, useEffect } from 'react';
import { PlannerEvent, PostTaskSession } from '../types';
import { formatStopwatch, CATEGORY_METADATA } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

interface PostTaskTimerModalProps {
  event: PlannerEvent;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onSaveSession: (eventId: string, session: PostTaskSession) => void;
  elapsedSeconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  isCountdown: boolean;
  targetSeconds: number;
  onSetMode: (isCountdown: boolean, targetSecs: number) => void;
}

export function PostTaskTimerModal({
  event,
  isOpen,
  onClose,
  onMinimize,
  onSaveSession,
  elapsedSeconds,
  isRunning,
  onTogglePlay,
  onReset,
  isCountdown,
  targetSeconds,
  onSetMode,
}: PostTaskTimerModalProps) {
  const [reflectionNotes, setReflectionNotes] = useState(event.postTaskSession?.notes || '');
  const [timerType, setTimerType] = useState<'rest' | 'buffer' | 'reflection'>('rest');

  const meta = CATEGORY_METADATA[event.category];

  // If countdown, display remaining time
  const displayRemaining = isCountdown ? Math.max(0, targetSeconds - elapsedSeconds) : elapsedSeconds;

  // Check if countdown ended
  useEffect(() => {
    if (isCountdown && targetSeconds > 0 && elapsedSeconds >= targetSeconds && isRunning) {
      soundManager.playChime();
    }
  }, [isCountdown, targetSeconds, elapsedSeconds, isRunning]);

  if (!isOpen) return null;

  const handlePresetSelect = (minutes: number) => {
    onSetMode(true, minutes * 60);
  };

  const handleSwitchToOpenCountUp = () => {
    onSetMode(false, 0);
  };

  const handleSaveAndFinish = () => {
    soundManager.playCompletionSound();
    onSaveSession(event.id, {
      durationSeconds: elapsedSeconds,
      timerType,
      completedAt: new Date().toISOString(),
      notes: reflectionNotes.trim() || undefined,
    });
    onClose();
  };

  // Format digital readout
  const minutes = Math.floor(displayRemaining / 60);
  const seconds = displayRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct =
    isCountdown && targetSeconds > 0
      ? Math.min(100, (elapsedSeconds / targetSeconds) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Post-Task Recovery & Buffer Tracker
              </h3>
              <p className="text-xs text-slate-500">
                Track restorative time before starting your next scheduled item
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMinimize}
              title="Minimize to floating dock"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Completed Task Identity Card */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Completed Task
              </span>
              <span className="text-sm font-semibold text-slate-800 truncate block mt-0.5">
                {event.title}
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-medium shrink-0 ${meta.lightBg} ${meta.text}`}
            >
              {meta.label}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={handleSwitchToOpenCountUp}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                !isCountdown
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open Buffer (Count Up)
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(5)}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                isCountdown
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timed Rest (Countdown)
            </button>
          </div>

          {/* Presets if in Countdown mode */}
          {isCountdown && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { mins: 3, label: '3m Quick Reset' },
                { mins: 5, label: '5m Water & Breath' },
                { mins: 10, label: '10m Stretch' },
                { mins: 15, label: '15m Mindful Walk' },
              ].map((p) => (
                <button
                  key={p.mins}
                  type="button"
                  onClick={() => handlePresetSelect(p.mins)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                    targetSeconds === p.mins * 60
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Central Timer Display */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-900 text-white rounded-xl relative overflow-hidden">
            {/* Background progress glow for countdown */}
            {isCountdown && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            )}

            <span className="text-[11px] font-medium tracking-widest uppercase text-slate-400 mb-1">
              {isCountdown ? 'Rest Countdown Remaining' : 'Buffer Elapsed Since Completion'}
            </span>

            <div className="text-5xl font-extrabold font-mono tabular-nums tracking-wider text-slate-50">
              {timeFormatted}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-5">
              <button
                type="button"
                onClick={onReset}
                title="Reset timer"
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{elapsedSeconds > 0 ? 'Resume' : 'Start'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Activity Category for the buffer & Notes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Buffer Activity</span>
              <div className="flex items-center gap-1">
                {(['rest', 'buffer', 'reflection'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTimerType(type)}
                    className={`px-2 py-0.5 rounded text-xs capitalize transition-colors cursor-pointer ${
                      timerType === type
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">
                Post-task note / takeaways (saved to event history)
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared inbox, recharged, ready for next sprint..."
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onMinimize}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Keep running in dock
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndFinish}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Buffer & Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
