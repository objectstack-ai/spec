/**
 * Hub Protocol (Re-exports)
 * 
 * Hub protocols have been reorganized:
 * - tenant, license, registry-config → @objectstack/spec/system
 * - plugin-registry, plugin-security → @objectstack/spec/kernel
 * 
 * Cloud-specific protocols (marketplace, composer, space, hub-federation)
 * have been migrated to the cloud project.
 * 
 * @deprecated Import from '@objectstack/spec/system' or '@objectstack/spec/kernel' directly.
 */
export * from '../system/tenant.zod';
export * from '../system/license.zod';
export * from '../system/registry-config.zod';
export * from '../kernel/plugin-registry.zod';
export * from '../kernel/plugin-security.zod';
