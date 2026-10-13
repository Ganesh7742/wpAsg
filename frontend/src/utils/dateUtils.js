/**
 * Date and Deadline utility functions for Student Workload Management System.
 * Ensures consistent timezone-independent date comparisons.
 */

// Helper to normalize a Date object or string to local midnight (00:00:00.000)
export const getMidnightDate = (dateInput) => {
  if (!dateInput) return new Date();
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Calculates deadline status based on PRD requirements:
 * - Completed: Task status is 'Completed' (must NEVER be marked overdue)
 * - Due Today: Deadline is today and status is not 'Completed'
 * - Overdue: Deadline has passed and status is not 'Completed'
 * - Upcoming: Deadline is in the future
 *
 * @param {string|Date} deadline
 * @param {string} status
 * @returns {Object} { key, label, badgeClass, variant, iconName }
 */
export const getDeadlineStatus = (deadline, status) => {
  if (status === 'Completed') {
    return {
      key: 'Completed',
      label: 'Completed',
      variant: 'success',
      badgeClass: 'badge-status-completed',
      dotClass: 'bg-emerald',
    };
  }

  const deadlineMidnight = getMidnightDate(deadline);
  const todayMidnight = getMidnightDate(new Date());

  const deadlineTime = deadlineMidnight.getTime();
  const todayTime = todayMidnight.getTime();

  if (deadlineTime < todayTime) {
    return {
      key: 'Overdue',
      label: 'Overdue',
      variant: 'danger',
      badgeClass: 'badge-status-overdue',
      dotClass: 'bg-rose',
    };
  } else if (deadlineTime === todayTime) {
    return {
      key: 'Due Today',
      label: 'Due Today',
      variant: 'warning',
      badgeClass: 'badge-status-duetoday',
      dotClass: 'bg-amber',
    };
  } else {
    return {
      key: 'Upcoming',
      label: 'Upcoming',
      variant: 'info',
      badgeClass: 'badge-status-upcoming',
      dotClass: 'bg-sky',
    };
  }
};

/**
 * Checks whether a task is overdue.
 * Crucial rule: Completed tasks are NEVER overdue.
 */
export const isTaskOverdue = (deadline, status) => {
  if (status === 'Completed') return false;
  const deadlineMidnight = getMidnightDate(deadline);
  const todayMidnight = getMidnightDate(new Date());
  return deadlineMidnight.getTime() < todayMidnight.getTime();
};

/**
 * Format a date string into readable academic format, e.g. "15 Oct 2026"
 */
export const formatDateDisplay = (dateInput) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date for HTML <input type="date"> (YYYY-MM-DD)
 */
export const formatDateInput = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get human-readable relative time representation
 */
export const getRelativeDeadlineText = (deadline, status) => {
  if (status === 'Completed') return 'Finished';
  const deadlineMidnight = getMidnightDate(deadline);
  const todayMidnight = getMidnightDate(new Date());

  const diffMs = deadlineMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} overdue`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  if (diffDays === 1) {
    return 'Due tomorrow';
  }
  return `Due in ${diffDays} days`;
};

/**
 * Check if two dates represent the exact same calendar day (local time)
 */
export const isSameDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/**
 * Format month and year for calendar header, e.g. "October 2026"
 */
export const formatMonthYear = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Generate full calendar grid for a given year and month (0-indexed month)
 * Includes padding days from previous and next months to form complete 7-day weeks.
 */
export const getMonthGrid = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week for first day: 0 (Sun) to 6 (Sat)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const days = [];
  const today = new Date();

  // 1. Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, dayNum);
    days.push({
      date: dateObj,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
      isToday: isSameDay(dateObj, today),
      dateString: formatDateInput(dateObj),
    });
  }

  // 2. Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateObj = new Date(year, month, i);
    days.push({
      date: dateObj,
      dayNumber: i,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
      isToday: isSameDay(dateObj, today),
      dateString: formatDateInput(dateObj),
    });
  }

  // 3. Next month leading days to complete row / 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  // If month view has 5 rows (35) or needs 6th row
  const targetTotal = days.length + remainingCells < 35 ? 35 : (days.length + remainingCells < 42 ? 42 : days.length + remainingCells);
  const nextMonthCount = targetTotal - days.length;

  for (let i = 1; i <= nextMonthCount; i++) {
    const dateObj = new Date(year, month + 1, i);
    days.push({
      date: dateObj,
      dayNumber: i,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
      isToday: isSameDay(dateObj, today),
      dateString: formatDateInput(dateObj),
    });
  }

  return days;
};

/**
 * Generate 7 days for a given week centered around or containing dateInput
 */
export const getWeekDays = (dateInput) => {
  const current = new Date(dateInput || new Date());
  const dayOfWeek = current.getDay(); // 0 is Sunday
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - dayOfWeek);

  const today = new Date();
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      date: d,
      dayNumber: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: isSameDay(d, today),
      dateString: formatDateInput(d),
    });
  }

  return weekDays;
};
