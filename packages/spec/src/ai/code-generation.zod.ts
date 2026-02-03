import { z } from 'zod';

/**
 * Code Generation Protocol
 * 
 * AI-powered code generation from natural language specifications.
 * Enables intelligent application development automation.
 * 
 * @module ai/code-generation
 */

/**
 * Target framework for code generation
 */
export const TargetFrameworkSchema = z.enum([
  'react',           // React with TypeScript
  'vue',             // Vue 3 with TypeScript
  'angular',         // Angular with TypeScript
  'react-native',    // React Native
  'node',            // Node.js backend
  'express',         // Express.js API
  'fastify',         // Fastify API
  'nextjs',          // Next.js full-stack
  'vanilla'          // Plain JavaScript/TypeScript
]);

export type TargetFramework = z.infer<typeof TargetFrameworkSchema>;

/**
 * Code style preferences
 */
export const CodeStyleSchema = z.enum([
  'minimal',         // Bare minimum code
  'standard',        // Standard best practices
  'documented',      // Well-documented code
  'production'       // Production-ready with error handling
]);

export type CodeStyle = z.infer<typeof CodeStyleSchema>;

/**
 * Code generation context
 */
export const CodeGenerationContextSchema = z.object({
  /** Existing objects in the system */
  existingObjects: z.array(z.object({
    name: z.string(),
    label: z.string(),
    fields: z.array(z.string())
  })).optional(),
  
  /** Existing relationships */
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.enum(['one-to-one', 'one-to-many', 'many-to-many'])
  })).optional(),
  
  /** Business constraints */
  constraints: z.array(z.object({
    type: z.enum(['validation', 'business-rule', 'security', 'performance']),
    description: z.string()
  })).optional(),
  
  /** Design patterns to follow */
  patterns: z.array(z.string()).optional(),
  
  /** Existing code style guide */
  styleGuide: z.string().optional()
});

export type CodeGenerationContext = z.infer<typeof CodeGenerationContextSchema>;

/**
 * Code generation output configuration
 */
export const CodeGenerationOutputSchema = z.object({
  /** Include unit tests */
  includeTests: z.boolean().default(true),
  
  /** Include documentation */
  includeDocumentation: z.boolean().default(true),
  
  /** Include database migrations */
  includeMigration: z.boolean().default(true),
  
  /** Include API documentation */
  includeApiDocs: z.boolean().default(false),
  
  /** Include deployment scripts */
  includeDeployment: z.boolean().default(false),
  
  /** Include example usage */
  includeExamples: z.boolean().default(true),
  
  /** Test coverage target (0-100) */
  testCoverage: z.number().min(0).max(100).default(80)
});

export type CodeGenerationOutput = z.infer<typeof CodeGenerationOutputSchema>;

/**
 * Code generation request
 */
export const CodeGenerationRequestSchema = z.object({
  /** Natural language description of what to build */
  naturalLanguage: z.string().min(10),
  
  /** Additional context */
  context: CodeGenerationContextSchema.optional(),
  
  /** Target framework/platform */
  targetFramework: TargetFrameworkSchema.optional(),
  
  /** Code style preference */
  codeStyle: CodeStyleSchema.default('production'),
  
  /** Output configuration */
  output: CodeGenerationOutputSchema.optional(),
  
  /** Specific requirements */
  requirements: z.array(z.object({
    type: z.enum(['functional', 'non-functional', 'technical']),
    priority: z.enum(['must', 'should', 'could']),
    description: z.string()
  })).optional(),
  
  /** User stories or use cases */
  userStories: z.array(z.string()).optional()
});

export type CodeGenerationRequest = z.infer<typeof CodeGenerationRequestSchema>;

/**
 * Generated code artifact
 */
export const CodeArtifactSchema = z.object({
  /** File path relative to project root */
  path: z.string(),
  
  /** File content */
  content: z.string(),
  
  /** Programming language */
  language: z.string(),
  
  /** Artifact type */
  type: z.enum([
    'source',          // Source code
    'test',            // Test file
    'schema',          // Database schema
    'migration',       // Database migration
    'config',          // Configuration file
    'documentation',   // Documentation
    'script'           // Script (build, deploy, etc.)
  ]),
  
  /** Dependencies required */
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string().optional(),
    dev: z.boolean().default(false)
  })).optional(),
  
  /** Description of the artifact */
  description: z.string().optional()
});

export type CodeArtifact = z.infer<typeof CodeArtifactSchema>;

/**
 * Generated test case
 */
export const GeneratedTestSchema = z.object({
  /** Test file path */
  path: z.string(),
  
  /** Test suite name */
  suite: z.string(),
  
  /** Test cases */
  cases: z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(['unit', 'integration', 'e2e']),
    assertions: z.array(z.string())
  })),
  
  /** Test coverage achieved */
  coverage: z.number().min(0).max(100),
  
  /** Mocks or fixtures needed */
  fixtures: z.array(z.string()).optional()
});

export type GeneratedTest = z.infer<typeof GeneratedTestSchema>;

/**
 * Code generation response
 */
export const CodeGenerationResponseSchema = z.object({
  /** Request ID for tracking */
  requestId: z.string(),
  
  /** Generation status */
  status: z.enum(['success', 'partial', 'failed']),
  
  /** Generated specification */
  specification: z.object({
    /** Data model definition */
    dataModel: z.array(z.object({
      object: z.string(),
      fields: z.array(z.any()),
      relationships: z.array(z.any())
    })).optional(),
    
    /** UI views */
    views: z.array(z.any()).optional(),
    
    /** Business logic */
    logic: z.array(z.any()).optional(),
    
    /** API endpoints */
    api: z.array(z.any()).optional()
  }).optional(),
  
  /** Generated code artifacts */
  artifacts: z.array(CodeArtifactSchema),
  
  /** Generated tests */
  tests: z.array(GeneratedTestSchema).optional(),
  
  /** Documentation */
  documentation: z.object({
    readme: z.string().optional(),
    apiDocs: z.string().optional(),
    userGuide: z.string().optional(),
    developerGuide: z.string().optional()
  }).optional(),
  
  /** Installation/setup instructions */
  setup: z.object({
    steps: z.array(z.string()),
    scripts: z.record(z.string()).optional(),
    environment: z.record(z.string()).optional()
  }).optional(),
  
  /** Quality metrics */
  quality: z.object({
    /** Code complexity score */
    complexity: z.number().optional(),
    
    /** Maintainability index */
    maintainability: z.number().optional(),
    
    /** Test coverage */
    coverage: z.number().optional(),
    
    /** Security score */
    security: z.number().optional(),
    
    /** Performance score */
    performance: z.number().optional()
  }).optional(),
  
  /** Warnings or recommendations */
  warnings: z.array(z.object({
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    suggestion: z.string().optional()
  })).optional(),
  
  /** Generation metadata */
  metadata: z.object({
    /** Time taken to generate (ms) */
    generationTime: z.number(),
    
    /** Model used for generation */
    model: z.string(),
    
    /** Tokens consumed */
    tokens: z.number().optional(),
    
    /** Estimated cost */
    cost: z.number().optional()
  })
});

export type CodeGenerationResponse = z.infer<typeof CodeGenerationResponseSchema>;

/**
 * Code refinement request
 */
export const CodeRefinementRequestSchema = z.object({
  /** Original code */
  code: z.string(),
  
  /** Refinement instructions */
  instructions: z.string(),
  
  /** Specific improvements to apply */
  improvements: z.array(z.enum([
    'performance',
    'readability',
    'security',
    'testing',
    'documentation',
    'error-handling',
    'accessibility',
    'i18n'
  ])).optional(),
  
  /** Target quality metrics */
  targets: z.object({
    complexity: z.number().optional(),
    coverage: z.number().optional(),
    maintainability: z.number().optional()
  }).optional()
});

export type CodeRefinementRequest = z.infer<typeof CodeRefinementRequestSchema>;

/**
 * Code validation result
 */
export const CodeValidationSchema = z.object({
  /** Validation status */
  valid: z.boolean(),
  
  /** Syntax errors */
  syntaxErrors: z.array(z.object({
    line: z.number(),
    column: z.number(),
    message: z.string()
  })).optional(),
  
  /** Linting issues */
  lintingIssues: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']),
    rule: z.string(),
    message: z.string(),
    line: z.number()
  })).optional(),
  
  /** Security vulnerabilities */
  security: z.array(z.object({
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    type: z.string(),
    description: z.string(),
    remediation: z.string()
  })).optional(),
  
  /** Best practice violations */
  bestPractices: z.array(z.object({
    category: z.string(),
    issue: z.string(),
    recommendation: z.string()
  })).optional()
});

export type CodeValidation = z.infer<typeof CodeValidationSchema>;
