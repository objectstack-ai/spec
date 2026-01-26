/**
 * Task type definition
 */
export interface Task {
  id: string;
  subject: string;
  priority: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTaskInput {
  subject: string;
  priority?: number;
  isCompleted?: boolean;
}

export interface UpdateTaskInput {
  subject?: string;
  priority?: number;
  isCompleted?: boolean;
}
