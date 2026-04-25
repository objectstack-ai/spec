// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @objectstack/platform-objects
 *
 * Core platform object schemas for ObjectStack.
 * All sys_* objects that every kernel service depends on are defined here.
 *
 * Subpath imports available:
 *   @objectstack/platform-objects/identity  — user, session, org, team, api-key, ...
 *   @objectstack/platform-objects/security  — role, permission-set
 *   @objectstack/platform-objects/audit     — audit-log, presence
 *   @objectstack/platform-objects/tenant    — project, app, package, ...
 *   @objectstack/platform-objects/metadata  — sys_metadata, sys_object, sys_view, ...
 */

export * from './identity/index.js';
export * from './security/index.js';
export * from './audit/index.js';
export * from './tenant/index.js';
export * from './metadata/index.js';
