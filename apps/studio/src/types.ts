// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Task type definition (todo_task)
 */
export interface Task {
  _id: string; // Internal ID
  id: string; // External ID usually, but here we might get _id or id depending on driver
  subject: string;
  priority: number;
  is_completed: boolean;
  due_date?: string;
  created_at?: string;
}

export interface CreateTaskInput {
  subject: string;
  priority?: number;
  is_completed?: boolean;
}

export interface UpdateTaskInput {
  subject?: string;
  priority?: number;
  is_completed?: boolean;
}
