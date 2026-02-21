// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createTimer, printHeader, printKV, printStep, printSuccess, printError, printWarning, printInfo } from '../../utils/format.js';

/**
 * Validate a plugin artifact (.tgz) for structural integrity, checksum
 * correctness, digital signature, and platform compatibility.
 *
 * Architecture alignment: `npm pack --dry-run`, `helm lint`, `vsce ls`.
 */
export default class PluginValidate extends Command {
  static override description = 'Validate a plugin artifact for integrity and compliance';

  static override args = {
    artifact: Args.string({ description: 'Path to the artifact file', required: true }),
  };

  static override flags = {
    verifySignature: Flags.boolean({ description: 'Verify digital signature', default: true, allowNo: true }),
    publicKeyPath: Flags.string({ description: 'Path to public key for signature verification' }),
    verifyChecksums: Flags.boolean({ description: 'Verify SHA-256 checksums', default: true, allowNo: true }),
    validateMetadata: Flags.boolean({ description: 'Validate metadata schema compliance', default: true, allowNo: true }),
    platformVersion: Flags.string({ description: 'Target platform version for compatibility check' }),
    json: Flags.boolean({ description: 'Output result as JSON' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PluginValidate);
    const timer = createTimer();

    if (!flags.json) {
      printHeader('Plugin Validate');
    }

    try {
      const artifactPath = path.resolve(process.cwd(), args.artifact);

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found: ${artifactPath}`);
      }

      if (!flags.json) {
        printKV('Artifact', path.relative(process.cwd(), artifactPath));
        printStep('Reading artifact...');
      }

      const artifactBuffer = fs.readFileSync(artifactPath);
      const findings: Array<{ severity: string; rule: string; message: string; path?: string }> = [];

      // 1. Verify file existence and basic structure
      if (artifactBuffer.length === 0) {
        findings.push({ severity: 'error', rule: 'artifact.empty', message: 'Artifact file is empty' });
      }

      // 2. Try to parse as JSON manifest
      let manifest: Record<string, unknown> | undefined;
      try {
        manifest = JSON.parse(artifactBuffer.toString('utf-8'));
        findings.push({ severity: 'info', rule: 'manifest.parsed', message: 'Manifest parsed successfully' });
      } catch {
        findings.push({ severity: 'error', rule: 'manifest.invalid', message: 'Artifact does not contain valid JSON manifest' });
      }

      // 3. Validate required manifest fields
      if (manifest) {
        if (!flags.json) printStep('Validating manifest fields...');

        if (!(manifest as any).manifest && !(manifest as any).name) {
          findings.push({ severity: 'warning', rule: 'manifest.name', message: 'No package name found in manifest' });
        }
        if (!(manifest as any).manifest?.version && !(manifest as any).version) {
          findings.push({ severity: 'warning', rule: 'manifest.version', message: 'No version found in manifest' });
        }
      }

      // 4. Checksum verification
      let checksumResult: { passed: boolean; mismatches?: string[] } | undefined;
      if (flags.verifyChecksums) {
        if (!flags.json) printStep('Verifying checksums...');
        const checksumFile = artifactPath + '.sha256';
        if (fs.existsSync(checksumFile)) {
          const checksumContent = fs.readFileSync(checksumFile, 'utf-8').trim();
          const expectedHash = checksumContent.split(/\s+/)[0];
          const actualHash = crypto.createHash('sha256').update(artifactBuffer).digest('hex');
          if (expectedHash === actualHash) {
            checksumResult = { passed: true };
            findings.push({ severity: 'info', rule: 'checksum.sha256', message: 'SHA-256 checksum verified' });
          } else {
            checksumResult = { passed: false, mismatches: ['artifact'] };
            findings.push({ severity: 'error', rule: 'checksum.sha256', message: `SHA-256 mismatch: expected ${expectedHash.slice(0, 16)}..., got ${actualHash.slice(0, 16)}...` });
          }
        } else {
          findings.push({ severity: 'warning', rule: 'checksum.missing', message: 'No .sha256 checksum file found alongside artifact' });
        }
      }

      // 5. Signature verification
      let signatureResult: { passed: boolean; failureReason?: string } | undefined;
      if (flags.verifySignature) {
        if (!flags.json) printStep('Verifying signature...');
        const sigFile = artifactPath + '.sig';
        if (fs.existsSync(sigFile) && flags.publicKeyPath && fs.existsSync(flags.publicKeyPath)) {
          try {
            const publicKey = fs.readFileSync(flags.publicKeyPath, 'utf-8');
            const signature = fs.readFileSync(sigFile, 'utf-8');
            const verifier = crypto.createVerify('RSA-SHA256');
            verifier.update(artifactBuffer);
            const valid = verifier.verify(publicKey, signature, 'base64');
            signatureResult = { passed: valid, failureReason: valid ? undefined : 'Signature does not match' };
            findings.push({
              severity: valid ? 'info' : 'error',
              rule: 'signature.verify',
              message: valid ? 'Digital signature verified' : 'Digital signature verification failed',
            });
          } catch (e: any) {
            signatureResult = { passed: false, failureReason: e.message };
            findings.push({ severity: 'error', rule: 'signature.verify', message: `Signature verification error: ${e.message}` });
          }
        } else if (fs.existsSync(sigFile) && !flags.publicKeyPath) {
          findings.push({ severity: 'warning', rule: 'signature.nokey', message: 'Signature file found but no --publicKeyPath provided' });
        } else if (!fs.existsSync(sigFile)) {
          findings.push({ severity: 'info', rule: 'signature.absent', message: 'No signature file found (unsigned artifact)' });
        }
      }

      // 6. Platform compatibility check
      let platformResult: { compatible: boolean; requiredRange?: string; targetVersion?: string } | undefined;
      if (flags.platformVersion && manifest) {
        if (!flags.json) printStep('Checking platform compatibility...');
        const engine = (manifest as any).manifest?.engine || (manifest as any).engine;
        const required = engine?.objectstack as string | undefined;
        if (required) {
          // Simple semver range check (>=X.Y.Z)
          const rangeMatch = required.match(/>=?\s*([\d.]+)/);
          if (rangeMatch) {
            const [rMajor, rMinor = '0', rPatch = '0'] = rangeMatch[1].split('.');
            const [pMajor, pMinor = '0', pPatch = '0'] = flags.platformVersion.split('.');
            const compatible =
              parseInt(pMajor) > parseInt(rMajor) ||
              (parseInt(pMajor) === parseInt(rMajor) && parseInt(pMinor) > parseInt(rMinor)) ||
              (parseInt(pMajor) === parseInt(rMajor) && parseInt(pMinor) === parseInt(rMinor) && parseInt(pPatch) >= parseInt(rPatch));
            platformResult = { compatible, requiredRange: required, targetVersion: flags.platformVersion };
            findings.push({
              severity: compatible ? 'info' : 'error',
              rule: 'platform.compatibility',
              message: compatible
                ? `Compatible with platform v${flags.platformVersion}`
                : `Requires platform ${required}, but target is v${flags.platformVersion}`,
            });
          }
        } else {
          platformResult = { compatible: true, targetVersion: flags.platformVersion };
          findings.push({ severity: 'info', rule: 'platform.noreq', message: 'No platform version requirement specified — assumed compatible' });
        }
      }

      // 7. Summary
      const errors = findings.filter(f => f.severity === 'error').length;
      const warns = findings.filter(f => f.severity === 'warning').length;
      const infos = findings.filter(f => f.severity === 'info').length;
      const valid = errors === 0;

      const result = {
        valid,
        checksumVerification: checksumResult,
        signatureVerification: signatureResult,
        platformCompatibility: platformResult,
        findings,
        summary: { errors, warnings: warns, infos },
      };

      if (flags.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log('');
      if (valid) {
        printSuccess(`Validation passed ${chalk.dim(`(${timer.display()})`)}`);
      } else {
        printError(`Validation failed ${chalk.dim(`(${timer.display()})`)}`);
      }

      console.log('');
      for (const finding of findings) {
        const icon = finding.severity === 'error' ? chalk.red('✗')
          : finding.severity === 'warning' ? chalk.yellow('⚠')
            : chalk.blue('ℹ');
        console.log(`  ${icon} ${chalk.dim(`[${finding.rule}]`)} ${finding.message}`);
      }

      console.log('');
      printKV('Errors', errors);
      printKV('Warnings', warns);
      printKV('Info', infos);
      console.log('');

      if (!valid) {
        this.exit(1);
      }
    } catch (error: any) {
      if (flags.json) {
        console.log(JSON.stringify({ valid: false, findings: [{ severity: 'error', rule: 'system', message: error.message }], summary: { errors: 1, warnings: 0, infos: 0 } }));
        this.exit(1);
      }
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
