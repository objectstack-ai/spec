/**
 * Demo App Entry Point
 * 
 * This file demonstrates how to set up and use the MSW demo components.
 * It shows the complete setup process from MSW initialization to rendering components.
 */

import React from 'react';
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';
import { UserManagement } from './components/UserManagement';
import { UserList } from './components/UserList';

/**
 * Step 1: Initialize MSW Mock Server
 * 
 * Before using any components, you need to initialize the MSW worker
 * with the ObjectStack protocol handlers.
 */
export async function setupMSW() {
  // Mock protocol - in production, this would come from your runtime
  const mockProtocol = {
    async findData(object: string, params?: any) {
      // Simulate database with in-memory storage
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' },
      ];
    },
    
    async getData(object: string, id: string) {
      const users = await this.findData(object);
      const user = users.find((u: any) => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    },
    
    async createData(object: string, data: any) {
      return { 
        id: Math.random().toString(36).substr(2, 9), 
        ...data 
      };
    },
    
    async updateData(object: string, id: string, data: any) {
      const existing = await this.getData(object, id);
      return { ...existing, ...data };
    },
    
    async deleteData(object: string, id: string) {
      return { id, deleted: true };
    },
  } as any;

  // Initialize ObjectStackServer with mock protocol
  ObjectStackServer.init(mockProtocol);

  // Define MSW handlers for all CRUD operations
  const handlers = [
    // GET /api/v1/data/:object - Find all records
    http.get('/api/v1/data/:object', async ({ params }) => {
      try {
        const result = await ObjectStackServer.findData(params.object as string);
        return HttpResponse.json(result.data, { status: result.status });
      } catch (error) {
        return HttpResponse.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 404 }
        );
      }
    }),

    // GET /api/v1/data/:object/:id - Get single record
    http.get('/api/v1/data/:object/:id', async ({ params }) => {
      try {
        const result = await ObjectStackServer.getData(
          params.object as string,
          params.id as string
        );
        return HttpResponse.json(result.data, { status: result.status });
      } catch (error) {
        return HttpResponse.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 404 }
        );
      }
    }),

    // POST /api/v1/data/:object - Create record
    http.post('/api/v1/data/:object', async ({ params, request }) => {
      try {
        const body = await request.json();
        const result = await ObjectStackServer.createData(
          params.object as string,
          body
        );
        return HttpResponse.json(result.data, { status: result.status });
      } catch (error) {
        return HttpResponse.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 400 }
        );
      }
    }),

    // PATCH /api/v1/data/:object/:id - Update record
    http.patch('/api/v1/data/:object/:id', async ({ params, request }) => {
      try {
        const body = await request.json();
        const result = await ObjectStackServer.updateData(
          params.object as string,
          params.id as string,
          body
        );
        return HttpResponse.json(result.data, { status: result.status });
      } catch (error) {
        return HttpResponse.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 400 }
        );
      }
    }),

    // DELETE /api/v1/data/:object/:id - Delete record
    http.delete('/api/v1/data/:object/:id', async ({ params }) => {
      try {
        const result = await ObjectStackServer.deleteData(
          params.object as string,
          params.id as string
        );
        return HttpResponse.json(result.data, { status: result.status });
      } catch (error) {
        return HttpResponse.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 400 }
        );
      }
    }),
  ];

  // Create and start the worker
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: 'bypass',
  });

  console.log('[MSW] Mock Service Worker started successfully');
  return worker;
}

/**
 * Step 2: Demo Application Component
 * 
 * This shows how to use the components after MSW is initialized.
 */
export const DemoApp: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'full' | 'simple'>('full');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1F2937',
        color: 'white',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0 }}>MSW Frontend Demo</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>
            Using Mock Service Worker for Data Operations
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 24px',
        padding: '0 24px',
      }}>
        <div style={{
          borderBottom: '2px solid #E5E7EB',
          display: 'flex',
          gap: '16px',
        }}>
          <button
            onClick={() => setActiveTab('full')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'full' ? '2px solid #3B82F6' : '2px solid transparent',
              color: activeTab === 'full' ? '#3B82F6' : '#6B7280',
              fontWeight: activeTab === 'full' ? 600 : 400,
              marginBottom: '-2px',
            }}
          >
            Full CRUD Example
          </button>
          <button
            onClick={() => setActiveTab('simple')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'simple' ? '2px solid #3B82F6' : '2px solid transparent',
              color: activeTab === 'simple' ? '#3B82F6' : '#6B7280',
              fontWeight: activeTab === 'simple' ? 600 : 400,
              marginBottom: '-2px',
            }}
          >
            Hooks Example
          </button>
        </div>
      </div>

      {/* Content */}
      <main>
        {activeTab === 'full' && <UserManagement />}
        {activeTab === 'simple' && <UserList />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: '#F8F9FA',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '14px',
      }}>
        <p>
          Built with ObjectStack + MSW | 
          <a 
            href="https://github.com/objectstack-ai/spec" 
            style={{ color: '#3B82F6', marginLeft: '8px' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

/**
 * Step 3: Initialize and Render
 * 
 * This is how you would use it in your actual application:
 */
export async function main() {
  // Initialize MSW first
  await setupMSW();
  
  // Then render your app
  // Note: In a real app, you would use ReactDOM.render() or createRoot()
  // import ReactDOM from 'react-dom/client';
  // const root = ReactDOM.createRoot(document.getElementById('root')!);
  // root.render(<DemoApp />);
  
  console.log('[Demo] Application ready');
}

// Export for use
export default DemoApp;
