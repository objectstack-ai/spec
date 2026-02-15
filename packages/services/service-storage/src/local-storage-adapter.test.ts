// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalStorageAdapter } from './local-storage-adapter';
import type { IStorageService } from '@objectstack/spec/contracts';

describe('LocalStorageAdapter', () => {
  let rootDir: string;
  let adapter: LocalStorageAdapter;

  const createTempDir = async () => {
    rootDir = join(tmpdir(), `os-test-storage-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(rootDir, { recursive: true });
    adapter = new LocalStorageAdapter({ rootDir });
  };

  afterEach(async () => {
    if (rootDir) {
      await fs.rm(rootDir, { recursive: true, force: true });
    }
  });

  it('should implement IStorageService contract', async () => {
    await createTempDir();
    const storage: IStorageService = adapter;
    expect(typeof storage.upload).toBe('function');
    expect(typeof storage.download).toBe('function');
    expect(typeof storage.delete).toBe('function');
    expect(typeof storage.exists).toBe('function');
    expect(typeof storage.getInfo).toBe('function');
    expect(typeof storage.list).toBe('function');
  });

  it('should upload and download a file', async () => {
    await createTempDir();
    const content = Buffer.from('hello world');
    await adapter.upload('test.txt', content);

    const downloaded = await adapter.download('test.txt');
    expect(downloaded.toString()).toBe('hello world');
  });

  it('should create nested directories automatically', async () => {
    await createTempDir();
    await adapter.upload('deep/nested/file.txt', Buffer.from('nested'));
    const downloaded = await adapter.download('deep/nested/file.txt');
    expect(downloaded.toString()).toBe('nested');
  });

  it('should check file existence', async () => {
    await createTempDir();
    expect(await adapter.exists('missing.txt')).toBe(false);
    await adapter.upload('exists.txt', Buffer.from('yes'));
    expect(await adapter.exists('exists.txt')).toBe(true);
  });

  it('should delete a file', async () => {
    await createTempDir();
    await adapter.upload('deleteme.txt', Buffer.from('bye'));
    await adapter.delete('deleteme.txt');
    expect(await adapter.exists('deleteme.txt')).toBe(false);
  });

  it('should get file info', async () => {
    await createTempDir();
    await adapter.upload('info.txt', Buffer.from('metadata'));
    const info = await adapter.getInfo('info.txt');
    expect(info.key).toBe('info.txt');
    expect(info.size).toBe(8); // 'metadata'.length
    expect(info.lastModified).toBeInstanceOf(Date);
  });

  it('should list files in a directory', async () => {
    await createTempDir();
    await adapter.upload('docs/a.txt', Buffer.from('a'));
    await adapter.upload('docs/b.txt', Buffer.from('bb'));
    const files = await adapter.list('docs');
    expect(files).toHaveLength(2);
    const keys = files.map(f => f.key).sort();
    expect(keys).toEqual(['docs/a.txt', 'docs/b.txt']);
  });

  it('should return empty array when listing non-existent directory', async () => {
    await createTempDir();
    const files = await adapter.list('nonexistent');
    expect(files).toEqual([]);
  });
});
