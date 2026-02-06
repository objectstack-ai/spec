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
