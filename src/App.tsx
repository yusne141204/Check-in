/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlannerEvent,
  DailyCheckIn,
  EventCategory,
  ActiveTab,
  PostTaskSession,
} from './types';
import {
  loadEvents,
  saveEvents,
  loadCheckIns,
  saveCheckIns,
  loadSoundSetting,
  saveSoundSetting,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { formatIsoDate, getTodayIso } from './utils/dateUtils';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { ClockView } from './components/ClockView';
import { CheckInTab } from './components/CheckInTab';
import { ScheduleListView } from './components/ScheduleListView';
import { EventModal } from './components/EventModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { CheckInModal } from './components/CheckInModal';
import { PostTaskTimerModal } from './components/PostTaskTimerModal';
import { PostTaskFloatingBar } from './components/PostTaskFloatingBar';

export default function App() {
  // 1. Core State
  const [events, setEvents] = useState<PlannerEvent[]>(() => loadEvents());
  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>(() =>
    loadCheckIns()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundSetting());

  // Category filter selection (all active by default)
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(
    new Set(['work', 'focus', 'meeting', 'health', 'personal', 'learning'])
  );

  // 2. Modals State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [eventModalInitialDate, setEventModalInitialDate] = useState<string | undefined>();
  const [eventModalInitialTime, setEventModalInitialTime] = useState<string | undefined>();

  const [detailsEvent, setDetailsEvent] = useState<PlannerEvent | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // 3. Post-Task Completion Timer State
  const [postTaskEvent, setPostTaskEvent] = useState<PlannerEvent | null>(null);
  const [isPostTaskModalOpen, setIsPostTaskModalOpen] = useState(false);
  const [isPostTaskDockMinimized, setIsPostTaskDockMinimized] = useState(false);
  const [postTaskElapsedSeconds, setPostTaskElapsedSeconds] = useState(0);
  const [isPostTaskRunning, setIsPostTaskRunning] = useState(false);
  const [isPostTaskCountdown, setIsPostTaskCountdown] = useState(false);
  const [postTaskTargetSeconds, setPostTaskTargetSeconds] = useState(0);

  // Sync sound setting to audio manager
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
    saveSoundSetting(soundEnabled);
  }, [soundEnabled]);

  // Persist events
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  // Persist check-ins
  useEffect(() => {
    saveCheckIns(checkIns);
  }, [checkIns]);

  // Post-Task Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPostTaskRunning) {
      interval = setInterval(() => {
        setPostTaskElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPostTaskRunning]);

  // Streak calculation
  const calculateStreak = useCallback(() => {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // If today is checked in, start from today; if not yet, start from yesterday
    const todayIso = formatIsoDate(today);
    if (!checkIns[todayIso]?.morningCheckedIn) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const iso = formatIsoDate(checkDate);
      if (checkIns[iso]?.morningCheckedIn) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [checkIns]);

  const streakCount = calculateStreak();

  // Handlers for Events
  const handleToggleCategory = (cat: EventCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleOpenNewEvent = (initialDate?: string, initialStartTime?: string) => {
    setEditingEvent(null);
    setEventModalInitialDate(initialDate || formatIsoDate(selectedDate));
    setEventModalInitialTime(initialStartTime || '09:00');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (saved: PlannerEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (detailsEvent?.id === eventId) setDetailsEvent(null);
    if (postTaskEvent?.id === eventId) {
      setIsPostTaskModalOpen(false);
      setIsPostTaskDockMinimized(false);
      setIsPostTaskRunning(false);
      setPostTaskEvent(null);
    }
  };

  // Toggle Complete Event (triggers the Post-Task Recovery Timer!)
  const handleToggleCompleteEvent = (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    if (!target) return;

    const willBeCompleted = !target.completed;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : undefined,
            }
          : e
      )
    );

    if (willBeCompleted) {
      soundManager.playCompletionSound();
      // Start Post-Task Recovery & Buffer Tracker
      setPostTaskEvent({ ...target, completed: true });
      setPostTaskElapsedSeconds(0);
      setIsPostTaskRunning(true);
      setIsPostTaskCountdown(false);
      setPostTaskTargetSeconds(0);
      setIsPostTaskModalOpen(true);
      setIsPostTaskDockMinimized(false);
    }
  };

  // Check In to an Event
  const handleCheckInEvent = (eventId: string) => {
    soundManager.playCheckInSound();
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              checkedIn: true,
              checkedInAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  // Manual launch of Post-Task Timer
  const handleStartPostTaskTimer = (event: PlannerEvent) => {
    setPostTaskEvent(event);
    setPostTaskElapsedSeconds(0);
    setIsPostTaskRunning(true);
    setIsPostTaskCountdown(false);
    setPostTaskTargetSeconds(0);
    setIsPostTaskModalOpen(true);
    setIsPostTaskDockMinimized(false);
  };

  // Save Post-Task Buffer Session
  const handleSavePostTaskSession = (eventId: string, session: PostTaskSession) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              postTaskSession: session,
            }
          : e
      )
    );
    setIsPostTaskModalOpen(false);
    setIsPostTaskDockMinimized(false);
    setIsPostTaskRunning(false);
  };

  // Assign duration from Stopwatch/Countdown to a task
  const handleAssignTimeToEvent = (eventId: string, durationSeconds: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              postTaskSession: {
                durationSeconds,
                timerType: 'buffer',
                completedAt: new Date().toISOString(),
                notes: 'Logged from Time Studio stopwatch/countdown',
              },
            }
          : e
      )
    );
  };

  // Check-In Save
  const handleSaveCheckIn = (ci: DailyCheckIn) => {
    setCheckIns((prev) => ({
      ...prev,
      [ci.date]: ci,
    }));
  };

  const todayIso = getTodayIso();
  const todayCheckIn = checkIns[todayIso];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans antialiased">
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onNewEvent={() => handleOpenNewEvent()}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        todayStreak={streakCount}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar on Calendar tab and Schedule tab */}
        {(activeTab === 'calendar' || activeTab === 'agenda') && (
          <Sidebar
            selectedDate={selectedDate}
            onSelectDate={(d) => setSelectedDate(d)}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            todayCheckIn={todayCheckIn}
            onOpenCheckIn={() => setIsCheckInModalOpen(true)}
            events={events}
            streakCount={streakCount}
          />
        )}

        {/* Tab 1: Calendar View (Google Calendar Style) */}
        {activeTab === 'calendar' && (
          <CalendarView
            currentDate={selectedDate}
            onDateChange={(d) => setSelectedDate(d)}
            events={events}
            selectedCategories={selectedCategories}
            onSelectEvent={(evt) => setDetailsEvent(evt)}
            onAddEventAt={(date, time) => handleOpenNewEvent(date, time)}
            onToggleCompleteEvent={handleToggleCompleteEvent}
            onCheckInEvent={handleCheckInEvent}
            onStartPostTaskTimer={handleStartPostTaskTimer}
          />
        )}

        {/* Tab 2: Daily Check-in & Intentions */}
        {activeTab === 'checkin' && (
          <CheckInTab
            checkIns={checkIns}
            events={events}
            todayCheckIn={todayCheckIn}
            onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
            onCheckInEvent={handleCheckInEvent}
            onToggleCompleteEvent={handleToggleCompleteEvent}
            streakCount={streakCount}
          />
        )}

        {/* Tab 3: Clock Studio (Stopwatch, Countdown, World Time) */}
        {activeTab === 'clock' && (
          <ClockView
            events={events}
            onAssignTimeToEvent={handleAssignTimeToEvent}
          />
        )}

        {/* Tab 4: Schedule View */}
        {activeTab === 'agenda' && (
          <ScheduleListView
            events={events}
            selectedCategories={selectedCategories}
            onSelectEvent={(evt) => setDetailsEvent(evt)}
            onToggleCompleteEvent={handleToggleCompleteEvent}
            onCheckInEvent={handleCheckInEvent}
            onStartPostTaskTimer={handleStartPostTaskTimer}
            onNewEvent={() => handleOpenNewEvent()}
          />
        )}
      </div>

      {/* 3. Post-Task Floating Dock Bar (when minimized while running) */}
      {isPostTaskDockMinimized && postTaskEvent && (
        <PostTaskFloatingBar
          eventTitle={postTaskEvent.title}
          elapsedSeconds={postTaskElapsedSeconds}
          isRunning={isPostTaskRunning}
          isCountdown={isPostTaskCountdown}
          targetSeconds={postTaskTargetSeconds}
          onTogglePlay={() => setIsPostTaskRunning(!isPostTaskRunning)}
          onExpand={() => {
            setIsPostTaskDockMinimized(false);
            setIsPostTaskModalOpen(true);
          }}
          onDismiss={() => {
            setIsPostTaskDockMinimized(false);
            setIsPostTaskRunning(false);
            setPostTaskEvent(null);
          }}
        />
      )}

      {/* 4. Post-Task Completion Timer Modal */}
      {isPostTaskModalOpen && postTaskEvent && (
        <PostTaskTimerModal
          event={postTaskEvent}
          isOpen={isPostTaskModalOpen}
          onClose={() => setIsPostTaskModalOpen(false)}
          onMinimize={() => {
            setIsPostTaskModalOpen(false);
            setIsPostTaskDockMinimized(true);
          }}
          onSaveSession={handleSavePostTaskSession}
          elapsedSeconds={postTaskElapsedSeconds}
          isRunning={isPostTaskRunning}
          onTogglePlay={() => setIsPostTaskRunning(!isPostTaskRunning)}
          onReset={() => setPostTaskElapsedSeconds(0)}
          isCountdown={isPostTaskCountdown}
          targetSeconds={postTaskTargetSeconds}
          onSetMode={(isCountdown, targetSecs) => {
            setIsPostTaskCountdown(isCountdown);
            setPostTaskTargetSeconds(targetSecs);
            setPostTaskElapsedSeconds(0);
          }}
        />
      )}

      {/* 5. Create / Edit Event Modal */}
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          event={editingEvent}
          initialDate={eventModalInitialDate}
          initialStartTime={eventModalInitialTime}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* 6. Event Details Modal */}
      {detailsEvent && (
        <EventDetailsModal
          event={detailsEvent}
          isOpen={Boolean(detailsEvent)}
          onClose={() => setDetailsEvent(null)}
          onEdit={(evt) => {
            setEditingEvent(evt);
            setIsEventModalOpen(true);
          }}
          onDelete={handleDeleteEvent}
          onToggleComplete={(id) => {
            handleToggleCompleteEvent(id);
            // Refresh details modal event
            const updated = events.find((e) => e.id === id);
            if (updated) {
              setDetailsEvent({ ...updated, completed: !updated.completed });
            }
          }}
          onCheckIn={(id) => {
            handleCheckInEvent(id);
            setDetailsEvent((prev) =>
              prev ? { ...prev, checkedIn: true, checkedInAt: new Date().toISOString() } : null
            );
          }}
          onStartPostTaskTimer={handleStartPostTaskTimer}
        />
      )}

      {/* 7. Daily Check-in Modal */}
      {isCheckInModalOpen && (
        <CheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          checkIn={todayCheckIn}
          onSaveCheckIn={handleSaveCheckIn}
          dateIso={todayIso}
        />
      )}
    </div>
  );
}
