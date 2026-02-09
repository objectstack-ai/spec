// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

// No-op for browser mocks
export default {};
export const watch = () => ({ on: () => {}, close: () => {} });
export const promises = {};
export const constants = {};
export const readFileSync = () => '';
export const statSync = () => ({ isFile: () => false, isDirectory: () => false });
export const existsSync = () => false;
export const join = (...args: string[]) => args.join('/');
export const resolve = (...args: string[]) => args.join('/');
export const dirname = () => '';
export const basename = () => '';
export const extname = () => '';
export const inspect = () => '';
export const inherits = () => {};
export const EventEmitter = class { on() {} emit() {} };
export const platform = 'browser';
export const cwd = () => '/';
export const env = {};
