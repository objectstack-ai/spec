import { App } from '@objectstack/spec/ui';
import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Task Object Definition
 */
const TaskObject = ObjectSchema.create({
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
    id: Field.text({ label: 'ID', required: true }),
    subject: Field.text({ label: 'Subject', required: true }),
    priority: Field.number({ label: 'Priority', defaultValue: 5 }),
    isCompleted: Field.boolean({ label: 'Completed', defaultValue: false }),
    createdAt: Field.datetime({ label: 'Created At' })
  }
});

/**
 * App Configuration
 */
export default App.create({
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
  ],
  data: [
    {
      object: 'task',
      mode: 'upsert',
      records: [
        { 
          id: '1',
          subject: 'Complete MSW integration example', 
          priority: 1, 
          isCompleted: false, 
          createdAt: new Date().toISOString() 
        },
        { 
          id: '2',
          subject: 'Test CRUD operations with React', 
          priority: 2, 
          isCompleted: false, 
          createdAt: new Date().toISOString() 
        },
        { 
          id: '3',
          subject: 'Write documentation', 
          priority: 3, 
          isCompleted: true, 
          createdAt: new Date().toISOString() 
        }
      ]
    }
  ]
});
