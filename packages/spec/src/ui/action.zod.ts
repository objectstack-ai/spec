import { z } from 'zod';
import { FieldType } from '../data/field.zod';

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
 */
export const ActionSchema = z.object({
  /** Machine name of the action */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)'),
  
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
  
  /** Legacy location support */
  location: z.any().optional(),

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
