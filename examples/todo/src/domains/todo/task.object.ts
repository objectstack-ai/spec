import { ObjectSchema, Field } from '@objectstack/spec/data';

export const TodoTask = ObjectSchema.create({
  name: 'todo_task',
  label: 'Todo Task',
  icon: 'check-square',
  titleFormat: '{subject}',
  compactLayout: ['subject', 'due_date', 'priority', 'is_completed'],
  enable: {
    apiEnabled: true,
    trackHistory: true,
    mru: true,
  },
  fields: {
    subject: Field.text({ required: true }),
    due_date: Field.date(),
    is_completed: Field.boolean({ defaultValue: false }),
    priority: Field.rating(3, { 
      label: 'Priority',
      description: 'Task priority (1-3 stars)',
    }),
    category_color: Field.color({
      label: 'Category Color',
      colorFormat: 'hex',
      presetColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    }),
    code_snippet: Field.code('javascript', {
      label: 'Code Snippet',
      description: 'Optional code to implement',
      lineNumbers: true,
    }),
    notes: Field.richtext({
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
