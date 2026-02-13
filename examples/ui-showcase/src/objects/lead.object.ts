// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Lead Object Definition
 * 
 * A simplified Lead object used to demonstrate UI capabilities.
 * This object serves as the foundation for view and page examples.
 */
export const Lead = ObjectSchema.create({
  name: 'lead',
  label: 'Lead',
  pluralLabel: 'Leads',
  icon: 'user-plus',
  description: 'Potential customers not yet qualified',
  
  fields: {
    // Basic Information
    salutation: Field.select(['Mr.', 'Ms.', 'Mrs.', 'Dr.'], {
      label: 'Salutation',
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
    
    company: Field.text({
      label: 'Company',
      required: true,
      searchable: true,
    }),
    
    title: Field.text({
      label: 'Job Title',
    }),
    
    // Contact Information
    email: Field.email({
      label: 'Email',
      required: true,
      unique: true,
    }),
    
    phone: Field.text({
      label: 'Phone',
      format: 'phone',
    }),
    
    mobile: Field.text({
      label: 'Mobile',
      format: 'phone',
    }),
    
    website: Field.url({
      label: 'Website',
    }),
    
    // Lead Classification
    status: Field.select({
      label: 'Lead Status',
      required: true,
      options: [
        { label: 'New', value: 'new', color: '#808080', default: true },
        { label: 'Contacted', value: 'contacted', color: '#FFA500' },
        { label: 'Qualified', value: 'qualified', color: '#4169E1' },
        { label: 'Unqualified', value: 'unqualified', color: '#FF0000' },
      ]
    }),
    
    rating: Field.rating(5, {
      label: 'Lead Score',
      description: 'Lead quality score (1-5 stars)',
      allowHalf: true,
    }),
    
    lead_source: Field.select(['Web', 'Referral', 'Event', 'Partner', 'Advertisement'], {
      label: 'Lead Source',
    }),
    
    industry: Field.select(['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'], {
      label: 'Industry',
    }),
    
    // Financial
    annual_revenue: Field.currency({
      label: 'Annual Revenue',
      scale: 2,
    }),
    
    number_of_employees: Field.number({
      label: 'Number of Employees',
    }),
    
    // Address
    street: Field.text({
      label: 'Street',
    }),
    
    city: Field.text({
      label: 'City',
    }),
    
    state: Field.text({
      label: 'State/Province',
    }),
    
    postal_code: Field.text({
      label: 'Postal Code',
    }),
    
    country: Field.select(['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'China', 'Japan'], {
      label: 'Country',
    }),
    
    // Additional Information
    description: Field.markdown({
      label: 'Description',
    }),
    
    notes: Field.richtext({
      label: 'Notes',
      description: 'Rich text notes with formatting',
    }),
    
    // Assignment
    owner: Field.lookup('user', {
      label: 'Lead Owner',
      required: true,
    }),
    
    // Privacy
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
    feeds: true,
    activities: true,
    trash: true,
    mru: true,
  },
  
  titleFormat: '{first_name} {last_name} - {company}',
  compactLayout: ['first_name', 'last_name', 'company', 'email', 'status', 'owner'],
});
