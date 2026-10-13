import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Flame,
  Plus,
  Minus,
  Clock,
  Sliders,
  Check,
} from 'lucide-react';
import { formatDateDisplay } from '../utils/dateUtils';

const PRESETS = [
  { id: '15m', label: '15m Quick Sprint', minutes: 15, type: 'focus', color: '#6366f1' },
  { id: '25m', label: '25m Standard Pomodoro', minutes: 25, type: 'focus', color: '#4f46e5' },
  { id: '45m', label: '45m Deep Study', minutes: 45, type: 'focus', color: '#4338ca' },
  { id: '60m', label: '60m Exam Prep', minutes: 60, type: 'focus', color: '#3730a3' },
  { id: '5m_break', label: '5m Short Break', minutes: 5, type: 'break', color: '#10b981' },
  { id: '15m_break', label: '15m Long Break', minutes: 15, type: 'break', color: '#0284c7' },
];

const PomodoroTimer = ({ tasks = [], onUpdateTask }) => {
  const [totalMinutes, setTotalMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionType, setSessionType] = useState('focus'); // 'focus' | 'break'
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Custom minute input state
  const [customInput, setCustomInput] = useState('25');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Selected task to work on
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const [selectedTaskId, setSelectedTaskId] = useState(
    pendingTasks.length > 0 ? pendingTasks[0]._id : ''
  );

  const timerRef = useRef(null);

  // Play pleasant acoustic chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  // Set duration in minutes
  const setDuration = (mins, type = 'focus') => {
    const validMins = Math.max(1, Math.min(180, mins));
    setIsRunning(false);
    setTotalMinutes(validMins);
    setTimeLeft(validMins * 60);
    setCustomInput(String(validMins));
    setSessionType(type);
  };

  // Adjust current duration by +/- delta minutes
  const adjustMinutes = (delta) => {
    const newMins = Math.max(1, Math.min(180, totalMinutes + delta));
    setDuration(newMins, sessionType);
  };

  // Apply custom input from student
  const handleApplyCustom = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      setDuration(parsed, parsed <= 15 ? 'break' : 'focus');
      setShowCustomInput(false);
    }
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();

            if (sessionType === 'focus') {
              setSessionsCompleted((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sessionType, soundEnabled]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalMinutes * 60);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Progress calculation
  const totalSeconds = totalMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentTask = tasks.find((t) => t._id === selectedTaskId);

  const handleMarkTaskCompleted = async () => {
    if (!currentTask) return;
    await onUpdateTask(currentTask._id, {
      ...currentTask,
      status: 'Completed',
    });
  };

  const progressColor =
    sessionType === 'break' ? '#10b981' : totalMinutes > 40 ? '#4338ca' : '#4f46e5';

  return (
    <div className="page-body">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0">Study Focus Timer</h2>
            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1">
              <Flame size={13} /> {sessionsCompleted} Sessions Completed
            </span>
          </div>
          <p className="text-secondary mb-0">
            Set your desired study or break duration, attach an academic task, and focus without distractions.
          </p>
        </div>

        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
          onClick={() => setSoundEnabled((s) => !s)}
          title={soundEnabled ? 'Mute sound chime' : 'Enable sound chime'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{soundEnabled ? 'Sound Chime On' : 'Muted'}</span>
        </button>
      </div>

      <div className="pomodoro-card">
        {/* Main Timer Content Card */}
        <div className="content-card shadow-sm border mb-4">
          <div className="content-card-body p-4 text-center">
            {/* Presets List */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
              {PRESETS.map((preset) => {
                const isActive = totalMinutes === preset.minutes && sessionType === preset.type;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                      isActive
                        ? 'btn-primary-custom text-white shadow-sm'
                        : 'btn-outline-secondary bg-light'
                    }`}
                    onClick={() => setDuration(preset.minutes, preset.type)}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1 ${
                  showCustomInput
                    ? 'btn-dark'
                    : 'btn-outline-secondary bg-light'
                }`}
                onClick={() => setShowCustomInput((prev) => !prev)}
              >
                <Sliders size={14} /> Custom Time
              </button>
            </div>

            {/* Custom Time Input Form */}
            {showCustomInput && (
              <form
                onSubmit={handleApplyCustom}
                className="d-inline-flex align-items-center justify-content-center gap-2 p-2 bg-light border rounded-pill mb-3 shadow-sm"
              >
                <Clock size={16} className="text-muted ms-2" />
                <span className="small text-secondary fw-semibold">Set minutes:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  className="form-control form-control-sm text-center fw-bold"
                  style={{ width: '80px', borderRadius: '12px' }}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-sm btn-primary-custom rounded-pill px-3">
                  <Check size={14} /> Set
                </button>
              </form>
            )}

            {/* Circular Countdown Ring */}
            <div className="timer-circle-wrapper my-2">
              <svg className="timer-svg" viewBox="0 0 240 240">
                <circle
                  className="timer-svg-bg"
                  cx="120"
                  cy="120"
                  r={radius}
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  className="timer-svg-progress"
                  cx="120"
                  cy="120"
                  r={radius}
                  strokeWidth="10"
                  stroke={progressColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="timer-digits text-dark">{formattedTime}</div>
            </div>

            {/* Quick +/- minute steppers */}
            <div className="d-flex align-items-center justify-content-center gap-2 my-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
                onClick={() => adjustMinutes(-5)}
                disabled={isRunning}
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
                onClick={() => adjustMinutes(-1)}
                disabled={isRunning}
                title="Subtract 1 minute"
              >
                -1m
              </button>

              <span className="badge bg-light text-secondary border px-3 py-1.5 fw-medium small">
                Target: {totalMinutes}m {sessionType === 'break' ? '(Break)' : '(Focus)'}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
                onClick={() => adjustMinutes(1)}
                disabled={isRunning}
                title="Add 1 minute"
              >
                +1m
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
                onClick={() => adjustMinutes(5)}
                disabled={isRunning}
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>

            <p className="text-muted small mb-4">
              {isRunning
                ? `Active ${sessionType === 'break' ? 'Break' : 'Focus'} session in progress... Keep going!`
                : timeLeft === 0
                ? 'Session complete! Take a breather or start the next round.'
                : 'Click Start to begin countdown.'}
            </p>

            {/* Control Buttons */}
            <div className="d-flex align-items-center justify-content-center gap-3">
              <button
                className="btn btn-outline-secondary btn-action p-2 rounded-circle"
                onClick={resetTimer}
                title="Reset timer to original duration"
                style={{ width: '42px', height: '42px' }}
              >
                <RotateCcw size={18} />
              </button>

              <button
                className="btn btn-primary-custom px-4 py-2.5 fs-5 rounded-pill shadow"
                onClick={toggleTimer}
              >
                {isRunning ? (
                  <>
                    <Pause size={20} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={20} /> Start Timer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Task Focus Integration */}
        <div className="content-card shadow-sm border mb-4">
          <div className="content-card-header bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h6 className="fw-bold mb-0">Attached Coursework Task</h6>
            </div>
            <span className="badge bg-light text-secondary border small">Study Target</span>
          </div>

          <div className="content-card-body p-3 p-md-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-3 text-secondary">
                <CheckCircle2 size={32} className="text-success mb-2" />
                <p className="mb-0 fw-semibold">All tasks are currently completed!</p>
                <small className="text-muted">You can still use the timer for revision or study sessions.</small>
              </div>
            ) : (
              <div>
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Select task to focus on:
                </label>
                <select
                  className="form-select mb-3"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                >
                  {pendingTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.taskName} — {t.subject} ({t.priority} Priority)
                    </option>
                  ))}
                </select>

                {currentTask && (
                  <div className="p-3 bg-light rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div>
                      <div className="fw-bold text-dark">{currentTask.taskName}</div>
                      <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                        <span>Course: {currentTask.subject}</span>
                        <span>&bull;</span>
                        <span>Due: {formatDateDisplay(currentTask.deadline)}</span>
                      </div>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5"
                      onClick={handleMarkTaskCompleted}
                    >
                      <CheckCircle2 size={16} /> Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Productivity Tip */}
        <div className="p-3 bg-primary-subtle border border-primary-subtle rounded-3 d-flex align-items-start gap-3">
          <Sparkles size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="small">
            <span className="fw-bold text-primary">Student Productivity Tip: </span>
            <span className="text-secondary">
              Custom timers allow you to match your study session length to task complexity: 15 mins for quick reading, 25 mins for assignment problem sets, and 45–60 mins for deep coding or lab analysis!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
