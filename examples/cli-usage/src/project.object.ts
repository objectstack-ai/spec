import { ObjectSchema, Field } from '@objectstack/spec/data';

export const Project = ObjectSchema.create({
  name: 'cli_project',
  label: 'CLI Project',
  icon: 'briefcase',
  fields: {
    name: Field.text({ required: true, label: 'Project Name' }),
    status: Field.select(['Planned', 'In Progress', 'Completed'], { defaultValue: 'Planned' }),
    description: Field.textarea()
  }
});
