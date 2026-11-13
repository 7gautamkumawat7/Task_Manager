export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  dueDate: string; // ISO format string: YYYY-MM-DD
  status: TaskStatus;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
}

export interface TaskValidationErrors {
  title?: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  status?: string;
}
