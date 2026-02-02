/**
 * Security Module
 * 
 * Provides security features for the ObjectStack microkernel:
 * - Plugin signature verification
 * - Plugin configuration validation
 * - Permission and capability enforcement
 * 
 * @module @objectstack/core/security
 */

export {
  PluginSignatureVerifier,
  type PluginSignatureConfig,
  type SignatureVerificationResult,
} from './plugin-signature-verifier.js';

export {
  PluginConfigValidator,
  createPluginConfigValidator,
} from './plugin-config-validator.js';

export {
  PluginPermissionEnforcer,
  SecurePluginContext,
  createPluginPermissionEnforcer,
  type PluginPermissions,
  type PermissionCheckResult,
} from './plugin-permission-enforcer.js';
