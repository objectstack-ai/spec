"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spec_1 = require("@objectstack/spec");
const task_object_1 = require("./src/domains/todo/task.object");
exports.default = spec_1.App.create({
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
        task_object_1.TodoTask
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
