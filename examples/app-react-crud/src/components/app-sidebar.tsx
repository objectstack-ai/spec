import {
  Settings,
  Database,
  Package,
  LayoutDashboard,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  Search,
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
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  client: ObjectStackClient | null;
  selectedObject: string | null;
  onSelectObject: (name: string) => void;
}

export function AppSidebar({ client, selectedObject, onSelectObject, ...props }: AppSidebarProps) {
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredObjects = objects.filter(obj =>
    !searchQuery || 
    obj.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    obj.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-sm">ObjectStack</span>
            <span className="text-xs text-muted-foreground">Platform Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={!selectedObject}
                  onClick={() => onSelectObject('')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Objects</SidebarGroupLabel>
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <SidebarInput
                placeholder="Search objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <>
                  <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                </>
              ) : filteredObjects.map((obj) => (
                <SidebarMenuItem key={obj.name}>
                  <SidebarMenuButton 
                    isActive={selectedObject === obj.name}
                    onClick={() => onSelectObject(obj.name)}
                    tooltip={obj.label}
                  >
                    <Package className="h-4 w-4" />
                    <span>{obj.label}</span>
                  </SidebarMenuButton>
                  {obj.fields && (
                    <SidebarMenuBadge>
                      {Object.keys(obj.fields).length}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
              {!loading && filteredObjects.length === 0 && (
                <div className="px-2 py-6 text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Database className="h-5 w-5 opacity-40" />
                  <span>{searchQuery ? 'No matching objects' : 'No objects found'}</span>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />

        <SidebarGroup>
           <SidebarGroupLabel>System</SidebarGroupLabel>
           <SidebarGroupContent>
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      OS
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Admin User</span>
                    <span className="truncate text-xs text-muted-foreground">admin@objectstack.dev</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                        OS
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Admin User</span>
                      <span className="truncate text-xs text-muted-foreground">admin@objectstack.dev</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
