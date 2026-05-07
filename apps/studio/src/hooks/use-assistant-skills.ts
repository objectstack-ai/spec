// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/config';
import {
  encodeAssistantContext,
  type AssistantContext,
} from './use-assistant-context';

/**
 * Hard-coded copilot for the Studio workspace.
 *
 * Studio is a first-party React host (not an ObjectUI-rendered App),
 * so it does NOT register an `app('studio')` metadata record on the
 * server. Instead it tells the Universal Assistant endpoint which
 * agent to use via an explicit `?agent=` query param on
 * `GET /api/v1/ai/assistant` and a top-level `agent` field on
 * `POST /api/v1/ai/assistant/chat`.
 *
 * The server still keeps the standard resolution chain
 * (`app.defaultAgent` → first active) for runtime ObjectUI apps that
 * DO have App metadata.
 */
export const STUDIO_AGENT = 'metadata_assistant';

export interface SkillSummary {
  name: string;
  label: string;
  description?: string;
  triggerPhrases?: string[];
  toolCount: number;
}

export interface ResolvedAssistant {
  /** Default agent the server resolved for the given context. */
  agent?: { name: string; label: string; role: string };
  /** Skills auto-activated by the agent + context. */
  skills: SkillSummary[];
  /** True while the most-recent fetch is in flight. */
  loading: boolean;
  /** Latest fetch error, if any. */
  error?: string;
}

/**
 * Resolve the default agent + active skills for the current Studio
 * context.
 *
 * Backed by `GET /api/v1/ai/assistant?<context>&agent=metadata_assistant`.
 * Re-fetches whenever the context changes (route navigation, package
 * switch, etc.). The explicit `agent=` is what makes Studio always
 * land on `metadata_assistant` regardless of server-side defaults.
 *
 * Used by:
 * - the chat panel header (to render "via {agent} · {skills}")
 * - the slash-command palette (to populate `/` autocomplete)
 */
export function useAssistantResolution(context: AssistantContext): ResolvedAssistant {
  const baseUrl = getApiBaseUrl();
  const [state, setState] = useState<ResolvedAssistant>({ skills: [], loading: true });

  const params = encodeAssistantContext(context);
  params.set('agent', STUDIO_AGENT);
  const queryString = params.toString();

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    fetch(`${baseUrl}/api/v1/ai/assistant?${queryString}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          agent?: { name: string; label: string; role: string };
          skills?: SkillSummary[];
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          agent: data.agent,
          skills: data.skills ?? [],
          loading: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ skills: [], loading: false, error: String(err?.message ?? err) });
      });

    return () => { cancelled = true; };
  }, [baseUrl, queryString]);

  return state;
}

