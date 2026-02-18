// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Resolve plugin display name from a plugin entry.
 * Plugins can be string package names, objects with `.name`, or class instances.
 */
export function resolvePluginName(plugin: unknown): string {
  if (typeof plugin === 'string') return plugin;
  if (plugin && typeof plugin === 'object') {
    const p = plugin as Record<string, unknown>;
    if (typeof p.name === 'string') return p.name;
    if (p.constructor && p.constructor.name !== 'Object') return p.constructor.name;
  }
  return 'unknown';
}

/**
 * Resolve plugin version from a plugin entry.
 */
export function resolvePluginVersion(plugin: unknown): string {
  if (plugin && typeof plugin === 'object') {
    const p = plugin as Record<string, unknown>;
    if (typeof p.version === 'string') return p.version;
  }
  return '-';
}

/**
 * Resolve plugin type from a plugin entry.
 */
export function resolvePluginType(plugin: unknown): string {
  if (plugin && typeof plugin === 'object') {
    const p = plugin as Record<string, unknown>;
    if (typeof p.type === 'string') return p.type;
  }
  return 'standard';
}
