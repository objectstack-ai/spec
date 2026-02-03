import { z } from 'zod';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * INPUT COMPONENTS PROTOCOL
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive specification for input components in enterprise management software.
 * Designed for both desktop and mobile, following industry best practices from
 * Salesforce Lightning, ServiceNow, Material Design, and Ant Design.
 * 
 * **Design Principles:**
 * - Mobile-first responsive design
 * - Accessibility (WCAG 2.1 AA)
 * - Touch-friendly (minimum 44px tap targets)
 * - Progressive enhancement
 * - Consistent validation patterns
 */

// ══════════════════════════════════════════════════════════════════════════════
// 1. TEXT INPUT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Text Input Props
 * Single-line text input with validation
 */
export const TextInputPropsSchema = z.object({
  placeholder: z.string().optional().describe('Placeholder text'),
  maxLength: z.number().int().positive().optional().describe('Maximum character length'),
  minLength: z.number().int().positive().optional().describe('Minimum character length'),
  pattern: z.string().optional().describe('Regex validation pattern'),
  autocomplete: z.enum(['off', 'on', 'name', 'email', 'username', 'tel', 'url']).optional().describe('Browser autocomplete hint'),
  prefix: z.string().optional().describe('Text/icon prefix (e.g., "$", "@")'),
  suffix: z.string().optional().describe('Text/icon suffix (e.g., "kg", search icon)'),
  clearable: z.boolean().default(false).describe('Show clear button when has value'),
  showCount: z.boolean().default(false).describe('Show character count'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Input size'),
});

/**
 * Textarea Props
 * Multi-line text input with auto-resize
 */
export const TextareaPropsSchema = z.object({
  placeholder: z.string().optional().describe('Placeholder text'),
  rows: z.number().int().positive().default(3).describe('Initial number of rows'),
  maxRows: z.number().int().positive().optional().describe('Maximum rows before scroll'),
  autoResize: z.boolean().default(true).describe('Auto-resize based on content'),
  maxLength: z.number().int().positive().optional().describe('Maximum character length'),
  showCount: z.boolean().default(true).describe('Show character count'),
  resizable: z.enum(['none', 'vertical', 'horizontal', 'both']).default('vertical').describe('Resize handle'),
});

/**
 * Rich Text Editor Props
 * WYSIWYG editor for formatted content
 */
export const RichTextEditorPropsSchema = z.object({
  toolbar: z.array(z.enum([
    'bold', 'italic', 'underline', 'strike',
    'heading1', 'heading2', 'heading3',
    'bulletList', 'orderedList', 'checklist',
    'blockquote', 'codeBlock', 'link', 'image',
    'table', 'undo', 'redo', 'clear'
  ])).optional().describe('Available toolbar buttons'),
  minHeight: z.string().optional().describe('Minimum editor height (e.g., "200px")'),
  maxHeight: z.string().optional().describe('Maximum editor height'),
  placeholder: z.string().optional().describe('Placeholder text'),
  uploadImage: z.boolean().default(false).describe('Enable image upload'),
  uploadUrl: z.string().url().optional().describe('Image upload endpoint'),
  mentions: z.boolean().default(false).describe('Enable @mentions'),
  emoji: z.boolean().default(false).describe('Enable emoji picker'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. NUMBER INPUT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Number Input Props
 * Numeric input with increment/decrement controls
 */
export const NumberInputPropsSchema = z.object({
  min: z.number().optional().describe('Minimum value'),
  max: z.number().optional().describe('Maximum value'),
  step: z.number().optional().default(1).describe('Increment/decrement step'),
  precision: z.number().int().nonnegative().optional().describe('Decimal places'),
  showControls: z.boolean().default(true).describe('Show +/- buttons'),
  controlsPosition: z.enum(['right', 'sides']).default('right').describe('Position of controls'),
  prefix: z.string().optional().describe('Prefix (e.g., "$")'),
  suffix: z.string().optional().describe('Suffix (e.g., "%")'),
  formatter: z.enum(['number', 'currency', 'percentage', 'custom']).optional().describe('Number formatting'),
  locale: z.string().optional().describe('Locale for number formatting (e.g., "en-US")'),
});

/**
 * Currency Input Props
 * Specialized number input for monetary values
 */
export const CurrencyInputPropsSchema = z.object({
  currency: z.string().default('USD').describe('Currency code (ISO 4217)'),
  locale: z.string().default('en-US').describe('Locale for formatting'),
  min: z.number().optional().describe('Minimum value'),
  max: z.number().optional().describe('Maximum value'),
  allowNegative: z.boolean().default(false).describe('Allow negative values'),
  showCurrencySymbol: z.boolean().default(true).describe('Display currency symbol'),
  symbolPosition: z.enum(['prefix', 'suffix']).default('prefix').describe('Currency symbol position'),
});

/**
 * Slider Props
 * Visual range selector
 */
export const SliderPropsSchema = z.object({
  min: z.number().default(0).describe('Minimum value'),
  max: z.number().default(100).describe('Maximum value'),
  step: z.number().default(1).describe('Increment step'),
  marks: z.record(z.string(), z.string()).optional().describe('Label marks at specific values'),
  range: z.boolean().default(false).describe('Enable range selection (two handles)'),
  vertical: z.boolean().default(false).describe('Vertical orientation'),
  showTooltip: z.boolean().default(true).describe('Show value tooltip on hover'),
  tooltipPlacement: z.enum(['top', 'bottom', 'left', 'right']).default('top').describe('Tooltip position'),
});

/**
 * Rating Input Props
 * Star rating or similar visual rating
 */
export const RatingInputPropsSchema = z.object({
  max: z.number().int().positive().default(5).describe('Maximum rating value'),
  allowHalf: z.boolean().default(false).describe('Allow half-star ratings'),
  icon: z.enum(['star', 'heart', 'thumb']).default('star').describe('Rating icon'),
  character: z.string().optional().describe('Custom character instead of icon'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Icon size'),
  showText: z.boolean().default(false).describe('Show rating text (e.g., "4 out of 5")'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. DATE/TIME INPUT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Date Picker Props
 * Calendar-based date selection
 */
export const DatePickerPropsSchema = z.object({
  format: z.string().default('YYYY-MM-DD').describe('Date format display'),
  minDate: z.string().optional().describe('Minimum selectable date (ISO 8601)'),
  maxDate: z.string().optional().describe('Maximum selectable date (ISO 8601)'),
  disabledDates: z.array(z.string()).optional().describe('Array of disabled dates'),
  disabledDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional().describe('Disabled weekdays (0=Sunday)'),
  showToday: z.boolean().default(true).describe('Highlight today'),
  showWeekNumbers: z.boolean().default(false).describe('Show week numbers'),
  firstDayOfWeek: z.number().int().min(0).max(6).default(0).describe('First day of week (0=Sunday)'),
  shortcuts: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional().describe('Quick selection shortcuts (e.g., "Today", "Last 7 days")'),
});

/**
 * DateTime Picker Props
 * Combined date and time selection
 */
export const DateTimePickerPropsSchema = DatePickerPropsSchema.extend({
  timeFormat: z.string().default('HH:mm').describe('Time format (24h or 12h)'),
  use12Hours: z.boolean().default(false).describe('Use 12-hour format'),
  minuteStep: z.number().int().positive().default(1).describe('Minute increment step'),
  showSecond: z.boolean().default(false).describe('Show seconds selector'),
});

/**
 * Time Picker Props
 * Time-only selection
 */
export const TimePickerPropsSchema = z.object({
  format: z.string().default('HH:mm').describe('Time format'),
  use12Hours: z.boolean().default(false).describe('Use 12-hour format'),
  minuteStep: z.number().int().positive().default(1).describe('Minute increment step'),
  hourStep: z.number().int().positive().default(1).describe('Hour increment step'),
  showSecond: z.boolean().default(false).describe('Show seconds selector'),
  disabledHours: z.array(z.number().int().min(0).max(23)).optional().describe('Disabled hours'),
  disabledMinutes: z.array(z.number().int().min(0).max(59)).optional().describe('Disabled minutes'),
});

/**
 * Date Range Picker Props
 * Select a date range (start and end)
 */
export const DateRangePickerPropsSchema = z.object({
  format: z.string().default('YYYY-MM-DD').describe('Date format display'),
  separator: z.string().default('~').describe('Separator between dates'),
  minDate: z.string().optional().describe('Minimum selectable date'),
  maxDate: z.string().optional().describe('Maximum selectable date'),
  maxRange: z.number().int().positive().optional().describe('Maximum days in range'),
  presets: z.array(z.object({
    label: z.string(),
    range: z.tuple([z.string(), z.string()]),
  })).optional().describe('Preset ranges (e.g., "Last 7 days", "This month")'),
  showWeekNumbers: z.boolean().default(false).describe('Show week numbers'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. SELECT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Select Option Schema
 */
export const SelectOptionSchema = z.object({
  label: z.string().describe('Display label'),
  value: z.string().describe('Option value'),
  disabled: z.boolean().optional().describe('Disable this option'),
  icon: z.string().optional().describe('Icon name'),
  description: z.string().optional().describe('Option description/subtitle'),
  group: z.string().optional().describe('Option group'),
});

/**
 * Select Props
 * Dropdown single/multi selection
 */
export const SelectPropsSchema = z.object({
  options: z.array(SelectOptionSchema).describe('Available options'),
  multiple: z.boolean().default(false).describe('Allow multiple selection'),
  searchable: z.boolean().default(false).describe('Enable search/filter'),
  clearable: z.boolean().default(false).describe('Show clear button'),
  placeholder: z.string().optional().describe('Placeholder text'),
  maxTagCount: z.number().int().positive().optional().describe('Max displayed tags (multi-select)'),
  maxTagPlaceholder: z.string().optional().describe('Placeholder for hidden tags (e.g., "+3 more")'),
  loading: z.boolean().default(false).describe('Show loading state'),
  loadingText: z.string().optional().describe('Loading message'),
  notFoundContent: z.string().optional().describe('No results message'),
  showSearch: z.boolean().default(false).describe('Show search input'),
  filterOption: z.enum(['label', 'value', 'both']).default('label').describe('Filter by field'),
  virtual: z.boolean().default(false).describe('Enable virtual scrolling (for large lists)'),
});

/**
 * Autocomplete Props
 * Text input with suggestions
 */
export const AutocompletePropsSchema = z.object({
  options: z.array(SelectOptionSchema).describe('Suggestion options'),
  minChars: z.number().int().nonnegative().default(1).describe('Minimum characters to trigger'),
  maxSuggestions: z.number().int().positive().default(10).describe('Maximum suggestions to show'),
  placeholder: z.string().optional().describe('Placeholder text'),
  freeSolo: z.boolean().default(false).describe('Allow custom values not in options'),
  clearable: z.boolean().default(false).describe('Show clear button'),
  autoSelect: z.boolean().default(false).describe('Auto-select first option on Enter'),
  openOnFocus: z.boolean().default(false).describe('Open dropdown on focus'),
  filterOption: z.enum(['startsWith', 'includes', 'fuzzy']).default('includes').describe('Filter matching mode'),
});

/**
 * Tag Input Props
 * Create and manage tags
 */
export const TagInputPropsSchema = z.object({
  placeholder: z.string().optional().describe('Placeholder text'),
  maxTags: z.number().int().positive().optional().describe('Maximum allowed tags'),
  allowDuplicates: z.boolean().default(false).describe('Allow duplicate tags'),
  suggestions: z.array(z.string()).optional().describe('Tag suggestions'),
  separators: z.array(z.string()).default([',']).describe('Characters that create tags (e.g., [",", "Enter"])'),
  validate: z.string().optional().describe('Validation pattern for tags'),
  caseSensitive: z.boolean().default(false).describe('Case-sensitive tag matching'),
});

/**
 * Cascader Props
 * Hierarchical selection (cascading dropdown)
 */
export const CascaderOptionSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    label: z.string(),
    value: z.string(),
    disabled: z.boolean().optional(),
    children: z.array(CascaderOptionSchema).optional(),
  })
);

export const CascaderPropsSchema = z.object({
  options: z.array(CascaderOptionSchema).describe('Hierarchical options'),
  placeholder: z.string().optional().describe('Placeholder text'),
  expandTrigger: z.enum(['click', 'hover']).default('click').describe('How to expand nodes'),
  changeOnSelect: z.boolean().default(false).describe('Allow selecting parent nodes'),
  showSearch: z.boolean().default(false).describe('Enable search'),
  displayRender: z.enum(['slash', 'arrow']).default('slash').describe('Display format (e.g., "China / Beijing")'),
  multiple: z.boolean().default(false).describe('Allow multiple selection'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. BOOLEAN INPUT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Checkbox Props
 * Single checkbox or checkbox group
 */
export const CheckboxPropsSchema = z.object({
  indeterminate: z.boolean().default(false).describe('Indeterminate state (partially checked)'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Checkbox size'),
  labelPosition: z.enum(['left', 'right']).default('right').describe('Label position'),
});

/**
 * Checkbox Group Props
 * Multiple checkboxes
 */
export const CheckboxGroupPropsSchema = z.object({
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    disabled: z.boolean().optional(),
  })).describe('Checkbox options'),
  layout: z.enum(['horizontal', 'vertical']).default('vertical').describe('Layout direction'),
  columns: z.number().int().positive().optional().describe('Number of columns for grid layout'),
});

/**
 * Switch Props
 * Toggle switch
 */
export const SwitchPropsSchema = z.object({
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Switch size'),
  checkedLabel: z.string().optional().describe('Label when checked'),
  uncheckedLabel: z.string().optional().describe('Label when unchecked'),
  checkedIcon: z.string().optional().describe('Icon when checked'),
  uncheckedIcon: z.string().optional().describe('Icon when unchecked'),
  loading: z.boolean().default(false).describe('Show loading state'),
});

/**
 * Radio Group Props
 * Mutually exclusive options
 */
export const RadioGroupPropsSchema = z.object({
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    disabled: z.boolean().optional(),
    description: z.string().optional(),
  })).describe('Radio options'),
  layout: z.enum(['horizontal', 'vertical']).default('vertical').describe('Layout direction'),
  buttonStyle: z.enum(['outline', 'solid']).default('outline').describe('Button-style radios'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Radio size'),
});

/**
 * Toggle Button Group Props
 * Visual toggle between options (like iOS segmented control)
 */
export const ToggleButtonGroupPropsSchema = z.object({
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    icon: z.string().optional(),
    disabled: z.boolean().optional(),
  })).describe('Toggle options'),
  multiple: z.boolean().default(false).describe('Allow multiple selection'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Button size'),
  fullWidth: z.boolean().default(false).describe('Fill container width'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. FILE UPLOAD COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * File Upload Props
 * File selection and upload
 */
export const FileUploadPropsSchema = z.object({
  accept: z.string().optional().describe('Accepted file types (MIME or extensions)'),
  multiple: z.boolean().default(false).describe('Allow multiple files'),
  maxSize: z.number().int().positive().optional().describe('Max file size in bytes'),
  maxFiles: z.number().int().positive().optional().describe('Maximum number of files'),
  dragDrop: z.boolean().default(true).describe('Enable drag-and-drop'),
  showFileList: z.boolean().default(true).describe('Show uploaded file list'),
  listType: z.enum(['text', 'picture', 'picture-card']).default('text').describe('File list display style'),
  uploadUrl: z.string().url().optional().describe('Upload endpoint URL'),
  uploadMethod: z.enum(['POST', 'PUT']).default('POST').describe('HTTP method for upload'),
  uploadHeaders: z.record(z.string(), z.string()).optional().describe('Custom headers for upload'),
  autoUpload: z.boolean().default(true).describe('Upload immediately after selection'),
  showProgress: z.boolean().default(true).describe('Show upload progress'),
  allowRemove: z.boolean().default(true).describe('Allow removing files'),
  allowPreview: z.boolean().default(true).describe('Allow file preview'),
});

/**
 * Image Upload Props
 * Specialized image upload with preview and crop
 */
export const ImageUploadPropsSchema = z.object({
  accept: z.string().default('image/*').describe('Accepted image types'),
  multiple: z.boolean().default(false).describe('Allow multiple images'),
  maxSize: z.number().int().positive().default(5242880).describe('Max file size (default 5MB)'),
  maxFiles: z.number().int().positive().optional().describe('Maximum number of images'),
  showPreview: z.boolean().default(true).describe('Show image preview'),
  crop: z.boolean().default(false).describe('Enable image cropping'),
  cropAspectRatio: z.number().positive().optional().describe('Crop aspect ratio (width/height)'),
  cropShape: z.enum(['rect', 'round']).default('rect').describe('Crop shape'),
  minWidth: z.number().int().positive().optional().describe('Minimum image width'),
  minHeight: z.number().int().positive().optional().describe('Minimum image height'),
  maxWidth: z.number().int().positive().optional().describe('Maximum image width'),
  maxHeight: z.number().int().positive().optional().describe('Maximum image height'),
  uploadUrl: z.string().url().optional().describe('Upload endpoint URL'),
  autoUpload: z.boolean().default(true).describe('Upload immediately after selection'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. ADVANCED INPUT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Color Picker Props
 * Color selection with various formats
 */
export const ColorPickerPropsSchema = z.object({
  format: z.enum(['hex', 'rgb', 'rgba', 'hsl', 'hsla']).default('hex').describe('Color format'),
  showAlpha: z.boolean().default(false).describe('Enable alpha/opacity selection'),
  showPreset: z.boolean().default(true).describe('Show preset colors'),
  presetColors: z.array(z.string()).optional().describe('Predefined color palette'),
  showInput: z.boolean().default(true).describe('Show color value input'),
  showEyeDropper: z.boolean().default(false).describe('Enable eyedropper tool'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Picker size'),
});

/**
 * Signature Pad Props
 * Capture handwritten signature
 */
export const SignaturePadPropsSchema = z.object({
  width: z.number().int().positive().default(400).describe('Canvas width'),
  height: z.number().int().positive().default(200).describe('Canvas height'),
  penColor: z.string().default('#000000').describe('Pen color'),
  backgroundColor: z.string().default('#ffffff').describe('Background color'),
  lineWidth: z.number().positive().default(2).describe('Pen line width'),
  format: z.enum(['png', 'jpg', 'svg']).default('png').describe('Output image format'),
  showClear: z.boolean().default(true).describe('Show clear button'),
  showUndo: z.boolean().default(true).describe('Show undo button'),
});

/**
 * Location Picker Props
 * Map-based location selection
 */
export const LocationPickerPropsSchema = z.object({
  defaultZoom: z.number().int().min(1).max(20).default(13).describe('Initial map zoom level'),
  searchable: z.boolean().default(true).describe('Enable location search'),
  showMarker: z.boolean().default(true).describe('Show location marker'),
  draggableMarker: z.boolean().default(true).describe('Allow dragging marker'),
  showCoordinates: z.boolean().default(true).describe('Display coordinates'),
  mapProvider: z.enum(['google', 'mapbox', 'openstreetmap']).default('openstreetmap').describe('Map provider'),
  height: z.string().default('300px').describe('Map height'),
});

/**
 * Code Editor Props
 * Syntax-highlighted code input
 */
export const CodeEditorPropsSchema = z.object({
  language: z.string().default('javascript').describe('Programming language for syntax highlighting'),
  theme: z.enum(['vs-light', 'vs-dark', 'github-light', 'github-dark']).default('vs-light').describe('Editor theme'),
  lineNumbers: z.boolean().default(true).describe('Show line numbers'),
  minimap: z.boolean().default(false).describe('Show code minimap'),
  readOnly: z.boolean().default(false).describe('Read-only mode'),
  wordWrap: z.enum(['off', 'on', 'wordWrapColumn', 'bounded']).default('off').describe('Word wrap mode'),
  fontSize: z.number().int().positive().default(14).describe('Font size in pixels'),
  tabSize: z.number().int().positive().default(2).describe('Tab size'),
  height: z.string().default('400px').describe('Editor height'),
  showGutter: z.boolean().default(true).describe('Show line gutter'),
  autoformat: z.boolean().default(false).describe('Auto-format on blur'),
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Input Component Props Map
 * Maps component types to their property schemas
 */
export const InputComponentPropsMap = {
  // Text
  'input:text': TextInputPropsSchema,
  'input:textarea': TextareaPropsSchema,
  'input:richtext': RichTextEditorPropsSchema,
  
  // Number
  'input:number': NumberInputPropsSchema,
  'input:currency': CurrencyInputPropsSchema,
  'input:slider': SliderPropsSchema,
  'input:rating': RatingInputPropsSchema,
  
  // Date/Time
  'input:date': DatePickerPropsSchema,
  'input:datetime': DateTimePickerPropsSchema,
  'input:time': TimePickerPropsSchema,
  'input:daterange': DateRangePickerPropsSchema,
  
  // Select
  'input:select': SelectPropsSchema,
  'input:autocomplete': AutocompletePropsSchema,
  'input:tags': TagInputPropsSchema,
  'input:cascader': CascaderPropsSchema,
  
  // Boolean
  'input:checkbox': CheckboxPropsSchema,
  'input:checkbox_group': CheckboxGroupPropsSchema,
  'input:switch': SwitchPropsSchema,
  'input:radio_group': RadioGroupPropsSchema,
  'input:toggle_group': ToggleButtonGroupPropsSchema,
  
  // File Upload
  'input:file': FileUploadPropsSchema,
  'input:image': ImageUploadPropsSchema,
  
  // Advanced
  'input:color': ColorPickerPropsSchema,
  'input:signature': SignaturePadPropsSchema,
  'input:location': LocationPickerPropsSchema,
  'input:code': CodeEditorPropsSchema,
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export type TextInputProps = z.infer<typeof TextInputPropsSchema>;
export type TextareaProps = z.infer<typeof TextareaPropsSchema>;
export type RichTextEditorProps = z.infer<typeof RichTextEditorPropsSchema>;

export type NumberInputProps = z.infer<typeof NumberInputPropsSchema>;
export type CurrencyInputProps = z.infer<typeof CurrencyInputPropsSchema>;
export type SliderProps = z.infer<typeof SliderPropsSchema>;
export type RatingInputProps = z.infer<typeof RatingInputPropsSchema>;

export type DatePickerProps = z.infer<typeof DatePickerPropsSchema>;
export type DateTimePickerProps = z.infer<typeof DateTimePickerPropsSchema>;
export type TimePickerProps = z.infer<typeof TimePickerPropsSchema>;
export type DateRangePickerProps = z.infer<typeof DateRangePickerPropsSchema>;

export type SelectProps = z.infer<typeof SelectPropsSchema>;
export type SelectOption = z.infer<typeof SelectOptionSchema>;
export type AutocompleteProps = z.infer<typeof AutocompletePropsSchema>;
export type TagInputProps = z.infer<typeof TagInputPropsSchema>;
export type CascaderProps = z.infer<typeof CascaderPropsSchema>;

export type CheckboxProps = z.infer<typeof CheckboxPropsSchema>;
export type CheckboxGroupProps = z.infer<typeof CheckboxGroupPropsSchema>;
export type SwitchProps = z.infer<typeof SwitchPropsSchema>;
export type RadioGroupProps = z.infer<typeof RadioGroupPropsSchema>;
export type ToggleButtonGroupProps = z.infer<typeof ToggleButtonGroupPropsSchema>;

export type FileUploadProps = z.infer<typeof FileUploadPropsSchema>;
export type ImageUploadProps = z.infer<typeof ImageUploadPropsSchema>;

export type ColorPickerProps = z.infer<typeof ColorPickerPropsSchema>;
export type SignaturePadProps = z.infer<typeof SignaturePadPropsSchema>;
export type LocationPickerProps = z.infer<typeof LocationPickerPropsSchema>;
export type CodeEditorProps = z.infer<typeof CodeEditorPropsSchema>;
