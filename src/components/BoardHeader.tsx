import React from 'react';
import { PlusIcon, RefreshIcon, AlertTriangleIcon, CheckCircleIcon } from './icons';

interface BoardHeaderProps {
  onOpenCreateModal: () => void;
  onReset: () => void;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  onOpenCreateModal,
  onReset,
  totalTasks,
  completedTasks,
  overdueTasks,
}) => {
  return (
    <header className="board-header">
      <div className="board-header-main">
        <div className="brand-group">
          <div className="brand-badge" aria-hidden="true">
            <span className="brand-badge-text">M</span>
          </div>
          <div className="brand-text">
            <h1 className="board-title">TASK_m</h1>
          </div>
        </div>

        <div className="board-header-actions">
          {/* Status summary pills */}
          <div className="header-stats-group" aria-label="Task board summary">
            <div className="stat-pill" title="Total tasks on board">
              <span className="stat-pill-label">Total</span>
              <span className="stat-pill-count">{totalTasks}</span>
            </div>

            <div className="stat-pill stat-pill-done" title="Completed tasks">
              <CheckCircleIcon size={13} className="stat-icon-done" />
              <span className="stat-pill-label">Done</span>
              <span className="stat-pill-count">{completedTasks}</span>
            </div>

            {overdueTasks > 0 && (
              <div className="stat-pill stat-pill-overdue" title="Overdue tasks requiring attention">
                <AlertTriangleIcon size={13} className="stat-icon-overdue" />
                <span className="stat-pill-label">Overdue</span>
                <span className="stat-pill-count">{overdueTasks}</span>
              </div>
            )}
          </div>

          {/* Single Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="btn btn-ghost btn-sm reset-btn"
            title="Reset board"
            aria-label="Reset board"
          >
            <RefreshIcon size={14} />
            <span className="reset-btn-label">Reset</span>
          </button>

          {/* Primary Create Task CTA */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn btn-primary"
            aria-label="Create Task"
          >
            <PlusIcon size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
