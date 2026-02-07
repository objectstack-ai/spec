import {
  Database,
  Package,
  LayoutDashboard,
  ChevronsUpDown,
  Sparkles,
  Search,
  Check,
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
import { useClient } from '@objectstack/client-react';
import type { InstalledPackage } from '@objectstack/spec/kernel';

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
  SidebarSeparator,
  SidebarInput,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  data:         { label: 'Seed Data',     icon: Database },
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
const HIDDEN_TYPES = new Set(['plugin', 'plugins', 'kind', 'app', 'apps', 'package']);

/** Icon mapping for package types */
const PKG_TYPE_ICONS: Record<string, LucideIcon> = {
  app: AppWindow,
  plugin: Layers,
  driver: Database,
  server: Globe,
  ui: Sparkles,
  theme: Sparkles,
  agent: Bot,
  module: Package,
  objectql: Database,
  adapter: Zap,
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedObject: string | null;
  onSelectObject: (name: string) => void;
  selectedMeta?: { type: string; name: string } | null;
  onSelectMeta?: (type: string, name: string) => void;
  packages: InstalledPackage[];
  selectedPackage: InstalledPackage | null;
  onSelectPackage: (pkg: InstalledPackage) => void;
  onSelectView?: (view: 'overview' | 'packages') => void;
  selectedView?: 'overview' | 'packages' | 'object' | 'metadata';
}

export function AppSidebar({ selectedObject, onSelectObject, selectedMeta, onSelectMeta, packages, selectedPackage, onSelectPackage, onSelectView, selectedView, ...props }: AppSidebarProps) {
  const client = useClient();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Dynamic metadata: type -> items[]
  const [metaTypes, setMetaTypes] = useState<string[]>([]);
  const [metaItems, setMetaItems] = useState<Record<string, any[]>>({});

  /** Load all metadata types and their items from the server */
  const loadMetadata = useCallback(async () => {
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

      // Package scope: filter metadata by selected package
      const packageId = selectedPackage?.manifest?.id;

      // 2. Load items for each type in parallel
      const entries = await Promise.all(
        types
          .filter(t => !HIDDEN_TYPES.has(t))
          .map(async (type) => {
            try {
              // Spec: GetMetaItemsResponse = { type, items: any[] }
              const result = await client.meta.getItems(type, packageId ? { packageId } : undefined);
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
  }, [client, selectedPackage]);

  useEffect(() => { loadMetadata(); }, [loadMetadata]);

  // Priority order for sidebar sections — lower index = higher up
  const TYPE_PRIORITY: Record<string, number> = {
    objects: 0, object: 0,
    actions: 1,
    flows: 2,
    dashboards: 3,
    reports: 4,
    agents: 5,
    apis: 6,
    ragPipelines: 7,
    profiles: 8,
    sharingRules: 9,
  };
  const DEFAULT_PRIORITY = 100;

  // Filter visible types: only those with items, excluding hidden types
  // Sort so Objects always appear first
  const visibleTypes = metaTypes
    .filter(t => !HIDDEN_TYPES.has(t))
    .filter(t => (metaItems[t]?.length ?? 0) > 0)
    .sort((a, b) => (TYPE_PRIORITY[a] ?? DEFAULT_PRIORITY) - (TYPE_PRIORITY[b] ?? DEFAULT_PRIORITY));

  // Apply search filter
  const matchesSearch = (label: string, name: string) =>
    !searchQuery ||
    label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    name.toLowerCase().includes(searchQuery.toLowerCase());

  const SelectedPkgIcon = selectedPackage ? (PKG_TYPE_ICONS[selectedPackage.manifest?.type] || Package) : Sparkles;
  const selectedNamespace = selectedPackage?.manifest?.namespace;

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b">
        {/* Package Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <SelectedPkgIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 leading-none overflow-hidden">
                <span className="truncate font-semibold text-sm flex items-center gap-1.5">
                  {selectedPackage ? (selectedPackage.manifest?.name || selectedPackage.manifest?.id) : 'ObjectStack'}
                  {selectedNamespace && (
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1 rounded">
                      {selectedNamespace}
                    </span>
                  )}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedPackage ? `v${selectedPackage.manifest?.version} · ${selectedPackage.manifest?.type}` : 'Loading packages...'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-64" align="start" sideOffset={4}>
            <DropdownMenuLabel>Installed Packages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {packages.map((pkg) => {
              const Icon = PKG_TYPE_ICONS[pkg.manifest?.type] || Package;
              const isSelected = selectedPackage?.manifest?.id === pkg.manifest?.id;
              const namespace = pkg.manifest?.namespace;
              return (
                <DropdownMenuItem
                  key={pkg.manifest?.id}
                  onClick={() => onSelectPackage(pkg)}
                  className="gap-2 py-2"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-1 flex-col leading-tight">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      {pkg.manifest?.name || pkg.manifest?.id}
                      {namespace && (
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1 rounded">
                          {namespace}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v{pkg.manifest?.version} · {pkg.manifest?.type}
                      {!pkg.enabled && ' · disabled'}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
            {packages.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">No packages installed</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Explorer */}
        <SidebarGroup>
          <SidebarGroupLabel>Explorer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedView === 'overview' && !selectedObject}
                  onClick={() => { onSelectObject(''); onSelectView?.('overview'); }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
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
                    // Parse FQN: namespace__shortName
                    const fqnParts = itemName.includes('__') ? itemName.split('__') : [null, itemName];
                    const namespace = fqnParts.length === 2 && fqnParts[0] ? fqnParts[0] : null;

                    const isActive = isObjectType
                      ? selectedObject === itemName
                      : selectedMeta?.type === type && selectedMeta?.name === itemName;

                    const handleClick = isObjectType
                      ? () => onSelectObject(itemName)
                      : () => onSelectMeta?.(type, itemName);
                    
                    return (
                      <SidebarMenuItem key={itemName}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={handleClick}
                          tooltip={`${itemName}${namespace ? ` (${namespace})` : ''}`}
                        >
                          <TypeIcon className="h-4 w-4" />
                          <span className="truncate">
                            {namespace && (
                              <span className="text-xs text-muted-foreground font-mono">{namespace}__</span>
                            )}
                            {itemLabel}
                          </span>
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
                  <SidebarMenuButton 
                    tooltip="Packages"
                    isActive={selectedView === 'packages'}
                    onClick={() => onSelectView?.('packages')}
                  >
                    <Package className="h-4 w-4" />
                    <span>Packages</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
