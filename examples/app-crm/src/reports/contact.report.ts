// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ReportInput } from '@objectstack/spec/ui';

export const ContactsByAccountReport: ReportInput = {
  name: 'contacts_by_account',
  label: 'Contacts by Account',
  description: 'List of contacts grouped by account',
  objectName: 'contact',
  type: 'summary',
  columns: [
    { field: 'full_name', label: 'Name' },
    { field: 'title', label: 'Title' },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone' },
    { field: 'is_primary', label: 'Primary Contact' },
  ],
  groupingsDown: [{ field: 'account', sortOrder: 'asc' }],
};
