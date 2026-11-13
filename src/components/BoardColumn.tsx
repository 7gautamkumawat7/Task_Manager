import React from 'react';
import type { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { PlusIcon, CheckCircleIcon, ClockIcon } from './icons';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (taskId: string, nextStatus: TaskStatus) => void;
  onQuickAdd: (status: TaskStatus) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = React.memo(({
  status,
  title,
  tasks,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onQuickAdd,
  isFiltered,
  onClearFilters,
}) => {
  // Column specific visual accent helpers
  const getColumnStyleClass = (colStatus: TaskStatus) => {
    switch (colStatus) {
      case 'To Do':
        return 'column-todo';
      case 'In Progress':
        return 'column-progress';
      case 'Done':
        return 'column-done';
      default:
        return '';
    }
  };

  return (
    <section
      className={`board-column ${getColumnStyleClass(status)}`}
      aria-label={`${title} column with ${tasks.length} tasks`}
    >
      {/* Column Header */}
      <div className="column-header">
        <div className="column-header-title-group">
          <span className="column-status-indicator" aria-hidden="true" />
          <h2 className="column-title">{title}</h2>
          <span
            className="column-count-badge"
            aria-label={`${tasks.length} tasks in ${title}`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          className="column-add-btn"
          onClick={() => onQuickAdd(status)}
          title={`Add new task to ${title}`}
          aria-label={`Add task to ${title}`}
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* Column Task List */}
      <div className="column-tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
            />
          ))
        ) : (
          /* Empty State */
          <div className="column-empty-state">
            {isFiltered ? (
              <div className="empty-state-content">
                <p className="empty-state-title">No matching tasks</p>
                <p className="empty-state-subtitle">
                  No tasks in <em>{title}</em> match your current search or assignee filter.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm empty-state-btn"
                  onClick={onClearFilters}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="empty-state-content">
                <div className="empty-state-icon-wrapper" aria-hidden="true">
                  {status === 'Done' ? (
                    <CheckCircleIcon size={24} className="empty-icon-done" />
                  ) : (
                    <ClockIcon size={24} className="empty-icon-neutral" />
                  )}
                </div>
                <p className="empty-state-title">
                  {status === 'Done' ? 'No completed tasks' : 'No tasks yet'}
                </p>
                <p className="empty-state-subtitle">
                  {status === 'Done'
                    ? 'Finished tasks will appear here.'
                    : `Get started by adding a task to ${title}.`}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm empty-state-btn"
                  onClick={() => onQuickAdd(status)}
                >
                  <PlusIcon size={13} />
                  <span>Add task</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

BoardColumn.displayName = 'BoardColumn';
