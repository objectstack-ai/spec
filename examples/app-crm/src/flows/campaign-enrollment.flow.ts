/** Campaign Enrollment — scheduled flow to bulk enroll leads */
export const CampaignEnrollmentFlow = {
  name: 'campaign_enrollment',
  label: 'Enroll Leads in Campaign',
  description: 'Bulk enroll leads into marketing campaigns',
  type: 'autolaunched',
  triggerType: 'scheduled',
  schedule: '0 9 * * 1', // Monday at 9am

  variables: [
    { name: 'campaignId', type: 'text', isInput: true, isOutput: false },
    { name: 'leadStatus', type: 'text', isInput: true, isOutput: false },
  ],

  steps: [
    {
      id: 'get_campaign',
      type: 'record_lookup',
      label: 'Get Campaign',
      objectName: 'campaign',
      filter: { id: '{campaignId}' },
      outputVariable: 'campaignRecord',
    },
    {
      id: 'query_leads',
      type: 'record_query',
      label: 'Find Eligible Leads',
      objectName: 'lead',
      filter: { status: '{leadStatus}', is_converted: false, email: { $ne: null } },
      limit: 1000,
      outputVariable: 'leadList',
    },
    {
      id: 'loop_leads',
      type: 'loop',
      label: 'Process Each Lead',
      collection: '{leadList}',
      itemVariable: 'currentLead',
      steps: [
        {
          id: 'create_campaign_member',
          type: 'record_create',
          label: 'Add to Campaign',
          objectName: 'campaign_member',
          fields: {
            campaign: '{campaignId}',
            lead: '{currentLead.id}',
            status: 'sent',
            added_date: '{NOW()}',
          },
        },
      ],
    },
    {
      id: 'update_campaign_stats',
      type: 'record_update',
      label: 'Update Campaign Stats',
      recordId: '{campaignId}',
      objectName: 'campaign',
      fields: { num_sent: '{leadList.length}' },
    },
  ],
};
