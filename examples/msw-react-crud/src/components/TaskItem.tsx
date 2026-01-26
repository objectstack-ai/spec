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
  const priorityLabel = ['Critical', 'High', 'Medium', 'Low', 'Lowest'][task.priority - 1] || 'Unknown';
  const priorityClass = `priority-${task.priority}`;

  return (
    <div className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={onToggleComplete}
          className="task-checkbox"
        />
        <div className="task-info">
          <h3 className="task-subject">{task.subject}</h3>
          <div className="task-meta">
            <span className={`task-priority ${priorityClass}`}>
              Priority: {priorityLabel} ({task.priority})
            </span>
            <span className="task-date">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="task-actions">
        <button onClick={onEdit} className="btn-edit">
          Edit
        </button>
        <button onClick={onDelete} className="btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
}
