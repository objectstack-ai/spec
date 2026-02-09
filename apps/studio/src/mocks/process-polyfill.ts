// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

// global process polyfill
if (typeof window !== 'undefined') {
    if (!window.process) {
        (window as any).process = {};
    }
    const process = (window as any).process;
    process.env = process.env || {};
    if (!process.cwd) process.cwd = () => '/';
    if (!process.platform) process.platform = 'browser';
}
