import { ObjectSchema, Field } from '@objectstack/spec';

export const Lead = ObjectSchema.create({
  name: 'lead',
  label: 'Lead',
  pluralLabel: 'Leads',
  icon: 'user-plus',
  description: 'Potential customers not yet qualified',
  
  fields: {
    // Personal Information
    salutation: Field.select({
      label: 'Salutation',
      options: [
        { label: 'Mr.', value: 'mr' },
        { label: 'Ms.', value: 'ms' },
        { label: 'Mrs.', value: 'mrs' },
        { label: 'Dr.', value: 'dr' },
      ]
    }),
    
    first_name: Field.text({
      label: 'First Name',
      required: true,
      searchable: true,
    }),
    
    last_name: Field.text({
      label: 'Last Name',
      required: true,
      searchable: true,
    }),
    
    full_name: Field.formula({
      label: 'Full Name',
      expression: 'CONCAT(salutation, " ", first_name, " ", last_name)',
    }),
    
    // Company Information
    company: Field.text({
      label: 'Company',
      required: true,
      searchable: true,
    }),
    
    title: Field.text({
      label: 'Job Title',
    }),
    
    industry: Field.select({
      label: 'Industry',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Finance', value: 'finance' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Retail', value: 'retail' },
        { label: 'Manufacturing', value: 'manufacturing' },
        { label: 'Education', value: 'education' },
      ]
    }),
    
    // Contact Information
    email: Field.email({
      label: 'Email',
      required: true,
      unique: true,
    }),
    
    phone: Field.phone({
      label: 'Phone',
    }),
    
    mobile: Field.phone({
      label: 'Mobile',
    }),
    
    website: Field.url({
      label: 'Website',
    }),
    
    // Lead Qualification
    status: Field.select({
      label: 'Lead Status',
      required: true,
      options: [
        { label: 'New', value: 'new', color: '#808080', default: true },
        { label: 'Contacted', value: 'contacted', color: '#FFA500' },
        { label: 'Qualified', value: 'qualified', color: '#4169E1' },
        { label: 'Unqualified', value: 'unqualified', color: '#FF0000' },
        { label: 'Converted', value: 'converted', color: '#00AA00' },
      ]
    }),
    
    rating: Field.select({
      label: 'Rating',
      options: [
        { label: 'Hot', value: 'hot', color: '#FF0000' },
        { label: 'Warm', value: 'warm', color: '#FFA500' },
        { label: 'Cold', value: 'cold', color: '#4169E1' },
      ]
    }),
    
    lead_source: Field.select({
      label: 'Lead Source',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Referral', value: 'referral' },
        { label: 'Event', value: 'event' },
        { label: 'Partner', value: 'partner' },
        { label: 'Advertisement', value: 'advertisement' },
        { label: 'Cold Call', value: 'cold_call' },
      ]
    }),
    
    // Assignment
    owner: Field.lookup('user', {
      label: 'Lead Owner',
      required: true,
    }),
    
    // Conversion tracking
    is_converted: Field.boolean({
      label: 'Converted',
      defaultValue: false,
      readonly: true,
    }),
    
    converted_account: Field.lookup('account', {
      label: 'Converted Account',
      readonly: true,
    }),
    
    converted_contact: Field.lookup('contact', {
      label: 'Converted Contact',
      readonly: true,
    }),
    
    converted_opportunity: Field.lookup('opportunity', {
      label: 'Converted Opportunity',
      readonly: true,
    }),
    
    converted_date: Field.datetime({
      label: 'Converted Date',
      readonly: true,
    }),
    
    // Address
    street: Field.textarea({ label: 'Street' }),
    city: Field.text({ label: 'City' }),
    state: Field.text({ label: 'State/Province' }),
    postal_code: Field.text({ label: 'Postal Code' }),
    country: Field.text({ label: 'Country' }),
    
    // Additional Info
    annual_revenue: Field.currency({
      label: 'Annual Revenue',
      scale: 2,
    }),
    
    number_of_employees: Field.number({
      label: 'Number of Employees',
    }),
    
    description: Field.markdown({
      label: 'Description',
    }),
    
    // Flags
    do_not_call: Field.boolean({
      label: 'Do Not Call',
      defaultValue: false,
    }),
    
    email_opt_out: Field.boolean({
      label: 'Email Opt Out',
      defaultValue: false,
    }),
  },
  
  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    files: true,
    feedEnabled: true,
    trash: true,
  },
  
  nameField: 'full_name',
  
  list_views: {
    all: {
      label: 'All Leads',
      type: 'grid',
      columns: ['full_name', 'company', 'email', 'phone', 'status', 'rating', 'owner'],
      sort: [{ field: 'last_name', order: 'asc' }],
      searchableFields: ['first_name', 'last_name', 'company', 'email'],
    },
    my_leads: {
      label: 'My Leads',
      type: 'grid',
      columns: ['full_name', 'company', 'email', 'phone', 'status', 'rating'],
      filter: [['owner', '=', '{current_user}']],
    },
    new_leads: {
      label: 'New Leads',
      type: 'grid',
      columns: ['full_name', 'company', 'email', 'phone', 'lead_source', 'owner'],
      filter: [['status', '=', 'new']],
      sort: [{ field: 'created_date', order: 'desc' }],
    },
    hot_leads: {
      label: 'Hot Leads',
      type: 'grid',
      columns: ['full_name', 'company', 'email', 'phone', 'status', 'owner'],
      filter: [
        ['rating', '=', 'hot'],
        ['is_converted', '=', false],
      ],
    },
    by_status: {
      label: 'Leads by Status',
      type: 'kanban',
      columns: ['full_name', 'company', 'email', 'rating'],
      filter: [['is_converted', '=', false]],
      kanban: {
        groupByField: 'status',
        columns: ['full_name', 'company', 'email', 'phone', 'rating'],
      }
    },
  },
  
  form_views: {
    default: {
      type: 'simple',
      sections: [
        {
          label: 'Lead Information',
          columns: 2,
          fields: ['salutation', 'first_name', 'last_name', 'full_name', 'company', 'title', 'owner'],
        },
        {
          label: 'Contact Information',
          columns: 2,
          fields: ['email', 'phone', 'mobile', 'website'],
        },
        {
          label: 'Lead Details',
          columns: 2,
          fields: ['status', 'rating', 'lead_source', 'industry', 'annual_revenue', 'number_of_employees'],
        },
        {
          label: 'Address',
          columns: 2,
          fields: ['street', 'city', 'state', 'postal_code', 'country'],
        },
        {
          label: 'Additional Information',
          columns: 2,
          collapsible: true,
          fields: ['do_not_call', 'email_opt_out', 'description'],
        },
        {
          label: 'Conversion Information',
          columns: 2,
          collapsible: true,
          collapsed: true,
          fields: ['is_converted', 'converted_account', 'converted_contact', 'converted_opportunity', 'converted_date'],
        }
      ]
    }
  },
  
  validations: [
    {
      name: 'email_required',
      type: 'script',
      severity: 'error',
      message: 'Email is required',
      condition: 'ISBLANK(email)',
    },
    {
      name: 'cannot_edit_converted',
      type: 'script',
      severity: 'error',
      message: 'Cannot edit a converted lead',
      condition: 'is_converted = true AND ISCHANGED(company, email, first_name, last_name)',
    },
  ],
  
  workflows: [
    {
      name: 'auto_qualify_hot_leads',
      objectName: 'lead',
      triggerType: 'on_create_or_update',
      criteria: 'rating = "hot" AND status = "new"',
      active: true,
      actions: [
        {
          name: 'set_status',
          type: 'field_update',
          field: 'status',
          value: 'contacted',
        }
      ],
    },
    {
      name: 'notify_owner_on_hot_lead',
      objectName: 'lead',
      triggerType: 'on_create_or_update',
      criteria: 'ISCHANGED(rating) AND rating = "hot"',
      active: true,
      actions: [
        {
          name: 'email_owner',
          type: 'email_alert',
          template: 'hot_lead_notification',
          recipients: ['{owner.email}'],
        }
      ],
    }
  ],
});
