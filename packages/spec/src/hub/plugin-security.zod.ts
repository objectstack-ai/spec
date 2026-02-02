import { z } from 'zod';

/**
 * # Plugin Security & Dependency Resolution Protocol
 * 
 * Provides comprehensive security scanning, vulnerability management,
 * and dependency resolution for the ObjectStack plugin ecosystem.
 * 
 * Features:
 * - CVE/vulnerability scanning
 * - Dependency graph resolution
 * - Semantic version conflict detection
 * - Supply chain security
 * - Plugin sandboxing policies
 * - Trust and verification workflows
 */

// ============================================================================
// Security Scanning
// ============================================================================

/**
 * Vulnerability Severity
 */
export const VulnerabilitySeverity = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);

export type VulnerabilitySeverity = z.infer<typeof VulnerabilitySeverity>;

/**
 * Security Vulnerability
 */
export const SecurityVulnerabilitySchema = z.object({
  /**
   * CVE identifier (if applicable)
   */
  cve: z.string().regex(/^CVE-\d{4}-\d+$/).optional().describe('CVE identifier'),
  
  /**
   * Vulnerability identifier (GHSA, SNYK, etc.)
   */
  id: z.string().describe('Vulnerability ID'),
  
  /**
   * Title
   */
  title: z.string(),
  
  /**
   * Description
   */
  description: z.string(),
  
  /**
   * Severity
   */
  severity: VulnerabilitySeverity,
  
  /**
   * CVSS score (0-10)
   */
  cvss: z.number().min(0).max(10).optional(),
  
  /**
   * Affected package
   */
  package: z.object({
    name: z.string(),
    version: z.string(),
    ecosystem: z.string().optional(),
  }),
  
  /**
   * Vulnerable version range
   */
  vulnerableVersions: z.string().describe('Semver range of vulnerable versions'),
  
  /**
   * Patched versions
   */
  patchedVersions: z.string().optional().describe('Semver range of patched versions'),
  
  /**
   * References
   */
  references: z.array(z.object({
    type: z.enum(['advisory', 'article', 'report', 'web']),
    url: z.string().url(),
  })).default([]),
  
  /**
   * CWE (Common Weakness Enumeration)
   */
  cwe: z.array(z.string()).default([]),
  
  /**
   * Published date
   */
  publishedAt: z.string().datetime().optional(),
  
  /**
   * Mitigation advice
   */
  mitigation: z.string().optional(),
});

export type SecurityVulnerability = z.infer<typeof SecurityVulnerabilitySchema>;

/**
 * Security Scan Result
 */
export const SecurityScanResultSchema = z.object({
  /**
   * Scan identifier
   */
  scanId: z.string().uuid(),
  
  /**
   * Plugin being scanned
   */
  plugin: z.object({
    id: z.string(),
    version: z.string(),
  }),
  
  /**
   * Scan timestamp
   */
  scannedAt: z.string().datetime(),
  
  /**
   * Scanner information
   */
  scanner: z.object({
    name: z.string().describe('Scanner name (e.g., snyk, osv, trivy)'),
    version: z.string(),
  }),
  
  /**
   * Scan status
   */
  status: z.enum(['passed', 'failed', 'warning']),
  
  /**
   * Vulnerabilities found
   */
  vulnerabilities: z.array(SecurityVulnerabilitySchema),
  
  /**
   * Vulnerability summary
   */
  summary: z.object({
    critical: z.number().int().min(0).default(0),
    high: z.number().int().min(0).default(0),
    medium: z.number().int().min(0).default(0),
    low: z.number().int().min(0).default(0),
    info: z.number().int().min(0).default(0),
    total: z.number().int().min(0).default(0),
  }),
  
  /**
   * License compliance issues
   */
  licenseIssues: z.array(z.object({
    package: z.string(),
    license: z.string(),
    reason: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })).default([]),
  
  /**
   * Code quality issues
   */
  codeQuality: z.object({
    score: z.number().min(0).max(100).optional(),
    issues: z.array(z.object({
      type: z.enum(['security', 'quality', 'style']),
      severity: z.enum(['error', 'warning', 'info']),
      message: z.string(),
      file: z.string().optional(),
      line: z.number().int().optional(),
    })).default([]),
  }).optional(),
  
  /**
   * Next scan scheduled
   */
  nextScanAt: z.string().datetime().optional(),
});

export type SecurityScanResult = z.infer<typeof SecurityScanResultSchema>;

/**
 * Security Policy
 */
export const SecurityPolicySchema = z.object({
  /**
   * Policy identifier
   */
  id: z.string(),
  
  /**
   * Policy name
   */
  name: z.string(),
  
  /**
   * Automatic scanning
   */
  autoScan: z.object({
    enabled: z.boolean().default(true),
    frequency: z.enum(['on-publish', 'daily', 'weekly', 'monthly']).default('daily'),
  }),
  
  /**
   * Vulnerability thresholds
   */
  thresholds: z.object({
    /**
     * Block plugin if critical vulnerabilities exceed this
     */
    maxCritical: z.number().int().min(0).default(0),
    
    /**
     * Block plugin if high vulnerabilities exceed this
     */
    maxHigh: z.number().int().min(0).default(0),
    
    /**
     * Warn if medium vulnerabilities exceed this
     */
    maxMedium: z.number().int().min(0).default(5),
  }),
  
  /**
   * Allowed licenses
   */
  allowedLicenses: z.array(z.string()).default([
    'MIT',
    'Apache-2.0',
    'BSD-3-Clause',
    'BSD-2-Clause',
    'ISC',
  ]),
  
  /**
   * Prohibited licenses
   */
  prohibitedLicenses: z.array(z.string()).default([
    'GPL-3.0',
    'AGPL-3.0',
  ]),
  
  /**
   * Code signing requirements
   */
  codeSigning: z.object({
    required: z.boolean().default(false),
    allowedSigners: z.array(z.string()).default([]),
  }).optional(),
  
  /**
   * Sandbox restrictions
   */
  sandbox: z.object({
    /**
     * Restrict network access
     */
    networkAccess: z.enum(['none', 'localhost', 'allowlist', 'all']).default('all'),
    
    /**
     * Allowed network destinations (if allowlist)
     */
    allowedDestinations: z.array(z.string()).default([]),
    
    /**
     * File system access
     */
    filesystemAccess: z.enum(['none', 'read-only', 'temp-only', 'full']).default('full'),
    
    /**
     * Maximum memory (MB)
     */
    maxMemoryMB: z.number().int().positive().optional(),
    
    /**
     * Maximum CPU time (seconds)
     */
    maxCPUSeconds: z.number().int().positive().optional(),
  }).optional(),
});

export type SecurityPolicy = z.infer<typeof SecurityPolicySchema>;

// ============================================================================
// Dependency Resolution
// ============================================================================

/**
 * Package Dependency
 */
export const PackageDependencySchema = z.object({
  /**
   * Package name/ID
   */
  name: z.string(),
  
  /**
   * Version constraint (semver range)
   */
  versionConstraint: z.string().describe('Semver range (e.g., ^1.0.0, >=2.0.0 <3.0.0)'),
  
  /**
   * Dependency type
   */
  type: z.enum(['required', 'optional', 'peer', 'dev']).default('required'),
  
  /**
   * Resolved version (filled during resolution)
   */
  resolvedVersion: z.string().optional(),
});

export type PackageDependency = z.infer<typeof PackageDependencySchema>;

/**
 * Dependency Graph Node
 */
export const DependencyGraphNodeSchema = z.object({
  /**
   * Package identifier
   */
  id: z.string(),
  
  /**
   * Package version
   */
  version: z.string(),
  
  /**
   * Dependencies of this package
   */
  dependencies: z.array(PackageDependencySchema).default([]),
  
  /**
   * Depth in dependency tree
   */
  depth: z.number().int().min(0),
  
  /**
   * Whether this is a direct dependency
   */
  isDirect: z.boolean(),
  
  /**
   * Package metadata
   */
  metadata: z.object({
    name: z.string(),
    description: z.string().optional(),
    license: z.string().optional(),
    homepage: z.string().url().optional(),
  }).optional(),
});

export type DependencyGraphNode = z.infer<typeof DependencyGraphNodeSchema>;

/**
 * Dependency Graph
 */
export const DependencyGraphSchema = z.object({
  /**
   * Root package
   */
  root: z.object({
    id: z.string(),
    version: z.string(),
  }),
  
  /**
   * All nodes in the graph
   */
  nodes: z.array(DependencyGraphNodeSchema),
  
  /**
   * Edges (dependency relationships)
   */
  edges: z.array(z.object({
    from: z.string().describe('Package ID'),
    to: z.string().describe('Package ID'),
    constraint: z.string().describe('Version constraint'),
  })),
  
  /**
   * Resolution statistics
   */
  stats: z.object({
    totalDependencies: z.number().int().min(0),
    directDependencies: z.number().int().min(0),
    maxDepth: z.number().int().min(0),
  }),
});

export type DependencyGraph = z.infer<typeof DependencyGraphSchema>;

/**
 * Dependency Conflict
 */
export const DependencyConflictSchema = z.object({
  /**
   * Package with conflict
   */
  package: z.string(),
  
  /**
   * Conflicting versions
   */
  conflicts: z.array(z.object({
    version: z.string(),
    requestedBy: z.array(z.string()).describe('Packages that require this version'),
    constraint: z.string(),
  })),
  
  /**
   * Suggested resolution
   */
  resolution: z.object({
    strategy: z.enum(['pick-highest', 'pick-lowest', 'manual']),
    version: z.string().optional(),
    reason: z.string().optional(),
  }).optional(),
  
  /**
   * Severity
   */
  severity: z.enum(['error', 'warning', 'info']),
});

export type DependencyConflict = z.infer<typeof DependencyConflictSchema>;

/**
 * Dependency Resolution Result
 */
export const DependencyResolutionResultSchema = z.object({
  /**
   * Resolution status
   */
  status: z.enum(['success', 'conflict', 'error']),
  
  /**
   * Resolved dependency graph
   */
  graph: DependencyGraphSchema.optional(),
  
  /**
   * Conflicts detected
   */
  conflicts: z.array(DependencyConflictSchema).default([]),
  
  /**
   * Errors encountered
   */
  errors: z.array(z.object({
    package: z.string(),
    error: z.string(),
  })).default([]),
  
  /**
   * Installation order (topological sort)
   */
  installOrder: z.array(z.string()).default([]),
  
  /**
   * Resolution time (ms)
   */
  resolvedIn: z.number().int().min(0).optional(),
});

export type DependencyResolutionResult = z.infer<typeof DependencyResolutionResultSchema>;

// ============================================================================
// Supply Chain Security
// ============================================================================

/**
 * SBOM (Software Bill of Materials) Entry
 */
export const SBOMEntrySchema = z.object({
  /**
   * Component name
   */
  name: z.string(),
  
  /**
   * Component version
   */
  version: z.string(),
  
  /**
   * Package URL (purl)
   */
  purl: z.string().optional().describe('Package URL identifier'),
  
  /**
   * License
   */
  license: z.string().optional(),
  
  /**
   * Hashes
   */
  hashes: z.object({
    sha256: z.string().optional(),
    sha512: z.string().optional(),
  }).optional(),
  
  /**
   * Supplier
   */
  supplier: z.object({
    name: z.string(),
    url: z.string().url().optional(),
  }).optional(),
  
  /**
   * External references
   */
  externalRefs: z.array(z.object({
    type: z.enum(['website', 'repository', 'documentation', 'issue-tracker']),
    url: z.string().url(),
  })).default([]),
});

export type SBOMEntry = z.infer<typeof SBOMEntrySchema>;

/**
 * Software Bill of Materials (SBOM)
 */
export const SBOMSchema = z.object({
  /**
   * SBOM format
   */
  format: z.enum(['spdx', 'cyclonedx']).default('cyclonedx'),
  
  /**
   * SBOM version
   */
  version: z.string(),
  
  /**
   * Plugin metadata
   */
  plugin: z.object({
    id: z.string(),
    version: z.string(),
    name: z.string(),
  }),
  
  /**
   * Components (dependencies)
   */
  components: z.array(SBOMEntrySchema),
  
  /**
   * Generation timestamp
   */
  generatedAt: z.string().datetime(),
  
  /**
   * Generator tool
   */
  generator: z.object({
    name: z.string(),
    version: z.string(),
  }).optional(),
});

export type SBOM = z.infer<typeof SBOMSchema>;

/**
 * Plugin Provenance
 * Verifiable chain of custody for plugin artifacts
 */
export const PluginProvenanceSchema = z.object({
  /**
   * Plugin identifier
   */
  pluginId: z.string(),
  
  /**
   * Plugin version
   */
  version: z.string(),
  
  /**
   * Build information
   */
  build: z.object({
    /**
     * Build timestamp
     */
    timestamp: z.string().datetime(),
    
    /**
     * Build environment
     */
    environment: z.object({
      os: z.string(),
      arch: z.string(),
      nodeVersion: z.string(),
    }).optional(),
    
    /**
     * Source repository
     */
    source: z.object({
      repository: z.string().url(),
      commit: z.string().regex(/^[a-f0-9]{40}$/),
      branch: z.string().optional(),
      tag: z.string().optional(),
    }).optional(),
    
    /**
     * Builder identity
     */
    builder: z.object({
      name: z.string(),
      email: z.string().email().optional(),
    }).optional(),
  }),
  
  /**
   * Artifact hashes
   */
  artifacts: z.array(z.object({
    filename: z.string(),
    sha256: z.string(),
    size: z.number().int().positive(),
  })),
  
  /**
   * Signatures
   */
  signatures: z.array(z.object({
    algorithm: z.enum(['rsa', 'ecdsa', 'ed25519']),
    publicKey: z.string(),
    signature: z.string(),
    signedBy: z.string(),
    timestamp: z.string().datetime(),
  })).default([]),
  
  /**
   * Attestations
   */
  attestations: z.array(z.object({
    type: z.enum(['code-review', 'security-scan', 'test-results', 'ci-build']),
    status: z.enum(['passed', 'failed']),
    url: z.string().url().optional(),
    timestamp: z.string().datetime(),
  })).default([]),
});

export type PluginProvenance = z.infer<typeof PluginProvenanceSchema>;

// ============================================================================
// Trust & Verification
// ============================================================================

/**
 * Plugin Trust Score
 */
export const PluginTrustScoreSchema = z.object({
  /**
   * Plugin identifier
   */
  pluginId: z.string(),
  
  /**
   * Overall trust score (0-100)
   */
  score: z.number().min(0).max(100),
  
  /**
   * Score components
   */
  components: z.object({
    /**
     * Vendor reputation (0-100)
     */
    vendorReputation: z.number().min(0).max(100),
    
    /**
     * Security scan results (0-100)
     */
    securityScore: z.number().min(0).max(100),
    
    /**
     * Code quality (0-100)
     */
    codeQuality: z.number().min(0).max(100),
    
    /**
     * Community engagement (0-100)
     */
    communityScore: z.number().min(0).max(100),
    
    /**
     * Update frequency (0-100)
     */
    maintenanceScore: z.number().min(0).max(100),
  }),
  
  /**
   * Trust level
   */
  level: z.enum(['verified', 'trusted', 'neutral', 'untrusted', 'blocked']),
  
  /**
   * Verification badges
   */
  badges: z.array(z.enum([
    'official',           // Official ObjectStack plugin
    'verified-vendor',    // Verified vendor
    'security-scanned',   // Passed security scan
    'code-signed',        // Digitally signed
    'open-source',        // Open source
    'popular',            // High downloads
  ])).default([]),
  
  /**
   * Last updated
   */
  updatedAt: z.string().datetime(),
});

export type PluginTrustScore = z.infer<typeof PluginTrustScoreSchema>;

// ============================================================================
// Export All
// ============================================================================

export const PluginSecurityProtocol = {
  VulnerabilitySeverity,
  SecurityVulnerability: SecurityVulnerabilitySchema,
  SecurityScanResult: SecurityScanResultSchema,
  SecurityPolicy: SecurityPolicySchema,
  PackageDependency: PackageDependencySchema,
  DependencyGraphNode: DependencyGraphNodeSchema,
  DependencyGraph: DependencyGraphSchema,
  DependencyConflict: DependencyConflictSchema,
  DependencyResolutionResult: DependencyResolutionResultSchema,
  SBOMEntry: SBOMEntrySchema,
  SBOM: SBOMSchema,
  PluginProvenance: PluginProvenanceSchema,
  PluginTrustScore: PluginTrustScoreSchema,
} as const;
