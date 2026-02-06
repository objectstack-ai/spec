/**
 * Console Application Configuration
 * 
 * Supports two runtime modes:
 * - MSW Mode: Uses Mock Service Worker with in-browser ObjectStack kernel
 * - Server Mode: Connects to a real ObjectStack server
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
   * @default 'http://localhost:5000/api/v1'
   */
  serverUrl: string;
  
  /**
   * MSW API base path (used in 'msw' mode)
   * @default '/api/v1'
   */
  mswBasePath: string;
}

/**
 * Get runtime mode from environment
 */
function getRuntimeMode(): RuntimeMode {
  const envMode = import.meta.env.VITE_RUNTIME_MODE;
  
  if (envMode === 'server') {
    return 'server';
  }
  
  // Default to MSW mode for development
  return 'msw';
}

/**
 * Default configuration values
 */
const defaultConfig: ConsoleConfig = {
  mode: getRuntimeMode(),
  serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api/v1',
  mswBasePath: '/api/v1',
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
