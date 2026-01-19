import { App } from '@objectstack/spec';
import { Account } from './src/domains/crm/account.object';
import { Contact } from './src/domains/crm/contact.object';
import { Opportunity } from './src/domains/crm/opportunity.object';

export default App.create({
  name: 'crm_example',
  label: 'CRM App',
  description: 'A simple CRM example demonstrating ObjectStack Protocol',
  version: '1.0.0',
  objects: [
    Account,
    Contact,
    Opportunity
  ],
  menus: [
    {
        label: 'Sales',
        items: [
            { type: 'object', object: 'account' },
            { type: 'object', object: 'contact' },
            { type: 'object', object: 'opportunity' }
        ]
    }
  ]
});