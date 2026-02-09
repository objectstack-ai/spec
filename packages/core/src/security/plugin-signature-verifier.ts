// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Logger } from '@objectstack/spec/contracts';
import type { PluginMetadata } from '../plugin-loader.js';

// Conditionally import crypto for Node.js environments
let cryptoModule: typeof import('crypto') | null = null;


/**
 * Plugin Signature Configuration
 * Controls how plugin signatures are verified
 */
export interface PluginSignatureConfig {
  /**
   * Map of publisher IDs to their trusted public keys
   * Format: { 'com.objectstack': '-----BEGIN PUBLIC KEY-----...' }
   */
  trustedPublicKeys: Map<string, string>;
  
  /**
   * Signature algorithm to use
   * - RS256: RSA with SHA-256
   * - ES256: ECDSA with SHA-256
   */
  algorithm: 'RS256' | 'ES256';
  
  /**
   * Strict mode: reject plugins without signatures
   * - true: All plugins must be signed
   * - false: Unsigned plugins are allowed with warning
   */
  strictMode: boolean;
  
  /**
   * Allow self-signed plugins in development
   */
  allowSelfSigned?: boolean;
}

/**
 * Plugin Signature Verification Result
 */
export interface SignatureVerificationResult {
  verified: boolean;
  error?: string;
  publisherId?: string;
  algorithm?: string;
  signedAt?: Date;
}

/**
 * Plugin Signature Verifier
 * 
 * Implements cryptographic verification of plugin signatures to ensure:
 * 1. Plugin integrity - code hasn't been tampered with
 * 2. Publisher authenticity - plugin comes from trusted source
 * 3. Non-repudiation - publisher cannot deny signing
 * 
 * Architecture:
 * - Uses Node.js crypto module for signature verification
 * - Supports RSA (RS256) and ECDSA (ES256) algorithms
 * - Verifies against trusted public key registry
 * - Computes hash of plugin code for integrity check
 * 
 * Security Model:
 * - Public keys are pre-registered and trusted
 * - Plugin signature is verified before loading
 * - Strict mode rejects unsigned plugins
 * - Development mode allows self-signed plugins
 */
export class PluginSignatureVerifier {
  private config: PluginSignatureConfig;
  private logger: Logger;
  
  constructor(config: PluginSignatureConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    
    this.validateConfig();
  }
  
  /**
   * Verify plugin signature
   * 
   * @param plugin - Plugin metadata with signature
   * @returns Verification result
   * @throws Error if verification fails in strict mode
   */
  async verifyPluginSignature(plugin: PluginMetadata): Promise<SignatureVerificationResult> {
    // Handle unsigned plugins
    if (!plugin.signature) {
      return this.handleUnsignedPlugin(plugin);
    }
    
    try {
      // 1. Extract publisher ID from plugin name (reverse domain notation)
      const publisherId = this.extractPublisherId(plugin.name);
      
      // 2. Get trusted public key for publisher
      const publicKey = this.config.trustedPublicKeys.get(publisherId);
      if (!publicKey) {
        const error = `No trusted public key for publisher: ${publisherId}`;
        this.logger.warn(error, { plugin: plugin.name, publisherId });
        
        if (this.config.strictMode && !this.config.allowSelfSigned) {
          throw new Error(error);
        }
        
        return {
          verified: false,
          error,
          publisherId,
        };
      }
      
      // 3. Compute plugin code hash
      const pluginHash = this.computePluginHash(plugin);
      
      // 4. Verify signature using crypto module
      const isValid = await this.verifyCryptoSignature(
        pluginHash,
        plugin.signature,
        publicKey
      );
      
      if (!isValid) {
        const error = `Signature verification failed for plugin: ${plugin.name}`;
        this.logger.error(error, undefined, { plugin: plugin.name, publisherId });
        throw new Error(error);
      }
      
      this.logger.info(`✅ Plugin signature verified: ${plugin.name}`, {
        plugin: plugin.name,
        publisherId,
        algorithm: this.config.algorithm,
      });
      
      return {
        verified: true,
        publisherId,
        algorithm: this.config.algorithm,
      };
      
    } catch (error) {
      this.logger.error(`Signature verification error: ${plugin.name}`, error as Error);
      
      if (this.config.strictMode) {
        throw error;
      }
      
      return {
        verified: false,
        error: (error as Error).message,
      };
    }
  }
  
  /**
   * Register a trusted public key for a publisher
   */
  registerPublicKey(publisherId: string, publicKey: string): void {
    this.config.trustedPublicKeys.set(publisherId, publicKey);
    this.logger.info(`Trusted public key registered for: ${publisherId}`);
  }
  
  /**
   * Remove a trusted public key
   */
  revokePublicKey(publisherId: string): void {
    this.config.trustedPublicKeys.delete(publisherId);
    this.logger.warn(`Public key revoked for: ${publisherId}`);
  }
  
  /**
   * Get list of trusted publishers
   */
  getTrustedPublishers(): string[] {
    return Array.from(this.config.trustedPublicKeys.keys());
  }
  
  // Private methods
  
  private handleUnsignedPlugin(plugin: PluginMetadata): SignatureVerificationResult {
    if (this.config.strictMode) {
      const error = `Plugin missing signature (strict mode): ${plugin.name}`;
      this.logger.error(error, undefined, { plugin: plugin.name });
      throw new Error(error);
    }
    
    this.logger.warn(`⚠️  Plugin not signed: ${plugin.name}`, {
      plugin: plugin.name,
      recommendation: 'Consider signing plugins for production environments',
    });
    
    return {
      verified: false,
      error: 'Plugin not signed',
    };
  }
  
  private extractPublisherId(pluginName: string): string {
    // Extract publisher from reverse domain notation
    // Example: "com.objectstack.engine.objectql" -> "com.objectstack"
    const parts = pluginName.split('.');
    
    if (parts.length < 2) {
      throw new Error(`Invalid plugin name format: ${pluginName} (expected reverse domain notation)`);
    }
    
    // Return first two parts (domain reversed)
    return `${parts[0]}.${parts[1]}`;
  }
  
  private computePluginHash(plugin: PluginMetadata): string {
    // In browser environment, use SubtleCrypto
    if (typeof (globalThis as any).window !== 'undefined') {
      return this.computePluginHashBrowser(plugin);
    }
    
    // In Node.js environment, use crypto module
    return this.computePluginHashNode(plugin);
  }
  
  private computePluginHashNode(plugin: PluginMetadata): string {
    // Use pre-loaded crypto module
    if (!cryptoModule) {
      this.logger.warn('crypto module not available, using fallback hash');
      return this.computePluginHashFallback(plugin);
    }
    
    // Compute hash of plugin code
    const pluginCode = this.serializePluginCode(plugin);
    return cryptoModule.createHash('sha256').update(pluginCode).digest('hex');
  }
  
  private computePluginHashBrowser(plugin: PluginMetadata): string {
    // Browser environment - use simple hash for now
    // In production, should use SubtleCrypto for proper cryptographic hash
    this.logger.debug('Using browser hash (SubtleCrypto integration pending)');
    return this.computePluginHashFallback(plugin);
  }
  
  private computePluginHashFallback(plugin: PluginMetadata): string {
    // Simple hash fallback (not cryptographically secure)
    const pluginCode = this.serializePluginCode(plugin);
    let hash = 0;
    
    for (let i = 0; i < pluginCode.length; i++) {
      const char = pluginCode.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }
  
  private serializePluginCode(plugin: PluginMetadata): string {
    // Serialize plugin code for hashing
    // Include init, start, destroy functions
    const parts: string[] = [
      plugin.name,
      plugin.version,
      plugin.init.toString(),
    ];
    
    if (plugin.start) {
      parts.push(plugin.start.toString());
    }
    
    if (plugin.destroy) {
      parts.push(plugin.destroy.toString());
    }
    
    return parts.join('|');
  }
  
  private async verifyCryptoSignature(
    data: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    // In browser environment, use SubtleCrypto
    if (typeof (globalThis as any).window !== 'undefined') {
      return this.verifyCryptoSignatureBrowser(data, signature, publicKey);
    }
    
    // In Node.js environment, use crypto module
    return this.verifyCryptoSignatureNode(data, signature, publicKey);
  }
  
  private async verifyCryptoSignatureNode(
    data: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    if (!cryptoModule) {
      try {
        // @ts-ignore
        cryptoModule = await import('crypto');
      } catch (e) {
        // ignore
      }
    }

    if (!cryptoModule) {
      this.logger.error('Crypto module not available for signature verification');
      return false;
    }
    
    try {
      // Create verify object based on algorithm
      if (this.config.algorithm === 'ES256') {
        // ECDSA verification - requires lowercase 'sha256'
        const verify = cryptoModule.createVerify('sha256');
        verify.update(data);
        return verify.verify(
          {
            key: publicKey,
            format: 'pem',
            type: 'spki',
          },
          signature,
          'base64'
        );
      } else {
        // RSA verification (RS256)
        const verify = cryptoModule.createVerify('RSA-SHA256');
        verify.update(data);
        return verify.verify(publicKey, signature, 'base64');
      }
    } catch (error) {
      this.logger.error('Signature verification failed', error as Error);
      return false;
    }
  }
  
  private async verifyCryptoSignatureBrowser(
    data: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      const subtle = globalThis.crypto?.subtle;
      if (!subtle) {
        this.logger.error('SubtleCrypto not available in this environment');
        return false;
      }

      // Decode PEM public key to raw DER bytes
      const pemBody = publicKey
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
      const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

      // Configure algorithms based on RS256 or ES256
      let importAlgorithm: { name: string; hash?: string; namedCurve?: string };
      let verifyAlgorithm: { name: string; hash?: string };

      if (this.config.algorithm === 'ES256') {
        importAlgorithm = { name: 'ECDSA', namedCurve: 'P-256' };
        verifyAlgorithm = { name: 'ECDSA', hash: 'SHA-256' };
      } else {
        importAlgorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
        verifyAlgorithm = { name: 'RSASSA-PKCS1-v1_5' };
      }

      const cryptoKey = await subtle.importKey(
        'spki',
        keyBytes,
        importAlgorithm,
        false,
        ['verify']
      );

      // Decode base64 signature to ArrayBuffer
      const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

      // Encode data to ArrayBuffer
      const dataBytes = new TextEncoder().encode(data);

      return await subtle.verify(verifyAlgorithm, cryptoKey, signatureBytes, dataBytes);
    } catch (error) {
      this.logger.error('Browser signature verification failed', error as Error);
      return false;
    }
  }
  
  private validateConfig(): void {
    if (!this.config.trustedPublicKeys || this.config.trustedPublicKeys.size === 0) {
      this.logger.warn('No trusted public keys configured - all signatures will fail');
    }
    
    if (!this.config.algorithm) {
      throw new Error('Signature algorithm must be specified');
    }
    
    if (!['RS256', 'ES256'].includes(this.config.algorithm)) {
      throw new Error(`Unsupported algorithm: ${this.config.algorithm}`);
    }
  }
}
