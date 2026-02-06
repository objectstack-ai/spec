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
import { Database } from 'lucide-react';
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
  const [refreshKey, setRefreshKey] = useState(0);

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
    setRefreshKey(k => k + 1);
  };

  if (!connected || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground">Connecting to Platform...</h2>
            {error && <p className="text-destructive font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 md:px-6">
            <div className="mr-4 hidden md:flex items-center space-x-2">
                <div className="font-bold text-xl tracking-tight">
                   Object<span className="text-muted-foreground">Stack</span>
                </div>
                <div className="hidden sm:inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    Console
                </div>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                 <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    v1.0.0 (Memory Kernel)
                </div>
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-muted/10 md:flex">
             <div className="p-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Explorer
             </div>
             <div className="flex-1 overflow-hidden px-2 pb-4">
                <MetadataExplorer 
                    client={client} 
                    selectedObject={selectedObject}
                    onSelectObject={(obj) => {
                       setSelectedObject(obj);
                       setView('list'); 
                       setEditingRecord(null);
                    }}
                />
             </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col bg-muted/5 relative">
            {selectedObject ? (
                <>
                    <ObjectDataTable 
                        key={`${selectedObject}-${refreshKey}`}
                        client={client}
                        objectApiName={selectedObject}
                        onEdit={handleEdit}
                    />
                    {view === 'form' && (
                        <ObjectDataForm 
                            client={client}
                            objectApiName={selectedObject}
                            record={editingRecord}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setView('list')}
                        />
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Database className="h-12 w-12 mb-4 opacity-20" />
                    <div className="text-xl font-medium">Select an Object</div>
                    <p className="opacity-60">Choose an object from the sidebar to manage data.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
