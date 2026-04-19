// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * NewEnvironmentDialog — provisions a new environment for the current
 * organization via `client.environments.create()`.
 *
 * Form fields mirror {@link ProvisionEnvironmentRequestSchema}:
 * slug, displayName, envType, region, plan. The `organizationId` and
 * `createdBy` fields are injected by the backend from the session.
 *
 * On success, the dialog invokes `onCreated(env)` and closes; the parent
 * (EnvironmentSwitcher) is responsible for reloading the environment list
 * and navigating into the new environment.
 */

import { useState } from 'react';
import type { Environment, EnvironmentType } from '@objectstack/spec/cloud';
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
import { useProvisionEnvironment } from '@/hooks/useEnvironments';
import { toast } from '@/hooks/use-toast';

const ENV_TYPES: { value: EnvironmentType; label: string; hint: string }[] = [
  { value: 'development', label: 'Development', hint: 'For makers building and iterating' },
  { value: 'test', label: 'Test', hint: 'Automated test runs, throwaway data' },
  { value: 'sandbox', label: 'Sandbox', hint: 'Isolated clone of production' },
  { value: 'preview', label: 'Preview', hint: 'Feature preview / PR environment' },
  { value: 'staging', label: 'Staging', hint: 'Pre-production parity' },
  { value: 'production', label: 'Production', hint: 'Live, customer-facing data' },
  { value: 'trial', label: 'Trial', hint: 'Time-boxed demo workspace' },
];

export interface NewEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (env: Environment) => void;
}

export function NewEnvironmentDialog({
  open,
  onOpenChange,
  onCreated,
}: NewEnvironmentDialogProps) {
  const { provision, provisioning } = useProvisionEnvironment();
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [envType, setEnvType] = useState<EnvironmentType>('development');
  const [region, setRegion] = useState('');

  const reset = () => {
    setSlug('');
    setDisplayName('');
    setEnvType('development');
    setRegion('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;
    try {
      const res = await provision({
        // organizationId + createdBy come from session on the server.
        organizationId: '__session__',
        createdBy: '__session__',
        slug: slug.trim(),
        displayName: displayName.trim() || undefined,
        envType,
        region: region.trim() || undefined,
      } as any);
      const env = (res?.environment ?? res) as Environment;
      toast({
        title: 'Environment provisioned',
        description: `${env.displayName} (${env.slug}) is ready.`,
      });
      reset();
      onOpenChange(false);
      onCreated?.(env);
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
            <DialogTitle>New environment</DialogTitle>
            <DialogDescription>
              Provisions a physically isolated database for this environment.
              Data in different environments is never shared.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="env-slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="env-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="dev-alice"
                pattern="^[a-z0-9][a-z0-9-]{0,62}$"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Lowercase letters, numbers, and dashes. Unique per organization.
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="env-name">Display name</Label>
              <Input
                id="env-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alice's dev sandbox"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select
                value={envType}
                onValueChange={(v) => setEnvType(v as EnvironmentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENV_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex flex-col">
                        <span>{t.label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {t.hint}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="env-region">Region (optional)</Label>
              <Input
                id="env-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="us-east-1"
              />
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
            <Button type="submit" disabled={provisioning || !slug.trim()}>
              {provisioning ? 'Provisioning…' : 'Create environment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
