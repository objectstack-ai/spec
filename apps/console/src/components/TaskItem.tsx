/**
 * TaskItem Component
 * 
 * Displays a single task with actions (edit, delete, toggle complete).
 */

import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function TaskItem({ task, onEdit, onDelete, onToggleComplete }: TaskItemProps) {
  const priorities = {
    1: { label: 'Critical', class: 'bg-error-lighter text-error-dark border-error-lighter' },
    2: { label: 'High', class: 'bg-warning-lighter text-warning-dark border-warning-lighter' },
    3: { label: 'Medium', class: 'bg-success-lighter text-success-dark border-success-lighter' },
    4: { label: 'Low', class: 'bg-accents-2 text-accents-6 border-accents-2' },
    5: { label: 'Lowest', class: 'bg-accents-1 text-accents-5 border-accents-2' },
  };

  const priorityConfig = priorities[task.priority as keyof typeof priorities] || priorities[3];

  return (
    <div className={`
      group flex items-start gap-4 p-4 rounded-lg border border-accents-2 bg-background 
      hover:border-accents-3 hover:shadow-sm transition-all duration-200
      ${task.is_completed ? 'bg-accents-1' : ''}
    `}>
      <div className="pt-1">
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={onToggleComplete}
          className="w-5 h-5 rounded border-accents-3 text-foreground focus:ring-offset-0 focus:ring-foreground transition-colors cursor-pointer"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={`font-medium text-base truncate pr-4 ${task.is_completed ? 'line-through text-accents-4' : 'text-foreground'}`}>
              {task.subject}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${priorityConfig.class}`}>
                {priorityConfig.label}
              </span>
              <span className="text-xs text-accents-4">
                {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button 
          onClick={onEdit} 
          className="p-2 text-accents-5 hover:text-foreground hover:bg-accents-2 rounded-md transition-colors"
          title="Edit Task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          onClick={onDelete} 
          className="p-2 text-accents-5 hover:text-error hover:bg-error-lighter/20 rounded-md transition-colors"
          title="Delete Task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
