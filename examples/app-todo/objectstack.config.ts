import { defineStack } from '@objectstack/spec';
import { App } from '@objectstack/spec/ui';
import { TodoTask } from './src/domains/todo/task.object';

export default defineStack({
  objects: [
    TodoTask
  ],
  apps: [
    App.create({
      name: 'todo_app',
      label: 'Todo App',
      icon: 'check-square',
      branding: {
        primaryColor: '#10B981',
        logo: '/assets/todo-logo.png',
      },
      navigation: [
        {
          id: 'group_tasks',
          type: 'group',
          label: 'Tasks',
          children: [
            { 
              id: 'nav_todo_task',
              type: 'object', 
              objectName: 'todo_task',
              label: 'My Tasks'
            }
          ]
        }
      ]
    })
  ],
  manifest: {
    id: 'com.example.todo',
    version: '1.0.0',
    type: 'app',
    name: 'Todo App',
    description: 'A simple Todo example demonstrating ObjectStack Protocol',
    data: [
      {
        object: 'todo_task',
        mode: 'upsert',
        records: [
          { subject: 'Learn ObjectStack', is_completed: true, priority: 3 },
          { subject: 'Build a cool app', is_completed: false, priority: 2 },
          { subject: 'Review PR #102', is_completed: true, priority: 3, due_date: new Date() },
          { subject: 'Write Documentation', is_completed: false, priority: 2, due_date: new Date(Date.now() + 86400000) },
          { subject: 'Fix specific Server bug', is_completed: false, priority: 1 }
        ]
      }
    ]
  }
});

