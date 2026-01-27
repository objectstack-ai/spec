/**
 * Version utilities
 * 
 * Import the version number from @objectstack/spec package
 */

import specPackage from '../../../packages/spec/package.json';

/**
 * The current version of @objectstack/spec
 * Computed once at module initialization
 */
export const SPEC_VERSION = `v${specPackage.version}`;
