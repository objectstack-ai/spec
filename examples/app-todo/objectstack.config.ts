import { defineStack } from '@objectstack/spec';

// ─── Objects ────────────────────────────────────────────────────────
import { Task } from './src/objects/task.object';

// ─── Actions ────────────────────────────────────────────────────────
import { 
  CompleteTaskAction, 
  StartTaskAction, 
  DeferTaskAction, 
  SetReminderAction,
  CloneTaskAction,
  MassCompleteTasksAction,
  DeleteCompletedAction,
  ExportToCsvAction 
} from './src/actions/task.actions';

// ─── Dashboards ─────────────────────────────────────────────────────
import { TaskDashboard } from './src/dashboards/task.dashboard';

// ─── Reports ────────────────────────────────────────────────────────
import { 
  TasksByStatusReport, 
  TasksByPriorityReport, 
  TasksByOwnerReport, 
  OverdueTasksReport,
  CompletedTasksReport,
  TimeTrackingReport 
} from './src/reports/task.report';

// ─── Flows ──────────────────────────────────────────────────────────
import { 
  TaskReminderFlow, 
  OverdueEscalationFlow, 
  TaskCompletionFlow,
  QuickAddTaskFlow 
} from './src/flows/task.flow';

// ─── App ────────────────────────────────────────────────────────────
import { TodoApp } from './src/apps/todo.app';

export default defineStack({
  manifest: {
    id: 'com.example.todo',
    version: '2.0.0',
    type: 'app',
    name: 'Todo Manager',
    description: 'A comprehensive Todo app demonstrating ObjectStack Protocol features including automation, dashboards, and reports',
    author: 'ObjectStack Team',
    repository: 'https://github.com/objectstack-ai/spec',
    license: 'MIT',
    data: [
      {
        object: 'task',
        mode: 'upsert',
        records: [
          { subject: 'Learn ObjectStack', status: 'completed', priority: 'high', category: 'Work' },
          { subject: 'Build a cool app', status: 'in_progress', priority: 'normal', category: 'Work', due_date: new Date(Date.now() + 86400000 * 3) },
          { subject: 'Review PR #102', status: 'completed', priority: 'high', category: 'Work' },
          { subject: 'Write Documentation', status: 'not_started', priority: 'normal', category: 'Work', due_date: new Date(Date.now() + 86400000) },
          { subject: 'Fix Server bug', status: 'waiting', priority: 'urgent', category: 'Work' },
          { subject: 'Buy groceries', status: 'not_started', priority: 'low', category: 'Shopping', due_date: new Date() },
          { subject: 'Schedule dentist appointment', status: 'not_started', priority: 'normal', category: 'Health', due_date: new Date(Date.now() + 86400000 * 7) },
          { subject: 'Pay utility bills', status: 'not_started', priority: 'high', category: 'Finance', due_date: new Date(Date.now() + 86400000 * 2) },
        ]
      }
    ]
  },

  objects: [
    Task,
  ],

  actions: [
    CompleteTaskAction,
    StartTaskAction,
    DeferTaskAction,
    SetReminderAction,
    CloneTaskAction,
    MassCompleteTasksAction,
    DeleteCompletedAction,
    ExportToCsvAction,
  ],

  dashboards: [
    TaskDashboard,
  ],

  reports: [
    TasksByStatusReport,
    TasksByPriorityReport,
    TasksByOwnerReport,
    OverdueTasksReport,
    CompletedTasksReport,
    TimeTrackingReport,
  ],

  flows: [
    TaskReminderFlow,
    OverdueEscalationFlow,
    TaskCompletionFlow,
    QuickAddTaskFlow,
  ],

  apps: [TodoApp],
});

