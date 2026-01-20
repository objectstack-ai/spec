import { z } from 'zod';
import { FieldSchema } from '../data/field.zod';

/**
 * Field Widget Props Schema
 * 
 * This defines the contract for custom field components and plugin UI extensions.
 * Third-party developers use this interface to build custom field widgets that integrate
 * seamlessly with the ObjectStack UI system.
 * 
 * @example
 * // Custom widget implementation
 * function CustomDatePicker(props: FieldWidgetProps) {
 *   const { value, onChange, readonly, required, error, field, record, options } = props;
 *   // Widget implementation...
 * }
 */
export const FieldWidgetPropsSchema = z.object({
  /**
   * Current field value.
   * Type depends on the field type (string, number, boolean, array, object, etc.)
   */
  value: z.any().describe('Current field value'),

  /**
   * Callback function to update the field value.
   * Should be called when user interaction changes the value.
   * 
   * @param newValue - The new value to set
   */
  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .describe('Callback to update field value'),

  /**
   * Whether the field is in read-only mode.
   * When true, the widget should display the value but not allow editing.
   */
  readonly: z.boolean().default(false).describe('Read-only mode flag'),

  /**
   * Whether the field is required.
   * Widget should indicate required state visually and validate accordingly.
   */
  required: z.boolean().default(false).describe('Required field flag'),

  /**
   * Validation error message to display.
   * When present, widget should display the error in its UI.
   */
  error: z.string().optional().describe('Validation error message'),

  /**
   * Complete field definition from the schema.
   * Contains metadata like type, constraints, options, etc.
   */
  field: FieldSchema.describe('Field schema definition'),

  /**
   * The complete record/document being edited.
   * Useful for conditional logic and cross-field dependencies.
   */
  record: z.record(z.any()).optional().describe('Complete record data'),

  /**
   * Custom options passed to the widget.
   * Can contain widget-specific configuration like themes, behaviors, etc.
   */
  options: z.record(z.any()).optional().describe('Custom widget options'),
});

/**
 * TypeScript type for Field Widget Props
 */
export type FieldWidgetProps = z.infer<typeof FieldWidgetPropsSchema>;
