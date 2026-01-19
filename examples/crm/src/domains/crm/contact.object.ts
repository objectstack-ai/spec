import { ObjectSchema, Field } from '@objectstack/spec';

export const Contact = ObjectSchema.create({
  name: 'contact',
  label: 'Contact',
  icon: 'user',
  fields: {
    first_name: Field.text({ required: true }),
    last_name: Field.text({ required: true }),
    email: Field.text({ format: 'email' }),
    phone: Field.text({ format: 'phone' }),
    
    // Relationship: Link to Account
    account: Field.master_detail('account', {
      label: 'Account',
      required: true,
      writeRequiresMasterRead: true
    }),
    
    title: Field.text(),
  }
});