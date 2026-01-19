import { ObjectSchema, Field } from '@objectstack/spec';

export const Task = ObjectSchema.create({
  name: 'task',
  label: 'Task',
  icon: 'check-square',
  fields: {
    subject: Field.text({ required: true }),
    due_date: Field.date(),
    is_completed: Field.boolean({ defaultValue: false }),
    priority: Field.select(['High', 'Normal', 'Low'], { 
      defaultValue: 'Normal' 
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
