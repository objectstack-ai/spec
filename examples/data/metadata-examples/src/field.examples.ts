// @ts-nocheck
import { Field } from '@objectstack/spec/data';

/**
 * Field Examples - Demonstrating ObjectStack Data Protocol
 * 
 * Fields are the atomic building blocks of data models, defining data types,
 * constraints, relationships, and validation rules.
 * Inspired by Salesforce Fields and ServiceNow Dictionary.
 */

// ============================================================================
// TEXT FIELDS
// ============================================================================

/**
 * Example 1: Basic Text Field
 * Simple single-line text input
 * Use Case: Names, titles, short descriptions
 */
export const BasicTextField: Field = {
  name: 'company_name',
  label: 'Company Name',
  type: 'text',
  required: true,
  maxLength: 255,
  searchable: true,
};

/**
 * Example 2: Textarea Field
 * Multi-line text input for longer content
 * Use Case: Descriptions, notes, comments
 */
export const TextareaField: Field = {
  name: 'description',
  label: 'Description',
  type: 'textarea',
  maxLength: 5000,
  description: 'Detailed description of the item',
};

/**
 * Example 3: Email Field
 * Email address with built-in validation
 * Use Case: Contact information
 */
export const EmailField: Field = {
  name: 'email',
  label: 'Email Address',
  type: 'email',
  required: true,
  unique: true,
  searchable: true,
  index: true,
};

/**
 * Example 4: URL Field
 * Website URL with validation
 * Use Case: Links, references
 */
export const UrlField: Field = {
  name: 'website',
  label: 'Website',
  type: 'url',
  description: 'Company website URL',
};

/**
 * Example 5: Phone Field
 * Phone number with formatting
 * Use Case: Contact information
 */
export const PhoneField: Field = {
  name: 'phone',
  label: 'Phone Number',
  type: 'phone',
  searchable: true,
};

/**
 * Example 6: Password Field
 * Encrypted password storage
 * Use Case: User authentication
 */
export const PasswordField: Field = {
  name: 'password',
  label: 'Password',
  type: 'password',
  required: true,
  encryption: true,
  hidden: true,
};

// ============================================================================
// RICH CONTENT FIELDS
// ============================================================================

/**
 * Example 7: Markdown Field
 * Markdown-formatted text with preview
 * Use Case: Documentation, articles, blog posts
 */
export const MarkdownField: Field = {
  name: 'content',
  label: 'Content',
  type: 'markdown',
  description: 'Article content in Markdown format',
};

/**
 * Example 8: HTML Field
 * Raw HTML content
 * Use Case: Email templates, web content
 */
export const HtmlField: Field = {
  name: 'email_template',
  label: 'Email Template',
  type: 'html',
  description: 'HTML email template',
};

/**
 * Example 9: Rich Text Field
 * WYSIWYG editor with formatting
 * Use Case: Blog posts, articles, formatted content
 */
export const RichTextField: Field = {
  name: 'article_body',
  label: 'Article Body',
  type: 'richtext',
  required: true,
};

// ============================================================================
// NUMBER FIELDS
// ============================================================================

/**
 * Example 10: Number Field
 * Integer or decimal number
 * Use Case: Quantities, counts, measurements
 */
export const NumberField: Field = {
  name: 'quantity',
  label: 'Quantity',
  type: 'number',
  min: 0,
  max: 999999,
  defaultValue: 1,
};

/**
 * Example 11: Currency Field
 * Monetary values with precision
 * Use Case: Prices, amounts, financial data
 */
export const CurrencyField: Field = {
  name: 'amount',
  label: 'Amount',
  type: 'currency',
  required: true,
  currencyConfig: {
    precision: 2,
    currencyMode: 'dynamic',
    defaultCurrency: 'USD',
  },
};

/**
 * Example 12: Percent Field
 * Percentage values
 * Use Case: Rates, discounts, probabilities
 */
export const PercentField: Field = {
  name: 'discount_rate',
  label: 'Discount Rate',
  type: 'percent',
  min: 0,
  max: 100,
  scale: 2,
};

// ============================================================================
// DATE & TIME FIELDS
// ============================================================================

/**
 * Example 13: Date Field
 * Date without time
 * Use Case: Birthdate, due date, start date
 */
export const DateField: Field = {
  name: 'due_date',
  label: 'Due Date',
  type: 'date',
  required: true,
};

/**
 * Example 14: DateTime Field
 * Date with time
 * Use Case: Timestamps, appointments, events
 */
export const DateTimeField: Field = {
  name: 'created_at',
  label: 'Created At',
  type: 'datetime',
  readonly: true,
};

/**
 * Example 15: Time Field
 * Time without date
 * Use Case: Business hours, schedules
 */
export const TimeField: Field = {
  name: 'business_hours_start',
  label: 'Business Hours Start',
  type: 'time',
};

// ============================================================================
// BOOLEAN FIELDS
// ============================================================================

/**
 * Example 16: Boolean Field
 * True/false checkbox
 * Use Case: Flags, toggles, status
 */
export const BooleanField: Field = {
  name: 'is_active',
  label: 'Active',
  type: 'boolean',
  defaultValue: true,
  index: true,
};

// ============================================================================
// SELECT FIELDS
// ============================================================================

/**
 * Example 17: Select Field (Single Choice)
 * Dropdown with predefined options
 * Use Case: Status, category, priority
 */
export const SelectField: Field = {
  name: 'status',
  label: 'Status',
  type: 'select',
  required: true,
  options: [
    { label: 'Draft', value: 'draft', color: '#888888', default: true },
    { label: 'In Progress', value: 'in_progress', color: '#0066CC' },
    { label: 'Completed', value: 'completed', color: '#00AA00' },
    { label: 'Cancelled', value: 'cancelled', color: '#CC0000' },
  ],
};

/**
 * Example 18: Multi-Select Field
 * Multiple choice selection
 * Use Case: Tags, categories, skills
 */
export const MultiSelectField: Field = {
  name: 'tags',
  label: 'Tags',
  type: 'select',
  multiple: true,
  options: [
    { label: 'Important', value: 'important', color: '#FF0000' },
    { label: 'Urgent', value: 'urgent', color: '#FFA500' },
    { label: 'Follow-up', value: 'follow_up', color: '#0066CC' },
    { label: 'Review', value: 'review', color: '#9966CC' },
  ],
};

// ============================================================================
// RELATIONSHIP FIELDS
// ============================================================================

/**
 * Example 19: Lookup Field (Optional Relationship)
 * Reference to another object (nullable)
 * Use Case: Optional parent, category, owner
 */
export const LookupField: Field = {
  name: 'account_id',
  label: 'Account',
  type: 'lookup',
  reference: 'account',
  deleteBehavior: 'set_null',
  referenceFilters: ['is_active = true'],
};

/**
 * Example 20: Master-Detail Field (Required Relationship)
 * Tight parent-child relationship
 * Use Case: Order items, contact to account
 */
export const MasterDetailField: Field = {
  name: 'opportunity_id',
  label: 'Opportunity',
  type: 'master_detail',
  reference: 'opportunity',
  required: true,
  deleteBehavior: 'cascade',
  writeRequiresMasterRead: true,
};

/**
 * Example 21: Multi-Lookup Field
 * Many-to-many relationship
 * Use Case: Skills, projects, team members
 */
export const MultiLookupField: Field = {
  name: 'project_ids',
  label: 'Projects',
  type: 'lookup',
  reference: 'project',
  multiple: true,
  deleteBehavior: 'set_null',
};

// ============================================================================
// MEDIA FIELDS
// ============================================================================

/**
 * Example 22: Image Field
 * Image upload and storage
 * Use Case: Product photos, profile pictures
 */
export const ImageField: Field = {
  name: 'product_image',
  label: 'Product Image',
  type: 'image',
  description: 'Main product image',
};

/**
 * Example 23: Multiple Images Field
 * Image gallery
 * Use Case: Product gallery, portfolio
 */
export const ImageGalleryField: Field = {
  name: 'gallery_images',
  label: 'Gallery',
  type: 'image',
  multiple: true,
};

/**
 * Example 24: File Field
 * File upload
 * Use Case: Documents, attachments
 */
export const FileField: Field = {
  name: 'attachment',
  label: 'Attachment',
  type: 'file',
};

/**
 * Example 25: Avatar Field
 * User profile picture
 * Use Case: User avatars, contact photos
 */
export const AvatarField: Field = {
  name: 'avatar',
  label: 'Avatar',
  type: 'avatar',
};

// ============================================================================
// CALCULATED FIELDS
// ============================================================================

/**
 * Example 26: Formula Field
 * Calculated field using expression
 * Use Case: Computed values, derived data
 */
export const FormulaField: Field = {
  name: 'total_amount',
  label: 'Total Amount',
  type: 'formula',
  expression: 'quantity * unit_price',
  readonly: true,
};

/**
 * Example 27: Summary Field (Roll-up)
 * Aggregate from related records
 * Use Case: Order total, team size
 */
export const SummaryField: Field = {
  name: 'total_opportunities',
  label: 'Total Opportunities',
  type: 'summary',
  summaryOperations: {
    object: 'opportunity',
    field: 'amount',
    function: 'sum',
  },
  readonly: true,
};

/**
 * Example 28: Auto Number Field
 * Sequential number generation
 * Use Case: Invoice numbers, ticket IDs
 */
export const AutoNumberField: Field = {
  name: 'invoice_number',
  label: 'Invoice Number',
  type: 'autonumber',
  readonly: true,
};

// ============================================================================
// ENHANCED FIELDS
// ============================================================================

/**
 * Example 29: Location Field
 * GPS coordinates
 * Use Case: Store locations, delivery addresses
 */
export const LocationField: Field = {
  name: 'store_location',
  label: 'Store Location',
  type: 'location',
  displayMap: true,
  allowGeocoding: true,
};

/**
 * Example 30: Address Field
 * Structured address
 * Use Case: Shipping, billing, office locations
 */
export const AddressField: Field = {
  name: 'billing_address',
  label: 'Billing Address',
  type: 'address',
  addressFormat: 'us',
  required: true,
};

/**
 * Example 31: Code Field
 * Code editor with syntax highlighting
 * Use Case: Configuration, scripts, JSON
 */
export const CodeField: Field = {
  name: 'custom_script',
  label: 'Custom Script',
  type: 'code',
  language: 'javascript',
  theme: 'dark',
  lineNumbers: true,
};

/**
 * Example 32: Color Field
 * Color picker
 * Use Case: Branding, theming, categories
 */
export const ColorField: Field = {
  name: 'brand_color',
  label: 'Brand Color',
  type: 'color',
  colorFormat: 'hex',
  presetColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
};

/**
 * Example 33: Rating Field
 * Star rating system
 * Use Case: Reviews, feedback, quality scores
 */
export const RatingField: Field = {
  name: 'customer_rating',
  label: 'Customer Rating',
  type: 'rating',
  maxRating: 5,
  allowHalf: true,
};

/**
 * Example 34: Slider Field
 * Numeric slider input
 * Use Case: Priority, satisfaction, volume
 */
export const SliderField: Field = {
  name: 'priority_level',
  label: 'Priority Level',
  type: 'slider',
  min: 0,
  max: 100,
  step: 10,
  showValue: true,
  marks: {
    '0': 'Low',
    '50': 'Medium',
    '100': 'High',
  },
};

/**
 * Example 35: Signature Field
 * Digital signature capture
 * Use Case: Approvals, contracts, agreements
 */
export const SignatureField: Field = {
  name: 'customer_signature',
  label: 'Customer Signature',
  type: 'signature',
  required: true,
};

/**
 * Example 36: QR Code Field
 * QR code generation and scanning
 * Use Case: Tickets, inventory, tracking
 */
export const QrCodeField: Field = {
  name: 'ticket_code',
  label: 'Ticket Code',
  type: 'qrcode',
  barcodeFormat: 'qr',
  qrErrorCorrection: 'M',
  displayValue: true,
  allowScanning: true,
};
