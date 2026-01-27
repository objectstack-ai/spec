/**
 * Version utilities
 * 
 * Import the version number from @objectstack/spec package
 */

import specPackage from '../../../packages/spec/package.json';

/**
 * Get the current version of @objectstack/spec
 */
export function getSpecVersion(): string {
  return `v${specPackage.version}`;
}
