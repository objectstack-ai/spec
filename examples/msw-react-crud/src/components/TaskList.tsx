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
      const result = await client.data.find('todo_task', {
        top: 100,
        sort: ['priority', '-created_at']
      });

      // Handle { value: [] } (PaginatedResult) and [] (Raw) formats
      const rawValues = Array.isArray(result) ? result : (result.value || []);
      const fetchedTasks = [...rawValues] as Task[];
      
      // Client-side sort fallback (since InMemoryDriver has limited sort support)
      // Sort by Priority (Ascending) -> Created At (Descending)
      fetchedTasks.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      // Use ObjectStack Client to delete task
      await client.data.delete('todo_task', id);
      
      // Refresh the list
      await loadTasks();
    } catch (err) {
      alert('Failed to delete task: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      // Use ObjectStack Client to update task
      await client.data.update('todo_task', task.id, {
        is_completed: !task.is_completed
      });
      
      // Refresh the list
      await loadTasks();
    } catch (err) {
      alert('Failed to update task: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-accents-4 space-y-3">
        <div className="w-6 h-6 border-2 border-accents-3 border-t-foreground rounded-full animate-spin"></div>
        <p className="text-sm">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 border border-error-light/50 bg-error-lighter rounded-lg text-error mb-4">
          {error}
        </div>
        <div>
          <button 
            onClick={loadTasks}
            className="text-sm font-medium text-foreground hover:text-accents-5 underline transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-accents-2">
        <h2 className="text-2xl font-bold tracking-tight">Your Tasks</h2>
        <span className="text-sm px-2.5 py-0.5 rounded-full bg-accents-1 text-accents-5 font-medium border border-accents-2">
          {tasks?.length || 0}
        </span>
      </div>
      
      {tasks?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-accents-3 rounded-lg bg-accents-1">
          <p className="text-accents-5 font-medium">No tasks yet</p>
          <p className="text-accents-4 text-sm mt-1">Create a new task to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
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
