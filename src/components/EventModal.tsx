import { useState, useEffect } from 'react';
import { PlannerEvent, EventCategory, PriorityLevel, Subtask } from '../types';
import { CATEGORY_METADATA } from '../utils/dateUtils';
import {
  X,
  Clock,
  Calendar,
  MapPin,
  AlignLeft,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: PlannerEvent | null;
  initialDate?: string;
  initialStartTime?: string;
  onSave: (event: PlannerEvent) => void;
  onDelete?: (eventId: string) => void;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  initialDate,
  initialStartTime,
  onSave,
  onDelete,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('work');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setCategory(event.category);
      setPriority(event.priority);
      setLocation(event.location || '');
      setDescription(event.description || '');
      setSubtasks(event.subtasks || []);
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      const start = initialStartTime || '09:00';
      setStartTime(start);
      // default end 1 hour later
      const [h, m] = start.split(':').map(Number);
      const endH = Math.min(23, h + 1);
      setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      setCategory('work');
      setPriority('medium');
      setLocation('');
      setDescription('');
      setSubtasks([]);
    }
  }, [event, initialDate, initialStartTime, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st-${Date.now()}-${Math.random()}`, text: newSubtaskText.trim(), done: false },
    ]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, done: !st.done } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedEvent: PlannerEvent = {
      id: event?.id || `evt-${Date.now()}`,
      title: title.trim(),
      date,
      startTime,
      endTime,
      category,
      color: CATEGORY_METADATA[category].bg,
      priority,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      subtasks,
      completed: event?.completed || false,
      completedAt: event?.completedAt,
      checkedIn: event?.checkedIn || false,
      checkedInAt: event?.checkedInAt,
      postTaskSession: event?.postTaskSession,
    };

    onSave(savedEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            {event ? 'Edit Planned Event' : 'Create New Event'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sprint Backlog Review, 30m Workout..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-900"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_METADATA) as EventCategory[]).map((cat) => {
                const meta = CATEGORY_METADATA[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      category === cat
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.bg}`} />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 capitalize"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Location or Video Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Room 3B or meet.google.com/..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Checklist / Subtasks
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-100 text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                      />
                      <span className={st.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                        {st.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Notes & Description
            </label>
            <textarea
              rows={2}
              placeholder="Context, agenda items, or outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {event && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                Delete Event
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
