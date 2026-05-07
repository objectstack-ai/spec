// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Action } from '@objectstack/spec/ui';

/**
 * Log a Call.
 *
 * Modal-typed cross-domain (global) action: collects subject /
 * duration / notes then writes an `activity` record via the metadata
 * body. The originating record id is forwarded as `related_to_id`.
 */
export const LogCallAction: Action = {
  name: 'log_call',
  label: 'Log a Call',
  icon: 'phone',
  type: 'modal',
  target: 'log_call',
  body: {
    language: 'js',
    source: `
      const recordId = ctx.recordId ?? ctx.record?.id ?? null;
      const activity = await ctx.api.object('activity').insert({
        type: 'call',
        subject: input.subject ? String(input.subject) : 'Untitled Call',
        duration_minutes: input.duration ? Number(input.duration) : 0,
        notes: input.notes ? String(input.notes) : '',
        related_to_id: recordId,
        direction: 'outbound',
        status: 'completed',
        created_by: ctx.user?.id ?? null,
        call_date: new Date().toISOString(),
      });
      return { activityId: activity?.id };
    `,
    capabilities: ['api.write'],
    timeoutMs: 5000,
  },
  locations: ['record_header', 'list_item', 'record_related'],
  params: [
    {
      name: 'subject',
      label: 'Call Subject',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      label: 'Duration (minutes)',
      type: 'number',
      required: true,
    },
    {
      name: 'notes',
      label: 'Call Notes',
      type: 'textarea',
      required: false,
    }
  ],
  successMessage: 'Call logged successfully!',
  refreshAfter: true,
};

/**
 * Export to CSV.
 *
 * Script-typed cross-domain (global) action: dumps the rows of the
 * target object to a CSV string. Object name is forwarded by the
 * dispatcher via `input.objectName` (defaults to `account`).
 */
export const ExportToCsvAction: Action = {
  name: 'export_csv',
  label: 'Export to CSV',
  icon: 'download',
  type: 'script',
  body: {
    language: 'js',
    source: `
      const objectName = input.objectName ?? 'account';
      const raw = await ctx.api.object(objectName).find();
      // Drivers may return either a plain array or { records, total }.
      const records = Array.isArray(raw) ? raw : (raw?.records ?? raw?.value ?? []);
      if (!Array.isArray(records) || records.length === 0) return '';
      const keys = Object.keys(records[0]);
      const header = keys.join(',');
      const rows = records.map((r) => keys.map((k) => r[k] ?? '').join(','));
      return [header, ...rows].join('\\n');
    `,
    capabilities: ['api.read'],
    timeoutMs: 10000,
  },
  locations: ['list_toolbar'],
  successMessage: 'Export completed!',
  refreshAfter: false,
};
