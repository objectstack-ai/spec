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
    priority: { name: 'priority', label: 'Priority', type: 'number', defaultValue: 5 },
    isCompleted: { name: 'isCompleted', label: 'Completed', type: 'boolean', defaultValue: false },
    createdAt: { name: 'createdAt', label: 'Created At', type: 'datetime' }
  }
};

/**
 * App Configuration
 */
export default {
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
};
