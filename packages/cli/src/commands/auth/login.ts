// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Command, Flags } from '@oclif/core';
import { printHeader, printSuccess, printError, printKV } from '../../utils/format.js';
import { writeAuthConfig, readAuthConfig } from '../../utils/auth-config.js';
import { ObjectStackClient } from '@objectstack/client';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/**
 * Prompt for a password with masked input (shows * per character).
 * Falls back to plain readline.question() in non-TTY environments.
 */
async function promptPassword(promptText: string): Promise<string> {
  if (!process.stdin.isTTY) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(promptText);
    rl.close();
    return answer;
  }

  return new Promise((resolve) => {
    const chars: string[] = [];
    process.stdout.write(promptText);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', handler);
      process.stdout.write('\n');
    };

    const handler = (char: string) => {
      switch (char) {
        case '': // Ctrl+C
          cleanup();
          process.kill(process.pid, 'SIGINT');
          break;
        case '\r':
        case '\n': // Enter
          cleanup();
          resolve(chars.join(''));
          break;
        case '': // Backspace
          if (chars.length > 0) {
            chars.pop();
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(promptText + '*'.repeat(chars.length));
          }
          break;
        default:
          chars.push(char);
          process.stdout.write('*');
          break;
      }
    };

    process.stdin.on('data', handler);
  });
}

/**
 * Open a URL in the system default browser (cross-platform).
 */
async function openBrowser(url: string): Promise<void> {
  const { exec } = await import('node:child_process');
  const platform = process.platform;
  const cmd = platform === 'darwin' ? `open "${url}"` : platform === 'win32' ? `start "" "${url}"` : `xdg-open "${url}"`;
  exec(cmd, () => { /* best-effort */ });
}

export default class AuthLogin extends Command {
  static override description = 'Authenticate and store session credentials';

  static override examples = [
    '$ os auth login',
    '$ os auth login --url https://api.example.com',
    '$ os auth login --email user@example.com --password mypassword',
    '$ os auth login --no-browser',
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
      description: 'Email address (skips browser flow)',
    }),
    password: Flags.string({
      char: 'p',
      description: 'Password (skips browser flow)',
    }),
    'no-browser': Flags.boolean({
      description: 'Print the login URL without opening a browser',
      default: false,
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force login even if already authenticated',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthLogin);

    try {
      // --- Already logged in guard ---
      if (!flags.force) {
        try {
          const existing = await readAuthConfig();
          if (existing?.token) {
            if (flags.json) {
              console.log(JSON.stringify({ success: false, error: 'Already logged in', email: existing.email }));
            } else {
              printSuccess(`Already logged in as ${existing.email || existing.userId}`);
              console.log('');
              console.log('  Run `os auth logout` first to switch accounts, or use --force to re-authenticate.');
              console.log('');
            }
            return;
          }
        } catch {
          // No credentials stored — proceed with login
        }
      }

      if (!flags.json) {
        printHeader('ObjectStack Login');
        printKV('Server', flags.url);
        console.log('');
      }

      const client = new ObjectStackClient({ baseUrl: flags.url });

      // --- CI / non-interactive path: email + password flags provided ---
      if (flags.email && flags.password) {
        await this.loginWithPassword(client, flags.url, flags.email, flags.password, flags.json);
        return;
      }

      // --- Interactive TTY: prompt style ---
      if (process.stdin.isTTY && !flags.email && !flags.password) {
        // Default: browser-based device flow
        await this.loginWithBrowser(client, flags.url, flags['no-browser'], flags.json);
        return;
      }

      // --- Non-TTY fallback: prompt for email/password ---
      const rl = readline.createInterface({ input, output });
      let email = flags.email;
      let password = flags.password;

      if (!email) email = await rl.question('Email: ');
      rl.close();
      if (!password) password = await promptPassword('Password: ');

      if (!email || !password) throw new Error('Email and password are required');

      await this.loginWithPassword(client, flags.url, email, password, flags.json);
    } catch (error: any) {
      if (flags.json) {
        console.log(JSON.stringify({ success: false, error: error.message }, null, 2));
        this.exit(1);
      }
      printError(error.message || String(error));
      this.exit(1);
    }
  }

  private async loginWithPassword(
    client: ObjectStackClient,
    url: string,
    email: string,
    password: string,
    jsonOutput?: boolean,
  ): Promise<void> {
    const response = await client.auth.login({ type: 'email', email, password });

    if (!response.data?.token && !response.data?.user) {
      throw new Error('Login failed: Invalid response from server');
    }

    const token = response.data?.token || (response as any).token;
    const user = response.data?.user;

    if (!token) throw new Error('Login failed: No token received from server');

    await writeAuthConfig({
      url,
      token,
      email: user?.email || email,
      userId: user?.id,
      createdAt: new Date().toISOString(),
    });

    if (jsonOutput) {
      console.log(JSON.stringify({ success: true, email: user?.email || email, userId: user?.id }, null, 2));
    } else {
      printSuccess('Authentication successful');
      printKV('Email', user?.email || email);
      if (user?.id) printKV('User ID', user.id);
      console.log('');
      console.log('  Credentials stored in ~/.objectstack/credentials.json');
      console.log('');
    }
  }

  private async loginWithBrowser(
    _client: ObjectStackClient,
    url: string,
    noBrowser: boolean,
    jsonOutput?: boolean,
  ): Promise<void> {
    // Request a device code from the server
    const res = await globalThis.fetch(`${url}/api/v1/auth/device/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) throw new Error(`Device request failed: ${res.status}`);
    const resJson = await res.json() as any;
    const deviceData = resJson?.data ?? resJson;
    const { code, verificationUrl, expiresAt, interval = 2 } = deviceData ?? {};

    if (!code || !verificationUrl) {
      throw new Error('Server did not return a device code. Try `os auth login --email <email> --password <password>` instead.');
    }

    if (jsonOutput) {
      console.log(JSON.stringify({ code, verificationUrl, expiresAt }));
    } else {
      console.log('  Open the following URL to log in:');
      console.log('');
      console.log(`  ${verificationUrl}`);
      console.log('');
    }

    if (!noBrowser && !jsonOutput) {
      await openBrowser(verificationUrl);
      console.log('  (Browser opened automatically. Press Ctrl+C to cancel.)');
      console.log('');
    }

    // Poll for approval
    const pollMs = interval * 1000;
    const expiryTime = new Date(expiresAt).getTime();
    let spinner = 0;
    const spinChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

    while (Date.now() < expiryTime) {
      await new Promise(r => setTimeout(r, pollMs));

      const pollRes = await globalThis.fetch(`${url}/api/v1/auth/device/token?code=${encodeURIComponent(code)}`);
      const pollJson = await pollRes.json() as any;
      const pollData = pollJson?.data ?? pollJson;

      if (pollData?.status === 'approved') {
        const { token, user } = pollData;

        if (!jsonOutput) process.stdout.write('\r\x1b[K'); // clear spinner line

        await writeAuthConfig({
          url,
          token,
          email: user?.email,
          userId: user?.id,
          createdAt: new Date().toISOString(),
        });

        if (jsonOutput) {
          console.log(JSON.stringify({ success: true, email: user?.email, userId: user?.id }, null, 2));
        } else {
          printSuccess('Authentication successful');
          if (user?.email) printKV('Email', user.email);
          if (user?.id) printKV('User ID', user.id);
          console.log('');
          console.log('  Credentials stored in ~/.objectstack/credentials.json');
          console.log('');
        }
        return;
      }

      if (pollData?.status === 'expired') {
        throw new Error('Login timed out. Please run `os auth login` again.');
      }

      if (!jsonOutput) {
        process.stdout.write(`\r  ${spinChars[spinner % spinChars.length]} Waiting for browser approval...`);
        spinner++;
      }
    }

    throw new Error('Login timed out. Please run `os auth login` again.');
  }
}
