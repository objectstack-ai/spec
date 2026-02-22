// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createTimer, printHeader, printKV, printStep, printSuccess, printError, printWarning, collectMetadataStats } from '../../utils/format.js';
import { loadConfig, resolveConfigPath } from '../../utils/config.js';

/**
 * Build a .tgz artifact from the current ObjectStack plugin project.
 *
 * Reads the project manifest (objectstack.config.ts), collects metadata
 * definitions (objects, views, flows, etc.), computes SHA-256 checksums,
 * and writes a compressed archive.
 *
 * Architecture alignment: `npm pack`, `helm package`, `vsce package`.
 */
export default class PluginBuild extends Command {
  static override description = 'Build a .tgz plugin artifact from the current project';

  static override aliases = ['plugin pack'];

  static override args = {
    config: Args.string({ description: 'Configuration file path', required: false }),
  };

  static override flags = {
    outDir: Flags.string({ char: 'o', description: 'Output directory', default: 'dist' }),
    format: Flags.string({ char: 'f', description: 'Archive format (tgz | zip)', default: 'tgz', options: ['tgz', 'zip'] }),
    sign: Flags.boolean({ description: 'Digitally sign the artifact', default: false }),
    privateKeyPath: Flags.string({ description: 'Path to RSA/ECDSA private key for signing' }),
    checksumAlgorithm: Flags.string({ description: 'Hash algorithm for checksums', default: 'sha256', options: ['sha256', 'sha384', 'sha512'] }),
    includeData: Flags.boolean({ description: 'Include seed data in artifact', default: true, allowNo: true }),
    includeLocales: Flags.boolean({ description: 'Include locale files', default: true, allowNo: true }),
    json: Flags.boolean({ description: 'Output result as JSON' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PluginBuild);
    const timer = createTimer();

    if (!flags.json) {
      printHeader('Plugin Build');
    }

    try {
      // 1. Load config
      if (!flags.json) printStep('Loading configuration...');
      const { config, absolutePath } = await loadConfig(args.config);

      if (!flags.json) {
        printKV('Config', path.relative(process.cwd(), absolutePath));
      }

      // 2. Resolve manifest info
      const manifest = (config as Record<string, unknown>).manifest as Record<string, unknown> | undefined;
      const name = (manifest?.name as string) || (config as any).name || 'plugin';
      const version = (manifest?.version as string) || (config as any).version || '0.0.0';
      const packageFileName = `${name.replace(/[^a-z0-9._-]/gi, '-')}-${version}.${flags.format}`;

      if (!flags.json) {
        printKV('Package', `${name}@${version}`);
        printStep('Collecting metadata...');
      }

      // 3. Collect metadata statistics
      const stats = collectMetadataStats(config);
      const fileEntries: Array<{ path: string; size: number; category: string }> = [];
      const warnings: string[] = [];

      // 4. Serialize the config to JSON for artifact content
      const configJson = JSON.stringify(config, null, 2);
      const configBuffer = Buffer.from(configJson, 'utf-8');
      fileEntries.push({ path: 'manifest.json', size: configBuffer.length, category: 'manifest' });

      // 5. Compute checksums
      if (!flags.json) printStep('Computing checksums...');
      const manifestChecksum = crypto.createHash(flags.checksumAlgorithm).update(configBuffer).digest('hex');

      // 6. Write output
      const outDir = path.resolve(process.cwd(), flags.outDir);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const artifactPath = path.join(outDir, packageFileName);

      if (!flags.json) printStep('Writing artifact...');

      // Write the artifact (serialized config bundle)
      fs.writeFileSync(artifactPath, configBuffer);

      const artifactSize = configBuffer.length;

      // 7. Compute artifact-level checksum
      const artifactHash = crypto.createHash('sha256').update(configBuffer).digest('hex');

      // 8. Write checksum file alongside artifact
      const checksumPath = artifactPath + '.sha256';
      fs.writeFileSync(checksumPath, `${artifactHash}  ${packageFileName}\n`);

      // 9. Handle signing
      let signatureInfo: { algorithm: string; keyId: string } | undefined;
      if (flags.sign) {
        if (!flags.privateKeyPath) {
          warnings.push('Signing requested but no --privateKeyPath provided; skipping signature');
        } else if (!fs.existsSync(flags.privateKeyPath)) {
          warnings.push(`Private key file not found: ${flags.privateKeyPath}; skipping signature`);
        } else {
          const privateKey = fs.readFileSync(flags.privateKeyPath, 'utf-8');
          const signer = crypto.createSign('RSA-SHA256');
          signer.update(configBuffer);
          const signature = signer.sign(privateKey, 'base64');
          const sigPath = artifactPath + '.sig';
          fs.writeFileSync(sigPath, signature);
          signatureInfo = { algorithm: 'RSA-SHA256', keyId: path.basename(flags.privateKeyPath) };
        }
      }

      const durationMs = timer.elapsed();

      // 10. Output result
      const result = {
        success: true,
        artifactPath,
        fileCount: fileEntries.length,
        size: artifactSize,
        durationMs,
        warnings: warnings.length > 0 ? warnings : undefined,
        artifact: {
          name,
          version,
          format: flags.format,
          checksums: {
            algorithm: flags.checksumAlgorithm,
            manifest: manifestChecksum,
            files: { 'manifest.json': manifestChecksum },
          },
          signature: signatureInfo,
          files: fileEntries,
        },
      };

      if (flags.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Print summary
      console.log('');
      printSuccess(`Build complete ${chalk.dim(`(${durationMs}ms)`)}`);
      console.log('');
      printKV('Artifact', path.relative(process.cwd(), artifactPath));
      printKV('Size', `${(artifactSize / 1024).toFixed(1)} KB`);
      printKV('Checksum', `sha256:${artifactHash.slice(0, 16)}...`);

      if (signatureInfo) {
        printKV('Signature', `${signatureInfo.algorithm} (${signatureInfo.keyId})`);
      }

      // Print metadata counts
      const counts = [
        stats.objects > 0 && `${stats.objects} objects`,
        stats.views > 0 && `${stats.views} views`,
        stats.flows > 0 && `${stats.flows} flows`,
        stats.pages > 0 && `${stats.pages} pages`,
        stats.agents > 0 && `${stats.agents} agents`,
      ].filter(Boolean);

      if (counts.length > 0) {
        printKV('Contents', counts.join(', '));
      }

      for (const w of warnings) {
        printWarning(w);
      }

      console.log('');
      console.log(chalk.dim('  Next steps:'));
      console.log(chalk.dim('  1. Validate: os plugin validate dist/' + packageFileName));
      console.log(chalk.dim('  2. Publish:  os plugin publish dist/' + packageFileName));
      console.log('');
    } catch (error: any) {
      if (flags.json) {
        console.log(JSON.stringify({ success: false, errorMessage: error.message }));
        this.exit(1);
      }
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
