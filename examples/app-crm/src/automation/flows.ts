import type { Flow } from '@objectstack/spec/automation';

/**
 * CRM Automation Flows
 * Define business process automation flows
 */

// Lead Conversion Flow
export const LeadConversionFlow: Flow = {
  name: 'lead_conversion',
  label: 'Lead Conversion Process',
  description: 'Automated flow to convert qualified leads to accounts, contacts, and opportunities',
  type: 'screen',
  
  triggerType: 'manual',
  objectName: 'lead',
  
  variables: [
    {
      name: 'leadId',
      type: 'text',
      required: true,
    },
    {
      name: 'createOpportunity',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'opportunityName',
      type: 'text',
    },
    {
      name: 'opportunityAmount',
      type: 'currency',
    },
  ],
  
  steps: [
    {
      id: 'screen_1',
      type: 'screen',
      label: 'Conversion Details',
      
      fields: [
        {
          name: 'createOpportunity',
          label: 'Create Opportunity?',
          type: 'boolean',
          required: true,
        },
        {
          name: 'opportunityName',
          label: 'Opportunity Name',
          type: 'text',
          required: true,
          visibleWhen: '{createOpportunity} == true',
        },
        {
          name: 'opportunityAmount',
          label: 'Opportunity Amount',
          type: 'currency',
          visibleWhen: '{createOpportunity} == true',
        },
      ],
    },
    
    {
      id: 'get_lead',
      type: 'record_lookup',
      label: 'Get Lead Record',
      
      objectName: 'lead',
      filter: {
        id: '{leadId}',
      },
      outputVariable: 'leadRecord',
    },
    
    {
      id: 'create_account',
      type: 'record_create',
      label: 'Create Account',
      
      objectName: 'account',
      fields: {
        name: '{leadRecord.company}',
        phone: '{leadRecord.phone}',
        website: '{leadRecord.website}',
        industry: '{leadRecord.industry}',
        annual_revenue: '{leadRecord.annual_revenue}',
        number_of_employees: '{leadRecord.number_of_employees}',
        billing_address: '{leadRecord.address}',
        owner: '{$User.Id}',
        is_active: true,
      },
      outputVariable: 'accountId',
    },
    
    {
      id: 'create_contact',
      type: 'record_create',
      label: 'Create Contact',
      
      objectName: 'contact',
      fields: {
        first_name: '{leadRecord.first_name}',
        last_name: '{leadRecord.last_name}',
        email: '{leadRecord.email}',
        phone: '{leadRecord.phone}',
        title: '{leadRecord.title}',
        account: '{accountId}',
        is_primary: true,
        owner: '{$User.Id}',
      },
      outputVariable: 'contactId',
    },
    
    {
      id: 'decision_opportunity',
      type: 'decision',
      label: 'Create Opportunity?',
      
      condition: '{createOpportunity} == true',
      
      ifTrue: 'create_opportunity',
      ifFalse: 'mark_converted',
    },
    
    {
      id: 'create_opportunity',
      type: 'record_create',
      label: 'Create Opportunity',
      
      objectName: 'opportunity',
      fields: {
        name: '{opportunityName}',
        account: '{accountId}',
        contact: '{contactId}',
        amount: '{opportunityAmount}',
        stage: 'prospecting',
        probability: 10,
        lead_source: '{leadRecord.lead_source}',
        close_date: '{TODAY() + 90}',
        owner: '{$User.Id}',
      },
      outputVariable: 'opportunityId',
    },
    
    {
      id: 'mark_converted',
      type: 'record_update',
      label: 'Mark Lead as Converted',
      
      recordId: '{leadId}',
      objectName: 'lead',
      fields: {
        is_converted: true,
        converted_date: '{NOW()}',
        converted_account: '{accountId}',
        converted_contact: '{contactId}',
        converted_opportunity: '{opportunityId}',
      },
    },
    
    {
      id: 'send_notification',
      type: 'email_alert',
      label: 'Send Confirmation Email',
      
      template: 'lead_converted_notification',
      recipients: ['{$User.Email}'],
      variables: {
        leadName: '{leadRecord.full_name}',
        accountName: '{accountId.name}',
        contactName: '{contactId.full_name}',
      },
    },
  ],
};

// Opportunity Approval Flow
export const OpportunityApprovalFlow: Flow = {
  name: 'opportunity_approval',
  label: 'Large Deal Approval',
  description: 'Approval process for opportunities over $100K',
  type: 'autolaunched',
  
  triggerType: 'on_update',
  objectName: 'opportunity',
  criteria: 'amount > 100000 AND stage = "proposal"',
  
  variables: [
    {
      name: 'opportunityId',
      type: 'text',
      required: true,
    },
  ],
  
  steps: [
    {
      id: 'get_opportunity',
      type: 'record_lookup',
      label: 'Get Opportunity',
      
      objectName: 'opportunity',
      filter: {
        id: '{opportunityId}',
      },
      outputVariable: 'oppRecord',
    },
    
    {
      id: 'approval_step_manager',
      type: 'approval',
      label: 'Sales Manager Approval',
      
      approver: '{oppRecord.owner.manager}',
      emailTemplate: 'opportunity_approval_request',
      comments: 'required',
      
      onApprove: 'approval_step_director',
      onReject: 'notify_rejection',
    },
    
    {
      id: 'approval_step_director',
      type: 'approval',
      label: 'Sales Director Approval',
      
      approver: '{oppRecord.owner.manager.manager}',
      emailTemplate: 'opportunity_approval_request',
      
      onApprove: 'mark_approved',
      onReject: 'notify_rejection',
    },
    
    {
      id: 'mark_approved',
      type: 'record_update',
      label: 'Mark as Approved',
      
      recordId: '{opportunityId}',
      objectName: 'opportunity',
      fields: {
        approval_status: 'approved',
        approved_date: '{NOW()}',
      },
      nextStep: 'notify_approval',
    },
    
    {
      id: 'notify_approval',
      type: 'email_alert',
      label: 'Send Approval Notification',
      
      template: 'opportunity_approved',
      recipients: ['{oppRecord.owner}'],
    },
    
    {
      id: 'notify_rejection',
      type: 'email_alert',
      label: 'Send Rejection Notification',
      
      template: 'opportunity_rejected',
      recipients: ['{oppRecord.owner}'],
    },
  ],
};

// Case Escalation Flow
export const CaseEscalationFlow: Flow = {
  name: 'case_escalation',
  label: 'Case Escalation Process',
  description: 'Automatically escalate high-priority cases',
  type: 'autolaunched',
  
  triggerType: 'on_create',
  objectName: 'case',
  criteria: 'priority = "critical" OR (priority = "high" AND account.type = "customer")',
  
  variables: [
    {
      name: 'caseId',
      type: 'text',
      required: true,
    },
  ],
  
  steps: [
    {
      id: 'get_case',
      type: 'record_lookup',
      label: 'Get Case Record',
      
      objectName: 'case',
      filter: {
        id: '{caseId}',
      },
      outputVariable: 'caseRecord',
    },
    
    {
      id: 'assign_senior_agent',
      type: 'record_update',
      label: 'Assign to Senior Agent',
      
      recordId: '{caseId}',
      objectName: 'case',
      fields: {
        owner: '{caseRecord.owner.manager}',
        is_escalated: true,
        escalated_date: '{NOW()}',
      },
    },
    
    {
      id: 'create_task',
      type: 'record_create',
      label: 'Create Follow-up Task',
      
      objectName: 'task',
      fields: {
        subject: 'Follow up on escalated case: {caseRecord.case_number}',
        related_to: '{caseId}',
        owner: '{caseRecord.owner}',
        priority: 'high',
        status: 'not_started',
        due_date: '{TODAY() + 1}',
      },
    },
    
    {
      id: 'notify_team',
      type: 'email_alert',
      label: 'Notify Support Team',
      
      template: 'case_escalated',
      recipients: [
        '{caseRecord.owner}',
        '{caseRecord.owner.manager}',
        'support-team@example.com',
      ],
      variables: {
        caseNumber: '{caseRecord.case_number}',
        priority: '{caseRecord.priority}',
        accountName: '{caseRecord.account.name}',
      },
    },
  ],
};

// Quote Generation Flow
export const QuoteGenerationFlow: Flow = {
  name: 'quote_generation',
  label: 'Generate Quote from Opportunity',
  description: 'Create a quote based on opportunity details',
  type: 'screen',
  
  triggerType: 'manual',
  objectName: 'opportunity',
  
  variables: [
    {
      name: 'opportunityId',
      type: 'text',
      required: true,
    },
    {
      name: 'quoteName',
      type: 'text',
    },
    {
      name: 'expirationDays',
      type: 'number',
      defaultValue: 30,
    },
    {
      name: 'discount',
      type: 'percent',
      defaultValue: 0,
    },
  ],
  
  steps: [
    {
      id: 'screen_1',
      type: 'screen',
      label: 'Quote Details',
      
      fields: [
        {
          name: 'quoteName',
          label: 'Quote Name',
          type: 'text',
          required: true,
        },
        {
          name: 'expirationDays',
          label: 'Valid For (Days)',
          type: 'number',
          required: true,
          defaultValue: 30,
        },
        {
          name: 'discount',
          label: 'Discount %',
          type: 'percent',
          defaultValue: 0,
        },
      ],
    },
    
    {
      id: 'get_opportunity',
      type: 'record_lookup',
      label: 'Get Opportunity',
      
      objectName: 'opportunity',
      filter: {
        id: '{opportunityId}',
      },
      outputVariable: 'oppRecord',
    },
    
    {
      id: 'create_quote',
      type: 'record_create',
      label: 'Create Quote',
      
      objectName: 'quote',
      fields: {
        name: '{quoteName}',
        opportunity: '{opportunityId}',
        account: '{oppRecord.account}',
        contact: '{oppRecord.contact}',
        owner: '{$User.Id}',
        status: 'draft',
        quote_date: '{TODAY()}',
        expiration_date: '{TODAY() + expirationDays}',
        subtotal: '{oppRecord.amount}',
        discount: '{discount}',
        discount_amount: '{oppRecord.amount * (discount / 100)}',
        total_price: '{oppRecord.amount * (1 - discount / 100)}',
        payment_terms: 'net_30',
      },
      outputVariable: 'quoteId',
    },
    
    {
      id: 'update_opportunity',
      type: 'record_update',
      label: 'Update Opportunity',
      
      recordId: '{opportunityId}',
      objectName: 'opportunity',
      fields: {
        stage: 'proposal',
        last_activity_date: '{TODAY()}',
      },
    },
    
    {
      id: 'notify_owner',
      type: 'email_alert',
      label: 'Send Notification',
      
      template: 'quote_created',
      recipients: ['{$User.Email}'],
      variables: {
        quoteName: '{quoteName}',
        quoteId: '{quoteId}',
      },
    },
  ],
};

// Campaign Member Enrollment Flow
export const CampaignEnrollmentFlow: Flow = {
  name: 'campaign_enrollment',
  label: 'Enroll Leads in Campaign',
  description: 'Bulk enroll leads into marketing campaigns',
  type: 'autolaunched',
  
  triggerType: 'scheduled',
  schedule: '0 9 * * 1', // Monday at 9am
  
  variables: [
    {
      name: 'campaignId',
      type: 'text',
      required: true,
    },
    {
      name: 'leadStatus',
      type: 'text',
      defaultValue: 'new',
    },
  ],
  
  steps: [
    {
      id: 'get_campaign',
      type: 'record_lookup',
      label: 'Get Campaign',
      
      objectName: 'campaign',
      filter: {
        id: '{campaignId}',
      },
      outputVariable: 'campaignRecord',
    },
    
    {
      id: 'query_leads',
      type: 'record_query',
      label: 'Find Eligible Leads',
      
      objectName: 'lead',
      filter: {
        status: '{leadStatus}',
        is_converted: false,
        email: { $ne: null },
      },
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
      fields: {
        num_sent: '{leadList.length}',
      },
    },
  ],
};

export const CrmFlows = {
  LeadConversionFlow,
  OpportunityApprovalFlow,
  CaseEscalationFlow,
  QuoteGenerationFlow,
  CampaignEnrollmentFlow,
};
