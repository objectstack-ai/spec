import type { 
  SemanticVersion,
  VersionConstraint,
  CompatibilityLevel,
  DependencyConflict
} from '@objectstack/spec/system';
import type { ObjectLogger } from './logger.js';

/**
 * Semantic Version Parser and Comparator
 * 
 * Implements semantic versioning comparison and constraint matching
 */
export class SemanticVersionManager {
  /**
   * Parse a version string into semantic version components
   */
  static parse(versionStr: string): SemanticVersion {
    // Remove 'v' prefix if present
    const cleanVersion = versionStr.replace(/^v/, '');
    
    // Match semver pattern: major.minor.patch[-prerelease][+build]
    const match = cleanVersion.match(
      /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/
    );

    if (!match) {
      throw new Error(`Invalid semantic version: ${versionStr}`);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      preRelease: match[4],
      build: match[5],
    };
  }

  /**
   * Convert semantic version back to string
   */
  static toString(version: SemanticVersion): string {
    let str = `${version.major}.${version.minor}.${version.patch}`;
    if (version.preRelease) {
      str += `-${version.preRelease}`;
    }
    if (version.build) {
      str += `+${version.build}`;
    }
    return str;
  }

  /**
   * Compare two semantic versions
   * Returns: -1 if a < b, 0 if a === b, 1 if a > b
   */
  static compare(a: SemanticVersion, b: SemanticVersion): number {
    // Compare major, minor, patch
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    if (a.patch !== b.patch) return a.patch - b.patch;

    // Pre-release versions have lower precedence
    if (a.preRelease && !b.preRelease) return -1;
    if (!a.preRelease && b.preRelease) return 1;
    
    // Compare pre-release versions
    if (a.preRelease && b.preRelease) {
      return a.preRelease.localeCompare(b.preRelease);
    }

    return 0;
  }

  /**
   * Check if version satisfies constraint
   */
  static satisfies(version: SemanticVersion, constraint: VersionConstraint): boolean {
    const constraintStr = constraint as string;

    // Any version
    if (constraintStr === '*' || constraintStr === 'latest') {
      return true;
    }

    // Exact version
    if (/^[\d.]+$/.test(constraintStr)) {
      const exact = this.parse(constraintStr);
      return this.compare(version, exact) === 0;
    }

    // Caret range (^): Compatible with version
    if (constraintStr.startsWith('^')) {
      const base = this.parse(constraintStr.slice(1));
      return (
        version.major === base.major &&
        this.compare(version, base) >= 0
      );
    }

    // Tilde range (~): Approximately equivalent
    if (constraintStr.startsWith('~')) {
      const base = this.parse(constraintStr.slice(1));
      return (
        version.major === base.major &&
        version.minor === base.minor &&
        this.compare(version, base) >= 0
      );
    }

    // Greater than or equal
    if (constraintStr.startsWith('>=')) {
      const base = this.parse(constraintStr.slice(2));
      return this.compare(version, base) >= 0;
    }

    // Greater than
    if (constraintStr.startsWith('>')) {
      const base = this.parse(constraintStr.slice(1));
      return this.compare(version, base) > 0;
    }

    // Less than or equal
    if (constraintStr.startsWith('<=')) {
      const base = this.parse(constraintStr.slice(2));
      return this.compare(version, base) <= 0;
    }

    // Less than
    if (constraintStr.startsWith('<')) {
      const base = this.parse(constraintStr.slice(1));
      return this.compare(version, base) < 0;
    }

    // Range (1.2.3 - 2.3.4)
    const rangeMatch = constraintStr.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
    if (rangeMatch) {
      const min = this.parse(rangeMatch[1]);
      const max = this.parse(rangeMatch[2]);
      return this.compare(version, min) >= 0 && this.compare(version, max) <= 0;
    }

    return false;
  }

  /**
   * Determine compatibility level between two versions
   */
  static getCompatibilityLevel(from: SemanticVersion, to: SemanticVersion): CompatibilityLevel {
    const cmp = this.compare(from, to);

    // Same version
    if (cmp === 0) {
      return 'fully-compatible';
    }

    // Major version changed - breaking changes
    if (from.major !== to.major) {
      return 'breaking-changes';
    }

    // Minor version increased - backward compatible
    if (from.minor < to.minor) {
      return 'backward-compatible';
    }

    // Patch version increased - fully compatible
    if (from.patch < to.patch) {
      return 'fully-compatible';
    }

    // Downgrade - incompatible
    return 'incompatible';
  }
}

/**
 * Plugin Dependency Resolver
 * 
 * Resolves plugin dependencies using topological sorting and conflict detection
 */
export class DependencyResolver {
  private logger: ObjectLogger;

  constructor(logger: ObjectLogger) {
    this.logger = logger.child({ component: 'DependencyResolver' });
  }

  /**
   * Resolve dependencies using topological sort
   */
  resolve(
    plugins: Map<string, { version?: string; dependencies?: string[] }>
  ): string[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Build dependency graph
    for (const [pluginName, pluginInfo] of plugins) {
      if (!graph.has(pluginName)) {
        graph.set(pluginName, []);
        inDegree.set(pluginName, 0);
      }

      const deps = pluginInfo.dependencies || [];
      for (const dep of deps) {
        // Check if dependency exists
        if (!plugins.has(dep)) {
          throw new Error(`Missing dependency: ${pluginName} requires ${dep}`);
        }

        // Add edge
        if (!graph.has(dep)) {
          graph.set(dep, []);
          inDegree.set(dep, 0);
        }
        graph.get(dep)!.push(pluginName);
        inDegree.set(pluginName, (inDegree.get(pluginName) || 0) + 1);
      }
    }

    // Topological sort using Kahn's algorithm
    const queue: string[] = [];
    const result: string[] = [];

    // Add all nodes with no incoming edges
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      // Reduce in-degree for dependent nodes
      const dependents = graph.get(node) || [];
      for (const dependent of dependents) {
        const newDegree = (inDegree.get(dependent) || 0) - 1;
        inDegree.set(dependent, newDegree);
        
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    // Check for circular dependencies
    if (result.length !== plugins.size) {
      const remaining = Array.from(plugins.keys()).filter(p => !result.includes(p));
      this.logger.error('Circular dependency detected', { remaining });
      throw new Error(`Circular dependency detected among: ${remaining.join(', ')}`);
    }

    this.logger.debug('Dependencies resolved', { order: result });
    return result;
  }

  /**
   * Detect dependency conflicts
   */
  detectConflicts(
    plugins: Map<string, { version: string; dependencies?: Record<string, VersionConstraint> }>
  ): DependencyConflict[] {
    const conflicts: DependencyConflict[] = [];
    const versionRequirements = new Map<string, Map<string, VersionConstraint>>();

    // Collect all version requirements
    for (const [pluginName, pluginInfo] of plugins) {
      if (!pluginInfo.dependencies) continue;

      for (const [depName, constraint] of Object.entries(pluginInfo.dependencies)) {
        if (!versionRequirements.has(depName)) {
          versionRequirements.set(depName, new Map());
        }
        versionRequirements.get(depName)!.set(pluginName, constraint);
      }
    }

    // Check for version mismatches
    for (const [depName, requirements] of versionRequirements) {
      const depInfo = plugins.get(depName);
      if (!depInfo) continue;

      const depVersion = SemanticVersionManager.parse(depInfo.version);
      const unsatisfied: Array<{ pluginId: string; version: string }> = [];

      for (const [requiringPlugin, constraint] of requirements) {
        if (!SemanticVersionManager.satisfies(depVersion, constraint)) {
          unsatisfied.push({
            pluginId: requiringPlugin,
            version: constraint as string,
          });
        }
      }

      if (unsatisfied.length > 0) {
        conflicts.push({
          type: 'version-mismatch',
          plugins: [
            { pluginId: depName, version: depInfo.version },
            ...unsatisfied,
          ],
          resolutions: [{
            strategy: 'upgrade',
            description: `Upgrade ${depName} to satisfy all constraints`,
            targetPlugins: [depName],
            automatic: false,
          }],
        });
      }
    }

    // Check for circular dependencies (will be caught by resolve())
    try {
      this.resolve(new Map(
        Array.from(plugins.entries()).map(([name, info]) => [
          name,
          { version: info.version, dependencies: info.dependencies ? Object.keys(info.dependencies) : [] }
        ])
      ));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Circular dependency')) {
        conflicts.push({
          type: 'circular-dependency',
          plugins: [], // Would need to extract from error
          resolutions: [{
            strategy: 'manual',
            description: 'Remove circular dependency by restructuring plugins',
            automatic: false,
          }],
        });
      }
    }

    return conflicts;
  }

  /**
   * Find best version that satisfies all constraints
   */
  findBestVersion(
    availableVersions: string[],
    constraints: VersionConstraint[]
  ): string | undefined {
    // Parse and sort versions (highest first)
    const versions = availableVersions
      .map(v => ({ str: v, parsed: SemanticVersionManager.parse(v) }))
      .sort((a, b) => -SemanticVersionManager.compare(a.parsed, b.parsed));

    // Find highest version that satisfies all constraints
    for (const version of versions) {
      const satisfiesAll = constraints.every(constraint =>
        SemanticVersionManager.satisfies(version.parsed, constraint)
      );

      if (satisfiesAll) {
        return version.str;
      }
    }

    return undefined;
  }

  /**
   * Check if dependencies form a valid DAG (no cycles)
   */
  isAcyclic(dependencies: Map<string, string[]>): boolean {
    try {
      const plugins = new Map(
        Array.from(dependencies.entries()).map(([name, deps]) => [
          name,
          { dependencies: deps }
        ])
      );
      this.resolve(plugins);
      return true;
    } catch {
      return false;
    }
  }
}
