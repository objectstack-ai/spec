import { App } from '@objectstack/spec';
import { TodoTask } from './src/domains/todo/task.object';

export default App.create({
  name: 'todo_app',
  label: 'Todo App',
  description: 'A simple Todo example demonstrating ObjectStack Protocol',
  version: '1.0.0',
  icon: 'check-square',
  branding: {
    primaryColor: '#10B981',
    logo: '/assets/todo-logo.png',
  },
  objects: [
    TodoTask
  ],
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
  ],
  data: [
    {
      object: 'todo_task',
      mode: 'upsert',
      records: [
        { subject: 'Review PR #102', is_completed: true, priority: 3, due_date: new Date() },
        { subject: 'Write Documentation', is_completed: false, priority: 2, due_date: new Date(Date.now() + 86400000) },
        { subject: 'Fix specific Server bug', is_completed: false, priority: 1 }
      ]
    }
  ]
});
