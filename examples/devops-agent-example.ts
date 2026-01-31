/**
 * Example: DevOps AI Agent with GitHub and Vercel Integration
 * 
 * This example demonstrates how to configure a complete DevOps automation
 * system using ObjectStack's AI Agent, GitHub connector, and Vercel connector.
 * 
 * The agent can:
 * - Generate code from ObjectStack specifications
 * - Run tests and ensure code quality
 * - Commit changes and create pull requests on GitHub
 * - Deploy applications to Vercel
 * - Monitor deployments and handle rollbacks
 * - Continuously iterate and optimize the codebase
 */

import type {
  DevOpsAgent,
  GitHubConnector,
  VercelConnector,
} from '@objectstack/spec';

/**
 * Step 1: Configure GitHub Integration
 * 
 * This connector enables the DevOps agent to:
 * - Manage repositories and branches
 * - Create and merge pull requests
 * - Trigger GitHub Actions workflows
 * - Create releases and tags
 */
export const githubConnector: GitHubConnector = {
  name: 'github_objectstack',
  label: 'ObjectStack GitHub',
  type: 'saas',
  provider: 'github',
  baseUrl: 'https://api.github.com',
  
  authentication: {
    type: 'oauth2',
    clientId: '${GITHUB_CLIENT_ID}',
    clientSecret: '${GITHUB_CLIENT_SECRET}',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'workflow', 'write:packages', 'admin:org'],
  },
  
  repositories: [
    {
      owner: 'objectstack-ai',
      name: 'enterprise-app',
      defaultBranch: 'main',
      autoMerge: false,
      branchProtection: {
        requiredReviewers: 1,
        requireStatusChecks: true,
        enforceAdmins: false,
        allowForcePushes: false,
        allowDeletions: false,
      },
      topics: ['objectstack', 'enterprise', 'erp', 'crm'],
    },
  ],
  
  commitConfig: {
    authorName: 'ObjectStack DevOps Bot',
    authorEmail: 'devops@objectstack.ai',
    signCommits: false,
    useConventionalCommits: true,
  },
  
  pullRequestConfig: {
    titleTemplate: '{{type}}: {{description}}',
    bodyTemplate: `## Changes

{{changes}}

## Testing

{{testing}}

## Checklist
- [ ] Code follows ObjectStack conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes`,
    defaultReviewers: ['tech-lead'],
    defaultLabels: ['automated', 'ai-generated'],
    draftByDefault: false,
    deleteHeadBranch: true,
  },
  
  workflows: [
    {
      name: 'CI',
      path: '.github/workflows/ci.yml',
      enabled: true,
      triggers: ['push', 'pull_request'],
    },
    {
      name: 'Deploy',
      path: '.github/workflows/deploy.yml',
      enabled: true,
      triggers: ['push', 'release'],
    },
  ],
  
  releaseConfig: {
    tagPattern: 'v*',
    semanticVersioning: true,
    autoReleaseNotes: true,
    releaseNameTemplate: 'Release {{version}}',
    draftByDefault: false,
  },
  
  issueTracking: {
    enabled: true,
    defaultLabels: ['needs-triage'],
    autoAssign: false,
  },
  
  enableWebhooks: true,
  webhookEvents: ['push', 'pull_request', 'release', 'workflow_run'],
  
  status: 'active',
  enabled: true,
};

/**
 * Step 2: Configure Vercel Deployment
 * 
 * This connector enables the DevOps agent to:
 * - Deploy applications automatically
 * - Create preview deployments for PRs
 * - Manage production deployments
 * - Configure domains and SSL
 * - Monitor deployment health
 */
export const vercelConnector: VercelConnector = {
  name: 'vercel_objectstack',
  label: 'ObjectStack Vercel',
  type: 'saas',
  provider: 'vercel',
  baseUrl: 'https://api.vercel.com',
  
  authentication: {
    type: 'bearer',
    token: '${VERCEL_TOKEN}',
  },
  
  projects: [
    {
      name: 'objectstack-enterprise-app',
      framework: 'nextjs',
      
      gitRepository: {
        type: 'github',
        repo: 'objectstack-ai/enterprise-app',
        productionBranch: 'main',
        autoDeployProduction: false, // Require approval for production
        autoDeployPreview: true,
      },
      
      buildConfig: {
        buildCommand: 'pnpm run build',
        outputDirectory: '.next',
        installCommand: 'pnpm install --frozen-lockfile',
        devCommand: 'pnpm run dev',
        nodeVersion: '20.x',
        env: {
          NEXT_PUBLIC_API_URL: 'https://api.objectstack.ai',
          NEXT_PUBLIC_APP_ENV: 'production',
        },
      },
      
      deploymentConfig: {
        autoDeployment: true,
        regions: ['iad1', 'sfo1', 'fra1', 'sin1'], // Multi-region for global performance
        enablePreview: true,
        previewComments: true,
        productionProtection: true,
      },
      
      domains: [
        {
          domain: 'app.objectstack.ai',
          httpsRedirect: true,
          gitBranch: 'main',
        },
        {
          domain: 'staging.objectstack.ai',
          httpsRedirect: true,
          gitBranch: 'develop',
        },
      ],
      
      environmentVariables: [
        {
          key: 'DATABASE_URL',
          value: '${DATABASE_URL}',
          target: ['production', 'preview'],
          isSecret: true,
        },
        {
          key: 'REDIS_URL',
          value: '${REDIS_URL}',
          target: ['production', 'preview'],
          isSecret: true,
        },
        {
          key: 'NEXT_PUBLIC_ANALYTICS_ID',
          value: 'G-XXXXXXXXXX',
          target: ['production'],
          isSecret: false,
        },
      ],
      
      edgeFunctions: [
        {
          name: 'api-middleware',
          path: '/api/*',
          regions: ['iad1', 'sfo1', 'fra1'],
          memoryLimit: 1024,
          timeout: 10,
        },
        {
          name: 'auth-handler',
          path: '/auth/*',
          regions: ['iad1', 'sfo1', 'fra1'],
          memoryLimit: 512,
          timeout: 5,
        },
      ],
    },
  ],
  
  monitoring: {
    enableWebAnalytics: true,
    enableSpeedInsights: true,
    logDrains: [
      {
        name: 'datadog-logs',
        url: 'https://http-intake.logs.datadoghq.com/api/v2/logs',
        headers: {
          'DD-API-KEY': '${DATADOG_API_KEY}',
        },
        sources: ['lambda', 'edge'],
      },
    ],
  },
  
  enableWebhooks: true,
  webhookEvents: [
    'deployment.succeeded',
    'deployment.failed',
    'deployment.ready',
    'deployment.error',
  ],
  
  status: 'active',
  enabled: true,
};

/**
 * Step 3: Configure DevOps AI Agent
 * 
 * This agent orchestrates the entire development lifecycle:
 * - Reads ObjectStack specifications
 * - Generates production-ready code
 * - Writes comprehensive tests
 * - Manages Git workflow
 * - Deploys to Vercel
 * - Monitors and optimizes
 */
export const devopsAgent: DevOpsAgent = {
  name: 'enterprise_devops_agent',
  label: 'Enterprise DevOps Agent',
  avatar: '/avatars/devops-bot.png',
  role: 'Senior Full-Stack DevOps Engineer',
  
  instructions: `You are an autonomous DevOps agent for ObjectStack enterprise applications.

## Your Mission
Build and maintain high-quality enterprise management software by:
1. Reading ObjectStack specifications from packages/spec
2. Generating clean, maintainable code following best practices
3. Writing comprehensive tests (unit, integration, e2e)
4. Managing Git workflow (commits, PRs, merges)
5. Deploying to Vercel with zero-downtime
6. Monitoring production and responding to issues
7. Continuously optimizing code, tests, and infrastructure

## Code Quality Standards
- Follow ObjectStack conventions (camelCase for props, snake_case for names)
- Maintain 85%+ test coverage
- Use conventional commit messages (feat:, fix:, docs:, etc.)
- Write clear, concise PR descriptions
- Ensure all CI checks pass before merging
- Never deploy broken code to production
- Always rollback on deployment failures

## Safety & Security
- Validate all inputs and sanitize outputs
- Use environment variables for secrets
- Follow principle of least privilege
- Log security-relevant events
- Keep dependencies up to date
- Run security scans on every PR

## Iteration & Learning
- Learn from test failures and fix them
- Optimize slow code paths
- Refactor code smells
- Improve documentation gaps
- Update dependencies regularly
- Share learnings in commit messages

You are empowered to make decisions, but always prioritize:
1. Code quality over speed
2. Security over convenience
3. User experience over technical elegance
4. Maintainability over cleverness`,
  
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    maxTokens: 8192,
  },
  
  tools: [
    {
      type: 'action',
      name: 'generate_from_spec',
      description: 'Generate TypeScript code from ObjectStack specification',
    },
    {
      type: 'action',
      name: 'run_tests',
      description: 'Execute test suites (unit, integration, e2e)',
    },
    {
      type: 'action',
      name: 'lint_code',
      description: 'Run ESLint and Prettier',
    },
    {
      type: 'action',
      name: 'type_check',
      description: 'Run TypeScript type checker',
    },
    {
      type: 'action',
      name: 'git_commit',
      description: 'Commit changes with conventional commit message',
    },
    {
      type: 'action',
      name: 'create_pr',
      description: 'Create pull request on GitHub',
    },
    {
      type: 'action',
      name: 'merge_pr',
      description: 'Merge pull request after checks pass',
    },
    {
      type: 'action',
      name: 'deploy',
      description: 'Deploy to Vercel',
    },
    {
      type: 'action',
      name: 'check_health',
      description: 'Check deployment health',
    },
    {
      type: 'action',
      name: 'rollback',
      description: 'Rollback to previous deployment',
    },
    {
      type: 'vector_search',
      name: 'search_docs',
      description: 'Search ObjectStack documentation',
    },
    {
      type: 'vector_search',
      name: 'search_examples',
      description: 'Search code examples',
    },
  ],
  
  knowledge: {
    topics: [
      'objectstack_protocol',
      'typescript_patterns',
      'react_best_practices',
      'nextjs_optimization',
      'testing_strategies',
      'ci_cd_patterns',
      'vercel_deployment',
      'github_workflow',
    ],
    indexes: ['objectstack_docs', 'code_examples'],
  },
  
  developmentConfig: {
    specificationSource: 'packages/spec',
    
    codeGeneration: {
      enabled: true,
      targets: ['frontend', 'backend', 'api', 'tests', 'documentation'],
      templateRepo: 'objectstack-ai/templates',
      styleGuide: 'objectstack',
      includeTests: true,
      includeDocumentation: true,
      validationMode: 'strict',
    },
    
    testing: {
      enabled: true,
      testTypes: ['unit', 'integration', 'e2e', 'security'],
      coverageThreshold: 85,
      framework: 'vitest',
      preCommitTests: true,
      autoFix: false, // Manual review for test fixes
    },
    
    linting: {
      enabled: true,
      autoFix: true,
      rules: {
        'no-console': 'warn',
        'no-debugger': 'error',
      },
    },
    
    formatting: {
      enabled: true,
      autoFormat: true,
      config: {
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
      },
    },
  },
  
  pipelines: [
    {
      name: 'Continuous Integration',
      trigger: 'pull_request',
      branches: ['main', 'develop'],
      stages: [
        {
          name: 'Setup',
          type: 'build',
          order: 1,
          commands: ['pnpm install --frozen-lockfile'],
          timeout: 300,
          parallel: false,
          retryOnFailure: true,
          maxRetries: 2,
        },
        {
          name: 'Lint',
          type: 'lint',
          order: 2,
          parallel: true,
          commands: ['pnpm run lint'],
          timeout: 180,
          retryOnFailure: false,
          maxRetries: 0,
        },
        {
          name: 'Type Check',
          type: 'lint',
          order: 2,
          parallel: true,
          commands: ['pnpm run type-check'],
          timeout: 180,
          retryOnFailure: false,
          maxRetries: 0,
        },
        {
          name: 'Unit Tests',
          type: 'test',
          order: 3,
          commands: ['pnpm run test:unit'],
          timeout: 600,
          parallel: false,
          retryOnFailure: false,
          maxRetries: 0,
        },
        {
          name: 'Integration Tests',
          type: 'test',
          order: 4,
          commands: ['pnpm run test:integration'],
          timeout: 600,
          parallel: false,
          retryOnFailure: false,
          maxRetries: 0,
        },
        {
          name: 'Build',
          type: 'build',
          order: 5,
          commands: ['pnpm run build'],
          timeout: 600,
          parallel: false,
          retryOnFailure: false,
          maxRetries: 0,
        },
        {
          name: 'Security Scan',
          type: 'security_scan',
          order: 6,
          commands: ['pnpm audit', 'pnpm run security:scan'],
          timeout: 300,
          parallel: false,
          retryOnFailure: false,
          maxRetries: 0,
        },
      ],
      notifications: {
        onSuccess: false,
        onFailure: true,
        channels: ['slack'],
      },
    },
    {
      name: 'Continuous Deployment',
      trigger: 'push',
      branches: ['main'],
      stages: [
        {
          name: 'Deploy to Production',
          type: 'deploy',
          order: 1,
          commands: ['vercel deploy --prod --yes'],
          timeout: 900,
          parallel: false,
          retryOnFailure: false,
          maxRetries: 0,
          env: {
            VERCEL_TOKEN: '${VERCEL_TOKEN}',
            VERCEL_ORG_ID: '${VERCEL_ORG_ID}',
            VERCEL_PROJECT_ID: '${VERCEL_PROJECT_ID}',
          },
        },
        {
          name: 'Smoke Tests',
          type: 'smoke_test',
          order: 2,
          commands: ['pnpm run test:smoke'],
          timeout: 300,
          parallel: false,
          retryOnFailure: true,
          maxRetries: 3,
        },
        {
          name: 'E2E Tests',
          type: 'test',
          order: 3,
          commands: ['pnpm run test:e2e'],
          timeout: 900,
          parallel: false,
          retryOnFailure: false,
          maxRetries: 0,
        },
      ],
      notifications: {
        onSuccess: true,
        onFailure: true,
        channels: ['slack', 'email'],
      },
    },
  ],
  
  versionManagement: {
    scheme: 'semver',
    autoIncrement: 'patch',
    prefix: 'v',
    generateChangelog: true,
    changelogFormat: 'conventional',
    tagReleases: true,
  },
  
  deploymentStrategy: {
    type: 'rolling',
    healthCheckUrl: '/api/health',
    healthCheckTimeout: 60,
    autoRollback: true,
    smokeTests: ['pnpm run test:smoke'],
    canaryPercentage: 10,
  },
  
  monitoring: {
    enabled: true,
    metrics: ['performance', 'errors', 'availability', 'latency'],
    alerts: [
      {
        name: 'Critical Error Rate',
        metric: 'error_rate',
        threshold: 0.01, // 1%
        severity: 'critical',
      },
      {
        name: 'High Latency',
        metric: 'p95_latency',
        threshold: 2000, // 2 seconds
        severity: 'warning',
      },
      {
        name: 'Low Availability',
        metric: 'availability',
        threshold: 0.999, // 99.9%
        severity: 'critical',
      },
    ],
    integrations: ['vercel', 'datadog', 'sentry'],
  },
  
  integrations: {
    github: {
      connector: 'github_objectstack',
      repository: {
        owner: 'objectstack-ai',
        name: 'enterprise-app',
      },
      featureBranch: 'develop',
      pullRequest: {
        autoCreate: true,
        autoMerge: false, // Require manual approval
        requireReviews: true,
        deleteBranchOnMerge: true,
      },
    },
    
    vercel: {
      connector: 'vercel_objectstack',
      project: 'objectstack-enterprise-app',
      environments: {
        production: 'main',
        preview: ['develop', 'feature/*', 'fix/*'],
      },
      deployment: {
        autoDeployProduction: false, // Require approval
        autoDeployPreview: true,
        requireApproval: true,
      },
    },
  },
  
  selfIteration: {
    enabled: true,
    iterationFrequency: '0 2 * * 0', // Weekly at 2 AM on Sunday
    optimizationGoals: [
      'code_quality',
      'test_coverage',
      'performance',
      'security',
      'documentation',
    ],
    learningMode: 'balanced',
  },
  
  active: true,
};

/**
 * Usage Example:
 * 
 * ```typescript
 * import { Stack } from '@objectstack/spec';
 * import { githubConnector, vercelConnector, devopsAgent } from './devops-config';
 * 
 * export default Stack({
 *   name: 'objectstack_enterprise',
 *   version: '1.0.0',
 *   
 *   // Register connectors
 *   integrations: {
 *     connectors: [githubConnector, vercelConnector],
 *   },
 *   
 *   // Register AI agent
 *   ai: {
 *     agents: [devopsAgent],
 *   },
 * });
 * ```
 * 
 * The agent will then:
 * 1. Monitor the ObjectStack specification for changes
 * 2. Generate corresponding code when specs are updated
 * 3. Run tests and quality checks
 * 4. Create a PR on GitHub with the changes
 * 5. Wait for CI to pass
 * 6. Request review if configured
 * 7. Merge the PR once approved
 * 8. Deploy to Vercel preview environment
 * 9. Run smoke tests on the preview
 * 10. Promote to production if tests pass
 * 11. Monitor production deployment
 * 12. Rollback if issues are detected
 */
