// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineInterface } from '@objectstack/spec/ui';

/**
 * Lead Review Interface
 * Sequential lead qualification and assignment workflow
 */
export const LeadReviewInterface = defineInterface({
  name: 'lead_review',
  label: 'Lead Review',
  description: 'Review and qualify incoming leads',
  icon: 'clipboard-check',
  group: 'Sales Cloud',
  object: 'lead',
  
  pages: [
    {
      name: 'page_review_queue',
      label: 'Review Queue',
      type: 'record_review',
      icon: 'check-square',
      object: 'lead',
      recordReview: {
        object: 'lead',
        filter: { status: 'new' },
        sort: [{ field: 'created_at', order: 'desc' }],
        displayFields: ['company', 'title', 'email', 'phone', 'source'],
        actions: [
          { 
            label: 'Qualify', 
            type: 'approve', 
            field: 'status', 
            value: 'qualified',
            nextRecord: true,
          },
          { 
            label: 'Disqualify', 
            type: 'reject', 
            field: 'status', 
            value: 'disqualified',
            nextRecord: true,
          },
          { 
            label: 'Skip', 
            type: 'skip',
            nextRecord: true,
          },
        ],
        navigation: 'sequential',
        showProgress: true,
      },
      regions: [],
    },
    {
      name: 'page_qualified',
      label: 'Qualified Leads',
      type: 'grid',
      icon: 'check-circle',
      object: 'lead',
      regions: [],
    },
  ],
  
  homePageName: 'page_review_queue',
  assignedRoles: ['sales_manager', 'lead_qualifier'],
});
