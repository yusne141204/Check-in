import { useState } from 'react';
import { DailyCheckIn, MoodType } from '../types';
import { formatIsoDate } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';
import {
  X,
  Sparkles,
  Sun,
  Moon,
  Smile,
  Zap,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn?: DailyCheckIn;
  onSaveCheckIn: (checkIn: DailyCheckIn) => void;
  dateIso?: string;
}

export function CheckInModal({
  isOpen,
  onClose,
  checkIn,
  onSaveCheckIn,
  dateIso,
}: CheckInModalProps) {
  const targetDate = dateIso || formatIsoDate(new Date());

  const [activeStep, setActiveStep] = useState<'morning' | 'evening'>('morning');
  const [intention, setIntention] = useState(checkIn?.intention || '');
  const [mood, setMood] = useState<MoodType>(checkIn?.mood || 'focused');
  const [energyLevel, setEnergyLevel] = useState(checkIn?.energyLevel || 4);
  const [priorities, setPriorities] = useState<string[]>(
    checkIn?.topPriorities && checkIn.topPriorities.length > 0
      ? checkIn.topPriorities
      : ['', '', '']
  );
  const [eveningReflection, setEveningReflection] = useState(
    checkIn?.eveningReflection || ''
  );
  const [wins, setWins] = useState<string[]>(
    checkIn?.wins && checkIn.wins.length > 0 ? checkIn.wins : ['']
  );

  if (!isOpen) return null;

  const handlePriorityChange = (index: number, val: string) => {
    const updated = [...priorities];
    updated[index] = val;
    setPriorities(updated);
  };

  const handleWinChange = (index: number, val: string) => {
    const updated = [...wins];
    updated[index] = val;
    setWins(updated);
  };

  const handleAddWin = () => {
    setWins([...wins, '']);
  };

  const handleRemoveWin = (index: number) => {
    setWins(wins.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    soundManager.playCheckInSound();
    const validPriorities = priorities.map((p) => p.trim()).filter(Boolean);
    const validWins = wins.map((w) => w.trim()).filter(Boolean);

    const updated: DailyCheckIn = {
      date: targetDate,
      morningCheckedIn: true,
      morningTime: checkIn?.morningTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      intention: intention.trim() || 'Focus on single-task mastery and clarity.',
      mood,
      energyLevel,
      topPriorities: validPriorities.length > 0 ? validPriorities : ['Execute daily plan'],
      eveningReviewed: activeStep === 'evening' ? true : (checkIn?.eveningReviewed || false),
      eveningTime:
        activeStep === 'evening'
          ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : checkIn?.eveningTime,
      eveningReflection: eveningReflection.trim() || checkIn?.eveningReflection,
      wins: validWins.length > 0 ? validWins : checkIn?.wins,
    };

    onSaveCheckIn(updated);
    onClose();
  };

  const moods: { id: MoodType; label: string; icon: string }[] = [
    { id: 'energized', label: 'Energized', icon: '⚡' },
    { id: 'focused', label: 'In Flow', icon: '🎯' },
    { id: 'calm', label: 'Calm & Steady', icon: '🌿' },
    { id: 'tired', label: 'Low Battery', icon: '🔋' },
    { id: 'stressed', label: 'Under Pressure', icon: '🌪️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Check-in · {targetDate}
              </h3>
              <p className="text-xs text-slate-500">
                Set mindful intentions and calibrate your energy for the day
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Switcher for Morning vs Evening */}
        <div className="px-6 pt-4">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveStep('morning')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeStep === 'morning'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Morning Check-in</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('evening')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeStep === 'evening'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evening Reflection</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {activeStep === 'morning' ? (
            <>
              {/* Daily Intention */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Today&apos;s Guiding Intention & Focus
                </label>
                <textarea
                  rows={2}
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="e.g. Approach each calendar block with full presence and calm focus."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Mood Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-2">
                  Current Mindset & Mood
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                        mood === m.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Energy Level</span>
                  <span className="font-bold font-mono text-blue-600">
                    {energyLevel} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Recharging (1)</span>
                  <span>Moderate (3)</span>
                  <span>Peak Flow (5)</span>
                </div>
              </div>

              {/* Top 3 Priorities */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-2">
                  Top 3 Non-Negotiable Priorities
                </label>
                <div className="flex flex-col gap-2">
                  {priorities.map((pri, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0 font-mono">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Priority ${i + 1}...`}
                        value={pri}
                        onChange={(e) => handlePriorityChange(i, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Evening Reflection */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Evening Reflection & Wrap-up
                </label>
                <textarea
                  rows={3}
                  value={eveningReflection}
                  onChange={(e) => setEveningReflection(e.target.value)}
                  placeholder="How did the day unfold? What surprised you or went according to plan?"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Today's Wins */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-800">
                    Celebrated Wins & Progress
                  </label>
                  <button
                    type="button"
                    onClick={handleAddWin}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Win</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {wins.map((win, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Log a win or breakthrough..."
                        value={win}
                        onChange={(e) => handleWinChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {wins.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWin(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Check-in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
