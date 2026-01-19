import { App } from '@objectstack/spec';
import { TodoTask } from './src/domains/todo/task.object';

export default App.create({
  name: 'todo_app',
  label: 'Todo App',
  description: 'A simple Todo example demonstrating ObjectStack Protocol',
  version: '1.0.0',
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
  ]
});
