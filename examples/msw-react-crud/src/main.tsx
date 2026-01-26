/**
 * Main Entry Point
 * 
 * Initializes MSW and renders the React application.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { startMockServer } from './mocks/browser';

// Start MSW before rendering the app
async function bootstrap() {
  // Initialize Mock Service Worker
  await startMockServer();

  // Render the React app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
