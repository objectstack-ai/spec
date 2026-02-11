import { describe, it, expect } from 'vitest';
import type { IStorageService, StorageFileInfo } from './storage-service';

describe('Storage Service Contract', () => {
  it('should allow a minimal IStorageService implementation with required methods', () => {
    const storage: IStorageService = {
      upload: async (_key, _data, _options?) => {},
      download: async (_key) => Buffer.from(''),
      delete: async (_key) => {},
      exists: async (_key) => false,
      getInfo: async (key) => ({
        key,
        size: 0,
        lastModified: new Date(),
      }),
    };

    expect(typeof storage.upload).toBe('function');
    expect(typeof storage.download).toBe('function');
    expect(typeof storage.delete).toBe('function');
    expect(typeof storage.exists).toBe('function');
    expect(typeof storage.getInfo).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const storage: IStorageService = {
      upload: async () => {},
      download: async () => Buffer.from(''),
      delete: async () => {},
      exists: async () => false,
      getInfo: async (key) => ({ key, size: 0, lastModified: new Date() }),
      list: async (_prefix) => [],
      getSignedUrl: async (_key, _expiresIn) => 'https://example.com/signed',
    };

    expect(storage.list).toBeDefined();
    expect(storage.getSignedUrl).toBeDefined();
  });

  it('should upload and download files', async () => {
    const files = new Map<string, Buffer>();

    const storage: IStorageService = {
      upload: async (key, data) => {
        files.set(key, Buffer.isBuffer(data) ? data : Buffer.from('stream-data'));
      },
      download: async (key) => {
        const data = files.get(key);
        if (!data) throw new Error(`File not found: ${key}`);
        return data;
      },
      delete: async (key) => { files.delete(key); },
      exists: async (key) => files.has(key),
      getInfo: async (key) => ({
        key,
        size: files.get(key)?.length ?? 0,
        lastModified: new Date(),
      }),
    };

    const content = Buffer.from('Hello, World!');
    await storage.upload('docs/readme.txt', content, { contentType: 'text/plain' });

    expect(await storage.exists('docs/readme.txt')).toBe(true);

    const downloaded = await storage.download('docs/readme.txt');
    expect(downloaded.toString()).toBe('Hello, World!');
  });

  it('should delete files', async () => {
    const files = new Set<string>();

    const storage: IStorageService = {
      upload: async (key) => { files.add(key); },
      download: async () => Buffer.from(''),
      delete: async (key) => { files.delete(key); },
      exists: async (key) => files.has(key),
      getInfo: async (key) => ({ key, size: 0, lastModified: new Date() }),
    };

    await storage.upload('temp/file.txt', Buffer.from('data'));
    expect(await storage.exists('temp/file.txt')).toBe(true);

    await storage.delete('temp/file.txt');
    expect(await storage.exists('temp/file.txt')).toBe(false);
  });

  it('should get file info', async () => {
    const now = new Date();

    const storage: IStorageService = {
      upload: async () => {},
      download: async () => Buffer.from(''),
      delete: async () => {},
      exists: async () => true,
      getInfo: async (key): Promise<StorageFileInfo> => ({
        key,
        size: 2048,
        contentType: 'image/png',
        lastModified: now,
        metadata: { uploadedBy: 'user-1' },
      }),
    };

    const info = await storage.getInfo('images/logo.png');
    expect(info.key).toBe('images/logo.png');
    expect(info.size).toBe(2048);
    expect(info.contentType).toBe('image/png');
    expect(info.lastModified).toBe(now);
    expect(info.metadata?.uploadedBy).toBe('user-1');
  });

  it('should list files by prefix', async () => {
    const storage: IStorageService = {
      upload: async () => {},
      download: async () => Buffer.from(''),
      delete: async () => {},
      exists: async () => true,
      getInfo: async (key) => ({ key, size: 0, lastModified: new Date() }),
      list: async (prefix) => {
        const allFiles: StorageFileInfo[] = [
          { key: 'docs/a.txt', size: 100, lastModified: new Date() },
          { key: 'docs/b.txt', size: 200, lastModified: new Date() },
          { key: 'images/c.png', size: 300, lastModified: new Date() },
        ];
        return allFiles.filter((f) => f.key.startsWith(prefix));
      },
    };

    const docs = await storage.list!('docs/');
    expect(docs).toHaveLength(2);
    expect(docs[0].key).toBe('docs/a.txt');
  });

  it('should generate signed URLs', async () => {
    const storage: IStorageService = {
      upload: async () => {},
      download: async () => Buffer.from(''),
      delete: async () => {},
      exists: async () => true,
      getInfo: async (key) => ({ key, size: 0, lastModified: new Date() }),
      getSignedUrl: async (key, expiresIn) =>
        `https://cdn.example.com/${key}?expires=${expiresIn}`,
    };

    const url = await storage.getSignedUrl!('docs/report.pdf', 3600);
    expect(url).toContain('docs/report.pdf');
    expect(url).toContain('expires=3600');
  });
});
