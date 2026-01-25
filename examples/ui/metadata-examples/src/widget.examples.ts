// @ts-nocheck
import { FieldWidgetProps } from '@objectstack/spec/ui';

/**
 * Widget Examples - Demonstrating ObjectStack Field Widget Protocol
 * 
 * Field Widgets define custom UI components for field rendering and editing.
 * This file shows example props configurations that widgets receive.
 * 
 * Note: These are TypeScript type examples showing the contract.
 * Actual widget implementations would be React/Vue/etc. components.
 */

// ============================================================================
// TEXT FIELD WIDGETS
// ============================================================================

/**
 * Example 1: Basic Text Field Widget Props
 * Simple string input field
 * Use Case: Name, title, description fields
 */
export const BasicTextFieldProps: FieldWidgetProps = {
  value: 'John Doe',
  onChange: (newValue: string) => console.log('Updated to:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'full_name',
    label: 'Full Name',
    type: 'text',
    maxLength: 100,
  },
  record: {
    id: '12345',
    full_name: 'John Doe',
    email: 'john@example.com',
  },
};

/**
 * Example 2: Email Field Widget Props
 * Email input with validation
 * Use Case: Email addresses with format validation
 */
export const EmailFieldProps: FieldWidgetProps = {
  value: 'user@example.com',
  onChange: (newValue: string) => console.log('Email changed:', newValue),
  readonly: false,
  required: true,
  error: 'Please enter a valid email address',
  field: {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    unique: true,
  },
  record: { email: 'user@example.com' },
};

/**
 * Example 3: Rich Text Editor Widget Props
 * WYSIWYG editor for formatted content
 * Use Case: Descriptions, notes, HTML content
 */
export const RichTextEditorProps: FieldWidgetProps = {
  value: '<p>This is <strong>rich</strong> text content</p>',
  onChange: (newValue: string) => console.log('Rich text updated'),
  readonly: false,
  required: false,
  field: {
    name: 'description',
    label: 'Description',
    type: 'richtext',
  },
  options: {
    toolbar: ['bold', 'italic', 'underline', 'link', 'image'],
    minHeight: 200,
  },
};

// ============================================================================
// NUMBER FIELD WIDGETS
// ============================================================================

/**
 * Example 4: Currency Field Widget Props
 * Number field formatted as currency
 * Use Case: Prices, revenue, financial amounts
 */
export const CurrencyFieldProps: FieldWidgetProps = {
  value: 125000.50,
  onChange: (newValue: number) => console.log('Amount changed:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'amount',
    label: 'Deal Amount',
    type: 'currency',
    precision: 2,
  },
  options: {
    currency: 'USD',
    locale: 'en-US',
    displayStyle: 'symbol', // $125,000.50
  },
};

/**
 * Example 5: Percentage Field Widget Props
 * Number field displayed as percentage
 * Use Case: Probability, discount, completion rate
 */
export const PercentageFieldProps: FieldWidgetProps = {
  value: 75,
  onChange: (newValue: number) => console.log('Percentage:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'probability',
    label: 'Win Probability',
    type: 'percent',
    min: 0,
    max: 100,
  },
  options: {
    showSlider: true,
    step: 5,
  },
};

// ============================================================================
// DATE/TIME WIDGETS
// ============================================================================

/**
 * Example 6: Date Picker Widget Props
 * Date selection field
 * Use Case: Due dates, birthdays, close dates
 */
export const DatePickerProps: FieldWidgetProps = {
  value: '2024-12-31',
  onChange: (newValue: string) => console.log('Date selected:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'close_date',
    label: 'Expected Close Date',
    type: 'date',
  },
  options: {
    minDate: '2024-01-01',
    maxDate: '2025-12-31',
    disableWeekends: false,
  },
};

/**
 * Example 7: Date-Time Picker Widget Props
 * Date and time selection
 * Use Case: Appointments, events, timestamps
 */
export const DateTimePickerProps: FieldWidgetProps = {
  value: '2024-06-15T14:30:00Z',
  onChange: (newValue: string) => console.log('DateTime:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'meeting_time',
    label: 'Meeting Time',
    type: 'datetime',
  },
  options: {
    timeZone: 'America/New_York',
    format24Hour: false,
    minuteStep: 15,
  },
};

// ============================================================================
// SELECTION WIDGETS
// ============================================================================

/**
 * Example 8: Dropdown Select Widget Props
 * Single selection from options
 * Use Case: Status, priority, category
 */
export const DropdownSelectProps: FieldWidgetProps = {
  value: 'high',
  onChange: (newValue: string) => console.log('Selected:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
};

/**
 * Example 9: Multi-Select Widget Props
 * Multiple selection from options
 * Use Case: Tags, skills, interests
 */
export const MultiSelectProps: FieldWidgetProps = {
  value: ['javascript', 'typescript', 'react'],
  onChange: (newValue: string[]) => console.log('Selected:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'skills',
    label: 'Skills',
    type: 'multiselect',
    options: [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
    ],
  },
  options: {
    maxSelections: 5,
    searchable: true,
  },
};

/**
 * Example 10: Lookup/Reference Field Widget Props
 * Reference to another object
 * Use Case: Account on Contact, Parent Account, Related To
 */
export const LookupFieldProps: FieldWidgetProps = {
  value: 'acc_12345',
  onChange: (newValue: string) => console.log('Lookup changed:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'account_id',
    label: 'Account',
    type: 'lookup',
    reference: 'account',
    displayField: 'name',
  },
  options: {
    searchFields: ['name', 'email', 'phone'],
    recentItems: true,
    createNew: true,
  },
  record: {
    account_id: 'acc_12345',
    account_name: 'Acme Corporation',
  },
};

// ============================================================================
// BOOLEAN WIDGETS
// ============================================================================

/**
 * Example 11: Checkbox Widget Props
 * Boolean true/false field
 * Use Case: Active/Inactive, Opt-in, Flags
 */
export const CheckboxProps: FieldWidgetProps = {
  value: true,
  onChange: (newValue: boolean) => console.log('Checkbox:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'is_active',
    label: 'Active',
    type: 'boolean',
  },
};

/**
 * Example 12: Toggle Switch Widget Props
 * Boolean field styled as toggle
 * Use Case: Enable/Disable features, preferences
 */
export const ToggleSwitchProps: FieldWidgetProps = {
  value: false,
  onChange: (newValue: boolean) => console.log('Toggle:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'email_notifications',
    label: 'Email Notifications',
    type: 'boolean',
  },
  options: {
    onLabel: 'Enabled',
    offLabel: 'Disabled',
    size: 'medium',
  },
};

// ============================================================================
// FILE UPLOAD WIDGETS
// ============================================================================

/**
 * Example 13: File Upload Widget Props
 * Single file upload
 * Use Case: Documents, attachments, images
 */
export const FileUploadProps: FieldWidgetProps = {
  value: {
    name: 'contract.pdf',
    size: 245678,
    url: 'https://storage.example.com/files/contract.pdf',
  },
  onChange: (newValue: any) => console.log('File uploaded:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'contract_file',
    label: 'Contract Document',
    type: 'file',
  },
  options: {
    maxSize: 10485760, // 10MB
    accept: '.pdf,.doc,.docx',
    uploadUrl: '/api/upload',
  },
};

/**
 * Example 14: Image Upload Widget Props
 * Image file with preview
 * Use Case: Profile pictures, product images
 */
export const ImageUploadProps: FieldWidgetProps = {
  value: {
    url: 'https://storage.example.com/images/profile.jpg',
    thumbnail: 'https://storage.example.com/images/profile_thumb.jpg',
  },
  onChange: (newValue: any) => console.log('Image uploaded:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'profile_image',
    label: 'Profile Picture',
    type: 'image',
  },
  options: {
    maxSize: 5242880, // 5MB
    accept: 'image/*',
    cropAspectRatio: 1, // Square
    showPreview: true,
  },
};

// ============================================================================
// ADVANCED WIDGETS
// ============================================================================

/**
 * Example 15: Address Field Widget Props
 * Composite address field
 * Use Case: Billing address, shipping address
 */
export const AddressFieldProps: FieldWidgetProps = {
  value: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'USA',
  },
  onChange: (newValue: any) => console.log('Address updated:', newValue),
  readonly: false,
  required: true,
  field: {
    name: 'billing_address',
    label: 'Billing Address',
    type: 'address',
  },
  options: {
    autocomplete: true,
    validateAddress: true,
    countries: ['USA', 'Canada', 'Mexico'],
  },
};

/**
 * Example 16: JSON Editor Widget Props
 * Structured JSON data editing
 * Use Case: Metadata, configuration, custom data
 */
export const JsonEditorProps: FieldWidgetProps = {
  value: {
    customSettings: {
      theme: 'dark',
      notifications: true,
      apiKey: 'abc123',
    },
  },
  onChange: (newValue: any) => console.log('JSON updated:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'custom_settings',
    label: 'Custom Settings',
    type: 'json',
  },
  options: {
    mode: 'tree', // or 'code'
    indentSize: 2,
    validateSchema: true,
  },
};

/**
 * Example 17: Color Picker Widget Props
 * Color selection field
 * Use Case: Themes, branding, UI customization
 */
export const ColorPickerProps: FieldWidgetProps = {
  value: '#3B82F6',
  onChange: (newValue: string) => console.log('Color selected:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'brand_color',
    label: 'Brand Color',
    type: 'color',
  },
  options: {
    format: 'hex', // or 'rgb', 'hsl'
    showAlpha: false,
    presetColors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
  },
};

/**
 * Example 18: Rating Widget Props
 * Star or numeric rating field
 * Use Case: Reviews, feedback, satisfaction scores
 */
export const RatingWidgetProps: FieldWidgetProps = {
  value: 4,
  onChange: (newValue: number) => console.log('Rating:', newValue),
  readonly: false,
  required: false,
  field: {
    name: 'satisfaction_rating',
    label: 'Customer Satisfaction',
    type: 'rating',
    min: 1,
    max: 5,
  },
  options: {
    icon: 'star',
    allowHalf: true,
    showLabel: true,
  },
};

/**
 * Example 19: Readonly Display Widget Props
 * Read-only computed field display
 * Use Case: Formula fields, system fields, calculated values
 */
export const ReadonlyDisplayProps: FieldWidgetProps = {
  value: '$125,000.50',
  onChange: () => {}, // No-op for readonly
  readonly: true,
  required: false,
  field: {
    name: 'annual_revenue',
    label: 'Annual Revenue',
    type: 'currency',
    formula: 'monthly_revenue * 12',
  },
  record: {
    monthly_revenue: 10416.71,
    annual_revenue: 125000.52,
  },
};

/**
 * Example 20: Widget with Validation Error
 * Field widget displaying validation error
 * Use Case: Form validation, error handling
 */
export const WidgetWithErrorProps: FieldWidgetProps = {
  value: 'invalid-email',
  onChange: (newValue: string) => console.log('Value:', newValue),
  readonly: false,
  required: true,
  error: 'Please enter a valid email address in the format: user@domain.com',
  field: {
    name: 'email',
    label: 'Email',
    type: 'email',
  },
};
