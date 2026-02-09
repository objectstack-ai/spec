// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Automation } from '@objectstack/spec';
type Flow = Automation.Flow;

/** Campaign Enrollment — scheduled flow to bulk enroll leads */
export const CampaignEnrollmentFlow: Flow = {
  name: 'campaign_enrollment',
  label: 'Enroll Leads in Campaign',
  description: 'Bulk enroll leads into marketing campaigns',
  type: 'schedule',

  variables: [
    { name: 'campaignId', type: 'text', isInput: true, isOutput: false },
    { name: 'leadStatus', type: 'text', isInput: true, isOutput: false },
  ],

  nodes: [
    { id: 'start', type: 'start', label: 'Start (Monday 9 AM)', config: { schedule: '0 9 * * 1' } },
    {
      id: 'get_campaign', type: 'get_record', label: 'Get Campaign',
      config: { objectName: 'campaign', filter: { id: '{campaignId}' }, outputVariable: 'campaignRecord' },
    },
    {
      id: 'query_leads', type: 'get_record', label: 'Find Eligible Leads',
      config: { objectName: 'lead', filter: { status: '{leadStatus}', is_converted: false, email: { $ne: null } }, limit: 1000, outputVariable: 'leadList' },
    },
    {
      id: 'loop_leads', type: 'loop', label: 'Process Each Lead',
      config: { collection: '{leadList}', iteratorVariable: 'currentLead' },
    },
    {
      id: 'create_campaign_member', type: 'create_record', label: 'Add to Campaign',
      config: {
        objectName: 'campaign_member',
        fields: { campaign: '{campaignId}', lead: '{currentLead.id}', status: 'sent', added_date: '{NOW()}' },
      },
    },
    {
      id: 'update_campaign_stats', type: 'update_record', label: 'Update Campaign Stats',
      config: { objectName: 'campaign', filter: { id: '{campaignId}' }, fields: { num_sent: '{leadList.length}' } },
    },
    { id: 'end', type: 'end', label: 'End' },
  ],

  edges: [
    { id: 'e1', source: 'start', target: 'get_campaign', type: 'default' },
    { id: 'e2', source: 'get_campaign', target: 'query_leads', type: 'default' },
    { id: 'e3', source: 'query_leads', target: 'loop_leads', type: 'default' },
    { id: 'e4', source: 'loop_leads', target: 'create_campaign_member', type: 'default' },
    { id: 'e5', source: 'create_campaign_member', target: 'update_campaign_stats', type: 'default' },
    { id: 'e6', source: 'update_campaign_stats', target: 'end', type: 'default' },
  ],
};
