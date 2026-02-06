import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { AppSidebar } from "./components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ObjectDataTable } from './components/ObjectDataTable';
import { Toaster } from "@/components/ui/toaster"

export default function App() {
  const [client, setClient] = useState<ObjectStackClient | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this might come from env or config
    // Using simple browser URL relative path for vite proxy or direct connection
    const baseUrl = '/api/v1'; 
    
    // Create client
    const newClient = new ObjectStackClient({
      baseUrl,
    });
    
    setClient(newClient);
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 16)", 
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset"
        client={client} 
        selectedObject={selectedObject} 
        onSelectObject={setSelectedObject} 
      />
      <SidebarInset>
        <SiteHeader selectedObject={selectedObject} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-4 h-full">
             {selectedObject ? (
                <div className="flex-1 rounded-xl bg-muted/50 p-4 relative h-full min-h-0">
                  <div className="absolute inset-0 p-4 overflow-auto">
                    {client && (
                      <ObjectDataTable 
                        client={client} 
                        objectApiName={selectedObject} 
                        onEdit={(record) => console.log('Edit', record)}
                      />
                    )}
                  </div>
                </div>
             ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full min-h-0">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                      Welcome to ObjectStack
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select an object from the sidebar to view its records.
                    </p>
                  </div>
                </div>
             )}
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
