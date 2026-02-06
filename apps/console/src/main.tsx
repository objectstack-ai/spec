/**
 * Main Entry Point
 * 
 * Initializes the console application with support for two runtime modes:
 * - MSW Mode: Uses Mock Service Worker with in-browser ObjectStack kernel
 * - Server Mode: Connects to a real ObjectStack server
 * 
 * Set VITE_RUNTIME_MODE=server to connect to a real server
 * Set VITE_RUNTIME_MODE=msw (or leave empty) for MSW mode
 */

import './mocks/process-polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppWithHooks } from './AppWithHooks';
import { startMockServer } from './mocks/browser';
import { config, isMswMode, logConfig } from './lib/config';

// Bootstrap the application
async function bootstrap() {
  // Log current configuration
  logConfig();

  // Only start MSW in MSW mode
  if (isMswMode()) {
    console.log('[Console] Starting in MSW mode (in-browser kernel)');
    await startMockServer();
  } else {
    console.log(`[Console] Starting in Server mode (connecting to ${config.serverUrl})`);
  }

  // Switch between traditional approach and hooks-based approach
  // Change this to true to use the hooks version
  const useHooks = false; // Set to true to see hooks in action

  // Render the React app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {useHooks ? <AppWithHooks /> : <App />}
    </React.StrictMode>
  );
}

bootstrap();
