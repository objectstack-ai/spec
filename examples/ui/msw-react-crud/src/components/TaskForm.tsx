/**
 * TaskForm Component
 * 
 * Form for creating and updating tasks.
 * Demonstrates CREATE and UPDATE operations using @objectstack/client.
 */

import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
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
      setIsCompleted(editingTask.isCompleted);
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
        await client.data.update('task', editingTask.id, {
          subject: subject.trim(),
          priority,
          isCompleted
        });
      } else {
        // CREATE operation using ObjectStack Client
        const taskData: CreateTaskInput = {
          subject: subject.trim(),
          priority,
          isCompleted
        };
        
        await client.data.create('task', taskData);
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
    <div className="task-form">
      <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter task subject..."
            disabled={submitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            disabled={submitting}
          >
            <option value={1}>1 - Critical</option>
            <option value={2}>2 - High</option>
            <option value={3}>3 - Medium</option>
            <option value={4}>4 - Low</option>
            <option value={5}>5 - Lowest</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              disabled={submitting}
            />
            Mark as completed
          </label>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
          </button>
          
          {editingTask && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
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
