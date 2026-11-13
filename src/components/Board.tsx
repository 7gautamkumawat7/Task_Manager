import React, { useState, useRef, useMemo } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { BoardColumn } from './BoardColumn';

interface BoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (taskId: string, nextStatus: TaskStatus) => void;
  onQuickAdd: (status: TaskStatus) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'To Do', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Done', title: 'Done' },
];

export const Board: React.FC<BoardProps> = React.memo(({
  tasks,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onQuickAdd,
  isFiltered,
  onClearFilters,
}) => {
  const [activeMobileTab, setActiveMobileTab] = useState<TaskStatus>('To Do');
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Group tasks by status in a single O(N) pass
  const groupedTasks = useMemo(() => {
    const todo: Task[] = [];
    const inProgress: Task[] = [];
    const done: Task[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.status === 'To Do') {
        todo.push(task);
      } else if (task.status === 'In Progress') {
        inProgress.push(task);
      } else if (task.status === 'Done') {
        done.push(task);
      }
    }

    return {
      'To Do': todo,
      'In Progress': inProgress,
      'Done': done,
    };
  }, [tasks]);

  const handleMobileTabClick = (status: TaskStatus) => {
    setActiveMobileTab(status);
    const colElement = document.getElementById(`col-${status.toLowerCase().replace(/\s+/g, '-')}`);
    if (colElement && boardContainerRef.current) {
      colElement.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  return (
    <div className="board-wrapper">
      {/* Mobile Column Navigation Tabs (visible on mobile only) */}
      <nav className="mobile-column-tabs" aria-label="Kanban columns mobile switcher">
        {COLUMNS.map((col) => {
          const count = groupedTasks[col.id].length;
          const isActive = activeMobileTab === col.id;
          return (
            <button
              key={col.id}
              type="button"
              className={`mobile-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleMobileTabClick(col.id)}
              aria-selected={isActive}
              role="tab"
            >
              <span className="mobile-tab-title">{col.title}</span>
              <span className="mobile-tab-count">{count}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Board 3-column Canvas */}
      <main
        className="board-columns-container"
        ref={boardContainerRef}
        role="region"
        aria-label="Kanban board columns"
      >
        {COLUMNS.map((col) => {
          const colTasks = groupedTasks[col.id];
          const colDomId = `col-${col.id.toLowerCase().replace(/\s+/g, '-')}`;
          return (
            <div key={col.id} id={colDomId} className="board-column-wrapper">
              <BoardColumn
                status={col.id}
                title={col.title}
                tasks={colTasks}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onMoveTask={onMoveTask}
                onQuickAdd={onQuickAdd}
                isFiltered={isFiltered}
                onClearFilters={onClearFilters}
              />
            </div>
          );
        })}
      </main>
    </div>
  );
});

Board.displayName = 'Board';
