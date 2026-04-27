// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useEffect, useState } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { getApiBaseUrl } from '../lib/config';

/**
 * Construct an {@link ObjectStackClient} bound to the configured API base
 * URL. The account portal is environment-agnostic — it never sets an active
 * project — so we only initialise `baseUrl`.
 */
export function useObjectStackClient(): ObjectStackClient | null {
  const [client, setClient] = useState<ObjectStackClient | null>(null);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    setClient(new ObjectStackClient({ baseUrl }));
  }, []);

  return client;
}
