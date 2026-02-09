// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

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

// Advanced security components (Phase 2)
export {
  PluginPermissionManager,
  type PermissionGrant,
  type PermissionCheckResult as PluginPermissionCheckResult,
} from './permission-manager.js';

export {
  PluginSandboxRuntime,
  type SandboxContext,
  type ResourceUsage,
} from './sandbox-runtime.js';

export {
  PluginSecurityScanner,
  type ScanTarget,
  type SecurityIssue,
} from './security-scanner.js';
