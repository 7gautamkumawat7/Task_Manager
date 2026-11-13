import React, { useState, useEffect, useRef } from 'react';
import type { Task, TaskFormData, TaskStatus, TaskValidationErrors } from '../types/task';
import { CloseIcon } from './icons';
import { getTodayDateString } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: TaskFormData) => void;
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
  availableAssignees: string[];
}

const COMMON_TEAM_MEMBERS = [
  'Alex Rivera',
  'Jordan Lee',
  'Taylor Chen',
  'Sam Patel',
  'Morgan Smith',
  'Casey Brooks',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultStatus = 'To Do',
  availableAssignees,
}) => {
  const isEditing = Boolean(initialTask);

  // Initialize form data directly from props when mounted
  const [formData, setFormData] = useState<TaskFormData>(() => {
    if (initialTask) {
      return {
        title: initialTask.title,
        description: initialTask.description || '',
        assignee: initialTask.assignee,
        dueDate: initialTask.dueDate,
        status: initialTask.status,
      };
    }
    return {
      title: '',
      description: '',
      assignee: '',
      dueDate: getTodayDateString(),
      status: defaultStatus,
    };
  });

  const [errors, setErrors] = useState<TaskValidationErrors>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalOverlayRef = useRef<HTMLDivElement>(null);

  // Suggested assignees
  const suggestedAssignees = Array.from(
    new Set([...availableAssignees, ...COMMON_TEAM_MEMBERS])
  ).sort();

  // Focus title input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: TaskValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.assignee.trim()) {
      newErrors.assignee = 'Assignee is required.';
    }

    if (!formData.dueDate.trim()) {
      newErrors.dueDate = 'Due date is required.';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalOverlayRef.current) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className="modal-backdrop"
      ref={modalOverlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Title Field (Required) */}
          <div className="form-group">
            <label htmlFor="task-title-input" className="form-label required">
              Task Title
            </label>
            <input
              id="task-title-input"
              ref={titleInputRef}
              type="text"
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <span id="title-error" className="form-error-msg" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          {/* Description Field (Optional) */}
          <div className="form-group">
            <label htmlFor="task-desc-input" className="form-label">
              Description <span className="label-hint">(optional)</span>
            </label>
            <textarea
              id="task-desc-input"
              className="form-textarea"
              placeholder="Add details, acceptance criteria, or relevant links..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Row: Assignee & Due Date */}
          <div className="form-row">
            {/* Assignee Field (Required) */}
            <div className="form-group form-col">
              <label htmlFor="task-assignee-input" className="form-label required">
                Assignee
              </label>
              <input
                id="task-assignee-input"
                type="text"
                list="assignee-datalist"
                className={`form-input ${errors.assignee ? 'form-input-error' : ''}`}
                placeholder="Name or team member"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                aria-invalid={Boolean(errors.assignee)}
                aria-describedby={errors.assignee ? 'assignee-error' : undefined}
              />
              <datalist id="assignee-datalist">
                {suggestedAssignees.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {errors.assignee && (
                <span id="assignee-error" className="form-error-msg" role="alert">
                  {errors.assignee}
                </span>
              )}
            </div>

            {/* Due Date Field (Required) */}
            <div className="form-group form-col">
              <label htmlFor="task-duedate-input" className="form-label required">
                Due Date
              </label>
              <input
                id="task-duedate-input"
                type="date"
                className={`form-input ${errors.dueDate ? 'form-input-error' : ''}`}
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={errors.dueDate ? 'duedate-error' : undefined}
              />
              {errors.dueDate && (
                <span id="duedate-error" className="form-error-msg" role="alert">
                  {errors.dueDate}
                </span>
              )}
            </div>
          </div>

          {/* Status Column Select (Required) */}
          <div className="form-group">
            <label htmlFor="task-status-select" className="form-label required">
              Column Status
            </label>
            <select
              id="task-status-select"
              className={`form-select ${errors.status ? 'form-input-error' : ''}`}
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? 'status-error' : undefined}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            {errors.status && (
              <span id="status-error" className="form-error-msg" role="alert">
                {errors.status}
              </span>
            )}
          </div>

          {/* Modal Footer / Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
