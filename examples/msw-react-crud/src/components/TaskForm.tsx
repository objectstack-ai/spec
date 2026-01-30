/**
 * TaskForm Component
 * 
 * Form for creating and updating tasks.
 * Demonstrates CREATE and UPDATE operations using @objectstack/client.
 */

import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/objectos/client';
import type { Task, CreateTaskInput } from '../types';

interface TaskFormProps {
  client: ObjectStackClient;
  editingTask: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ client, editingTask, onSuccess, onCancel }: TaskFormProps) {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setSubject(editingTask.subject);
      setPriority(editingTask.priority);
      setIsCompleted(editingTask.is_completed);
    } else {
      resetForm();
    }
  }, [editingTask]);

  function resetForm() {
    setSubject('');
    setPriority(3);
    setIsCompleted(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingTask) {
        // UPDATE operation using ObjectStack Client
        await client.data.update('todo_task', editingTask.id, {
          subject: subject.trim(),
          priority,
          is_completed: isCompleted
        });
      } else {
        // CREATE operation using ObjectStack Client
        const taskData: CreateTaskInput = {
          subject: subject.trim(),
          priority,
          is_completed: isCompleted
        };
        
        await client.data.create('todo_task', taskData);
      }

      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      console.error('Error saving task:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  return (
    <div className="bg-background border border-accents-2 rounded-lg p-6 shadow-[0_0_15px_rgba(0,0,0,0.02)]">
      <h2 className="text-xl font-semibold mb-6">
        {editingTask ? 'Edit Task' : 'Create New Task'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-xs uppercase tracking-wider text-accents-5 font-semibold mb-2">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter task subject..."
            disabled={submitting}
            required
            className="w-full px-3 py-2 bg-background border border-accents-2 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-200 placeholder:text-accents-3"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-xs uppercase tracking-wider text-accents-5 font-semibold mb-2">
            Priority
          </label>
          <div className="relative">
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              disabled={submitting}
              className="w-full px-3 py-2 bg-background border border-accents-2 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-200 appearance-none"
            >
              <option value={1}>1 - Critical</option>
              <option value={2}>2 - High</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - Low</option>
              <option value={5}>5 - Lowest</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-accents-4">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="isCompleted"
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            disabled={submitting}
            className="w-4 h-4 rounded border-accents-3 text-foreground focus:ring-offset-0 focus:ring-foreground transition-colors cursor-pointer"
          />
          <label htmlFor="isCompleted" className="select-none cursor-pointer text-sm text-foreground">
            Mark as completed
          </label>
        </div>

        {error && (
          <div className="p-3 text-sm text-error bg-error-lighter border border-error-light rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-foreground text-background rounded-md font-medium text-sm hover:bg-accents-7 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
          </button>
          
          {editingTask && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-background text-foreground border border-accents-2 rounded-md font-medium text-sm hover:bg-accents-1 disabled:opacity-50 transition-colors duration-200"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
