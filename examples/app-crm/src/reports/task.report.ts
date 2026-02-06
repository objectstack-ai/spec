import type { ReportInput } from '@objectstack/spec/ui';

export const TasksByOwnerReport: ReportInput = {
  name: 'tasks_by_owner',
  label: 'Tasks by Owner',
  description: 'Task summary by owner',
  objectName: 'task',
  type: 'summary',
  columns: [
    { field: 'subject', label: 'Subject' },
    { field: 'status', label: 'Status' },
    { field: 'priority', label: 'Priority' },
    { field: 'due_date', label: 'Due Date' },
    { field: 'actual_hours', label: 'Hours', aggregate: 'sum' },
  ],
  groupingsDown: [{ field: 'owner', sortOrder: 'asc' }],
  filter: { is_completed: false },
};
