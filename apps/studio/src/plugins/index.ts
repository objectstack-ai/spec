// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Studio Plugin System — Public API
 * 
 * @example
 * ```tsx
 * // In App.tsx
 * import { PluginRegistryProvider, PluginHost, builtInPlugins } from './plugins';
 * 
 * function App() {
 *   return (
 *     <PluginRegistryProvider plugins={builtInPlugins}>
 *       <PluginHost metadataType="object" metadataName="account" />
 *     </PluginRegistryProvider>
 *   );
 * }
 * ```
 */

// Types
export type {
  StudioPlugin,
  StudioPluginAPI,
  MetadataViewerProps,
  ActionContext,
  ResolvedViewer,
  ResolvedPanel,
  ResolvedAction,
  ResolvedCommand,
  ResolvedMetadataIcon,
} from './types';

// Registry
export { PluginRegistry, getPluginRegistry, resetPluginRegistry } from './registry';

// React Context
export { PluginRegistryProvider, usePluginRegistry } from './context';

// React Hooks
export {
  useRegistryState,
  useMetadataViewer,
  useMetadataViewers,
  useAvailableModes,
  useMetadataActions,
  useCommands,
  usePanels,
  useMetadataIcon,
  useAllMetadataIcons,
  useSidebarGroups,
} from './hooks';

// Plugin Host
export { PluginHost } from './plugin-host';

// Built-in Plugins
export { builtInPlugins } from './built-in/index';
