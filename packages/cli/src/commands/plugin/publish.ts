// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createTimer, printHeader, printKV, printStep, printSuccess, printError, printWarning, printInfo } from '../../utils/format.js';

/**
 * Publish a plugin artifact to the ObjectStack marketplace.
 *
 * Validates the artifact locally (unless --skipValidation), computes the
 * SHA-256 checksum, and uploads to the marketplace REST API.
 *
 * Architecture alignment: `npm publish`, `helm push`, `vsce publish`.
 */
export default class PluginPublish extends Command {
  static override description = 'Publish a plugin artifact to the marketplace';

  static override args = {
    artifact: Args.string({ description: 'Path to the artifact file', required: true }),
  };

  static override flags = {
    registryUrl: Flags.string({ char: 'r', description: 'Marketplace API base URL', default: 'https://marketplace.objectstack.com/api/v1' }),
    token: Flags.string({ char: 't', description: 'Authentication token', env: 'OBJECTSTACK_MARKETPLACE_TOKEN' }),
    releaseNotes: Flags.string({ description: 'Release notes for this version' }),
    preRelease: Flags.boolean({ description: 'Mark as a pre-release', default: false }),
    skipValidation: Flags.boolean({ description: 'Skip local validation before publish', default: false }),
    access: Flags.string({ description: 'Access level (public | restricted)', default: 'public', options: ['public', 'restricted'] }),
    tags: Flags.string({ description: 'Comma-separated tags', multiple: true }),
    json: Flags.boolean({ description: 'Output result as JSON' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PluginPublish);
    const timer = createTimer();

    if (!flags.json) {
      printHeader('Plugin Publish');
    }

    try {
      const artifactPath = path.resolve(process.cwd(), args.artifact);

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found: ${artifactPath}`);
      }

      if (!flags.token) {
        throw new Error('Authentication token required. Set --token or OBJECTSTACK_MARKETPLACE_TOKEN environment variable.');
      }

      if (!flags.json) {
        printKV('Artifact', path.relative(process.cwd(), artifactPath));
        printKV('Registry', flags.registryUrl);
      }

      // 1. Read artifact
      const artifactBuffer = fs.readFileSync(artifactPath);
      const sha256 = crypto.createHash('sha256').update(artifactBuffer).digest('hex');

      // 2. Extract manifest info
      let manifest: Record<string, unknown> | undefined;
      try {
        manifest = JSON.parse(artifactBuffer.toString('utf-8'));
      } catch {
        throw new Error('Artifact does not contain a valid JSON manifest');
      }

      const name = (manifest as any).manifest?.name || (manifest as any).name || 'unknown';
      const version = (manifest as any).manifest?.version || (manifest as any).version || '0.0.0';

      if (!flags.json) {
        printKV('Package', `${name}@${version}`);
      }

      // 3. Local validation (unless skipped)
      if (!flags.skipValidation) {
        if (!flags.json) printStep('Running local validation...');

        if (artifactBuffer.length === 0) {
          throw new Error('Artifact is empty — cannot publish');
        }

        const checksumFile = artifactPath + '.sha256';
        if (fs.existsSync(checksumFile)) {
          const expectedHash = fs.readFileSync(checksumFile, 'utf-8').trim().split(/\s+/)[0];
          if (expectedHash !== sha256) {
            throw new Error(`SHA-256 mismatch: artifact has changed since build`);
          }
        }

        if (!flags.json) printSuccess('Local validation passed');
      }

      // 4. Upload to marketplace
      if (!flags.json) printStep('Uploading to marketplace...');

      const uploadUrl = `${flags.registryUrl}/packages/upload`;
      const tags = flags.tags?.flatMap(t => t.split(',')) || [];

      const uploadPayload = {
        packageName: name,
        version,
        sha256,
        size: artifactBuffer.length,
        preRelease: flags.preRelease,
        access: flags.access,
        releaseNotes: flags.releaseNotes,
        tags,
      };

      // Perform HTTP upload
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${flags.token}`,
        },
        body: JSON.stringify(uploadPayload),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(`Marketplace upload failed (${response.status}): ${errorBody}`);
      }

      const responseData = await response.json().catch(() => ({})) as Record<string, unknown>;

      const result = {
        success: true,
        packageId: (responseData.packageId as string) || name,
        version,
        artifactUrl: responseData.artifactUrl as string | undefined,
        sha256,
        submissionId: responseData.submissionId as string | undefined,
        message: `Published ${name}@${version} to marketplace`,
      };

      if (flags.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log('');
      printSuccess(`Published ${chalk.cyan(`${name}@${version}`)}`);
      console.log('');
      printKV('SHA-256', sha256.slice(0, 16) + '...');
      printKV('Size', `${(artifactBuffer.length / 1024).toFixed(1)} KB`);

      if (result.artifactUrl) {
        printKV('URL', result.artifactUrl);
      }
      if (result.submissionId) {
        printKV('Submission', result.submissionId);
      }

      if (flags.preRelease) {
        printWarning('Published as pre-release');
      }

      console.log('');
      printInfo(`Duration: ${timer.display()}`);
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
