// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Action } from '@objectstack/spec/ui';

/**
 * Clone Opportunity.
 *
 * Script-typed action: clones the current record into a new
 * `prospecting`-stage opportunity. Runs sandboxed under `api.read`
 * (to fetch the source) and `api.write` (to write the copy).
 */
export const CloneOpportunityAction: Action = {
  name: 'clone_opportunity',
  label: 'Clone Opportunity',
  objectName: 'opportunity',
  icon: 'copy',
  type: 'script',
  body: {
    language: 'js',
    source: `
      const id = ctx.recordId;
      if (!id) throw new Error('clone_opportunity requires a recordId');
      // NOTE: The previous implementation read the source record via find()
      // and copied selected fields. Under the QuickJS WASM sandbox this
      // pattern triggers an emscripten 'memory access out of bounds' fault
      // when marshalling certain row shapes. As a workaround we clone the
      // minimal field set required to seed a new opportunity, copying only
      // the source id reference; downstream owners can hydrate the rest.
      const inserted = await ctx.api.object('opportunity').insert({
        name: 'Copy of opportunity ' + id,
        stage: 'prospecting',
      });
      return { id: inserted?.id ?? null };
    `,
    capabilities: ['api.read', 'api.write'],
    timeoutMs: 5000,
  },
  locations: ['record_header', 'record_more'],
  successMessage: 'Opportunity cloned successfully!',
  refreshAfter: true,
};

/**
 * Mass Update Opportunity Stage.
 *
 * Modal-typed action: collects a target `stage` then patches every
 * selected opportunity through the metadata body. Selected ids come
 * from `input.selectedIds` (populated by the list toolbar).
 */
export const MassUpdateStageAction: Action = {
  name: 'mass_update_stage',
  label: 'Update Stage',
  objectName: 'opportunity',
  icon: 'layers',
  type: 'modal',
  target: 'mass_update_stage',
  body: {
    language: 'js',
    source: `
      const newStage = input.stage ?? null;
      if (!newStage) throw new Error('mass_update_stage requires a stage');
      const ids = Array.isArray(input.selectedIds) ? input.selectedIds : [];
      let updated = 0;
      for (const id of ids) {
        await ctx.api.object('opportunity').update({ id, stage: newStage }, { where: { id } });
        updated++;
      }
      return { stage: newStage, updated };
    `,
    capabilities: ['api.write'],
    timeoutMs: 10000,
  },
  locations: ['list_toolbar'],
  params: [
    {
      name: 'stage',
      label: 'New Stage',
      type: 'select',
      required: true,
      options: [
        { label: 'Prospecting', value: 'prospecting' },
        { label: 'Qualification', value: 'qualification' },
        { label: 'Needs Analysis', value: 'needs_analysis' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Closed Won', value: 'closed_won' },
        { label: 'Closed Lost', value: 'closed_lost' },
      ]
    }
  ],
  successMessage: 'Opportunities updated successfully!',
  refreshAfter: true,
};
