import { ObjectStackKernel } from './kernel';

export interface RuntimeContext {
    engine: ObjectStackKernel;
}

export interface RuntimePlugin {
    name: string;
    install?: (ctx: RuntimeContext) => void | Promise<void>;
    onStart?: (ctx: RuntimeContext) => void | Promise<void>;
}
