import {
  Settings,
  Database,
  Package
} from "lucide-react"
import { useState, useEffect } from "react"
import { ObjectStackClient } from '@objectstack/client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  client: ObjectStackClient | null;
  selectedObject: string | null;
  onSelectObject: (name: string) => void;
}

export function AppSidebar({ client, selectedObject, onSelectObject, ...props }: AppSidebarProps) {
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadObjects() {
      if (!client) return;
      setLoading(true);
      try {
        const result: any = await client.meta.getItems('objects');
        let items = [];
        if (Array.isArray(result)) {
            items = result;
        } else if (result && result.success && Array.isArray(result.data)) {
            items = result.data;
        } else if (result && Array.isArray(result.value)) {
            items = result.value;
        }
        setObjects(items);
      } catch (err) {
        console.error("Failed to load objects", err);
      } finally {
        setLoading(false);
      }
    }
    loadObjects();
  }, [client]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b h-14 flex items-center justify-center">
        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            <span>ObjectStack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explorer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                 <div className="px-2 py-4 text-xs text-muted-foreground">Loading...</div>
              ) : objects.map((obj) => (
                <SidebarMenuItem key={obj.name}>
                  <SidebarMenuButton 
                    isActive={selectedObject === obj.name}
                    onClick={() => onSelectObject(obj.name)}
                  >
                    <Package />
                    <span>{obj.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!loading && objects.length === 0 && (
                 <div className="px-2 py-4 text-xs text-muted-foreground flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>No objects found</span>
                 </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
           <SidebarGroupLabel>System</SidebarGroupLabel>
           <SidebarGroupContent>
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
