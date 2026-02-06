/**
 * App Component - Admin Console
 * 
 * Demonstrates the "Platform Capabilities" of ObjectStack:
 * 1. Metadata Discovery (MetadataExplorer)
 * 2. Generic Data Table (ObjectDataTable)
 * 3. Generic Form (ObjectDataForm)
 */

import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { MetadataExplorer } from './components/MetadataExplorer';
import { ObjectDataTable } from './components/ObjectDataTable';
import { ObjectDataForm } from './components/ObjectDataForm';
import './App.css';

export function App() {
  const [client, setClient] = useState<ObjectStackClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selection State
  const [selectedObject, setSelectedObject] = useState<string | null>('todo_task');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingRecord, setEditingRecord] = useState<any>(null); // null = create new

  useEffect(() => {
    initializeClient();
  }, []);

  async function initializeClient() {
    try {
      const stackClient = new ObjectStackClient({
        baseUrl: '' // Mocked by MSW to /api/v1
      });
      
      // Wait for MSW
      await new Promise(resolve => setTimeout(resolve, 500));
      await stackClient.connect();
      setClient(stackClient);
      setConnected(true);
      console.log('✅ ObjectStack Client connected');
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    }
  }

  // --- Actions ---

  const handleCreate = () => {
    setEditingRecord(null); // New record
    setView('form');
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setView('form');
  };

  const handleFormSuccess = () => {
    setView('list');
    setEditingRecord(null);
    // Table will reload when switching back to list implicitly if we force refresh?
    // Actually ObjectDataTable mounts again or we can trigger refresh.
    // For simplicity, remounting works or we can add a refresh trigger key.
  };

  if (!connected || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
            <h2 className="text-xl font-bold text-gray-700">Connecting to Platform...</h2>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-foreground text-background shadow-md z-10">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="font-extrabold text-2xl tracking-tighter">
                   Object<span className="text-gray-400">Stack</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 border border-gray-600">
                    Console
                </span>
            </div>
            <div className="text-sm opacity-80 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                v1.0.0 (Memory Kernel)
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: Metadata Explorer */}
          <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
              <div className="p-4">
                  <MetadataExplorer 
                      client={client} 
                      selectedObject={selectedObject}
                      onSelectObject={(obj) => {
                          setSelectedObject(obj);
                          setView('list'); // Reset to list when changing objects
                      }}
                  />
              </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 relative">
              {selectedObject ? (
                  <div className="space-y-6 max-w-7xl mx-auto">
                      {/* Toolbar */}
                      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
                           <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {selectedObject}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage records and view schema definition.
                                </p>
                           </div>
                           <button 
                                onClick={handleCreate}
                                className="px-4 py-2 bg-foreground text-white rounded hover:bg-black transition-colors shadow-sm font-medium flex items-center gap-2"
                           >
                               <span>+</span> New Record
                           </button>
                      </div>

                      {/* Data Table */}
                      <ObjectDataTable 
                           key={selectedObject + view} // Force refresh when switching back
                           client={client}
                           objectApiName={selectedObject}
                           onEdit={handleEdit}
                      />
                      
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="text-6xl mb-4">Select an Object</div>
                      <p>Choose an object from the sidebar to manage data.</p>
                  </div>
              )}
          </main>
      </div>

      {/* Modal Form */}
      {view === 'form' && selectedObject && (
          <ObjectDataForm 
              client={client}
              objectApiName={selectedObject}
              record={editingRecord}
              onSuccess={handleFormSuccess}
              onCancel={() => setView('list')}
          />
      )}
    </div>
  );
}
