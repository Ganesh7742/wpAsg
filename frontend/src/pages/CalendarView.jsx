import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
  Play,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  CalendarDays,
  ListTodo,
  Check,
  RotateCcw,
  AlertCircle,
  X
} from 'lucide-react';
import {
  formatDateDisplay,
  formatDateInput,
  formatMonthYear,
  getMonthGrid,
  getWeekDays,
  isSameDay,
  getDeadlineStatus,
  isTaskOverdue,
  getRelativeDeadlineText,
} from '../utils/dateUtils';
import TaskForm from '../components/TaskForm';

const CalendarView = ({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onNavigateToPomodoro,
  isSubmitting = false,
}) => {
  // Current view date (year & month navigation)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  // Selected day for detailed preview panel
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  // View mode: 'month' | 'week' | 'agenda'
  const [viewMode, setViewMode] = useState('month');

  // Filtering state
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);

  // Extract unique subjects for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subs = new Set();
    tasks.forEach((t) => {
      if (t.subject && t.subject.trim()) {
        subs.add(t.subject.trim());
      }
    });
    return Array.from(subs).sort();
  }, [tasks]);

  // Navigate calendar month
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      if (viewMode === 'week') {
        const next = new Date(prev);
        next.setDate(next.getDate() - 7);
        return next;
      }
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      if (viewMode === 'week') {
        const next = new Date(prev);
        next.setDate(next.getDate() + 7);
        return next;
      }
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Subject filter
      if (subjectFilter !== 'all' && task.subject !== subjectFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Overdue') {
          if (!isTaskOverdue(task.deadline, task.status)) return false;
        } else if (task.status !== statusFilter) {
          return false;
        }
      }
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, subjectFilter, statusFilter, priorityFilter]);

  // Map tasks by date string (YYYY-MM-DD) for instant lookup
  const tasksByDate = useMemo(() => {
    const map = new Map();
    filteredTasks.forEach((task) => {
      if (!task.deadline) return;
      const key = formatDateInput(task.deadline);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(task);
    });
    return map;
  }, [filteredTasks]);

  // Month grid days
  const monthGridDays = useMemo(() => {
    return getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Week days
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate);
  }, [currentDate]);

  // Tasks for the currently selected date
  const selectedDateStr = formatDateInput(selectedDate);
  const tasksForSelectedDate = tasksByDate.get(selectedDateStr) || [];

  // Month statistics
  const monthStats = useMemo(() => {
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth();

    const thisMonthTasks = tasks.filter((t) => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });

    const total = thisMonthTasks.length;
    const completed = thisMonthTasks.filter((t) => t.status === 'Completed').length;
    const pending = thisMonthTasks.filter((t) => t.status === 'Pending').length;
    const overdue = thisMonthTasks.filter((t) => isTaskOverdue(t.deadline, t.status)).length;

    // Due today count
    const todayStr = formatDateInput(new Date());
    const dueToday = tasks.filter(
      (t) => t.status !== 'Completed' && formatDateInput(t.deadline) === todayStr
    ).length;

    return { total, completed, pending, overdue, dueToday };
  }, [tasks, currentDate]);

  // Form open helpers
  const handleOpenAddOnSelectedDate = () => {
    setEditingTask({
      taskName: '',
      subject: '',
      deadline: selectedDateStr,
      priority: 'Medium',
      status: 'Pending',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTask && editingTask._id) {
      await onUpdateTask(editingTask._id, formData);
    } else {
      await onCreateTask(formData);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleToggleStatus = async (task) => {
    const nextStatus =
      task.status === 'Completed'
        ? 'Pending'
        : task.status === 'Pending'
        ? 'In Progress'
        : 'Completed';
    await onUpdateTask(task._id, { ...task, status: nextStatus });
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await onDeleteTask(taskToDelete._id);
    setTaskToDelete(null);
    if (selectedTaskModal && selectedTaskModal._id === taskToDelete._id) {
      setSelectedTaskModal(null);
    }
  };

  // Helper for priority pill color
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'bg-secondary';
    }
  };

  // Helper for status badge
  const getTaskStatusChip = (task) => {
    const info = getDeadlineStatus(task.deadline, task.status);
    if (task.status === 'Completed') {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 py-1 px-2">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    }
    if (info.key === 'Overdue') {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1 py-1 px-2">
          <AlertTriangle size={12} /> Overdue
        </span>
      );
    }
    if (info.key === 'Due Today') {
      return (
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle d-inline-flex align-items-center gap-1 py-1 px-2">
          <Clock size={12} /> Due Today
        </span>
      );
    }
    return (
      <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 py-1 px-2">
        <CalendarIcon size={12} /> Upcoming
      </span>
    );
  };

  return (
    <div className="page-body">
      {/* Top Header & Overview */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0">Academic Calendar</h2>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small fw-semibold">
              <Sparkles size={12} className="me-1 inline" /> Interactive Schedule
            </span>
          </div>
          <p className="text-secondary mb-0">
            Visualize assignment deadlines, manage coursework timelines, and plan your study focus.
          </p>
        </div>

        {/* View Mode & Add Task */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="btn-group p-1 bg-white border rounded-3 shadow-xs">
            <button
              className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-light text-secondary'} rounded-2`}
              onClick={() => setViewMode('month')}
            >
              <CalendarDays size={15} className="me-1" /> Month
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-light text-secondary'} rounded-2`}
              onClick={() => setViewMode('week')}
            >
              <Layers size={15} className="me-1" /> Week
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'agenda' ? 'btn-primary' : 'btn-light text-secondary'} rounded-2`}
              onClick={() => setViewMode('agenda')}
            >
              <ListTodo size={15} className="me-1" /> Agenda
            </button>
          </div>

          <button
            className="btn btn-primary-custom d-inline-flex align-items-center gap-2"
            onClick={handleOpenAddOnSelectedDate}
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Monthly Statistics Bar */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card stat-card p-3 h-100 border-0 shadow-sm rounded-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Deadlines in Month</div>
                <div className="fs-4 fw-bold text-dark mt-1">{monthStats.total}</div>
              </div>
              <div
                className="p-2.5 rounded-3"
                style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}
              >
                <CalendarIcon size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card stat-card p-3 h-100 border-0 shadow-sm rounded-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Due Today</div>
                <div className="fs-4 fw-bold text-warning mt-1">{monthStats.dueToday}</div>
              </div>
              <div
                className="p-2.5 rounded-3"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
              >
                <Clock size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card stat-card p-3 h-100 border-0 shadow-sm rounded-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Completed in Month</div>
                <div className="fs-4 fw-bold text-success mt-1">{monthStats.completed}</div>
              </div>
              <div
                className="p-2.5 rounded-3"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
              >
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card stat-card p-3 h-100 border-0 shadow-sm rounded-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Overdue Incomplete</div>
                <div className="fs-4 fw-bold text-danger mt-1">{monthStats.overdue}</div>
              </div>
              <div
                className="p-2.5 rounded-3"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              >
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls & Navigation Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          {/* Month / Date Navigation */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary btn-sm p-2"
                onClick={handlePrevMonth}
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
                onClick={handleToday}
              >
                Today
              </button>
              <button
                className="btn btn-outline-secondary btn-sm p-2"
                onClick={handleNextMonth}
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <h4 className="mb-0 fw-bold ms-2 text-primary" style={{ letterSpacing: '-0.02em' }}>
              {viewMode === 'week'
                ? `Week of ${formatDateDisplay(weekDays[0].date)}`
                : formatMonthYear(currentDate)}
            </h4>
          </div>

          {/* Filters Bar */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Subject Filter */}
            <div className="d-flex align-items-center gap-1.5">
              <BookOpen size={15} className="text-muted d-none d-sm-inline" />
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto', minWidth: '130px' }}
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: '125px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* Priority Filter */}
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: '120px' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Reset Filters */}
            {(subjectFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSubjectFilter('all');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                title="Reset all filters"
              >
                <RotateCcw size={14} className="me-1" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Layout with Calendar Grid and Selected Day Detail Panel */}
      <div className="row g-4">
        {/* Calendar Grid / Schedule Column */}
        <div className="col-12 col-xl-8">
          {viewMode === 'month' && (
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              {/* Day of Week Headers */}
              <div className="calendar-grid-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="calendar-header-cell">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Day Cells */}
              <div className="calendar-grid">
                {monthGridDays.map((cell, idx) => {
                  const dayTasks = tasksByDate.get(cell.dateString) || [];
                  const isSelected = isSameDay(cell.date, selectedDate);
                  const isToday = cell.isToday;

                  return (
                    <div
                      key={idx}
                      className={`calendar-cell ${!cell.isCurrentMonth ? 'calendar-cell-other-month' : ''} ${
                        isSelected ? 'calendar-cell-selected' : ''
                      } ${isToday ? 'calendar-cell-today' : ''}`}
                      onClick={() => setSelectedDate(cell.date)}
                    >
                      {/* Day Number Header */}
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span
                          className={`calendar-day-number ${
                            isToday ? 'calendar-day-badge-today' : ''
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {dayTasks.length > 0 && (
                          <span
                            className="badge rounded-pill bg-light text-secondary border small"
                            style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                          >
                            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        )}
                      </div>

                      {/* Task Pills within the day */}
                      <div className="calendar-task-list">
                        {dayTasks.slice(0, 3).map((task) => {
                          const statusInfo = getDeadlineStatus(task.deadline, task.status);
                          const isComplete = task.status === 'Completed';

                          let pillThemeClass = 'task-pill-upcoming';
                          if (isComplete) pillThemeClass = 'task-pill-completed';
                          else if (statusInfo.key === 'Overdue') pillThemeClass = 'task-pill-overdue';
                          else if (statusInfo.key === 'Due Today') pillThemeClass = 'task-pill-duetoday';

                          return (
                            <div
                              key={task._id}
                              className={`calendar-task-pill ${pillThemeClass}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskModal(task);
                                setSelectedDate(cell.date);
                              }}
                              title={`${task.subject}: ${task.taskName} (${task.priority} Priority, ${task.status})`}
                            >
                              <span
                                className={`pill-priority-indicator ${
                                  task.priority === 'High'
                                    ? 'bg-danger'
                                    : task.priority === 'Medium'
                                    ? 'bg-warning'
                                    : 'bg-info'
                                }`}
                              />
                              <span className="task-pill-text">
                                <strong className="me-1">{task.subject}:</strong>
                                {task.taskName}
                              </span>
                            </div>
                          );
                        })}

                        {dayTasks.length > 3 && (
                          <div
                            className="calendar-more-badge text-muted small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(cell.date);
                            }}
                          >
                            +{dayTasks.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <div className="d-flex flex-column gap-3">
                {weekDays.map((wDay) => {
                  const dayTasks = tasksByDate.get(wDay.dateString) || [];
                  const isSelected = isSameDay(wDay.date, selectedDate);

                  return (
                    <div
                      key={wDay.dateString}
                      className={`p-3 rounded-3 border transition-all ${
                        isSelected ? 'border-primary bg-primary-subtle-5' : 'bg-white'
                      } ${wDay.isToday ? 'border-2 border-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDate(wDay.date)}
                    >
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge px-2.5 py-1.5 rounded-pill ${
                              wDay.isToday
                                ? 'bg-primary text-white'
                                : 'bg-light text-dark border'
                            }`}
                          >
                            {wDay.dayName}, {wDay.dayNumber} {currentDate.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          {wDay.isToday && (
                            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill">
                              Today
                            </span>
                          )}
                        </div>

                        <span className="text-muted small">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task due' : 'tasks due'}
                        </span>
                      </div>

                      {dayTasks.length === 0 ? (
                        <p className="text-muted small mb-0 ps-1">
                          No coursework deadlines on this day.
                        </p>
                      ) : (
                        <div className="d-flex flex-column gap-2 mt-2">
                          {dayTasks.map((task) => (
                            <div
                              key={task._id}
                              className="d-flex align-items-center justify-content-between p-2.5 bg-light rounded-2 border"
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className={`rounded-circle d-inline-block`}
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor:
                                      task.priority === 'High'
                                        ? '#ef4444'
                                        : task.priority === 'Medium'
                                        ? '#f59e0b'
                                        : '#10b981',
                                  }}
                                />
                                <div>
                                  <span className="fw-semibold text-primary me-2">
                                    [{task.subject}]
                                  </span>
                                  <span
                                    className={`${
                                      task.status === 'Completed'
                                        ? 'text-decoration-line-through text-muted'
                                        : 'text-dark'
                                    }`}
                                  >
                                    {task.taskName}
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                {getTaskStatusChip(task)}
                                <button
                                  className="btn btn-sm btn-outline-secondary p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(task);
                                  }}
                                  title="Edit Task"
                                >
                                  <Edit2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'agenda' && (
            <div className="card border-0 shadow-sm rounded-3 p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <ListTodo size={18} className="text-primary" /> Chronological Agenda
              </h5>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <CalendarIcon size={36} className="mb-2 opacity-50" />
                  <p>No tasks match the selected filters.</p>
                </div>
              ) : (
                <div className="timeline-container">
                  {filteredTasks
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                    .map((task) => {
                      const deadlineFormatted = formatDateDisplay(task.deadline);
                      const relativeText = getRelativeDeadlineText(task.deadline, task.status);
                      const isComplete = task.status === 'Completed';

                      return (
                        <div
                          key={task._id}
                          className="agenda-item p-3 mb-2 rounded-3 border bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 shadow-xs"
                        >
                          <div className="d-flex align-items-start gap-3">
                            <button
                              className={`btn btn-sm rounded-circle p-1.5 mt-1 ${
                                isComplete
                                  ? 'btn-success text-white'
                                  : 'btn-outline-secondary'
                              }`}
                              onClick={() => handleToggleStatus(task)}
                              title={isComplete ? 'Mark Pending' : 'Mark Completed'}
                            >
                              <Check size={14} />
                            </button>

                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <span className="badge bg-indigo-subtle text-primary border border-indigo-subtle">
                                  {task.subject}
                                </span>
                                <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                                  {task.priority} Priority
                                </span>
                                {getTaskStatusChip(task)}
                              </div>
                              <h6
                                className={`mb-1 fw-bold ${
                                  isComplete ? 'text-decoration-line-through text-muted' : 'text-dark'
                                }`}
                              >
                                {task.taskName}
                              </h6>
                              <div className="d-flex align-items-center gap-2 text-muted small">
                                <CalendarIcon size={13} />
                                <span>{deadlineFormatted}</span>
                                <span>•</span>
                                <span className="fw-medium">{relativeText}</span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2 justify-content-end">
                            {onNavigateToPomodoro && (
                              <button
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                onClick={() => onNavigateToPomodoro(task)}
                                title="Start Pomodoro Study Session"
                              >
                                <Play size={13} /> Study
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-secondary p-1.5"
                              onClick={() => handleOpenEdit(task)}
                              title="Edit Task"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger p-1.5"
                              onClick={() => setTaskToDelete(task)}
                              title="Delete Task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Calendar Color Legend */}
          <div className="card border-0 shadow-sm rounded-3 p-3 mt-3 bg-white">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 small">
              <span className="fw-semibold text-secondary">Legend:</span>
              <div className="d-flex align-items-center gap-1.5">
                <span className="legend-dot bg-danger" />
                <span className="text-muted">Overdue</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span className="legend-dot bg-warning" />
                <span className="text-muted">Due Today</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span className="legend-dot bg-primary" />
                <span className="text-muted">Upcoming</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span className="legend-dot bg-success" />
                <span className="text-muted">Completed</span>
              </div>
              <div className="d-flex align-items-center gap-1.5 ms-md-3">
                <span className="badge badge-priority-high p-1 me-1">High</span>
                <span className="badge badge-priority-medium p-1 me-1">Med</span>
                <span className="badge badge-priority-low p-1">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Breakdown Panel */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-3 sticky-xl-top" style={{ top: '90px' }}>
            <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-bold letter-spacing-wider">
                  Day Schedule
                </span>
                <h5 className="fw-bold mb-0 text-dark">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h5>
              </div>
              <button
                className="btn btn-sm btn-primary-custom d-inline-flex align-items-center gap-1"
                onClick={handleOpenAddOnSelectedDate}
                title="Add task on this date"
              >
                <Plus size={15} /> Add
              </button>
            </div>

            <div className="card-body p-3">
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-5 px-3">
                  <div
                    className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}
                  >
                    <CalendarDays size={28} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">No Deadlines</h6>
                  <p className="text-muted small mb-3">
                    There are no coursework tasks scheduled for this day.
                  </p>
                  <button
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1.5"
                    onClick={handleOpenAddOnSelectedDate}
                  >
                    <Plus size={14} /> Schedule a Task
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  <div className="text-muted small fw-medium mb-1">
                    {tasksForSelectedDate.length}{' '}
                    {tasksForSelectedDate.length === 1 ? 'task scheduled' : 'tasks scheduled'}
                  </div>

                  {tasksForSelectedDate.map((task) => {
                    const isComplete = task.status === 'Completed';

                    return (
                      <div
                        key={task._id}
                        className={`p-3 rounded-3 border transition-all ${
                          isComplete ? 'bg-light opacity-85' : 'bg-white shadow-xs'
                        }`}
                      >
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <span className="badge bg-indigo-subtle text-primary border border-indigo-subtle">
                            {task.subject}
                          </span>
                          <div className="d-flex align-items-center gap-1">
                            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                            {getTaskStatusChip(task)}
                          </div>
                        </div>

                        <h6
                          className={`fw-bold mb-2 ${
                            isComplete ? 'text-decoration-line-through text-muted' : 'text-dark'
                          }`}
                        >
                          {task.taskName}
                        </h6>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                          <button
                            className={`btn btn-sm d-inline-flex align-items-center gap-1 py-1 px-2.5 ${
                              isComplete ? 'btn-outline-success' : 'btn-success'
                            }`}
                            onClick={() => handleToggleStatus(task)}
                          >
                            <Check size={13} />
                            <span className="small">{isComplete ? 'Completed' : 'Mark Done'}</span>
                          </button>

                          <div className="d-flex align-items-center gap-1">
                            {onNavigateToPomodoro && (
                              <button
                                className="btn btn-sm btn-outline-primary p-1.5"
                                onClick={() => onNavigateToPomodoro(task)}
                                title="Focus with Pomodoro"
                              >
                                <Play size={13} />
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-secondary p-1.5"
                              onClick={() => handleOpenEdit(task)}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger p-1.5"
                              onClick={() => setTaskToDelete(task)}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick date selector jump */}
            <div className="card-footer bg-light p-3 border-top text-center">
              <span className="text-muted small">
                Click any calendar cell to inspect and schedule tasks on that date.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Quick Detail Modal (Triggered by pill click) */}
      {selectedTaskModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-light border-bottom p-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-indigo-subtle text-primary border border-indigo-subtle">
                    {selectedTaskModal.subject}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(selectedTaskModal.priority)}`}>
                    {selectedTaskModal.priority} Priority
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTaskModal(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4">
                <h5 className="fw-bold mb-3">{selectedTaskModal.taskName}</h5>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="p-2.5 bg-light rounded-2 border small">
                      <span className="text-muted d-block">Deadline</span>
                      <strong className="text-dark">
                        {formatDateDisplay(selectedTaskModal.deadline)}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2.5 bg-light rounded-2 border small">
                      <span className="text-muted d-block">Status</span>
                      <strong className="text-dark">{selectedTaskModal.status}</strong>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info py-2 px-3 small rounded-3 mb-0 d-flex align-items-center gap-2">
                  <Clock size={16} />
                  <span>
                    {getRelativeDeadlineText(selectedTaskModal.deadline, selectedTaskModal.status)}
                  </span>
                </div>
              </div>

              <div className="modal-footer bg-light border-top p-3 d-flex justify-content-between">
                <button
                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                  onClick={() => {
                    const task = selectedTaskModal;
                    setSelectedTaskModal(null);
                    setTaskToDelete(task);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      const task = selectedTaskModal;
                      setSelectedTaskModal(null);
                      handleOpenEdit(task);
                    }}
                  >
                    <Edit2 size={14} className="me-1" /> Edit
                  </button>
                  {onNavigateToPomodoro && (
                    <button
                      className="btn btn-primary-custom btn-sm d-inline-flex align-items-center gap-1"
                      onClick={() => {
                        const task = selectedTaskModal;
                        setSelectedTaskModal(null);
                        onNavigateToPomodoro(task);
                      }}
                    >
                      <Play size={14} /> Start Pomodoro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-2">
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                  style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
                >
                  <AlertTriangle size={32} />
                </div>
                <h5 className="fw-bold mb-2">Delete Task Confirmation</h5>
                <p className="text-secondary small mb-4">
                  Are you sure you want to delete the task{' '}
                  <strong className="text-dark">"{taskToDelete.taskName}"</strong>? This action
                  cannot be undone.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setTaskToDelete(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger px-4 d-inline-flex align-items-center gap-2"
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} /> Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CalendarView;
