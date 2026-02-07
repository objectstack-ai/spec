/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Runtime mode for the console application
   * - 'msw': Mock Service Worker mode (browser-based kernel)
   * - 'server': Connect to real ObjectStack server
   */
  readonly VITE_RUNTIME_MODE: 'msw' | 'server';
  
  /**
   * ObjectStack server URL (used when VITE_RUNTIME_MODE=server)
   */
  readonly VITE_SERVER_URL: string;

  /**
   * Demo / playground mode.
   * When 'true', forces MSW mode and shows demo UI hints.
   * Set at build time for dedicated playground deployments.
   */
  readonly VITE_DEMO_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
