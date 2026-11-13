import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Task, TaskFormData, TaskStatus } from '../types/task';
import {
  getInitialTasks,
  saveTasksToStorage,
} from '../utils/storage';
import { isTaskOverdue } from '../utils/dateUtils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getInitialTasks());
  const isInitialMount = useRef(true);

  // Save to localStorage on subsequent task mutations (skip redundant write on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveTasksToStorage(tasks);
  }, [tasks]);

  /**
   * Creates a new task and appends it to state and persistence.
   */
  const createTask = useCallback((formData: TaskFormData): Task => {
    const nowIso = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      assignee: formData.assignee.trim(),
      dueDate: formData.dueDate.trim(),
      status: formData.status,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  /**
   * Updates an existing task by ID.
   */
  const updateTask = useCallback((id: string, formData: TaskFormData): boolean => {
    let updated = false;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          updated = true;
          return {
            ...task,
            title: formData.title.trim(),
            description: formData.description?.trim() || undefined,
            assignee: formData.assignee.trim(),
            dueDate: formData.dueDate.trim(),
            status: formData.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );

    return updated;
  }, []);

  /**
   * Deletes a task by ID.
   */
  const deleteTask = useCallback((id: string): boolean => {
    let deleted = false;

    setTasks((prev) => {
      const filtered = prev.filter((task) => {
        if (task.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      return filtered;
    });

    return deleted;
  }, []);

  /**
   * Moves a task to a different status column.
   */
  const moveTask = useCallback((id: string, nextStatus: TaskStatus): boolean => {
    let moved = false;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          if (task.status === nextStatus) return task;
          moved = true;
          return {
            ...task,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );

    return moved;
  }, []);

  /**
   * Clears all tasks on the board.
   */
  const clearAllTasks = useCallback((): void => {
    setTasks([]);
  }, []);

  /**
   * Dynamic list of all unique assignees across existing tasks.
   */
  const allAssignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignee && t.assignee.trim()) {
        set.add(t.assignee.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  /**
   * Summary counts.
   */
  const stats = useMemo(() => {
    let doneCount = 0;
    let overdueCount = 0;

    tasks.forEach((task) => {
      if (task.status === 'Done') {
        doneCount++;
      }
      if (isTaskOverdue(task.dueDate, task.status)) {
        overdueCount++;
      }
    });

    return {
      total: tasks.length,
      done: doneCount,
      overdue: overdueCount,
    };
  }, [tasks]);

  return {
    tasks,
    allAssignees,
    stats,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    clearAllTasks,
  };
}
