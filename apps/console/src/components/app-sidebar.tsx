import {
  Settings,
  Database,
  Package,
  LayoutDashboard,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  Search,
  Check,
  Briefcase,
  CheckSquare,
  Zap,
  BarChart3,
  FileText,
  Workflow,
  Bot,
  Globe,
  BookOpen,
  Shield,
  AppWindow,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { ObjectStackClient } from '@objectstack/client';
import type { AppPackage } from "@/mocks/browser";

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

const APP_ICONS: Record<string, React.ElementType> = {
  'check-square': CheckSquare,
  'briefcase': Briefcase,
};

/** Metadata category definition for sidebar display */
interface MetadataCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  configKey: string;
}

const METADATA_CATEGORIES: MetadataCategory[] = [
  { key: 'objects',       label: 'Objects',       icon: Package,     configKey: 'objects' },
  { key: 'apps',          label: 'Apps',          icon: AppWindow,   configKey: 'apps' },
  { key: 'actions',       label: 'Actions',       icon: Zap,         configKey: 'actions' },
  { key: 'dashboards',    label: 'Dashboards',    icon: BarChart3,   configKey: 'dashboards' },
  { key: 'reports',       label: 'Reports',       icon: FileText,    configKey: 'reports' },
  { key: 'flows',         label: 'Flows',         icon: Workflow,    configKey: 'flows' },
  { key: 'agents',        label: 'Agents',        icon: Bot,         configKey: 'agents' },
  { key: 'apis',          label: 'APIs',          icon: Globe,       configKey: 'apis' },
  { key: 'ragPipelines',  label: 'RAG Pipelines', icon: BookOpen,    configKey: 'ragPipelines' },
  { key: 'profiles',      label: 'Profiles',      icon: Shield,      configKey: 'profiles' },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  client: ObjectStackClient | null;
  selectedObject: string | null;
  onSelectObject: (name: string) => void;
  apps: AppPackage[];
  selectedApp: AppPackage | null;
  onSelectApp: (app: AppPackage) => void;
}

export function AppSidebar({ client, selectedObject, onSelectObject, apps, selectedApp, onSelectApp, ...props }: AppSidebarProps) {
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

  // Build metadata sections from selected app config
  const metadataSections = useMemo(() => {
    if (!selectedApp) return [];
    const cfg = selectedApp.config;
    return METADATA_CATEGORIES
      .map(cat => {
        const items: any[] = cfg[cat.configKey] || [];
        if (items.length === 0) return null;
        return {
          ...cat,
          items: items.map((item: any) => ({
            name: item.name || 'unknown',
            label: item.label || item.name || 'Untitled',
          })),
        };
      })
      .filter(Boolean) as (MetadataCategory & { items: { name: string; label: string }[] })[];
  }, [selectedApp]);

  // For objects, merge runtime definitions from the registry with the config list
  const appObjectNames = selectedApp
    ? (selectedApp.config.objects || []).map((o: any) => o.name)
    : [];
  const runtimeObjects = selectedApp
    ? objects.filter(obj => appObjectNames.includes(obj.name))
    : objects;

  // Apply search filter across all sections
  const matchesSearch = (label: string, name: string) =>
    !searchQuery ||
    label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    name.toLowerCase().includes(searchQuery.toLowerCase());

  const AppIcon = selectedApp?.icon ? (APP_ICONS[selectedApp.icon] || Sparkles) : Sparkles;

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b">
        {/* App Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <AppIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 leading-none overflow-hidden">
                <span className="truncate font-semibold text-sm">
                  {selectedApp ? selectedApp.label : 'ObjectStack'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedApp ? selectedApp.description : 'Select an app'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-64" align="start" sideOffset={4}>
            <DropdownMenuLabel>Applications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {apps.map((app) => {
              const Icon = app.icon ? (APP_ICONS[app.icon] || Package) : Package;
              return (
                <DropdownMenuItem
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className="gap-2 py-2"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-1 flex-col leading-tight">
                    <span className="text-sm font-medium">{app.label}</span>
                    {app.description && (
                      <span className="text-xs text-muted-foreground">{app.description}</span>
                    )}
                  </div>
                  {selectedApp?.id === app.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
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

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <SidebarInput
              placeholder="Search metadata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Metadata Categories */}
        {metadataSections.map((section) => {
          const CatIcon = section.icon;

          // For objects, use runtime definitions (with field counts from registry)
          if (section.key === 'objects') {
            const filtered = runtimeObjects.filter(obj =>
              matchesSearch(obj.label || obj.name, obj.name)
            );
            if (filtered.length === 0 && searchQuery) return null;
            return (
              <SidebarGroup key={section.key}>
                <SidebarGroupLabel>
                  <CatIcon className="mr-1.5 h-3.5 w-3.5" />
                  {section.label}
                  <SidebarMenuBadge>{runtimeObjects.length}</SidebarMenuBadge>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {loading ? (
                      <>
                        <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                        <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                      </>
                    ) : filtered.map((obj) => (
                      <SidebarMenuItem key={obj.name}>
                        <SidebarMenuButton
                          isActive={selectedObject === obj.name}
                          onClick={() => onSelectObject(obj.name)}
                          tooltip={obj.label}
                        >
                          <Package className="h-4 w-4" />
                          <span>{obj.label || obj.name}</span>
                        </SidebarMenuButton>
                        {obj.fields && (
                          <SidebarMenuBadge>
                            {Object.keys(obj.fields).length}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // Other metadata categories (read-only display)
          const filtered = section.items.filter(item =>
            matchesSearch(item.label, item.name)
          );
          if (filtered.length === 0 && searchQuery) return null;
          return (
            <SidebarGroup key={section.key}>
              <SidebarGroupLabel>
                <CatIcon className="mr-1.5 h-3.5 w-3.5" />
                {section.label}
                <SidebarMenuBadge>{section.items.length}</SidebarMenuBadge>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filtered.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton tooltip={item.name}>
                        <CatIcon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {!loading && metadataSections.length === 0 && (
          <div className="px-4 py-8 text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Database className="h-5 w-5 opacity-40" />
            <span>No metadata in this app</span>
          </div>
        )}

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
