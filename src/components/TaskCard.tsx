import React, { useState } from 'react';
import type { Task, TaskStatus } from '../types/task';
import {
  CalendarIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  EditIcon,
  TrashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from './icons';
import { getDueDateInfo } from '../utils/dateUtils';
import { getAvatarStyle, getInitials } from '../utils/avatarUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (taskId: string, nextStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(({
  task,
  onEdit,
  onDelete,
  onMove,
}) => {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const dueDateInfo = getDueDateInfo(task.dueDate, task.status);
  const avatarStyle = getAvatarStyle(task.assignee);
  const initials = getInitials(task.assignee);

  const isCompleted = task.status === 'Done';
  const isOverdue = dueDateInfo.isOverdue;

  // Next / Previous target statuses for quick directional actions
  const getPrevStatus = (): TaskStatus | null => {
    if (task.status === 'In Progress') return 'To Do';
    if (task.status === 'Done') return 'In Progress';
    return null;
  };

  const getNextStatus = (): TaskStatus | null => {
    if (task.status === 'To Do') return 'In Progress';
    if (task.status === 'In Progress') return 'Done';
    return null;
  };

  const prevStatus = getPrevStatus();
  const nextStatus = getNextStatus();

  return (
    <article
      className={`task-card ${isOverdue ? 'task-card-overdue' : ''} ${
        isCompleted ? 'task-card-completed' : ''
      }`}
      aria-labelledby={`task-title-${task.id}`}
    >
      {/* Top Banner / Overdue Badge */}
      <div className="task-card-header">
        <div className="task-card-badges">
          {isOverdue && (
            <span
              className="badge badge-overdue"
              title="This task has passed its due date and is not completed"
              role="status"
            >
              <AlertTriangleIcon size={12} />
              <span>Overdue</span>
            </span>
          )}

          {isCompleted && (
            <span className="badge badge-done" role="status">
              <CheckCircleIcon size={12} />
              <span>Completed</span>
            </span>
          )}

          {!isOverdue && !isCompleted && dueDateInfo.isToday && (
            <span className="badge badge-today">
              <span>Due today</span>
            </span>
          )}
        </div>

        {/* Card action buttons (Edit, Delete) */}
        <div className="task-card-actions">
          <button
            type="button"
            className="card-action-btn edit-action-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit task: ${task.title}`}
          >
            <EditIcon size={14} />
          </button>

          <button
            type="button"
            className="card-action-btn delete-action-btn"
            onClick={() => onDelete(task)}
            title="Delete task"
            aria-label={`Delete task: ${task.title}`}
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 id={`task-title-${task.id}`} className="task-card-title">
        {task.title}
      </h3>

      {/* Description with graceful truncation */}
      {task.description && (
        <div className="task-card-desc-wrapper">
          <p
            className={`task-card-description ${
              isDescExpanded ? 'expanded' : 'truncated'
            }`}
          >
            {task.description}
          </p>
          {task.description.length > 90 && (
            <button
              type="button"
              className="btn-text-toggle"
              onClick={() => setIsDescExpanded((prev) => !prev)}
              aria-label={isDescExpanded ? 'Show less description' : 'Show full description'}
            >
              {isDescExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Metadata Row: Assignee & Due Date */}
      <div className="task-card-meta">
        {/* Assignee chip */}
        <div
          className="assignee-chip"
          title={`Assigned to ${task.assignee}`}
        >
          <div
            className="assignee-avatar"
            style={{
              backgroundColor: avatarStyle.bg,
              color: avatarStyle.color,
              borderColor: avatarStyle.border,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <span className="assignee-name">{task.assignee}</span>
        </div>

        {/* Due date badge */}
        <div
          className={`due-date-indicator ${
            isOverdue
              ? 'due-date-overdue'
              : isCompleted
              ? 'due-date-completed'
              : 'due-date-normal'
          }`}
          title={`Due date: ${task.dueDate}`}
        >
          <CalendarIcon size={12} className="due-date-icon" />
          <span className="due-date-text">{dueDateInfo.displayText}</span>
        </div>
      </div>

      {/* Task Movement Controls */}
      <div className="task-card-footer">
        <div className="task-move-container">
          <span className="move-label">Move:</span>

          {/* Quick previous button */}
          {prevStatus && (
            <button
              type="button"
              className="btn-move btn-move-prev"
              onClick={() => onMove(task.id, prevStatus)}
              title={`Move back to ${prevStatus}`}
              aria-label={`Move task back to ${prevStatus}`}
            >
              <ArrowLeftIcon size={12} />
              <span>{prevStatus}</span>
            </button>
          )}

          {/* Quick next button */}
          {nextStatus && (
            <button
              type="button"
              className="btn-move btn-move-next"
              onClick={() => onMove(task.id, nextStatus)}
              title={`Move forward to ${nextStatus}`}
              aria-label={`Move task forward to ${nextStatus}`}
            >
              <span>{nextStatus}</span>
              <ArrowRightIcon size={12} />
            </button>
          )}

          {/* Dropdown for direct jump */}
          <div className="move-select-wrapper">
            <select
              className="move-select"
              value={task.status}
              onChange={(e) => onMove(task.id, e.target.value as TaskStatus)}
              aria-label={`Change status for "${task.title}"`}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </div>
    </article>
  );
});

TaskCard.displayName = 'TaskCard';
