// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * PackageSwitcher
 *
 * Extracted from AppSidebar's SidebarHeader dropdown.
 * Displays the current package and provides a dropdown menu to switch packages.
 * Used in the TopBar for global chrome.
 */

import {
  Package,
  AppWindow,
  Layers,
  Database,
  Globe,
  Sparkles,
  Bot,
  Zap,
  ChevronsUpDown,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { InstalledPackage } from '@objectstack/spec/kernel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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

interface PackageSwitcherProps {
  packages: InstalledPackage[];
  selectedPackage: InstalledPackage | null;
  onSelectPackage: (pkg: InstalledPackage) => void;
}

export function PackageSwitcher({
  packages,
  selectedPackage,
  onSelectPackage,
}: PackageSwitcherProps) {
  const SelectedPkgIcon = selectedPackage
    ? PKG_TYPE_ICONS[selectedPackage.manifest?.type] || Package
    : Sparkles;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 px-2 text-sm font-medium"
        >
          <SelectedPkgIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {selectedPackage ? (
            <span className="max-w-[140px] truncate">
              {selectedPackage.manifest?.name || selectedPackage.manifest?.id}
            </span>
          ) : (
            <span className="text-muted-foreground">Select package</span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[280px]"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Installed Packages
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {packages.map((pkg) => {
          const Icon = PKG_TYPE_ICONS[pkg.manifest?.type] || Package;
          const isSelected = selectedPackage?.manifest?.id === pkg.manifest?.id;
          return (
            <DropdownMenuItem
              key={pkg.manifest?.id}
              onSelect={(e) => {
                e.preventDefault();
                onSelectPackage(pkg);
              }}
              className="gap-2 py-2"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-1 flex-col leading-tight">
                <span className="text-sm font-medium">
                  {pkg.manifest?.name || pkg.manifest?.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  v{pkg.manifest?.version} · {pkg.manifest?.type}
                  {!pkg.enabled && ' · disabled'}
                </span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        {packages.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No packages installed
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
