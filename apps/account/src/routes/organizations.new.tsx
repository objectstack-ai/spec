// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useCreateOrganization, useSession } from '@/hooks/useSession';

export const Route = createFileRoute('/organizations/new')({
  component: NewOrgPage,
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function NewOrgPage() {
  const { t } = useObjectTranslation();
  const navigate = useNavigate();
  const { create, creating } = useCreateOrganization();
  const { setActiveOrganization, reloadOrganizations } = useSession();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugDirty, setSlugDirty] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugDirty) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await create({ name, slug: slug || undefined });
      const created = (res as any)?.data ?? res;
      const newId = created?.id ?? created?.organization?.id;
      if (newId) {
        await setActiveOrganization(newId).catch(() => {});
      }
      await reloadOrganizations().catch(() => {});
      toast({ title: t('organizations.new.successToast') });
      // Hand off to the platform home — the new org is now the active one,
      // and the user wants to start using the product, not stare at org
      // settings. They can manage the org later from /organizations.
      window.location.assign('/');
    } catch (err) {
      toast({
        title: t('organizations.new.failed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.new.title')}</CardTitle>
              <CardDescription>
                {t('organizations.new.description')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t('organizations.new.name')}</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={t('organizations.new.namePlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">{t('organizations.new.slug')}</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugDirty(true);
                    }}
                    placeholder={t('organizations.new.slugPlaceholder')}
                    pattern="[a-z0-9-]+"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {t('organizations.new.slugHint')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate({ to: '/organizations' })}
                >
                  {t('organizations.new.cancel')}
                </Button>
                <Button type="submit" disabled={creating || !name}>
                  {creating ? t('organizations.new.submitting') : t('organizations.new.submit')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
