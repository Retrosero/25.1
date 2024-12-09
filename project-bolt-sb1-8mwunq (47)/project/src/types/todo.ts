export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'pending' | 'in-progress' | 'completed';

export interface TodoStep {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: string;
  assignedTo?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  steps: TodoStep[];
  isPublic: boolean;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }[];
}