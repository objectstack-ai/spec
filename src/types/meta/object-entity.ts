/**
 * Object Entity Interface
 * 
 * Defines the structure of an entity in the ObjectStack metamodel.
 * Entities represent data models/tables with their fields and relationships.
 * 
 * @module types/meta/object-entity
 */

import { ObjectField } from './object-field';

/**
 * Represents an entity definition in the ObjectStack metamodel
 * 
 * @remarks
 * ObjectEntity is the core data model definition. It describes a logical
 * entity (like User, Account, Product) with its fields, constraints,
 * and metadata. This interface is used by:
 * 
 * - ObjectQL parser: To validate and process schema definitions
 * - ObjectUI renderer: To generate forms, tables, and views
 * - Database drivers: To create tables and migrations
 * - API generators: To expose REST/GraphQL endpoints
 * 
 * @example
 * ```typescript
 * const userEntity: ObjectEntity = {
 *   name: 'User',
 *   label: 'User',
 *   pluralLabel: 'Users',
 *   description: 'System user account',
 *   fields: [
 *     {
 *       name: 'id',
 *       label: 'ID',
 *       type: 'text',
 *       required: true,
 *       readonly: true
 *     },
 *     {
 *       name: 'email',
 *       label: 'Email',
 *       type: 'email',
 *       required: true,
 *       unique: true
 *     },
 *     {
 *       name: 'name',
 *       label: 'Full Name',
 *       type: 'text',
 *       required: true
 *     }
 *   ],
 *   primaryKey: 'id',
 *   displayField: 'name'
 * };
 * ```
 */
export interface ObjectEntity {
  /**
   * Technical name of the entity
   * 
   * @remarks
   * Used in code, APIs, and database table names.
   * Should be in PascalCase for entities.
   * Must be unique across the system.
   * 
   * @example 'User', 'Account', 'SalesOrder'
   */
  name: string;

  /**
   * Human-readable singular label for the entity
   * 
   * @remarks
   * Used in UI headers, forms, and documentation.
   * 
   * @example 'User', 'Sales Order', 'Product Category'
   */
  label: string;

  /**
   * Human-readable plural label for the entity
   * 
   * @remarks
   * Used in UI when displaying lists or collections.
   * 
   * @example 'Users', 'Sales Orders', 'Product Categories'
   */
  pluralLabel: string;

  /**
   * Detailed description of the entity's purpose
   * 
   * @remarks
   * Used for documentation and context-sensitive help
   */
  description?: string;

  /**
   * Array of field definitions that make up this entity
   * 
   * @remarks
   * Each field represents a column/attribute in the entity.
   * Field names must be unique within the entity.
   * 
   * @see ObjectField
   */
  fields: ObjectField[];

  /**
   * Name of the field that serves as the primary key
   * 
   * @remarks
   * The primary key uniquely identifies each record.
   * Must be one of the field names in the fields array.
   * 
   * @defaultValue 'id'
   * 
   * @example 'id', 'uuid', 'userId'
   */
  primaryKey?: string;

  /**
   * Name of the field to use as the display/title field
   * 
   * @remarks
   * Used when showing a record reference in lookups, breadcrumbs, etc.
   * Should be a field that uniquely and meaningfully identifies a record.
   * 
   * @defaultValue 'name'
   * 
   * @example 'name', 'title', 'email', 'code'
   */
  displayField?: string;

  /**
   * Icon identifier for the entity
   * 
   * @remarks
   * Used in navigation menus, headers, and lists.
   * Can be an icon library reference (e.g., 'user', 'building', 'package')
   * or a URL to a custom icon.
   * 
   * @example 'user', 'briefcase', 'https://example.com/icon.svg'
   */
  icon?: string;

  /**
   * Color theme for the entity
   * 
   * @remarks
   * Used for visual distinction in UI elements.
   * Can be a CSS color name, hex code, or theme variable.
   * 
   * @example 'blue', '#3B82F6', 'primary'
   */
  color?: string;

  /**
   * Whether this entity should be audited
   * 
   * @remarks
   * When enabled, tracks create/update/delete operations with user and timestamp.
   * Typically adds fields like: createdBy, createdAt, updatedBy, updatedAt
   * 
   * @defaultValue false
   */
  auditable?: boolean;

  /**
   * Whether this entity supports soft deletion
   * 
   * @remarks
   * When enabled, records are marked as deleted rather than physically removed.
   * Typically adds a 'deletedAt' timestamp field.
   * 
   * @defaultValue false
   */
  softDelete?: boolean;

  /**
   * Whether this entity can be searched via full-text search
   * 
   * @remarks
   * When enabled, the entity is indexed for full-text search operations
   * 
   * @defaultValue false
   */
  searchable?: boolean;

  /**
   * Names of fields to include in full-text search
   * 
   * @remarks
   * Only relevant when searchable is true.
   * If not specified, all text fields are included.
   * 
   * @example ['name', 'description', 'email']
   */
  searchableFields?: string[];

  /**
   * Permission scope identifier
   * 
   * @remarks
   * Defines the permission namespace for this entity.
   * Used to generate permission strings like: '{scope}.read', '{scope}.write'
   * 
   * @example 'user', 'sales.order', 'product.category'
   */
  permissionScope?: string;

  /**
   * Custom validation rules
   * 
   * @remarks
   * Array of validation rule identifiers that apply to the entire entity.
   * Can reference built-in validators or custom validation functions.
   * 
   * @example ['uniqueTogether:email,domain', 'requiredIf:field1,field2']
   */
  validationRules?: string[];

  /**
   * Database table name override
   * 
   * @remarks
   * By default, table name is derived from entity name.
   * Use this to specify a custom table name.
   * 
   * @example 'tbl_users', 'legacy_accounts'
   */
  tableName?: string;

  /**
   * Entity version for schema migration tracking
   * 
   * @remarks
   * Incremented when breaking changes are made to the entity structure.
   * Used for migration management and compatibility checking.
   * 
   * @defaultValue 1
   */
  version?: number;

  /**
   * Tags for categorization and filtering
   * 
   * @remarks
   * Used to organize entities into logical groups.
   * 
   * @example ['core', 'sales', 'internal']
   */
  tags?: string[];

  /**
   * Custom metadata for extensions and plugins
   * 
   * @remarks
   * Allows third-party code to attach arbitrary metadata to entities
   * without modifying the core interface
   */
  metadata?: Record<string, unknown>;
}
