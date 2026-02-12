// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';
import { ObjectSchema } from '../data/object.zod';
import { AppSchema } from '../ui/app.zod';
import { MetadataTypeSchema, MetadataQuerySchema, MetadataQueryResultSchema, MetadataValidationResultSchema, MetadataBulkResultSchema, MetadataDependencySchema } from '../kernel/metadata-plugin.zod';
import { MetadataOverlaySchema } from '../kernel/metadata-customization.zod';

/**
 * Metadata Service Protocol
 *
 * Defines the standard API contracts for the **@objectstack/metadata** package.
 * This is the single authority for ALL metadata-related services and APIs across
 * the entire platform, including Hono, Next.js, and NestJS adapters.
 *
 * ## Architecture
 * ```
 * ┌──────────────────────────────────────────────────────────────────┐
 * │              @objectstack/metadata — API Contracts              │
 * │                                                                  │
 * │  CRUD        │ Query/Search │ Bulk Ops  │ Overlay   │ Watch     │
 * │  Import/Export│ Validation   │ Type Reg  │ Deps      │           │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  Hono Adapter │ Next.js Adapter │ NestJS Adapter │ CLI         │
 * └──────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Alignment
 * - **Salesforce**: Metadata API (deploy, retrieve, describe)
 * - **ServiceNow**: System Dictionary + Metadata API
 * - **Kubernetes**: API Server + CRD Registry
 */

// ==========================================
// 1. Legacy Responses (existing)
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

// ==========================================
// 2. CRUD Request / Response Schemas
// ==========================================

/**
 * Register (Create/Update) Metadata Request
 * POST /api/meta/:type
 * PUT  /api/meta/:type/:name
 */
export const MetadataRegisterRequestSchema = z.object({
  type: MetadataTypeSchema.describe('Metadata type'),
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Item name (snake_case)'),
  data: z.record(z.string(), z.unknown()).describe('Metadata payload'),
  namespace: z.string().optional().describe('Optional namespace'),
});

/**
 * Single Metadata Item Response
 * GET /api/meta/:type/:name
 */
export const MetadataItemResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    type: z.string().describe('Metadata type'),
    name: z.string().describe('Item name'),
    definition: z.record(z.string(), z.unknown()).describe('Metadata definition payload'),
  }).describe('Metadata item'),
});

/**
 * Metadata List Response
 * GET /api/meta/:type
 */
export const MetadataListResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.record(z.string(), z.unknown())).describe('Array of metadata definitions'),
});

/**
 * Metadata Names Response
 * GET /api/meta/:type/names
 */
export const MetadataNamesResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.string()).describe('Array of metadata item names'),
});

/**
 * Metadata Exists Response
 * GET /api/meta/:type/:name/exists
 */
export const MetadataExistsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    exists: z.boolean().describe('Whether the item exists'),
  }),
});

/**
 * Metadata Delete Response
 * DELETE /api/meta/:type/:name
 */
export const MetadataDeleteResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    type: z.string().describe('Metadata type'),
    name: z.string().describe('Deleted item name'),
  }),
});

// ==========================================
// 3. Query / Search
// ==========================================

/**
 * Metadata Query Request
 * POST /api/meta/query
 */
export const MetadataQueryRequestSchema = MetadataQuerySchema.describe(
  'Metadata query with filtering, sorting, and pagination',
);

/**
 * Metadata Query Response
 * POST /api/meta/query
 */
export const MetadataQueryResponseSchema = BaseResponseSchema.extend({
  data: MetadataQueryResultSchema.describe('Paginated query result'),
});

// ==========================================
// 4. Bulk Operations
// ==========================================

/**
 * Bulk Register Request
 * POST /api/meta/bulk/register
 */
export const MetadataBulkRegisterRequestSchema = z.object({
  items: z.array(z.object({
    type: z.string().describe('Metadata type'),
    name: z.string().describe('Item name'),
    data: z.record(z.string(), z.unknown()).describe('Metadata payload'),
  })).min(1).describe('Items to register'),
  continueOnError: z.boolean().default(false).describe('Continue on individual failure'),
  validate: z.boolean().default(true).describe('Validate before registering'),
});

/**
 * Bulk Unregister Request
 * POST /api/meta/bulk/unregister
 */
export const MetadataBulkUnregisterRequestSchema = z.object({
  items: z.array(z.object({
    type: z.string().describe('Metadata type'),
    name: z.string().describe('Item name'),
  })).min(1).describe('Items to unregister'),
});

/**
 * Bulk Operation Response
 * POST /api/meta/bulk/*
 */
export const MetadataBulkResponseSchema = BaseResponseSchema.extend({
  data: MetadataBulkResultSchema.describe('Bulk operation result'),
});

// ==========================================
// 5. Overlay / Customization
// ==========================================

/**
 * Get Overlay Response
 * GET /api/meta/:type/:name/overlay
 */
export const MetadataOverlayResponseSchema = BaseResponseSchema.extend({
  data: MetadataOverlaySchema.optional().describe('Overlay definition, undefined if none'),
});

/**
 * Save Overlay Request
 * PUT /api/meta/:type/:name/overlay
 */
export const MetadataOverlaySaveRequestSchema = MetadataOverlaySchema.describe(
  'Overlay to save',
);

/**
 * Get Effective (merged) Response
 * GET /api/meta/:type/:name/effective
 */
export const MetadataEffectiveResponseSchema = BaseResponseSchema.extend({
  data: z.record(z.string(), z.unknown()).optional()
    .describe('Effective metadata with all overlays applied'),
});

// ==========================================
// 6. Import / Export
// ==========================================

/**
 * Export Metadata Request
 * POST /api/meta/export
 */
export const MetadataExportRequestSchema = z.object({
  types: z.array(z.string()).optional().describe('Filter by metadata types'),
  namespaces: z.array(z.string()).optional().describe('Filter by namespaces'),
  format: z.enum(['json', 'yaml']).default('json').describe('Export format'),
});

/**
 * Export Metadata Response
 * POST /api/meta/export
 */
export const MetadataExportResponseSchema = BaseResponseSchema.extend({
  data: z.unknown().describe('Exported metadata bundle'),
});

/**
 * Import Metadata Request
 * POST /api/meta/import
 */
export const MetadataImportRequestSchema = z.object({
  data: z.unknown().describe('Metadata bundle to import'),
  conflictResolution: z.enum(['skip', 'overwrite', 'merge']).default('skip')
    .describe('Conflict resolution strategy'),
  validate: z.boolean().default(true).describe('Validate before import'),
  dryRun: z.boolean().default(false).describe('Dry run (no save)'),
});

/**
 * Import Metadata Response
 * POST /api/meta/import
 */
export const MetadataImportResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    total: z.number().int().min(0),
    imported: z.number().int().min(0),
    skipped: z.number().int().min(0),
    failed: z.number().int().min(0),
    errors: z.array(z.object({
      type: z.string(),
      name: z.string(),
      error: z.string(),
    })).optional(),
  }).describe('Import result'),
});

// ==========================================
// 7. Validation
// ==========================================

/**
 * Validate Metadata Request
 * POST /api/meta/validate
 */
export const MetadataValidateRequestSchema = z.object({
  type: z.string().describe('Metadata type to validate against'),
  data: z.unknown().describe('Metadata payload to validate'),
});

/**
 * Validate Metadata Response
 * POST /api/meta/validate
 */
export const MetadataValidateResponseSchema = BaseResponseSchema.extend({
  data: MetadataValidationResultSchema.describe('Validation result'),
});

// ==========================================
// 8. Type Registry
// ==========================================

/**
 * List Registered Types Response
 * GET /api/meta/types
 */
export const MetadataTypesResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.string()).describe('Registered metadata type identifiers'),
});

/**
 * Type Info Response
 * GET /api/meta/types/:type
 */
export const MetadataTypeInfoResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    type: z.string().describe('Metadata type identifier'),
    label: z.string().describe('Display label'),
    description: z.string().optional().describe('Description'),
    filePatterns: z.array(z.string()).describe('File glob patterns'),
    supportsOverlay: z.boolean().describe('Overlay support'),
    domain: z.string().describe('Protocol domain'),
  }).optional().describe('Type info'),
});

// ==========================================
// 9. Dependency Tracking
// ==========================================

/**
 * Dependencies Response
 * GET /api/meta/:type/:name/dependencies
 */
export const MetadataDependenciesResponseSchema = BaseResponseSchema.extend({
  data: z.array(MetadataDependencySchema).describe('Items this item depends on'),
});

/**
 * Dependents Response
 * GET /api/meta/:type/:name/dependents
 */
export const MetadataDependentsResponseSchema = BaseResponseSchema.extend({
  data: z.array(MetadataDependencySchema).describe('Items that depend on this item'),
});

// ==========================================
// Type Exports
// ==========================================

export type ObjectDefinitionResponse = z.infer<typeof ObjectDefinitionResponseSchema>;
export type AppDefinitionResponse = z.infer<typeof AppDefinitionResponseSchema>;
export type ConceptListResponse = z.infer<typeof ConceptListResponseSchema>;
export type MetadataRegisterRequest = z.infer<typeof MetadataRegisterRequestSchema>;
export type MetadataItemResponse = z.infer<typeof MetadataItemResponseSchema>;
export type MetadataListResponse = z.infer<typeof MetadataListResponseSchema>;
export type MetadataNamesResponse = z.infer<typeof MetadataNamesResponseSchema>;
export type MetadataExistsResponse = z.infer<typeof MetadataExistsResponseSchema>;
export type MetadataDeleteResponse = z.infer<typeof MetadataDeleteResponseSchema>;
export type MetadataQueryResponse = z.infer<typeof MetadataQueryResponseSchema>;
export type MetadataBulkResponse = z.infer<typeof MetadataBulkResponseSchema>;
export type MetadataOverlayResponse = z.infer<typeof MetadataOverlayResponseSchema>;
export type MetadataEffectiveResponse = z.infer<typeof MetadataEffectiveResponseSchema>;
export type MetadataExportResponse = z.infer<typeof MetadataExportResponseSchema>;
export type MetadataImportResponse = z.infer<typeof MetadataImportResponseSchema>;
export type MetadataValidateResponse = z.infer<typeof MetadataValidateResponseSchema>;
export type MetadataTypesResponse = z.infer<typeof MetadataTypesResponseSchema>;
export type MetadataTypeInfoResponse = z.infer<typeof MetadataTypeInfoResponseSchema>;
export type MetadataDependenciesResponse = z.infer<typeof MetadataDependenciesResponseSchema>;
export type MetadataDependentsResponse = z.infer<typeof MetadataDependentsResponseSchema>;
