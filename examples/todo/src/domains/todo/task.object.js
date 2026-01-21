"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoTask = void 0;
const spec_1 = require("@objectstack/spec");
exports.TodoTask = spec_1.ObjectSchema.create({
    name: 'todo_task',
    label: 'Todo Task',
    icon: 'check-square',
    nameField: 'subject',
    enable: {
        apiEnabled: true,
        trackHistory: true,
    },
    fields: {
        subject: spec_1.Field.text({ required: true }),
        due_date: spec_1.Field.date(),
        is_completed: spec_1.Field.boolean({ defaultValue: false }),
        priority: spec_1.Field.rating(3, {
            label: 'Priority',
            description: 'Task priority (1-3 stars)',
        }),
        category_color: spec_1.Field.color({
            label: 'Category Color',
            colorFormat: 'hex',
            presetColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
        }),
        code_snippet: spec_1.Field.code('javascript', {
            label: 'Code Snippet',
            description: 'Optional code to implement',
            lineNumbers: true,
        }),
        notes: spec_1.Field.richtext({
            label: 'Notes',
            description: 'Rich text notes with formatting',
        }),
    },
    // actions: {
    //   // Custom button on the Record page
    //   complete: {
    //       label: 'Mark Complete',
    //       type: 'script',
    //       on: 'record',
    //       todo: 'update_record',
    //       visible: [['is_completed', '=', false]]
    //   }
    // }
});
