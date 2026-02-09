// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @module studio
 * 
 * Studio Protocol — Plugin system for ObjectStack Studio
 * 
 * Defines the extension model that allows metadata types to contribute
 * custom viewers, designers, sidebar groups, actions, and commands.
 */

export {
  // Schemas
  ViewModeSchema,
  MetadataViewerContributionSchema,
  SidebarGroupContributionSchema,
  ActionContributionSchema,
  ActionLocationSchema,
  MetadataIconContributionSchema,
  PanelContributionSchema,
  PanelLocationSchema,
  CommandContributionSchema,
  StudioPluginContributionsSchema,
  ActivationEventSchema,
  StudioPluginManifestSchema,

  // Types
  type ViewMode,
  type MetadataViewerContribution,
  type SidebarGroupContribution,
  type ActionContribution,
  type MetadataIconContribution,
  type PanelContribution,
  type CommandContribution,
  type StudioPluginContributions,
  type StudioPluginManifest,

  // Helpers
  defineStudioPlugin,
} from './plugin.zod';
