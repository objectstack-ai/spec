import { defineStack } from '@objectstack/spec';

/**
 * Task Object Definition
 */
export const TaskObject = {
  name: 'task',
  label: 'Task',
  description: 'Task management object',
  icon: 'check-square',
  titleFormat: '{subject}',
  enable: {
    apiEnabled: true,
    trackHistory: false,
    feeds: false,
    activities: false,
    mru: true,
  },
  fields: {
    id: { name: 'id', label: 'ID', type: 'text', required: true },
    subject: { name: 'subject', label: 'Subject', type: 'text', required: true },
    status: {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Waiting', value: 'waiting' },
        { label: 'Completed', value: 'completed' },
      ]
    },
    priority: {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ]
    },
    category: { name: 'category', label: 'Category', type: 'text' },
    due_date: { name: 'due_date', label: 'Due Date', type: 'date' },
    is_completed: { name: 'is_completed', label: 'Completed', type: 'boolean', defaultValue: false },
    created_at: { name: 'created_at', label: 'Created At', type: 'datetime' }
  }
};

/**
 * App Configuration
 *
 * This is the single source of truth for apps/studio in MSW (browser) mode.
 * In server mode the studio fetches apps dynamically via the API.
 */
export default defineStack({
  name: 'task_app',
  label: 'Task Management',
  description: 'MSW + React CRUD Example with ObjectStack',
  version: '1.0.0',
  icon: 'check-square',
  branding: {
    primaryColor: '#3b82f6',
    logo: '/assets/logo.png',
  },
  objects: [
    TaskObject
  ],
  data: [
    {
      object: 'task',
      mode: 'upsert' as const,
      externalId: 'subject',
      records: [
        { subject: 'Learn ObjectStack', status: 'completed', priority: 'high', category: 'Work' },
        { subject: 'Build a cool app', status: 'in_progress', priority: 'normal', category: 'Work' },
        { subject: 'Review PR #102', status: 'completed', priority: 'high', category: 'Work' },
        { subject: 'Write Documentation', status: 'not_started', priority: 'normal', category: 'Work' },
        { subject: 'Fix Server bug', status: 'waiting', priority: 'urgent', category: 'Work' },
        { subject: 'Buy groceries', status: 'not_started', priority: 'low', category: 'Shopping' },
        { subject: 'Schedule dentist appointment', status: 'not_started', priority: 'normal', category: 'Health' },
        { subject: 'Pay utility bills', status: 'not_started', priority: 'high', category: 'Finance' },
      ]
    }
  ],
  navigation: [
    {
      id: 'group_tasks',
      type: 'group',
      label: 'Tasks',
      children: [
        { 
          id: 'nav_tasks',
          type: 'object', 
          objectName: 'task',
          label: 'My Tasks'
        }
      ]
    }
  ]
});
