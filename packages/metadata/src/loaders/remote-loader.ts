/**
 * Remote Metadata Loader
 * 
 * Loads metadata from an HTTP API.
 * This loader is stateless and delegates storage to the remote server.
 */

import type {
  MetadataLoadOptions,
  MetadataLoadResult,
  MetadataStats,
  MetadataLoaderContract,
  MetadataSaveOptions,
  MetadataSaveResult,
} from '@objectstack/spec/system';
import type { MetadataLoader } from './loader-interface.js';

export class RemoteLoader implements MetadataLoader {
  readonly contract: MetadataLoaderContract = {
    name: 'remote',
    protocol: 'http',
    capabilities: {
      read: true,
      write: true,
      watch: false, // Could implement SSE/WebSocket in future
      list: true,
    },
  };

  constructor(private baseUrl: string, private authToken?: string) {}

  private get headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
    };
  }

  async load(
    type: string,
    name: string,
    _options?: MetadataLoadOptions
  ): Promise<MetadataLoadResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${name}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (response.status === 404) {
        return { data: null };
      }

      if (!response.ok) {
        throw new Error(`Remote load failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data,
        source: this.baseUrl,
        format: 'json',
        loadTime: 0, 
      };
    } catch (error) {
      console.error(`RemoteLoader error loading ${type}/${name}`, error);
      throw error;
    }
  }

  async loadMany<T = any>(
    type: string,
    _options?: MetadataLoadOptions
  ): Promise<T[]> {
    const response = await fetch(`${this.baseUrl}/${type}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as T[];
  }

  async exists(type: string, name: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${type}/${name}`, {
      method: 'HEAD',
      headers: this.headers,
    });
    return response.ok;
  }

  async stat(type: string, name: string): Promise<MetadataStats | null> {
    // Basic implementation using HEAD
    const response = await fetch(`${this.baseUrl}/${type}/${name}`, {
      method: 'HEAD',
      headers: this.headers,
    });
    
    if (!response.ok) return null;

    return {
      size: Number(response.headers.get('content-length') || 0),
      mtime: new Date(response.headers.get('last-modified') || Date.now()).toISOString(),
      format: 'json',
    };
  }

  async list(type: string): Promise<string[]> {
    const items = await this.loadMany<{ name: string }>(type);
    return items.map(i => i.name);
  }

  async save(
    type: string,
    name: string,
    data: any,
    _options?: MetadataSaveOptions
  ): Promise<MetadataSaveResult> {
    const response = await fetch(`${this.baseUrl}/${type}/${name}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Remote save failed: ${response.statusText}`);
    }

    return {
      success: true,
      path: `${this.baseUrl}/${type}/${name}`,
      saveTime: 0,
    };
  }
}
