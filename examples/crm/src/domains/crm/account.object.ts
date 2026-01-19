import { ObjectSchema, Field } from '@objectstack/spec';

export const Account = ObjectSchema.create({
  name: 'account',
  label: 'Account',
  icon: 'building',
  fields: {
    name: Field.text({ 
      label: 'Account Name', 
      required: true, 
      searchable: true 
    }),
    type: Field.select([
        'Prospect', 
        'Customer', 
        'Partner'
    ]),
    industry: Field.select([
        'Technology', 
        'Finance', 
        'Healthcare', 
        'Retail'
    ]),
    annual_revenue: Field.currency({ scale: 2 }),
    website: Field.url(),
    owner: Field.lookup('user'),
  },
  list_views: {
    all: {
      label: 'All Accounts',
      columns: ['name', 'type', 'industry', 'annual_revenue', 'owner']
    },
    my_accounts: {
      label: 'My Accounts',
      columns: ['name', 'type', 'industry'],
      filters: [['owner', '=', '{current_user}']]
    }
  }
});