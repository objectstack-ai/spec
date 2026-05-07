// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Action Definitions Barrel
 *
 * Exports CRM action metadata. Every action ships an inline metadata
 * `body` (sandboxed JS) so the AppPlugin auto-binds the handler at
 * boot — no imperative `engine.registerAction(...)` wiring is needed.
 *
 * `ConvertLeadAction` is the only exception: it is a `flow`-typed
 * action and the screen flow under `src/flows/lead-conversion.flow.ts`
 * carries the implementation.
 */
export { EscalateCaseAction, CloseCaseAction } from './case.actions';
export { MarkPrimaryContactAction, SendEmailAction } from './contact.actions';
export { LogCallAction, ExportToCsvAction } from './global.actions';
export { ConvertLeadAction, CreateCampaignAction } from './lead.actions';
export { CloneOpportunityAction, MassUpdateStageAction } from './opportunity.actions';
