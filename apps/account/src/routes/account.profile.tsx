// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useObjectTranslation } from '@object-ui/i18n';
import { useClient } from '@objectstack/client-react';
import { Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

export const Route = createFileRoute('/account/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useObjectTranslation();
  const client = useClient() as any;
  const { user, refresh } = useSession();
  const [name, setName] = useState(user?.name ?? '');
  const [image, setImage] = useState<string | null>((user as any)?.image ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.name ?? '');
    setImage((user as any)?.image ?? null);
  }, [user?.id, user?.name, (user as any)?.image]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await client.auth.updateUser({ name, image });
      await refresh();
      toast({ title: t('profile.updated') });
    } catch (err) {
      toast({
        title: t('profile.updateFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setUploading(true);
    try {
      // Storage may be disabled in a given deployment; fall back gracefully.
      if (!client?.storage?.upload) {
        throw new Error(t('profile.avatarStorageUnavailable'));
      }
      const uploaded = await client.storage.upload(file, 'user');
      const url = (uploaded as any)?.data?.url ?? (uploaded as any)?.url;
      if (!url) throw new Error('Upload returned no URL');
      setImage(url);
      // Persist immediately so other tabs see the new avatar without a save.
      await client.auth.updateUser({ image: url });
      await refresh();
      toast({ title: t('profile.avatarUpdated') });
    } catch (err) {
      toast({
        title: t('profile.avatarUploadFailed'),
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const initials = (user?.name ?? user?.email ?? '?')
    .split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('profile.title')}</CardTitle>
        <CardDescription>{t('profile.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {image ? <AvatarImage src={image} alt={user?.name ?? ''} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePickAvatar}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? t('profile.avatarUploading') : t('profile.changeAvatar')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('profile.avatarHint')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">{t('profile.email')}</Label>
            <Input id="profile-email" value={user?.email ?? ''} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">{t('profile.name')}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? t('common.saving') : t('profile.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
