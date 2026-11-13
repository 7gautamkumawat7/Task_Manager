import React, { useState, useMemo, useCallback, useDeferredValue, Suspense } from 'react';
import type { Task, TaskFormData, TaskStatus } from './types/task';
import { useTasks } from './hooks/useTasks';
import { BoardHeader } from './components/BoardHeader';
import { TaskToolbar } from './components/TaskToolbar';
import { Board } from './components/Board';

// Lazy load dialogs to minimize initial bundle size and boost FCP/LCP
const TaskModal = React.lazy(() =>
  import('./components/TaskModal').then((m) => ({ default: m.TaskModal }))
);
const ConfirmModal = React.lazy(() =>
  import('./components/ConfirmModal').then((m) => ({ default: m.ConfirmModal }))
);

export const App: React.FC = () => {
  const {
    tasks,
    allAssignees,
    stats,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    clearAllTasks,
  } = useTasks();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Zero-latency input: defer search filtering to maintain 120fps typing responsiveness
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultNewTaskStatus, setDefaultNewTaskStatus] = useState<TaskStatus>('To Do');

  // Deletion confirmation modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Filter tasks based on deferred search query (case-insensitive title search) and assignee
  const filteredTasks = useMemo(() => {
    const trimmedQuery = deferredSearchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Title search match
      const matchesTitle =
        !trimmedQuery || task.title.toLowerCase().includes(trimmedQuery);

      // Assignee filter match
      const matchesAssignee =
        !selectedAssignee || task.assignee === selectedAssignee;

      return matchesTitle && matchesAssignee;
    });
  }, [tasks, deferredSearchQuery, selectedAssignee]);

  const isFiltered = searchQuery.trim().length > 0 || selectedAssignee !== '';

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedAssignee('');
  }, []);

  // Handlers for Task Creation and Editing
  const handleOpenCreateModal = useCallback((status: TaskStatus = 'To Do') => {
    setEditingTask(null);
    setDefaultNewTaskStatus(status);
    setIsTaskModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultNewTaskStatus(task.status);
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleSaveTask = useCallback(
    (formData: TaskFormData) => {
      if (editingTask) {
        updateTask(editingTask.id, formData);
      } else {
        createTask(formData);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
    [editingTask, updateTask, createTask]
  );

  // Handlers for Deletion
  const handleRequestDelete = useCallback((task: Task) => {
    setTaskToDelete(task);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  }, [taskToDelete, deleteTask]);

  const handleCancelDelete = useCallback(() => {
    setTaskToDelete(null);
  }, []);

  // Handler for Board Reset
  const handleConfirmReset = useCallback(() => {
    clearAllTasks();
    setIsResetModalOpen(false);
    handleClearFilters();
  }, [clearAllTasks, handleClearFilters]);

  return (
    <div className="app-container">
      {/* Skip to content link for keyboard accessibility */}
      <a href="#main-board" className="skip-to-content">
        Skip to task board
      </a>

      {/* Header */}
      <BoardHeader
        onOpenCreateModal={() => handleOpenCreateModal('To Do')}
        onReset={() => setIsResetModalOpen(true)}
        totalTasks={stats.total}
        completedTasks={stats.done}
        overdueTasks={stats.overdue}
      />

      {/* Toolbar (Search, Filter, Reset) */}
      <TaskToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        availableAssignees={allAssignees}
        totalTasks={tasks.length}
        filteredTasksCount={filteredTasks.length}
        onClearFilters={handleClearFilters}
      />

      {/* Main Kanban Board */}
      <div id="main-board">
        <Board
          tasks={filteredTasks}
          onEditTask={handleOpenEditModal}
          onDeleteTask={handleRequestDelete}
          onMoveTask={moveTask}
          onQuickAdd={handleOpenCreateModal}
          isFiltered={isFiltered}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Lazy-Loaded Dialogs wrapped in Suspense */}
      <Suspense fallback={null}>
        {/* Reusable Create / Edit Task Modal */}
        {isTaskModalOpen && (
          <TaskModal
            key={editingTask ? editingTask.id : `new-task-${defaultNewTaskStatus}`}
            isOpen={isTaskModalOpen}
            onClose={handleCloseTaskModal}
            onSubmit={handleSaveTask}
            initialTask={editingTask}
            defaultStatus={defaultNewTaskStatus}
            availableAssignees={allAssignees}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(taskToDelete)}
          title="Delete Task"
          message={
            taskToDelete
              ? `Are you sure you want to delete "${taskToDelete.title}"? This task will be permanently removed.`
              : ''
          }
          confirmLabel="Delete Task"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        {/* Reset Board Confirmation Modal */}
        <ConfirmModal
          isOpen={isResetModalOpen}
          title="Reset Board?"
          message="Are you sure you want to reset the board? All tasks will be cleared."
          confirmLabel="Reset Board"
          cancelLabel="Cancel"
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetModalOpen(false)}
        />
      </Suspense>

      {/* Footer */}
      <footer className="app-footer">
        <p>TASK_m</p>
      </footer>
    </div>
  );
};

export default App;
