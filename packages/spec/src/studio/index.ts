// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @module studio
 * 
 * Studio Protocol — Plugin system for ObjectStack Studio
 * 
 * Defines the extension model that allows metadata types to contribute
 * custom viewers, designers, sidebar groups, actions, and commands.
 * Also includes the Object Designer protocol for visual field editing,
 * relationship mapping, and ER diagram configuration.
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

export {
  // Object Designer Schemas
  FieldPropertySectionSchema,
  FieldGroupSchema,
  FieldEditorConfigSchema,
  RelationshipDisplaySchema,
  RelationshipMapperConfigSchema,
  ERLayoutAlgorithmSchema,
  ERNodeDisplaySchema,
  ERDiagramConfigSchema,
  ObjectListDisplayModeSchema,
  ObjectSortFieldSchema,
  ObjectFilterSchema,
  ObjectManagerConfigSchema,
  ObjectPreviewTabSchema,
  ObjectPreviewConfigSchema,
  ObjectDesignerDefaultViewSchema,
  ObjectDesignerConfigSchema,

  // Object Designer Types
  type FieldPropertySection,
  type FieldGroup,
  type FieldEditorConfig,
  type RelationshipDisplay,
  type RelationshipMapperConfig,
  type ERLayoutAlgorithm,
  type ERNodeDisplay,
  type ERDiagramConfig,
  type ObjectListDisplayMode,
  type ObjectSortField,
  type ObjectFilter,
  type ObjectManagerConfig,
  type ObjectPreviewTab,
  type ObjectPreviewConfig,
  type ObjectDesignerDefaultView,
  type ObjectDesignerConfig,

  // Object Designer Helpers
  defineObjectDesignerConfig,
} from './object-designer.zod';

export {
  // Page Builder Schemas
  CanvasSnapSettingsSchema,
  CanvasZoomSettingsSchema,
  ElementPaletteItemSchema,
  PageBuilderConfigSchema,
  /** @deprecated Use PageBuilderConfigSchema instead */
  InterfaceBuilderConfigSchema,

  // Page Builder Types
  type CanvasSnapSettings,
  type CanvasZoomSettings,
  type ElementPaletteItem,
  type PageBuilderConfig,
  /** @deprecated Use PageBuilderConfig instead */
  type InterfaceBuilderConfig,
} from './page-builder.zod';

export {
  // Flow Builder Schemas
  FlowNodeShapeSchema,
  FlowNodeRenderDescriptorSchema,
  FlowCanvasNodeSchema,
  FlowCanvasEdgeStyleSchema,
  FlowCanvasEdgeSchema,
  FlowLayoutAlgorithmSchema,
  FlowLayoutDirectionSchema,
  FlowBuilderConfigSchema,
  BUILT_IN_NODE_DESCRIPTORS,

  // Flow Builder Types
  type FlowNodeShape,
  type FlowNodeRenderDescriptor,
  type FlowCanvasNode,
  type FlowCanvasEdgeStyle,
  type FlowCanvasEdge,
  type FlowLayoutAlgorithm,
  type FlowLayoutDirection,
  type FlowBuilderConfig,

  // Flow Builder Helpers
  defineFlowBuilderConfig,
} from './flow-builder.zod';
