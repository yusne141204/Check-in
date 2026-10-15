import { formatStopwatch } from '../utils/dateUtils';
import { Play, Pause, Maximize2, X, CheckCircle2, Coffee } from 'lucide-react';

interface PostTaskFloatingBarProps {
  eventTitle: string;
  elapsedSeconds: number;
  isRunning: boolean;
  isCountdown: boolean;
  targetSeconds: number;
  onTogglePlay: () => void;
  onExpand: () => void;
  onDismiss: () => void;
}

export function PostTaskFloatingBar({
  eventTitle,
  elapsedSeconds,
  isRunning,
  isCountdown,
  targetSeconds,
  onTogglePlay,
  onExpand,
  onDismiss,
}: PostTaskFloatingBarProps) {
  const displaySecs = isCountdown
    ? Math.max(0, targetSeconds - elapsedSeconds)
    : elapsedSeconds;

  const mins = Math.floor(displaySecs / 60);
  const secs = displaySecs % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <aside
      aria-label="Active post-task timer"
      className="fixed bottom-5 right-6 z-40 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/80 px-4 py-3 flex items-center gap-4 transition-transform animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Coffee className="w-4 h-4" />
        </div>

        <div className="min-w-0 max-w-[200px]">
          <div className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">
            {isCountdown ? 'Rest Timer' : 'Buffer Elapsed'}
          </div>
          <div className="text-xs font-semibold text-slate-200 truncate">
            {eventTitle}
          </div>
        </div>
      </div>

      <div className="text-base font-bold font-mono tabular-nums text-slate-50 px-2 py-0.5 bg-slate-800 rounded-md">
        {timeStr}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onTogglePlay}
          title={isRunning ? 'Pause timer' : 'Resume timer'}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={onExpand}
          title="Open full timer details"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onDismiss}
          title="Dismiss dock"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
