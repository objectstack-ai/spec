/**
 * App Component
 * 
 * Main application component that demonstrates complete CRUD operations
 * using ObjectStack Client with MSW for API mocking.
 */

import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/objectos/client';
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
    // Check if on mobile to scroll
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 border border-error-light bg-background rounded-lg shadow-sm text-center">
          <h1 className="text-xl font-bold text-error mb-2">Connection Error</h1>
          <p className="text-accents-5 mb-6">{error}</p>
          <button 
            onClick={initializeClient}
            className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-accents-7 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!connected || !client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-8 h-8 rounded-full border-4 border-accents-2 border-t-foreground animate-spin"></div>
        <div className="text-center">
          <h1 className="text-lg font-semibold mb-1">Connecting to ObjectStack...</h1>
          <p className="text-accents-5 text-sm">Initializing MSW and ObjectStack Client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen font-sans">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">
          ObjectStack Action
        </h1>
        <p className="text-accents-5 text-lg mb-6">
          Complete CRUD operations using <code className="text-sm bg-accents-1 px-1.5 py-0.5 rounded font-mono text-accents-6">@objectstack/client</code> with Mock Service Worker
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-lighter border border-success-lighter text-success-dark text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          MSW Active - All API calls are mocked
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-sm">
        <section className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
          <TaskForm
            client={client}
            editingTask={editingTask}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className="lg:col-span-8">
          <TaskList
            client={client}
            onEdit={handleEditTask}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>

      <footer className="mt-16 pt-8 border-t border-accents-2 text-center text-sm text-accents-4 space-y-2">
        <p>
          This example demonstrates MSW integration with React components.
          All API calls are intercepted and mocked in the browser.
        </p>
        <p className="font-mono text-xs text-accents-3">
          React + TypeScript + Vite + MSW + @objectstack/client
        </p>
      </footer>
    </div>
  );
}
