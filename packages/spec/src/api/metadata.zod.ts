import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';
import { ObjectSchema } from '../data/object.zod';
import { AppSchema } from '../ui/app.zod';

/**
 * Metadata Service Protocol
 * 
 * Defines the standard API contracts for fetching system metadata.
 * Frontend, IDEs, and Mobile apps use this to build dynamic UIs.
 */

// ==========================================
// Responses
// ==========================================

/**
 * Single Object Definition Response
 * Returns the full JSON schema for an Entity (Fields, Actions, Config).
 */
export const ObjectDefinitionResponseSchema = BaseResponseSchema.extend({
  data: ObjectSchema.describe('Full Object Schema'),
});

/**
 * App Definition Response
 * Returns the navigation, branding, and layout for an App.
 */
export const AppDefinitionResponseSchema = BaseResponseSchema.extend({
  data: AppSchema.describe('Full App Configuration'),
});

/**
 * All Concepts Response
 * Bulk load lightweight definitions for autocomplete/pickers.
 */
export const ConceptListResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.object({
    name: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    description: z.string().optional(),
  })).describe('List of available concepts (Objects, Apps, Flows)'),
});

export type ObjectDefinitionResponse = z.infer<typeof ObjectDefinitionResponseSchema>;
export type AppDefinitionResponse = z.infer<typeof AppDefinitionResponseSchema>;
export type ConceptListResponse = z.infer<typeof ConceptListResponseSchema>;
