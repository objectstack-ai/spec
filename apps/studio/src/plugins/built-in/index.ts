/**
 * Built-in Plugins Barrel Export
 * 
 * All built-in plugins are registered by default when Studio starts.
 * External plugins can be added at runtime via the PluginRegistry.
 */

import type { StudioPlugin } from '../types';

// Core plugins
import { objectDesignerPlugin } from './object-plugin';
import { defaultInspectorPlugin } from './default-plugin';

// Protocol plugins (sidebar groups + icons)
import { uiProtocolPlugin } from './ui-plugin';
import { automationProtocolPlugin } from './automation-plugin';
import { securityProtocolPlugin } from './security-plugin';
import { aiProtocolPlugin } from './ai-plugin';
import { apiProtocolPlugin } from './api-plugin';

// Example plugins (demonstrating custom viewers)
import { flowDesignerPlugin } from './examples/flow-designer-plugin.example';
import { dashboardDesignerPlugin } from './examples/dashboard-designer.example';
import { agentViewerPlugin } from './examples/agent-viewer.example';

/** All built-in plugins, in activation order */
export const builtInPlugins: StudioPlugin[] = [
  // The default inspector MUST be first — it provides the wildcard fallback
  defaultInspectorPlugin,

  // Object designer (highest priority for object/objects types)
  objectDesignerPlugin,

  // Protocol group plugins (provide sidebar groups + icons)
  uiProtocolPlugin,
  automationProtocolPlugin,
  securityProtocolPlugin,
  aiProtocolPlugin,
  apiProtocolPlugin,

  // Example viewer plugins
  flowDesignerPlugin,
  dashboardDesignerPlugin,
  agentViewerPlugin,
];

// Re-export individual plugins for selective use / testing
export {
  objectDesignerPlugin,
  defaultInspectorPlugin,
  uiProtocolPlugin,
  automationProtocolPlugin,
  securityProtocolPlugin,
  aiProtocolPlugin,
  apiProtocolPlugin,
};
