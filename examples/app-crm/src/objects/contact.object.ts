// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectSchema, Field } from '@objectstack/spec/data';

export const Contact = ObjectSchema.create({
  name: 'contact',
  label: 'Contact',
  pluralLabel: 'Contacts',
  icon: 'user',
  description: 'People associated with accounts',
  
  fields: {
    // Name fields
    salutation: Field.select(['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'], {
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
    
    // Formula field - Full name
    full_name: Field.formula({
      label: 'Full Name',
      expression: 'CONCAT(salutation, " ", first_name, " ", last_name)',
    }),
    
    // Relationship: Link to Account (Master-Detail)
    account: Field.masterDetail('account', {
      label: 'Account',
      required: true,
      writeRequiresMasterRead: true,
      deleteBehavior: 'cascade',  // Delete contacts when account is deleted
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
    
    // Professional Information
    title: Field.text({
      label: 'Job Title',
    }),
    
    department: Field.select(['Executive', 'Sales', 'Marketing', 'Engineering', 'Support', 'Finance', 'HR', 'Operations'], {
      label: 'Department',
    }),
    
    // Relationship fields
    reports_to: Field.lookup('contact', {
      label: 'Reports To',
      description: 'Direct manager/supervisor',
    }),
    
    owner: Field.lookup('user', {
      label: 'Contact Owner',
      required: true,
    }),
    
    // Mailing Address
    mailing_street: Field.textarea({ label: 'Mailing Street' }),
    mailing_city: Field.text({ label: 'Mailing City' }),
    mailing_state: Field.text({ label: 'Mailing State/Province' }),
    mailing_postal_code: Field.text({ label: 'Mailing Postal Code' }),
    mailing_country: Field.text({ label: 'Mailing Country' }),
    
    // Additional Information
    birthdate: Field.date({
      label: 'Birthdate',
    }),
    
    lead_source: Field.select(['Web', 'Referral', 'Event', 'Partner', 'Advertisement'], {
      label: 'Lead Source',
    }),
    
    description: Field.markdown({
      label: 'Description',
    }),
    
    // Flags
    is_primary: Field.boolean({
      label: 'Primary Contact',
      defaultValue: false,
      description: 'Is this the main contact for the account?',
    }),
    
    do_not_call: Field.boolean({
      label: 'Do Not Call',
      defaultValue: false,
    }),
    
    email_opt_out: Field.boolean({
      label: 'Email Opt Out',
      defaultValue: false,
    }),
    
    // Avatar field
    avatar: Field.avatar({
      label: 'Profile Picture',
    }),
  },
  
  // Enable features
  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    files: true,
    feeds: true,            // Enable social feed, comments, and mentions
    activities: true,       // Enable tasks and events tracking
    trash: true,
    mru: true,              // Track Most Recently Used
  },
  
  // Display configuration
  titleFormat: '{full_name}',
  compactLayout: ['full_name', 'email', 'account', 'phone'],
  
  // Validation Rules
  validations: [
    {
      name: 'email_required_for_opt_in',
      type: 'script',
      severity: 'error',
      message: 'Email is required when Email Opt Out is not checked',
      condition: 'email_opt_out = false AND ISBLANK(email)',
    },
    {
      name: 'email_unique_per_account',
      type: 'unique',
      severity: 'error',
      message: 'Email must be unique within an account',
      fields: ['email', 'account'],
      caseSensitive: false,
    },
  ],
  
  // Workflow Rules
  workflows: [
    {
      name: 'welcome_email',
      objectName: 'contact',
      triggerType: 'on_create',
      active: true,
      actions: [
        {
          name: 'send_welcome',
          type: 'email_alert',
          template: 'contact_welcome',
          recipients: ['{contact.email}'],
        }
      ],
    }
  ],
});