// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import { printError, printSuccess } from '../../utils/format.js';
import { createApiClient, requireAuth } from '../../utils/api-client.js';

export default class MetaDelete extends Command {
  static override description = 'Delete a metadata item';

  static override examples = [
    '$ os meta delete object my_custom_object',
    '$ os meta delete plugin my-plugin',
  ];

  static override args = {
    type: Args.string({
      description: 'Metadata type',
      required: true,
    }),
    name: Args.string({
      description: 'Item name (snake_case)',
      required: true,
    }),
  };

  static override flags = {
    url: Flags.string({
      char: 'u',
      description: 'Server URL',
      env: 'OBJECTSTACK_URL',
    }),
    token: Flags.string({
      char: 't',
      description: 'Authentication token',
      env: 'OBJECTSTACK_TOKEN',
    }),
    format: Flags.string({
      char: 'f',
      description: 'Output format',
      options: ['json', 'table'],
      default: 'table',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MetaDelete);

    try {
      const client = await createApiClient({
        url: flags.url,
        token: flags.token,
      });

      requireAuth((client as any).token);

      // Note: The current client doesn't have a direct delete method for metadata
      // We'll need to use fetch directly with the proper endpoint
      const baseUrl = (client as any).baseUrl;
      const token = (client as any).token;

      const response = await fetch(`${baseUrl}/api/v1/meta/${encodeURIComponent(args.type)}/${encodeURIComponent(args.name)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(`Delete failed (${response.status}): ${errorBody}`);
      }

      if (flags.format === 'json') {
        console.log(JSON.stringify({
          success: true,
          type: args.type,
          name: args.name,
        }, null, 2));
      } else {
        printSuccess(`Metadata deleted: ${args.type}/${args.name}`);
      }
    } catch (error: any) {
      if (flags.format === 'json') {
        console.log(JSON.stringify({
          success: false,
          error: error.message,
        }, null, 2));
        this.exit(1);
      }
      printError(error.message || String(error));
      this.exit(1);
    }
  }
}
