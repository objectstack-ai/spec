/**
 * TaskList Component
 * 
 * Displays a list of tasks fetched from the ObjectStack API.
 * Demonstrates READ operation using @objectstack/client.
 */

import { useEffect, useState } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  client: ObjectStackClient;
  onEdit: (task: Task) => void;
  refreshTrigger: number;
}

export function TaskList({ client, onEdit, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      // Use ObjectStack Client to fetch tasks
      const result = await client.data.find('task', {
        top: 100,
        sort: ['priority', '-createdAt']
      });

      setTasks(result.value as Task[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      // Use ObjectStack Client to delete task
      await client.data.delete('task', id);
      
      // Refresh the list
      await loadTasks();
    } catch (err) {
      alert('Failed to delete task: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      // Use ObjectStack Client to update task
      await client.data.update('task', task.id, {
        isCompleted: !task.isCompleted
      });
      
      // Refresh the list
      await loadTasks();
    } catch (err) {
      alert('Failed to update task: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  if (loading) {
    return (
      <div className="task-list">
        <p className="loading">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list">
        <p className="error">Error: {error}</p>
        <button onClick={loadTasks}>Retry</button>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>Tasks ({tasks.length})</h2>
      
      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Create one to get started!</p>
      ) : (
        <div className="tasks">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={() => onEdit(task)}
              onDelete={() => handleDelete(task.id)}
              onToggleComplete={() => handleToggleComplete(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
