import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { AppSidebar } from "./components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
    <SidebarProvider>
      <AppSidebar 
        client={client} 
        selectedObject={selectedObject} 
        onSelectObject={setSelectedObject} 
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  ObjectStack
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedObject ? selectedObject : 'Home'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {selectedObject ? (
             <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
               {client && (
                 <ObjectDataTable 
                   client={client} 
                   objectApiName={selectedObject} 
                   onEdit={(record) => console.log('Edit', record)}
                 />
               )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
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
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
