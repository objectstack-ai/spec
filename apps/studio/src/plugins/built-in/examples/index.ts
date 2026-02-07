/**
 * Studio Plugin Examples
 * 
 * Complete, runnable example plugins demonstrating different aspects
 * of the Studio plugin API.
 * 
 * These are NOT registered by default — import them individually
 * to test or use as a starting point for custom plugins.
 * 
 * @example
 * ```tsx
 * import { builtInPlugins } from '@/plugins/built-in';
 * import { flowDesignerPlugin } from '@/plugins/built-in/examples/flow-designer-plugin.example';
 * import { dashboardDesignerPlugin } from '@/plugins/built-in/examples/dashboard-designer.example';
 * import { agentViewerPlugin } from '@/plugins/built-in/examples/agent-viewer.example';
 * 
 * const allPlugins = [
 *   ...builtInPlugins,
 *   flowDesignerPlugin,
 *   dashboardDesignerPlugin,
 *   agentViewerPlugin,
 * ];
 * ```
 */

export { flowDesignerPlugin } from './flow-designer-plugin.example';
export { dashboardDesignerPlugin } from './dashboard-designer.example';
export { agentViewerPlugin } from './agent-viewer.example';
