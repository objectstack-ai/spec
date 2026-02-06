/**
 * Main Entry Point
 * 
 * Initializes MSW and renders the React application.
 */

import './mocks/process-polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { AppWithHooks } from './AppWithHooks';
import { startMockServer } from './mocks/browser';

// Start MSW before rendering the app
async function bootstrap() {
  // Initialize Mock Service Worker
  await startMockServer();

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
