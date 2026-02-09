// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { ChangeSetSchema } from '../system/migration.zod';

// Identifying the source of truth
export const MetadataSourceSchema = z.object({
  file: z.string().optional().describe('Source file path where the metadata is defined'),
  line: z.number().optional().describe('Line number in the source file'),
  column: z.number().optional().describe('Column number in the source file'),
  // Logic references
  package: z.string().optional().describe('Package name containing the metadata'),
  object: z.string().optional().describe('ObjectQL object name if applicable'),
  field: z.string().optional().describe('Field name if the issue is field-specific'),
  component: z.string().optional().describe('Specific UI component or flow node identifier')
});

export type MetadataSource = z.infer<typeof MetadataSourceSchema>;

// The Runtime Issue
export const IssueSchema = z.object({
  id: z.string().describe('Unique identifier for this issue'),
  severity: z.enum(['critical', 'error', 'warning', 'info']).describe('Issue severity level'),
  message: z.string().describe('Human-readable error or issue description'),
  stackTrace: z.string().optional().describe('Full stack trace if available'),
  timestamp: z.string().datetime().describe('When the issue occurred (ISO 8601)'),
  userId: z.string().optional().describe('User who encountered the issue'),
  
  // Context snapshot
  context: z.record(z.string(), z.unknown()).optional().describe('Runtime context snapshot at the time of the issue'),
  
  // The suspected metadata culprit
  source: MetadataSourceSchema.optional().describe('Source location of the suspected problematic metadata')
});

// The AI's proposed resolution
export const ResolutionSchema = z.object({
  issueId: z.string().describe('Reference to the issue being resolved'),
  reasoning: z.string().describe('Explanation of why this fix is needed'),
  confidence: z.number().min(0).max(1).describe('AI confidence score (0.0-1.0) for this resolution'),
  
  // Actionable change to fix the issue
  fix: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('metadata_change'),
      changeSet: ChangeSetSchema.describe('Automated metadata changes to resolve the issue')
    }),
    z.object({
      type: z.literal('manual_intervention'),
      instructions: z.string().describe('Step-by-step instructions for manual resolution')
    })
  ]).describe('Proposed fix action (automated or manual)')
});

// Complete Feedback Loop Record
export const FeedbackLoopSchema = z.object({
  issue: IssueSchema.describe('The runtime issue that triggered this feedback loop'),
  analysis: z.string().optional().describe('AI analysis of the root cause'),
  resolutions: z.array(ResolutionSchema).optional().describe('Proposed resolutions ranked by confidence'),
  status: z.enum(['open', 'analyzing', 'resolved', 'ignored']).default('open').describe('Current status of the feedback loop')
});

export type FeedbackLoop = z.infer<typeof FeedbackLoopSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Resolution = z.infer<typeof ResolutionSchema>;
