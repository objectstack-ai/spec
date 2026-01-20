import type { ObjectStackServer } from './index';

export interface ServerPlugin {
  name: string;
  version?: string;
  install: (server: ObjectStackServer) => void | Promise<void>;
}
