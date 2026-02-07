import { useState, useEffect, useCallback } from 'react';
import { useClient } from '@objectstack/client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Power, PowerOff, Trash2, RefreshCw, AppWindow, Layers } from 'lucide-react';

import type { InstalledPackage } from '@objectstack/spec/kernel';

export function PackageManager() {
  const client = useClient();
  const [packages, setPackages] = useState<InstalledPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.packages.list();
      setPackages(result?.packages || []);
    } catch (err: any) {
      console.error('[PackageManager] Failed to load packages:', err);
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  async function handleToggle(pkg: InstalledPackage) {
    try {
      if (pkg.enabled) {
        await client.packages.disable(pkg.manifest.id);
      } else {
        await client.packages.enable(pkg.manifest.id);
      }
      await loadPackages();
    } catch (err: any) {
      console.error('[PackageManager] Toggle failed:', err);
    }
  }

  async function handleUninstall(pkg: InstalledPackage) {
    if (!confirm(`Uninstall "${pkg.manifest.name}"? This cannot be undone.`)) return;
    try {
      await client.packages.uninstall(pkg.manifest.id);
      await loadPackages();
    } catch (err: any) {
      console.error('[PackageManager] Uninstall failed:', err);
    }
  }

  const typeColors: Record<string, string> = {
    app: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    plugin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    driver: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    server: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    module: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Package Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage installed packages. A package may contain apps, objects, actions, and other metadata.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPackages} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-destructive text-sm">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Package list */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="h-3 w-60 bg-muted rounded mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Layers className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No packages installed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => (
            <Card 
              key={pkg.manifest.id}
              className={!pkg.enabled ? 'opacity-60' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {pkg.manifest.type === 'app' ? (
                      <AppWindow className="h-5 w-5 shrink-0 text-blue-500" />
                    ) : (
                      <Package className="h-5 w-5 shrink-0 text-purple-500" />
                    )}
                    <CardTitle className="text-base truncate">
                      {pkg.manifest.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-xs font-mono">
                      v{pkg.manifest.version}
                    </Badge>
                    <Badge className={`text-xs ${typeColors[pkg.manifest.type] || typeColors.module}`}>
                      {pkg.manifest.type}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-xs mt-1">
                  {pkg.manifest.description || pkg.manifest.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge 
                      variant={pkg.enabled ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {pkg.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {pkg.installedAt && (
                      <span>Installed {new Date(pkg.installedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleToggle(pkg)}
                      title={pkg.enabled ? 'Disable' : 'Enable'}
                    >
                      {pkg.enabled ? (
                        <PowerOff className="h-3.5 w-3.5" />
                      ) : (
                        <Power className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleUninstall(pkg)}
                      title="Uninstall"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
