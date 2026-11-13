import type { Task, TaskStatus } from '../types/task';

export const STORAGE_KEY = 'team_task_board_tasks_v1';

/**
 * Validates whether an object matches the Task interface.
 */
export function isValidTask(obj: unknown): obj is Task {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;

  const validStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.assignee === 'string' &&
    typeof candidate.dueDate === 'string' &&
    typeof candidate.status === 'string' &&
    validStatuses.includes(candidate.status as TaskStatus)
  );
}

/**
 * Loads tasks from localStorage. Returns null if not stored or corrupt.
 */
export function loadTasksFromStorage(): Task[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed.filter(isValidTask);
  } catch (error) {
    console.warn('[Storage] Failed to read tasks from localStorage:', error);
    return null;
  }
}

/**
 * Saves tasks to localStorage safely.
 */
export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    const raw = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, raw);
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save tasks to localStorage:', error);
    return false;
  }
}

/**
 * Clears stored tasks from localStorage.
 */
export function clearStoredTasks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[Storage] Failed to clear localStorage:', error);
  }
}

/**
 * Retrieves initial tasks:
 * Purges any sample tasks from previous sessions and defaults to an empty board.
 */
export function getInitialTasks(): Task[] {
  const existing = loadTasksFromStorage();
  if (existing !== null) {
    // Remove sample tasks that were previously presented
    const userOnlyTasks = existing.filter((t) => !t.id.startsWith('task-sample-'));
    if (userOnlyTasks.length !== existing.length) {
      saveTasksToStorage(userOnlyTasks);
    }
    return userOnlyTasks;
  }
  return [];
}
