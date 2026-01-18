/**
 * Field Type Definitions
 * 
 * Defines the available field types in the ObjectStack metamodel.
 * These types determine how fields are stored, validated, and rendered.
 * 
 * @module types/meta/field-type
 */

/**
 * Available field types in the ObjectStack metamodel.
 * 
 * @remarks
 * Each field type corresponds to specific storage, validation, and rendering behavior:
 * 
 * - `text`: Short text strings (single line)
 * - `textarea`: Long text content (multi-line)
 * - `number`: Numeric values (integer or decimal)
 * - `boolean`: True/false values (checkbox)
 * - `date`: Date values (without time)
 * - `datetime`: Date and time values
 * - `email`: Email address with validation
 * - `url`: URL with validation
 * - `lookup`: Reference to another entity (foreign key)
 * - `select`: Single selection from predefined options
 * - `multiselect`: Multiple selections from predefined options
 * - `json`: Arbitrary JSON data structure
 * - `file`: File attachment reference
 * - `image`: Image file reference with preview
 * - `currency`: Monetary values with precision
 * - `percentage`: Percentage values (0-100)
 * 
 * @example
 * ```typescript
 * const nameField: FieldType = 'text';
 * const priceField: FieldType = 'currency';
 * const ownerField: FieldType = 'lookup';
 * ```
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'lookup'
  | 'select'
  | 'multiselect'
  | 'json'
  | 'file'
  | 'image'
  | 'currency'
  | 'percentage';

/**
 * Type guard to check if a string is a valid FieldType
 * 
 * @param value - The value to check
 * @returns True if the value is a valid FieldType
 * 
 * @example
 * ```typescript
 * if (isFieldType('text')) {
 *   // value is a valid FieldType
 * }
 * ```
 */
export function isFieldType(value: unknown): value is FieldType {
  const validTypes: FieldType[] = [
    'text',
    'textarea',
    'number',
    'boolean',
    'date',
    'datetime',
    'email',
    'url',
    'lookup',
    'select',
    'multiselect',
    'json',
    'file',
    'image',
    'currency',
    'percentage',
  ];
  return typeof value === 'string' && validTypes.includes(value as FieldType);
}
