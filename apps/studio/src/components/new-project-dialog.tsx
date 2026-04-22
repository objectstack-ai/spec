// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * NewProjectDialog — provisions a new project for the current
 * organization via `client.projects.create()`.
 *
 * Form fields mirror {@link ProvisionProjectRequestSchema}:
 * displayName (required) + driver. The `organizationId` and `createdBy`
 * fields are injected by the backend from the session.
 *
 * On success, the dialog invokes `onCreated(env)` and closes; the parent
 * (ProjectSwitcher) is responsible for reloading the project list
 * and navigating into the new project.
 */

import { useEffect, useState } from 'react';
import type { Project } from '@objectstack/spec/cloud';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDrivers, useProvisionProject } from '@/hooks/useProjects';
import { toast } from '@/hooks/use-toast';
import { useActiveOrganizationId, useSession } from '@/hooks/useSession';

export interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (env: Project) => void;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: NewProjectDialogProps) {
  const { provision, provisioning } = useProvisionProject();
  const { drivers, loading: driversLoading } = useDrivers();
  const activeOrgId = useActiveOrganizationId();
  const { user } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [driver, setDriver] = useState<string>('');

  // Auto-select a sensible default once drivers load: prefer turso, then memory,
  // otherwise the first registered driver.
  useEffect(() => {
    if (driver || drivers.length === 0) return;
    const preferred =
      drivers.find((d) => d.name === 'turso') ??
      drivers.find((d) => d.name === 'memory') ??
      drivers[0];
    if (preferred) setDriver(preferred.name);
  }, [driver, drivers]);

  const reset = () => {
    setDisplayName('');
    setDriver('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    if (!activeOrgId) {
      toast({
        title: 'No active organization',
        description: 'Select or create an organization first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await provision({
        organizationId: activeOrgId,
        createdBy: user?.id ?? '__session__',
        displayName: displayName.trim(),
        driver: driver || undefined,
      } as any);
      const project = (res?.project ?? res) as Project;
      toast({
        title: 'Project provisioned',
        description: `${project.displayName} is ready.`,
      });
      reset();
      onOpenChange(false);
      onCreated?.(project);
    } catch (err) {
      toast({
        title: 'Provisioning failed',
        description: (err as Error).message ?? 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Provisions a physically isolated database for this project.
              Data in different projects is never shared.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="env-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="env-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alice's dev sandbox"
                required
                autoFocus
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Driver</Label>
              <Select
                value={driver}
                onValueChange={setDriver}
                disabled={driversLoading || drivers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      driversLoading
                        ? 'Loading drivers…'
                        : drivers.length === 0
                          ? 'No drivers registered'
                          : 'Select a driver'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.driverId} value={d.name}>
                      <div className="flex flex-col">
                        <span>{d.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {d.driverId}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Where this project's data will be stored. `memory` is ideal
                for tests; `turso` persists to libSQL.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={provisioning}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={provisioning || !displayName.trim()}>
              {provisioning ? 'Provisioning…' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
