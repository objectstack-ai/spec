import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { AppSidebar } from "./components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ObjectDataTable } from './components/ObjectDataTable';
import { ObjectDataForm } from './components/ObjectDataForm';
import { PackageManager } from './components/PackageManager';
import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Database, Layers, Sparkles, Zap } from 'lucide-react';
import { getApiBaseUrl, config } from './lib/config';
import type { InstalledPackage } from '@objectstack/spec/kernel';

function DashboardWelcome() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Hero section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ObjectStack
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          A metadata-driven platform console. Select an object from the sidebar to view and manage your data, or explore the features below.
        </p>
      </div>

      {/* Feature cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Objects</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dynamic</div>
            <CardDescription className="text-xs mt-1">
              Metadata-driven object definitions with auto-generated CRUD
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Layer</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">REST</div>
            <CardDescription className="text-xs mt-1">
              Auto-generated REST endpoints via MSW interception
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UI Components</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">shadcn/ui</div>
            <CardDescription className="text-xs mt-1">
              Beautiful, accessible components built with Radix & Tailwind
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runtime</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Plugin</div>
            <CardDescription className="text-xs mt-1">
              Extensible plugin architecture with lifecycle hooks
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Explore ObjectStack by navigating the sidebar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">1</div>
              <div>
                <p className="text-sm font-medium">Browse Objects</p>
                <p className="text-xs text-muted-foreground mt-0.5">Select an object from the sidebar to view its records in a data table.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">2</div>
              <div>
                <p className="text-sm font-medium">Create Records</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use the "New" button to create records with auto-generated forms.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">3</div>
              <div>
                <p className="text-sm font-medium">Edit & Delete</p>
                <p className="text-xs text-muted-foreground mt-0.5">Inline actions let you edit or remove records with one click.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [client, setClient] = useState<ObjectStackClient | null>(null);
  const [packages, setPackages] = useState<InstalledPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<InstalledPackage | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'packages' | 'object'>('dashboard');
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
    setSelectedView('dashboard');
    setShowForm(false);
    setEditingRecord(null);
  }

  function handleSelectObject(name: string) {
    if (name) {
      setSelectedObject(name);
      setSelectedView('object');
    } else {
      setSelectedObject(null);
      setSelectedView('dashboard');
    }
  }

  function handleSelectView(view: 'dashboard' | 'packages') {
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
        <SiteHeader selectedObject={selectedObject} appLabel={selectedPackage?.manifest?.name || selectedPackage?.manifest?.id} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedView === 'object' && selectedObject ? (
            <div className="flex flex-1 flex-col gap-4 p-4">
              {client && (
                <ObjectDataTable 
                  client={client} 
                  objectApiName={selectedObject} 
                  onEdit={handleEdit}
                />
              )}
            </div>
          ) : selectedView === 'packages' ? (
            client && <PackageManager client={client} />
          ) : (
            <DashboardWelcome />
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
