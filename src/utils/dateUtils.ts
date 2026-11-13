import type { TaskStatus } from '../types/task';

const displayDateCache = new Map<string, string>();

/**
 * Returns today's date in local YYYY-MM-DD string format.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD date string into local components.
 */
export function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

/**
 * Determines if a task is overdue.
 * Requirement:
 * - Its due date has passed (strictly earlier than today).
 * - Its status is NOT Done.
 * - Completed tasks must NEVER be marked overdue.
 */
export function isTaskOverdue(dueDate: string, status: TaskStatus): boolean {
  if (status === 'Done') {
    return false;
  }
  if (!dueDate) return false;

  const todayStr = getTodayDateString();
  return dueDate < todayStr;
}

/**
 * Checks if the due date is today.
 */
export function isTaskDueToday(dueDate: string): boolean {
  if (!dueDate) return false;
  return dueDate === getTodayDateString();
}

/**
 * Formats a YYYY-MM-DD date string into a user-friendly display date,
 * e.g., "Nov 14, 2026".
 * Uses memoized lookup to avoid repeated parsing on re-renders.
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'No date';
  const cached = displayDateCache.get(dateStr);
  if (cached) return cached;

  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr;

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const monthName = monthNames[parts.month - 1] || '';
  const result = `${monthName} ${parts.day}, ${parts.year}`;
  displayDateCache.set(dateStr, result);
  return result;
}

/**
 * Returns human-friendly relative due date metadata.
 */
export function getDueDateInfo(dueDate: string, status: TaskStatus): {
  displayText: string;
  isOverdue: boolean;
  isToday: boolean;
  badgeClass: 'overdue' | 'due-today' | 'upcoming' | 'completed';
} {
  const isOverdue = isTaskOverdue(dueDate, status);
  const isToday = isTaskDueToday(dueDate);
  const formatted = formatDisplayDate(dueDate);

  if (status === 'Done') {
    return {
      displayText: formatted,
      isOverdue: false,
      isToday: false,
      badgeClass: 'completed',
    };
  }

  if (isOverdue) {
    return {
      displayText: `Overdue (${formatted})`,
      isOverdue: true,
      isToday: false,
      badgeClass: 'overdue',
    };
  }

  if (isToday) {
    return {
      displayText: 'Due today',
      isOverdue: false,
      isToday: true,
      badgeClass: 'due-today',
    };
  }

  return {
    displayText: formatted,
    isOverdue: false,
    isToday: false,
    badgeClass: 'upcoming',
  };
}
