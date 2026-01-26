import { z } from 'zod';
import { ExtensionsMapSchema } from '../system/extension.zod';

/**
 * Field Type Enum
 */
export const FieldType = z.enum([
  // Core Text
  'text', 'textarea', 'email', 'url', 'phone', 'password',
  // Rich Content
  'markdown', 'html', 'richtext',
  // Numbers
  'number', 'currency', 'percent', 
  // Date & Time
  'date', 'datetime', 'time',
  // Logic
  'boolean',
  // Selection
  'select', // Static options
  // Relational
  'lookup', 'master_detail', // Dynamic reference to other objects
  // Media
  'image', 'file', 'avatar',
  // Calculated / System
  'formula', 'summary', 'autonumber',
  // Enhanced Types
  'location', // GPS coordinates (aka geolocation)
  'geolocation', // Alternative name for location field
  'address', // Structured address
  'code', // Code with syntax highlighting
  'color', // Color picker
  'rating', // Star rating
  'slider', // Numeric slider
  'signature', // Digital signature
  'qrcode', // QR code / Barcode
]);

export type FieldType = z.infer<typeof FieldType>;

/**
 * Select Option Schema
 */
export const SelectOptionSchema = z.object({
  label: z.string().describe('Display label'),
  value: z.string().describe('Stored value'),
  color: z.string().optional().describe('Color code for badges/charts'),
  default: z.boolean().optional().describe('Is default option'),
});

/**
 * Location Coordinates Schema
 * GPS coordinates for location field type
 */
export const LocationCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
  longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
  altitude: z.number().optional().describe('Altitude in meters'),
  accuracy: z.number().optional().describe('Accuracy in meters'),
});

/**
 * Currency Configuration Schema
 * Configuration for currency field type supporting multi-currency
 * 
 * Note: Currency codes are validated by length only (3 characters) to support:
 * - Standard ISO 4217 codes (USD, EUR, CNY, etc.)
 * - Cryptocurrency codes (BTC, ETH, etc.)
 * - Custom business-specific codes
 * Stricter validation can be implemented at the application layer based on business requirements.
 */
export const CurrencyConfigSchema = z.object({
  precision: z.number().int().min(0).max(10).default(2).describe('Decimal precision (default: 2)'),
  currencyMode: z.enum(['dynamic', 'fixed']).default('dynamic').describe('Currency mode: dynamic (user selectable) or fixed (single currency)'),
  defaultCurrency: z.string().length(3).default('CNY').describe('Default or fixed currency code (ISO 4217, e.g., USD, CNY, EUR)'),
});

/**
 * Currency Value Schema
 * Runtime value structure for currency fields
 * 
 * Note: Currency codes are validated by length only (3 characters) to support flexibility.
 * See CurrencyConfigSchema for details on currency code validation strategy.
 */
export const CurrencyValueSchema = z.object({
  value: z.number().describe('Monetary amount'),
  currency: z.string().length(3).describe('Currency code (ISO 4217)'),
});

/**
 * Address Schema
 * Structured address for address field type
 */
export const AddressSchema = z.object({
  street: z.string().optional().describe('Street address'),
  city: z.string().optional().describe('City name'),
  state: z.string().optional().describe('State/Province'),
  postalCode: z.string().optional().describe('Postal/ZIP code'),
  country: z.string().optional().describe('Country name or code'),
  countryCode: z.string().optional().describe('ISO country code (e.g., US, GB)'),
  formatted: z.string().optional().describe('Formatted address string'),
});

/**
 * Field Schema - Best Practice Enterprise Pattern
 */
export const FieldSchema = z.object({
  /** Identity */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)').optional(),
  label: z.string().optional().describe('Human readable label'),
  type: FieldType.describe('Field Data Type'),
  description: z.string().optional().describe('Tooltip/Help text'),
  format: z.string().optional().describe('Format string (e.g. email, phone)'),

  /** Database Constraints */
  required: z.boolean().default(false).describe('Is required'),
  searchable: z.boolean().default(false).describe('Is searchable'),
  multiple: z.boolean().default(false).describe('Allow multiple values (Stores as Array/JSON). Applicable for select, lookup, file, image.'),
  unique: z.boolean().default(false).describe('Is unique constraint'),
  defaultValue: z.any().optional().describe('Default value'),
  
  /** Text/String Constraints */
  maxLength: z.number().optional().describe('Max character length'),
  minLength: z.number().optional().describe('Min character length'),
  
  /** Number Constraints */
  precision: z.number().optional().describe('Total digits'),
  scale: z.number().optional().describe('Decimal places'),
  min: z.number().optional().describe('Minimum value'),
  max: z.number().optional().describe('Maximum value'),

  /** Selection Options */
  options: z.array(SelectOptionSchema).optional().describe('Static options for select/multiselect'),

  /** Relationship Config */
  reference: z.string().optional().describe('Target Object Name'),
  referenceFilters: z.array(z.string()).optional().describe('Filters applied to lookup dialogs (e.g. "active = true")'),
  writeRequiresMasterRead: z.boolean().optional().describe('If true, user needs read access to master record to edit this field'),
  deleteBehavior: z.enum(['set_null', 'cascade', 'restrict']).optional().default('set_null').describe('What happens if referenced record is deleted'),

  /** Calculation */
  expression: z.string().optional().describe('Formula expression'),
  formula: z.string().optional().describe('Deprecated: Use expression'),
  summaryOperations: z.object({
    object: z.string(),
    field: z.string(),
    function: z.enum(['count', 'sum', 'min', 'max', 'avg'])
  }).optional().describe('Roll-up summary definition'),

  /** Enhanced Field Type Configurations */
  // Code field config
  language: z.string().optional().describe('Programming language for syntax highlighting (e.g., javascript, python, sql)'),
  theme: z.string().optional().describe('Code editor theme (e.g., dark, light, monokai)'),
  lineNumbers: z.boolean().optional().describe('Show line numbers in code editor'),
  
  // Rating field config
  maxRating: z.number().optional().describe('Maximum rating value (default: 5)'),
  allowHalf: z.boolean().optional().describe('Allow half-star ratings'),
  
  // Location field config
  displayMap: z.boolean().optional().describe('Display map widget for location field'),
  allowGeocoding: z.boolean().optional().describe('Allow address-to-coordinate conversion'),
  
  // Address field config
  addressFormat: z.enum(['us', 'uk', 'international']).optional().describe('Address format template'),
  
  // Color field config
  colorFormat: z.enum(['hex', 'rgb', 'rgba', 'hsl']).optional().describe('Color value format'),
  allowAlpha: z.boolean().optional().describe('Allow transparency/alpha channel'),
  presetColors: z.array(z.string()).optional().describe('Preset color options'),
  
  // Slider field config
  step: z.number().optional().describe('Step increment for slider (default: 1)'),
  showValue: z.boolean().optional().describe('Display current value on slider'),
  marks: z.record(z.string()).optional().describe('Custom marks/labels at specific values (e.g., {0: "Low", 50: "Medium", 100: "High"})'),
  
  // QR Code / Barcode field config
  // Note: qrErrorCorrection is only applicable when barcodeFormat='qr'
  // Runtime validation should enforce this constraint
  barcodeFormat: z.enum(['qr', 'ean13', 'ean8', 'code128', 'code39', 'upca', 'upce']).optional().describe('Barcode format type'),
  qrErrorCorrection: z.enum(['L', 'M', 'Q', 'H']).optional().describe('QR code error correction level (L=7%, M=15%, Q=25%, H=30%). Only applicable when barcodeFormat is "qr"'),
  displayValue: z.boolean().optional().describe('Display human-readable value below barcode/QR code'),
  allowScanning: z.boolean().optional().describe('Enable camera scanning for barcode/QR code input'),

  // Currency field config
  currencyConfig: CurrencyConfigSchema.optional().describe('Configuration for currency field type'),

  /** Security & Visibility */
  hidden: z.boolean().default(false).describe('Hidden from default UI'),
  readonly: z.boolean().default(false).describe('Read-only in UI'),
  encryption: z.boolean().default(false).describe('Encrypt at rest'),
  
  /** Indexing */
  index: z.boolean().default(false).describe('Create standard database index'),
  externalId: z.boolean().default(false).describe('Is external ID for upsert operations'),

  /**
   * Extensions
   * 
   * Custom extension properties from plugins and modules.
   * Use namespaced keys (e.g., 'ai_assistant.vectorIndexed', 'crm_sync.salesforceField').
   * 
   * @example
   * {
   *   'ai_assistant.vectorIndexed': true,
   *   'ai_assistant.embeddingModel': 'text-embedding-3-small',
   *   'ai_assistant.chunkSize': 512
   * }
   */
  extensions: ExtensionsMapSchema,
});

export type Field = z.infer<typeof FieldSchema>;
export type SelectOption = z.infer<typeof SelectOptionSchema>;
export type LocationCoordinates = z.infer<typeof LocationCoordinatesSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type CurrencyConfig = z.infer<typeof CurrencyConfigSchema>;
export type CurrencyValue = z.infer<typeof CurrencyValueSchema>;

/**
 * Field Factory Helper
 */
export type FieldInput = Omit<Partial<Field>, 'type'>;

export const Field = {
  text: (config: FieldInput = {}) => ({ type: 'text', ...config } as const),
  textarea: (config: FieldInput = {}) => ({ type: 'textarea', ...config } as const),
  number: (config: FieldInput = {}) => ({ type: 'number', ...config } as const),
  boolean: (config: FieldInput = {}) => ({ type: 'boolean', ...config } as const),
  date: (config: FieldInput = {}) => ({ type: 'date', ...config } as const),
  datetime: (config: FieldInput = {}) => ({ type: 'datetime', ...config } as const),
  currency: (config: FieldInput = {}) => ({ type: 'currency', ...config } as const),
  percent: (config: FieldInput = {}) => ({ type: 'percent', ...config } as const),
  url: (config: FieldInput = {}) => ({ type: 'url', ...config } as const),
  email: (config: FieldInput = {}) => ({ type: 'email', ...config } as const),
  phone: (config: FieldInput = {}) => ({ type: 'phone', ...config } as const),
  image: (config: FieldInput = {}) => ({ type: 'image', ...config } as const),
  file: (config: FieldInput = {}) => ({ type: 'file', ...config } as const),
  avatar: (config: FieldInput = {}) => ({ type: 'avatar', ...config } as const),
  formula: (config: FieldInput = {}) => ({ type: 'formula', ...config } as const),
  summary: (config: FieldInput = {}) => ({ type: 'summary', ...config } as const),
  autonumber: (config: FieldInput = {}) => ({ type: 'autonumber', ...config } as const),
  markdown: (config: FieldInput = {}) => ({ type: 'markdown', ...config } as const),
  html: (config: FieldInput = {}) => ({ type: 'html', ...config } as const),
  password: (config: FieldInput = {}) => ({ type: 'password', ...config } as const),
  
  /**
   * Select field helper with backward-compatible API
   * 
   * @example Old API (array first)
   * Field.select(['High', 'Low'], { label: 'Priority' })
   * 
   * @example New API (config object)
   * Field.select({ options: [{label: 'High', value: 'high'}], label: 'Priority' })
   */
  select: (optionsOrConfig: SelectOption[] | string[] | FieldInput & { options: SelectOption[] | string[] }, config?: FieldInput) => {
    // Support both old and new signatures:
    // Old: Field.select(['a', 'b'], { label: 'X' })
    // New: Field.select({ options: [{label: 'A', value: 'a'}], label: 'X' })
    let options: SelectOption[];
    let finalConfig: FieldInput;
    
    if (Array.isArray(optionsOrConfig)) {
      // Old signature: array as first param
      options = optionsOrConfig.map(o => typeof o === 'string' ? { label: o, value: o } : o);
      finalConfig = config || {};
    } else {
      // New signature: config object with options
      options = (optionsOrConfig.options || []).map(o => typeof o === 'string' ? { label: o, value: o } : o);
      // Remove options from config to avoid confusion
      const { options: _, ...restConfig } = optionsOrConfig;
      finalConfig = restConfig;
    }
    
    return { type: 'select', options, ...finalConfig } as const;
  },

  
  lookup: (reference: string, config: FieldInput = {}) => ({ 
    type: 'lookup', 
    reference, 
    ...config 
  } as const),
  
  masterDetail: (reference: string, config: FieldInput = {}) => ({ 
    type: 'master_detail', 
    reference, 
    ...config 
  } as const),

  // Enhanced Field Type Helpers
  location: (config: FieldInput = {}) => ({ 
    type: 'location', 
    ...config 
  } as const),
  
  address: (config: FieldInput = {}) => ({ 
    type: 'address', 
    ...config 
  } as const),
  
  richtext: (config: FieldInput = {}) => ({ 
    type: 'richtext', 
    ...config 
  } as const),
  
  code: (language?: string, config: FieldInput = {}) => ({ 
    type: 'code', 
    language,
    ...config 
  } as const),
  
  color: (config: FieldInput = {}) => ({ 
    type: 'color', 
    ...config 
  } as const),
  
  rating: (maxRating: number = 5, config: FieldInput = {}) => ({ 
    type: 'rating', 
    maxRating,
    ...config 
  } as const),
  
  signature: (config: FieldInput = {}) => ({ 
    type: 'signature', 
    ...config 
  } as const),
  
  slider: (config: FieldInput = {}) => ({ 
    type: 'slider', 
    ...config 
  } as const),
  
  qrcode: (config: FieldInput = {}) => ({ 
    type: 'qrcode', 
    ...config 
  } as const),
  
  geolocation: (config: FieldInput = {}) => ({ 
    type: 'geolocation', 
    ...config 
  } as const),
};
