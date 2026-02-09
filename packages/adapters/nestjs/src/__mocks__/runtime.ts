// Stub for @objectstack/runtime - resolved via vitest alias
import { vi } from 'vitest';

export class HttpDispatcher {
  getDiscoveryInfo = vi.fn().mockReturnValue({ version: '1.0' });
  handleGraphQL = vi.fn().mockResolvedValue({ data: {} });
  handleAuth = vi.fn().mockResolvedValue({ handled: true, response: { status: 200, body: { ok: true } } });
  handleMetadata = vi.fn().mockResolvedValue({ handled: true, response: { status: 200, body: [] } });
  handleData = vi.fn().mockResolvedValue({ handled: true, response: { status: 200, body: [] } });
  handleStorage = vi.fn().mockResolvedValue({ handled: true, response: { status: 200, body: {} } });

  constructor(_kernel: any) {}
}

export type ObjectKernel = any;
export type HttpDispatcherResult = any;
