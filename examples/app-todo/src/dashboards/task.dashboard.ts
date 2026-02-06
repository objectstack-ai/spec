import type { Dashboard } from '@objectstack/spec/ui';

export const TaskDashboard: Dashboard = {
  name: 'task_dashboard',
  label: 'Task Overview',
  description: 'Key task metrics and productivity overview',
  
  widgets: [
    // Row 1: Key Metrics
    {
      title: 'Total Tasks',
      type: 'metric',
      object: 'task',
      aggregate: 'count',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: { color: '#3B82F6' }
    },
    {
      title: 'Completed Today',
      type: 'metric',
      object: 'task',
      filter: { is_completed: true, completed_date: { $gte: '{today_start}' } },
      aggregate: 'count',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: { color: '#10B981' }
    },
    {
      title: 'Overdue Tasks',
      type: 'metric',
      object: 'task',
      filter: { is_overdue: true, is_completed: false },
      aggregate: 'count',
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: { color: '#EF4444' }
    },
    {
      title: 'Completion Rate',
      type: 'metric',
      object: 'task',
      filter: { created_date: { $gte: '{current_week_start}' } },
      valueField: 'is_completed',
      aggregate: 'count',
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: { suffix: '%', color: '#8B5CF6' }
    },
    
    // Row 2: Task Distribution
    {
      title: 'Tasks by Status',
      type: 'pie',
      object: 'task',
      filter: { is_completed: false },
      categoryField: 'status',
      aggregate: 'count',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      options: { showLegend: true }
    },
    {
      title: 'Tasks by Priority',
      type: 'bar',
      object: 'task',
      filter: { is_completed: false },
      categoryField: 'priority',
      aggregate: 'count',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      options: { horizontal: true }
    },
    
    // Row 3: Trends
    {
      title: 'Weekly Task Completion',
      type: 'line',
      object: 'task',
      filter: { is_completed: true, completed_date: { $gte: '{last_4_weeks}' } },
      categoryField: 'completed_date',
      aggregate: 'count',
      dateGranularity: 'week',
      layout: { x: 0, y: 6, w: 8, h: 4 },
      options: { showDataLabels: true }
    },
    {
      title: 'Tasks by Category',
      type: 'donut',
      object: 'task',
      filter: { is_completed: false },
      categoryField: 'category',
      aggregate: 'count',
      layout: { x: 8, y: 6, w: 4, h: 4 },
      options: { showLegend: true }
    },
    
    // Row 4: Lists
    {
      title: 'Overdue Tasks',
      type: 'list',
      object: 'task',
      filter: { is_overdue: true, is_completed: false },
      columns: ['subject', 'due_date', 'priority'],
      sortBy: 'due_date',
      sortOrder: 'asc',
      limit: 10,
      layout: { x: 0, y: 10, w: 6, h: 4 },
    },
    {
      title: 'Due Today',
      type: 'list',
      object: 'task',
      filter: { due_date: '{today}', is_completed: false },
      columns: ['subject', 'priority', 'status'],
      sortBy: 'priority',
      sortOrder: 'desc',
      limit: 10,
      layout: { x: 6, y: 10, w: 6, h: 4 },
    },
  ],
};
