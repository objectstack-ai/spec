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
  Layers,
  type LucideIcon,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
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

/** Icon & label hints for well-known metadata types */
const META_TYPE_HINTS: Record<string, { label: string; icon: LucideIcon }> = {
  object:       { label: 'Objects',       icon: Package },
  objects:      { label: 'Objects',       icon: Package },
  app:          { label: 'Apps',          icon: AppWindow },
  apps:         { label: 'Apps',          icon: AppWindow },
  actions:      { label: 'Actions',       icon: Zap },
  dashboards:   { label: 'Dashboards',    icon: BarChart3 },
  reports:      { label: 'Reports',       icon: FileText },
  flows:        { label: 'Flows',         icon: Workflow },
  agents:       { label: 'Agents',        icon: Bot },
  apis:         { label: 'APIs',          icon: Globe },
  ragPipelines: { label: 'RAG Pipelines', icon: BookOpen },
  profiles:     { label: 'Profiles',      icon: Shield },
  sharingRules: { label: 'Sharing Rules', icon: Shield },
  plugin:       { label: 'Plugins',       icon: Layers },
  plugins:      { label: 'Plugins',       icon: Layers },
  kind:         { label: 'Kinds',         icon: Database },
};

function getTypeLabel(type: string): string {
  return META_TYPE_HINTS[type]?.label || type.charAt(0).toUpperCase() + type.slice(1);
}

function getTypeIcon(type: string): LucideIcon {
  return META_TYPE_HINTS[type]?.icon || Layers;
}

/** Types that are internal / should be hidden from the sidebar */
const HIDDEN_TYPES = new Set(['plugin', 'plugins', 'kind', 'app']);

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  client: ObjectStackClient | null;
  selectedObject: string | null;
  onSelectObject: (name: string) => void;
  apps: AppPackage[];
  selectedApp: AppPackage | null;
  onSelectApp: (app: AppPackage) => void;
}

export function AppSidebar({ client, selectedObject, onSelectObject, apps, selectedApp, onSelectApp, ...props }: AppSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Dynamic metadata: type -> items[]
  const [metaTypes, setMetaTypes] = useState<string[]>([]);
  const [metaItems, setMetaItems] = useState<Record<string, any[]>>({});

  /** Load all metadata types and their items from the server */
  const loadMetadata = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      // 1. Discover all registered metadata types (spec: GetMetaTypesResponse)
      const typesResult = await client.meta.getTypes();
      let types: string[] = [];
      if (typesResult && Array.isArray(typesResult.types)) {
        types = typesResult.types;
      } else if (Array.isArray(typesResult)) {
        types = typesResult as any;
      }
      setMetaTypes(types);

      // 2. Load items for each type in parallel
      const entries = await Promise.all(
        types
          .filter(t => !HIDDEN_TYPES.has(t))
          .map(async (type) => {
            try {
              // Spec: GetMetaItemsResponse = { type, items: any[] }
              const result = await client.meta.getItems(type);
              let items: any[] = [];
              if (Array.isArray(result)) {
                items = result as any;
              } else if (result && Array.isArray(result.items)) {
                items = result.items;
              } else if (result && Array.isArray((result as any).value)) {
                items = (result as any).value;
              }
              return [type, items] as const;
            } catch {
              return [type, []] as const;
            }
          })
      );
      setMetaItems(Object.fromEntries(entries));
    } catch (err) {
      console.error("Failed to load metadata types", err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { loadMetadata(); }, [loadMetadata]);

  // Filter visible types: only those with items, excluding hidden types
  const visibleTypes = metaTypes
    .filter(t => !HIDDEN_TYPES.has(t))
    .filter(t => (metaItems[t]?.length ?? 0) > 0);

  // Apply search filter
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

        {/* Dynamic Metadata Types */}
        {loading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : visibleTypes.map((type) => {
          const items = metaItems[type] || [];
          const TypeIcon = getTypeIcon(type);
          const typeLabel = getTypeLabel(type);
          const isObjectType = type === 'object' || type === 'objects';

          const filtered = items.filter((item: any) =>
            matchesSearch(item.label || item.name || '', item.name || '')
          );
          if (filtered.length === 0 && searchQuery) return null;

          return (
            <SidebarGroup key={type}>
              <SidebarGroupLabel>
                <TypeIcon className="mr-1.5 h-3.5 w-3.5" />
                {typeLabel}
                <SidebarMenuBadge>{items.length}</SidebarMenuBadge>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filtered.map((item: any) => {
                    const itemName = item.name || item.id || 'unknown';
                    const itemLabel = item.label || item.name || 'Untitled';
                    return (
                      <SidebarMenuItem key={itemName}>
                        <SidebarMenuButton
                          isActive={isObjectType && selectedObject === itemName}
                          onClick={isObjectType ? () => onSelectObject(itemName) : undefined}
                          tooltip={itemName}
                        >
                          <TypeIcon className="h-4 w-4" />
                          <span>{itemLabel}</span>
                        </SidebarMenuButton>
                        {isObjectType && item.fields && (
                          <SidebarMenuBadge>
                            {Object.keys(item.fields).length}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {!loading && visibleTypes.length === 0 && (
          <div className="px-4 py-8 text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Database className="h-5 w-5 opacity-40" />
            <span>No metadata registered</span>
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
