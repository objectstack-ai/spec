import { DataEngine } from './data-engine';

export interface RuntimeContext {
    engine: DataEngine;
}

export interface RuntimePlugin {
    name: string;
    install?: (ctx: RuntimeContext) => void | Promise<void>;
    onStart?: (ctx: RuntimeContext) => void | Promise<void>;
}
