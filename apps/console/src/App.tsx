import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { AppSidebar } from "./components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DeveloperOverview } from './components/DeveloperOverview';
import { ObjectExplorer } from './components/ObjectExplorer';
import { ObjectDataForm } from './components/ObjectDataForm';
import { PackageManager } from './components/PackageManager';
import { Toaster } from "@/components/ui/toaster"
import { getApiBaseUrl, config } from './lib/config';
import type { InstalledPackage } from '@objectstack/spec/kernel';

export default function App() {
  const [client, setClient] = useState<ObjectStackClient | null>(null);
  const [packages, setPackages] = useState<InstalledPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<InstalledPackage | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'packages' | 'object'>('overview');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // 1. Create client
  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    console.log(`[App] Connecting to API: ${baseUrl} (mode: ${config.mode})`);
    
    const newClient = new ObjectStackClient({
      baseUrl,
    });
    setClient(newClient);
  }, []);

  // 2. Fetch installed packages from the server API
  useEffect(() => {
    if (!client) return;
    let mounted = true;

    async function loadPackages() {
      try {
        // Spec: GET /api/v1/packages → ListPackagesResponse = { packages: InstalledPackage[], total }
        const result = await client!.packages.list();
        const items: InstalledPackage[] = result?.packages || [];
        
        console.log('[App] Fetched packages from API:', items.map((p) => p.manifest?.name || p.manifest?.id));
        
        if (mounted && items.length > 0) {
          setPackages(items);
          setSelectedPackage(items[0]);
        }
      } catch (err) {
        console.error('[App] Failed to fetch packages from API:', err);
      }
    }

    loadPackages();
    return () => { mounted = false; };
  }, [client]);

  function handleEdit(record: any) {
    setEditingRecord(record);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingRecord(null);
    // Force a re-render of the table by toggling selected object
    const current = selectedObject;
    setSelectedObject(null);
    setTimeout(() => setSelectedObject(current), 0);
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingRecord(null);
  }

  function handleSelectPackage(pkg: InstalledPackage) {
    setSelectedPackage(pkg);
    setSelectedObject(null);
    setSelectedView('overview');
    setShowForm(false);
    setEditingRecord(null);
  }

  function handleSelectObject(name: string) {
    if (name) {
      setSelectedObject(name);
      setSelectedView('object');
    } else {
      setSelectedObject(null);
      setSelectedView('overview');
    }
  }

  function handleSelectView(view: 'overview' | 'packages') {
    setSelectedView(view);
    setSelectedObject(null);
    setShowForm(false);
    setEditingRecord(null);
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        client={client} 
        selectedObject={selectedObject} 
        onSelectObject={handleSelectObject}
        packages={packages}
        selectedPackage={selectedPackage}
        onSelectPackage={handleSelectPackage}
        onSelectView={handleSelectView}
        selectedView={selectedView}
      />
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <SiteHeader
          selectedObject={selectedObject}
          selectedView={selectedView}
          packageLabel={selectedPackage?.manifest?.name || selectedPackage?.manifest?.id}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedView === 'object' && selectedObject ? (
            client && (
              <ObjectExplorer
                client={client}
                objectApiName={selectedObject}
                onEdit={handleEdit}
              />
            )
          ) : selectedView === 'packages' ? (
            client && <PackageManager client={client} />
          ) : (
            client && (
              <DeveloperOverview
                client={client}
                packages={packages}
                onNavigate={(view, detail) => {
                  if (view === 'packages') handleSelectView('packages');
                  else if (detail) handleSelectObject(detail);
                }}
              />
            )
          )}
        </div>
      </main>

      {/* Form Dialog */}
      {showForm && client && selectedObject && (
        <ObjectDataForm
          client={client}
          objectApiName={selectedObject}
          record={editingRecord && Object.keys(editingRecord).length > 0 ? editingRecord : undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <Toaster />
    </SidebarProvider>
  )
}
