import { PlannerEvent } from '../types';
import { formatTime12, CATEGORY_METADATA } from '../utils/dateUtils';
import {
  X,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  Circle,
  Timer,
  Edit3,
  Trash2,
  CheckSquare,
} from 'lucide-react';

interface EventDetailsModalProps {
  event: PlannerEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: PlannerEvent) => void;
  onDelete: (eventId: string) => void;
  onToggleComplete: (eventId: string) => void;
  onCheckIn: (eventId: string) => void;
  onStartPostTaskTimer: (event: PlannerEvent) => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onCheckIn,
  onStartPostTaskTimer,
}: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  const meta = CATEGORY_METADATA[event.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header with category color banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${meta.bg}`} />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              title="Edit event"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(event.id);
                onClose();
              }}
              title="Delete event"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Event Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Title & Checkbox */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => onToggleComplete(event.id)}
              className="text-slate-400 hover:text-blue-600 transition-colors mt-0.5"
            >
              {event.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1">
              <h2
                className={`text-base font-bold leading-snug ${
                  event.completed ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {event.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {formatTime12(event.startTime)} – {formatTime12(event.endTime)}
                </span>
                <span>·</span>
                <span className="font-sans font-medium">{event.date}</span>
              </div>
            </div>
          </div>

          {/* Quick Check-in & Timer Action Row */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Check-in Status</span>
              {event.checkedIn ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Checked in at{' '}
                  {event.checkedInAt
                    ? new Date(event.checkedInAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onCheckIn(event.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer"
                >
                  Check In Now
                </button>
              )}
            </div>

            {/* Post-Task Completion Timer prompt */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Post-Task Rest & Buffer
                </span>
                <span className="text-[11px] text-slate-500">
                  {event.postTaskSession
                    ? `Logged ${Math.round(event.postTaskSession.durationSeconds / 60)} min buffer`
                    : 'Track time taken to rest/recover'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPostTaskTimer(event);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Timer className="w-3.5 h-3.5 text-blue-400" />
                <span>{event.postTaskSession ? 'Adjust Buffer' : 'Start Timer'}</span>
              </button>
            </div>
          </div>

          {/* Location if present */}
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Description if present */}
          {event.description && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              {event.description}
            </p>
          )}

          {/* Subtasks */}
          {event.subtasks && event.subtasks.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Subtasks ({event.subtasks.filter((s) => s.done).length} / {event.subtasks.length})
              </span>
              <div className="flex flex-col gap-1.5">
                {event.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <CheckSquare
                      className={`w-4 h-4 ${
                        st.done ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                    <span className={st.done ? 'line-through text-slate-400' : ''}>
                      {st.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
