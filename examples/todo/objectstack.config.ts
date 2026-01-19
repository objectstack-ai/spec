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
  menus: [
    {
        label: 'Tasks',
        items: [
            { type: 'object', object: 'todo_task' }
        ]
    }
  ]
});
