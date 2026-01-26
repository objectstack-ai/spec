/**
 * App Component
 * 
 * Main application component that demonstrates complete CRUD operations
 * using ObjectStack Client with MSW for API mocking.
 */

import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import type { Task } from './types';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import './App.css';

export function App() {
  const [client, setClient] = useState<ObjectStackClient | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeClient();
  }, []);

  async function initializeClient() {
    try {
      // Initialize ObjectStack Client pointing to our mocked API
      // Note: We use an empty baseUrl because the Discovery Endpoint is at /api/v1
      // and the server routes (returned by connect) already include the /api/v1 prefix.
      const stackClient = new ObjectStackClient({
        baseUrl: ''
      });

      // Connect to the server (will be intercepted by MSW)
      await stackClient.connect();
      
      setClient(stackClient);
      setConnected(true);
      console.log('✅ ObjectStack Client connected (via MSW)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize client');
      console.error('Failed to initialize client:', err);
    }
  }

  function handleFormSuccess() {
    setEditingTask(null);
    // Trigger refresh of task list
    setRefreshTrigger(prev => prev + 1);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h1>Connection Error</h1>
          <p>{error}</p>
          <button onClick={initializeClient}>Retry</button>
        </div>
      </div>
    );
  }

  if (!connected || !client) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <h1>Connecting to ObjectStack...</h1>
          <p>Initializing MSW and ObjectStack Client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📋 ObjectStack MSW + React CRUD Example</h1>
        <p className="subtitle">
          Complete CRUD operations using <code>@objectstack/client</code> with Mock Service Worker
        </p>
        <div className="status-badge">
          <span className="status-indicator"></span>
          MSW Active - All API calls are mocked
        </div>
      </header>

      <main className="app-main">
        <section className="form-section">
          <TaskForm
            client={client}
            editingTask={editingTask}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className="list-section">
          <TaskList
            client={client}
            onEdit={handleEditTask}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>
          This example demonstrates MSW integration with React components.
          All API calls are intercepted and mocked in the browser.
        </p>
        <p className="tech-stack">
          Tech: React + TypeScript + Vite + MSW + @objectstack/client
        </p>
      </footer>
    </div>
  );
}
