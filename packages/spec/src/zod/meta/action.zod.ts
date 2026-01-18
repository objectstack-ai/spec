import { z } from 'zod';

/**
 * Action Type Definitions
 * Defines the type of execution for the action.
 */
export const ActionType = z.enum([
  'script',  // Execute a server-side script
  'client',  // Execute a client-side function
  'url',     // Open a URL
  'flow',    // Trigger a workflow/process
  'call_service' // Call a microservice
]);

/**
 * Action Location
 * Defines where the action button should appear.
 */
export const ActionLocation = z.enum([
  'record',            // Record detail page
  'record_more',       // Record detail "More" menu
  'list',             // List view toolbar
  'list_item',        // List view row action
  'global'            // Global header/sidebar
]);

/**
 * Schema for Actions (Buttons/Operations).
 */
export const ActionSchema = z.object({
  /** Machine name of the action */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Machine name (snake_case)'),
  
  /** Display label */
  label: z.string().describe('Display label'),
  
  /** Action functionality type */
  type: ActionType.default('script').describe('Action functionality type'),
  
  /** Locations where this action is visible */
  location: z.union([ActionLocation, z.array(ActionLocation)]).describe('Locations where this action is visible'),
  
  /** 
   * The actual logic to execute.
   * - For 'script': The script code or file path.
   * - For 'url': The URL template.
   * - For 'call_service': Service endpoint.
   */
  execute: z.string().optional().describe('Execution logic (script, url, or endpoint)'),
  
  /** Visibility condition expression (Formula returning boolean) */
  visible: z.string().optional().describe('Visibility condition (Formula)'),
  
  /** Confirmation message before execution */
  confirmText: z.string().optional().describe('Confirmation message before execution'),
  
  /** Icon name (Lucide) */
  icon: z.string().optional().describe('Icon name'),

  /** Success message after execution */
  successMessage: z.string().optional().describe('Success message to show after execution'),
});

export type Action = z.infer<typeof ActionSchema>;
