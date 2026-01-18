/**
 * Object Field Interface
 * 
 * Defines the structure of a field within an ObjectEntity.
 * Fields represent individual data attributes and their metadata.
 * 
 * @module types/meta/object-field
 */

import { FieldType } from './field-type';

/**
 * Represents a field definition within an ObjectEntity
 * 
 * @remarks
 * ObjectField defines the complete metadata for a single field/attribute
 * in an entity. This includes its type, validation rules, UI hints, and
 * relationships to other entities (in the case of lookup fields).
 * 
 * @example
 * ```typescript
 * const nameField: ObjectField = {
 *   name: 'name',
 *   label: 'Full Name',
 *   type: 'text',
 *   required: true,
 *   maxLength: 100
 * };
 * 
 * const ownerField: ObjectField = {
 *   name: 'owner',
 *   label: 'Owner',
 *   type: 'lookup',
 *   required: true,
 *   lookupEntity: 'User',
 *   lookupDisplayField: 'name'
 * };
 * ```
 */
export interface ObjectField {
  /**
   * Technical name of the field (used in code and database)
   * 
   * @remarks
   * Should be in camelCase or snake_case format.
   * Must be unique within the entity.
   * 
   * @example 'firstName', 'email', 'created_at'
   */
  name: string;

  /**
   * Human-readable label for the field
   * 
   * @remarks
   * Used in UI forms, tables, and documentation.
   * 
   * @example 'First Name', 'Email Address', 'Created At'
   */
  label: string;

  /**
   * Data type of the field
   * 
   * @see FieldType
   */
  type: FieldType;

  /**
   * Detailed description of the field's purpose and usage
   * 
   * @remarks
   * Used for tooltips, help text, and documentation.
   */
  description?: string;

  /**
   * Whether the field is required (cannot be null/empty)
   * 
   * @defaultValue false
   */
  required?: boolean;

  /**
   * Whether the field value must be unique across all records
   * 
   * @defaultValue false
   */
  unique?: boolean;

  /**
   * Default value when creating new records
   * 
   * @remarks
   * Can be a static value or a function reference (e.g., 'NOW()' for timestamps)
   */
  defaultValue?: unknown;

  /**
   * Maximum length for text fields
   * 
   * @remarks
   * Only applicable to 'text', 'textarea', 'email', 'url' field types
   */
  maxLength?: number;

  /**
   * Minimum length for text fields
   * 
   * @remarks
   * Only applicable to 'text', 'textarea', 'email', 'url' field types
   */
  minLength?: number;

  /**
   * Minimum value for numeric fields
   * 
   * @remarks
   * Only applicable to 'number', 'currency', 'percentage' field types
   */
  min?: number;

  /**
   * Maximum value for numeric fields
   * 
   * @remarks
   * Only applicable to 'number', 'currency', 'percentage' field types
   */
  max?: number;

  /**
   * Regular expression pattern for validation
   * 
   * @remarks
   * Applied to text-based field types for custom validation rules
   * 
   * @example '^[A-Z]{2}-\\d{4}$' for pattern like 'AB-1234'
   */
  pattern?: string;

  /**
   * Target entity name for lookup fields
   * 
   * @remarks
   * Required when type is 'lookup'. Specifies which entity this field references.
   * 
   * @example 'User', 'Account', 'Product'
   */
  lookupEntity?: string;

  /**
   * Field name in the lookup entity to display
   * 
   * @remarks
   * Used to show human-readable text instead of IDs.
   * Common values: 'name', 'title', 'label'
   * 
   * @defaultValue 'name'
   */
  lookupDisplayField?: string;

  /**
   * Available options for select/multiselect fields
   * 
   * @remarks
   * Only applicable to 'select' and 'multiselect' field types
   * 
   * @example
   * ```typescript
   * options: [
   *   { value: 'draft', label: 'Draft' },
   *   { value: 'published', label: 'Published' }
   * ]
   * ```
   */
  options?: Array<{
    /** Internal value stored in database */
    value: string | number;
    /** Human-readable label shown in UI */
    label: string;
  }>;

  /**
   * Whether the field is indexed for faster queries
   * 
   * @defaultValue false
   */
  indexed?: boolean;

  /**
   * Whether the field is read-only
   * 
   * @remarks
   * Read-only fields can only be set by the system, not by users
   * 
   * @defaultValue false
   */
  readonly?: boolean;

  /**
   * Whether the field is hidden from UI by default
   * 
   * @remarks
   * Hidden fields are still stored and queryable but not shown in standard forms/views
   * 
   * @defaultValue false
   */
  hidden?: boolean;

  /**
   * Custom metadata for extensions and plugins
   * 
   * @remarks
   * Allows third-party code to attach arbitrary metadata to fields
   * without modifying the core interface
   */
  metadata?: Record<string, unknown>;
}
