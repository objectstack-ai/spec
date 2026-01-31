/**
 * TaskListWithHooks Component
 * 
 * Demonstrates using @objectstack/client-react hooks for data fetching
 */

import { usePagination, useMutation, ObjectStackProvider } from '@objectstack/client-react';
import type { ObjectStackClient } from '@objectstack/client';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListWithHooksProps {
  client: ObjectStackClient;
  onEdit: (task: Task) => void;
}

function TaskListContent({ onEdit }: { onEdit: (task: Task) => void }) {
  const {
    data,
    isLoading,
    error,
    page,
    totalPages,
    totalCount,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    refetch
  } = usePagination<Task>('todo_task', {
    pageSize: 10,
    sort: ['priority', '-created_at']
  });

  const { mutate: deleteTask } = useMutation('todo_task', 'delete', {
    onSuccess: () => {
      refetch();
    }
  });

  const { mutate: updateTask } = useMutation('todo_task', 'update', {
    onSuccess: () => {
      refetch();
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    deleteTask({ id });
  };

  const handleToggleComplete = (task: Task) => {
    updateTask({
      id: task.id,
      data: {
        is_completed: !task.is_completed
      }
    });
  };

  if (isLoading) {
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
          {error.message}
        </div>
        <div>
          <button 
            onClick={() => refetch()}
            className="text-sm font-medium text-foreground hover:text-accents-5 underline transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tasks = data?.value || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-accents-2">
        <h2 className="text-2xl font-bold tracking-tight">Your Tasks (With Hooks)</h2>
        <span className="text-sm px-2.5 py-0.5 rounded-full bg-accents-1 text-accents-5 font-medium border border-accents-2">
          {totalCount}
        </span>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-accents-3 rounded-lg bg-accents-1">
          <p className="text-accents-5 font-medium">No tasks yet</p>
          <p className="text-accents-4 text-sm mt-1">Create a new task to get started!</p>
        </div>
      ) : (
        <>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={previousPage}
                disabled={!hasPreviousPage}
                className="px-4 py-2 text-sm font-medium border border-accents-2 rounded-md hover:bg-accents-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-accents-5">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className="px-4 py-2 text-sm font-medium border border-accents-2 rounded-md hover:bg-accents-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function TaskListWithHooks({ client, onEdit }: TaskListWithHooksProps) {
  return (
    <ObjectStackProvider client={client}>
      <TaskListContent onEdit={onEdit} />
    </ObjectStackProvider>
  );
}
