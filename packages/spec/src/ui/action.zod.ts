import { z } from 'zod';
import { FieldType } from '../data/field.zod';
import { SnakeCaseIdentifierSchema } from '../shared/identifiers.zod';

/**
 * Action Parameter Schema
 * Defines inputs required before executing an action.
 */
export const ActionParamSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: FieldType,
  required: z.boolean().default(false),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

/**
 * Action Schema
 * 
 * **NAMING CONVENTION:**
 * Action names are machine identifiers used in code and must be lowercase snake_case.
 * 
 * @example Good action names
 * - 'on_close_deal'
 * - 'send_welcome_email'
 * - 'approve_contract'
 * - 'export_report'
 * 
 * @example Bad action names (will be rejected)
 * - 'OnCloseDeal' (PascalCase)
 * - 'sendEmail' (camelCase)
 * - 'Send Email' (spaces)
 * 
 * Note: The action name is the configuration ID. JavaScript function names can use camelCase,
 * but the metadata ID must be lowercase snake_case.
 */
export const ActionSchema = z.object({
  /** Machine name of the action */
  name: SnakeCaseIdentifierSchema.describe('Machine name (lowercase snake_case)'),
  
  /** Display label */
  label: z.string().describe('Display label'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('Icon name'),

  /** Where does this action appear? */
  locations: z.array(z.enum([
    'list_toolbar', 'list_item', 
    'record_header', 'record_more', 'record_related',
    'global_nav'
  ])).optional().describe('Locations where this action is visible'),

  /** 
   * Visual Component Type
   * Defaults to 'button' or 'menu_item' based on location,
   * but can be overridden.
   */
  component: z.enum([
    'action:button', // Standard Button
    'action:icon',   // Icon only
    'action:menu',   // Dropdown menu
    'action:group'   // Button Group
  ]).optional().describe('Visual component override'),
  
  /** @deprecated Use `locations` instead. Will be removed in v2.0.0 */
  location: z.unknown().optional()
    .describe('DEPRECATED: Use `locations` field instead. Scheduled for removal in v2.0.0'),

  /** What type of interaction? */
  type: z.enum(['script', 'url', 'modal', 'flow', 'api']).default('script').describe('Action functionality type'),
  
  /** Payload / Target */
  target: z.string().optional().describe('URL, Script Name, Flow ID, or API Endpoint'), // For URL/Flow types
  execute: z.string().optional().describe('Legacy execution logic'),
  
  /** User Input Requirements */
  params: z.array(ActionParamSchema).optional().describe('Input parameters required from user'),
  
  /** UX Behavior */
  confirmText: z.string().optional().describe('Confirmation message before execution'),
  successMessage: z.string().optional().describe('Success message to show after execution'),
  refreshAfter: z.boolean().default(false).describe('Refresh view after execution'),
  
  /** Access */
  visible: z.string().optional().describe('Formula returning boolean'),
});

export type Action = z.infer<typeof ActionSchema>;
export type ActionParam = z.infer<typeof ActionParamSchema>;

/**
 * Action Factory Helper
 */
export const Action = {
  create: (config: z.input<typeof ActionSchema>): Action => ActionSchema.parse(config),
} as const;
