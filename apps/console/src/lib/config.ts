/**
 * Console Application Configuration
 * 
 * Supports two runtime modes:
 * - MSW Mode: Uses Mock Service Worker with in-browser ObjectStack kernel
 * - Server Mode: Connects to a real ObjectStack server
 * 
 * Auto-detection: When served under /_studio/ (embedded in CLI via --ui),
 * the console automatically switches to Server mode with same-origin API.
 */

export type RuntimeMode = 'msw' | 'server';

export interface ConsoleConfig {
  /**
   * Runtime mode
   * - 'msw': Mock Service Worker mode (browser-based kernel)
   * - 'server': Connect to real ObjectStack server
   */
  mode: RuntimeMode;
  
  /**
   * Server base URL (used in 'server' mode)
   * This should be the server root, not including /api/v1
   * Empty string means same-origin (used in embedded mode)
   * @default 'http://localhost:3000'
   */
  serverUrl: string;
  
  /**
   * MSW API base path (used in 'msw' mode)
   * This should be empty string since client adds /api/v1/... internally
   * @default ''
   */
  mswBasePath: string;
}

/**
 * Detect if running in embedded mode (served under /_studio/ by CLI)
 */
function isEmbedded(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/_studio');
}

/**
 * Get runtime mode from environment
 */
function getRuntimeMode(): RuntimeMode {
  const envMode = import.meta.env.VITE_RUNTIME_MODE;
  
  if (envMode === 'server') {
    return 'server';
  }
  
  // Auto-detect: embedded mode uses server mode
  if (isEmbedded()) {
    return 'server';
  }
  
  // Default to MSW mode for standalone development
  return 'msw';
}

/**
 * Resolve the server URL based on environment and context
 */
function resolveServerUrl(): string {
  // Explicit env var takes priority (including empty string for same-origin)
  if (import.meta.env.VITE_SERVER_URL != null) {
    return import.meta.env.VITE_SERVER_URL;
  }
  
  // Embedded mode: same-origin API
  if (isEmbedded()) {
    return '';
  }
  
  return 'http://localhost:3000';
}

/**
 * Default configuration values
 */
const defaultConfig: ConsoleConfig = {
  mode: getRuntimeMode(),
  serverUrl: resolveServerUrl(),
  mswBasePath: '',  // Empty - client adds /api/v1/... internally
};

/**
 * Current application configuration
 */
export const config: ConsoleConfig = {
  ...defaultConfig,
};

/**
 * Check if running in MSW mode
 */
export function isMswMode(): boolean {
  return config.mode === 'msw';
}

/**
 * Check if running in Server mode
 */
export function isServerMode(): boolean {
  return config.mode === 'server';
}

/**
 * Get the API base URL based on current mode
 */
export function getApiBaseUrl(): string {
  if (isServerMode()) {
    return config.serverUrl;
  }
  return config.mswBasePath;
}

/**
 * Update configuration at runtime
 * Useful for switching modes programmatically
 */
export function updateConfig(updates: Partial<ConsoleConfig>): void {
  Object.assign(config, updates);
}

/**
 * Log current configuration (for debugging)
 */
export function logConfig(): void {
  console.log('[Console Config]', {
    mode: config.mode,
    apiBaseUrl: getApiBaseUrl(),
    serverUrl: config.serverUrl,
  });
}
