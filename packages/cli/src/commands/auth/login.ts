// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Args, Command, Flags } from '@oclif/core';
import { printHeader, printSuccess, printError, printKV } from '../../utils/format.js';
import { writeAuthConfig } from '../../utils/auth-config.js';
import { ObjectStackClient } from '@objectstack/client';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export default class AuthLogin extends Command {
  static override description = 'Authenticate and store session credentials';

  static override examples = [
    '$ os auth login',
    '$ os auth login --url https://api.example.com',
    '$ os auth login --email user@example.com --password mypassword',
  ];

  static override flags = {
    url: Flags.string({
      char: 'u',
      description: 'Server URL',
      default: 'http://localhost:3000',
      env: 'OBJECTSTACK_URL',
    }),
    email: Flags.string({
      char: 'e',
      description: 'Email address',
    }),
    password: Flags.string({
      char: 'p',
      description: 'Password',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthLogin);

    try {
      if (!flags.json) {
        printHeader('ObjectStack Login');
        printKV('Server', flags.url);
        console.log('');
      }

      // Prompt for credentials if not provided
      let email = flags.email;
      let password = flags.password;

      if (!email || !password) {
        const rl = readline.createInterface({ input, output });

        if (!email) {
          email = await rl.question('Email: ');
        }

        if (!password) {
          // Note: This doesn't hide the password input in the terminal
          // For production use, consider using a library like 'inquirer' or 'prompts'
          password = await rl.question('Password: ');
        }

        rl.close();
      }

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Create client and authenticate
      const client = new ObjectStackClient({
        baseUrl: flags.url,
      });

      const response = await client.auth.login({
        email,
        password,
      });

      // Check if login was successful
      if (!response.data?.token && !response.data?.user) {
        throw new Error('Login failed: Invalid response from server');
      }

      // Extract token - it might be in different locations depending on the auth system
      const token = response.data?.token || (response as any).token;
      const user = response.data?.user;

      if (!token) {
        throw new Error('Login failed: No token received from server');
      }

      // Store credentials
      await writeAuthConfig({
        url: flags.url,
        token,
        email: user?.email || email,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      });

      if (flags.json) {
        console.log(JSON.stringify({
          success: true,
          email: user?.email || email,
          userId: user?.id,
        }, null, 2));
      } else {
        printSuccess('Authentication successful');
        printKV('Email', user?.email || email);
        if (user?.id) {
          printKV('User ID', user.id);
        }
        console.log('');
        console.log('  Credentials stored in ~/.objectstack/credentials.json');
        console.log('');
      }
    } catch (error: any) {
      if (flags.json) {
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
