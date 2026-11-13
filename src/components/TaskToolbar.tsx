import React from 'react';
import { SearchIcon, CloseIcon, FilterIcon, UserIcon } from './icons';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (assignee: string) => void;
  availableAssignees: string[];
  totalTasks: number;
  filteredTasksCount: number;
  onClearFilters: () => void;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  availableAssignees,
  totalTasks,
  filteredTasksCount,
  onClearFilters,
}) => {
  const isFilterActive = searchQuery.trim().length > 0 || selectedAssignee !== '';

  return (
    <section className="task-toolbar" aria-label="Task search and filters">
      <div className="toolbar-controls">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks by title"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              title="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="filter-select-wrapper">
          <UserIcon size={14} className="filter-select-icon" />
          <select
            className="filter-select"
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            aria-label="Filter tasks by assignee"
          >
            <option value="">All Assignees ({totalTasks})</option>
            {availableAssignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Action */}
        {isFilterActive && (
          <button
            type="button"
            className="btn btn-secondary btn-sm clear-filters-btn"
            onClick={onClearFilters}
            aria-label="Clear all active filters"
          >
            <CloseIcon size={13} />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Filter status feedback text */}
      {isFilterActive && (
        <div className="filter-results-status" role="status" aria-live="polite">
          <FilterIcon size={13} />
          <span>
            Showing <strong>{filteredTasksCount}</strong> of <strong>{totalTasks}</strong> tasks
            {selectedAssignee ? ` assigned to "${selectedAssignee}"` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
        </div>
      )}
    </section>
  );
};
