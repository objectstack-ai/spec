import { describe, it, expect } from 'vitest';
import {
  GitHubConnectorSchema,
  GitHubRepositorySchema,
  GitHubCommitConfigSchema,
  GitHubPullRequestConfigSchema,
  GitHubActionsWorkflowSchema,
  GitHubReleaseConfigSchema,
  GitHubIssueTrackingSchema,
  githubPublicConnectorExample,
  githubEnterpriseConnectorExample,
  type GitHubConnector,
} from './github.zod';

describe('GitHubRepositorySchema', () => {
  it('should accept minimal repository config', () => {
    const repo = {
      owner: 'objectstack-ai',
      name: 'spec',
    };

    const result = GitHubRepositorySchema.parse(repo);
    expect(result.defaultBranch).toBe('main');
    expect(result.autoMerge).toBe(false);
  });

  it('should accept repository with branch protection', () => {
    const repo = {
      owner: 'objectstack-ai',
      name: 'spec',
      defaultBranch: 'main',
      branchProtection: {
        requiredReviewers: 2,
        requireStatusChecks: true,
        enforceAdmins: true,
      },
    };

    expect(() => GitHubRepositorySchema.parse(repo)).not.toThrow();
  });

  it('should accept repository with topics', () => {
    const repo = {
      owner: 'objectstack-ai',
      name: 'spec',
      topics: ['objectstack', 'low-code', 'metadata'],
    };

    expect(() => GitHubRepositorySchema.parse(repo)).not.toThrow();
  });
});

describe('GitHubCommitConfigSchema', () => {
  it('should accept minimal commit config', () => {
    const config = {};

    const result = GitHubCommitConfigSchema.parse(config);
    expect(result.signCommits).toBe(false);
    expect(result.useConventionalCommits).toBe(true);
  });

  it('should accept full commit config', () => {
    const config = {
      authorName: 'ObjectStack Bot',
      authorEmail: 'bot@objectstack.ai',
      signCommits: true,
      messageTemplate: '{{type}}: {{message}}',
      useConventionalCommits: true,
    };

    expect(() => GitHubCommitConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate email format', () => {
    expect(() => GitHubCommitConfigSchema.parse({
      authorEmail: 'invalid-email',
    })).toThrow();

    expect(() => GitHubCommitConfigSchema.parse({
      authorEmail: 'valid@email.com',
    })).not.toThrow();
  });
});

describe('GitHubPullRequestConfigSchema', () => {
  it('should accept minimal PR config', () => {
    const config = {};

    const result = GitHubPullRequestConfigSchema.parse(config);
    expect(result.draftByDefault).toBe(false);
    expect(result.deleteHeadBranch).toBe(true);
  });

  it('should accept PR config with templates and reviewers', () => {
    const config = {
      titleTemplate: '{{type}}: {{description}}',
      bodyTemplate: '## Changes\n\n{{changes}}',
      defaultReviewers: ['reviewer1', 'reviewer2'],
      defaultAssignees: ['assignee1'],
      defaultLabels: ['automated', 'needs-review'],
    };

    expect(() => GitHubPullRequestConfigSchema.parse(config)).not.toThrow();
  });
});

describe('GitHubActionsWorkflowSchema', () => {
  it('should accept minimal workflow', () => {
    const workflow = {
      name: 'CI',
      path: '.github/workflows/ci.yml',
    };

    const result = GitHubActionsWorkflowSchema.parse(workflow);
    expect(result.enabled).toBe(true);
  });

  it('should accept all trigger types', () => {
    const triggers = ['push', 'pull_request', 'release', 'schedule', 'workflow_dispatch', 'repository_dispatch'] as const;
    
    triggers.forEach(trigger => {
      const workflow = {
        name: 'Test',
        path: '.github/workflows/test.yml',
        triggers: [trigger],
      };
      expect(() => GitHubActionsWorkflowSchema.parse(workflow)).not.toThrow();
    });
  });

  it('should accept workflow with env and secrets', () => {
    const workflow = {
      name: 'Deploy',
      path: '.github/workflows/deploy.yml',
      env: {
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
      },
      secrets: ['DEPLOY_TOKEN', 'AWS_SECRET_KEY'],
    };

    expect(() => GitHubActionsWorkflowSchema.parse(workflow)).not.toThrow();
  });
});

describe('GitHubReleaseConfigSchema', () => {
  it('should accept minimal release config', () => {
    const config = {};

    const result = GitHubReleaseConfigSchema.parse(config);
    expect(result.tagPattern).toBe('v*');
    expect(result.semanticVersioning).toBe(true);
    expect(result.autoReleaseNotes).toBe(true);
  });

  it('should accept full release config', () => {
    const config = {
      tagPattern: 'release/*',
      semanticVersioning: true,
      autoReleaseNotes: true,
      releaseNameTemplate: 'Release {{version}}',
      preReleasePattern: '*-rc*',
      draftByDefault: true,
    };

    expect(() => GitHubReleaseConfigSchema.parse(config)).not.toThrow();
  });
});

describe('GitHubIssueTrackingSchema', () => {
  it('should accept minimal issue tracking config', () => {
    const config = {};

    const result = GitHubIssueTrackingSchema.parse(config);
    expect(result.enabled).toBe(true);
    expect(result.autoAssign).toBe(false);
  });

  it('should accept auto-close stale issues config', () => {
    const config = {
      autoCloseStale: {
        enabled: true,
        daysBeforeStale: 30,
        daysBeforeClose: 7,
        staleLabel: 'wontfix',
      },
    };

    const result = GitHubIssueTrackingSchema.parse(config);
    expect(result.autoCloseStale?.enabled).toBe(true);
    expect(result.autoCloseStale?.daysBeforeStale).toBe(30);
  });
});

describe('GitHubConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal GitHub connector', () => {
      const connector: GitHubConnector = {
        name: 'github_test',
        label: 'GitHub Test',
        type: 'saas',
        provider: 'github',
        authentication: {
          type: 'oauth2',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          grantType: 'authorization_code',
        },
        repositories: [
          {
            owner: 'test-org',
            name: 'test-repo',
          },
        ],
      };

      const result = GitHubConnectorSchema.parse(connector);
      expect(result.baseUrl).toBe('https://api.github.com');
      expect(result.enableWebhooks).toBe(true);
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['github_test', 'github_production', '_internal'];
      validNames.forEach(name => {
        expect(() => GitHubConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'github',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          repositories: [{ owner: 'x', name: 'y' }],
        })).not.toThrow();
      });

      const invalidNames = ['githubTest', 'GitHub-Test', '123github'];
      invalidNames.forEach(name => {
        expect(() => GitHubConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'github',
          authentication: { type: 'oauth2', clientId: 'x', clientSecret: 'y', authorizationUrl: 'https://x.com', tokenUrl: 'https://y.com', grantType: 'authorization_code' },
          repositories: [{ owner: 'x', name: 'y' }],
        })).toThrow();
      });
    });

    it('should accept GitHub Enterprise provider', () => {
      const connector: GitHubConnector = {
        name: 'github_enterprise',
        label: 'GitHub Enterprise',
        type: 'saas',
        provider: 'github_enterprise',
        baseUrl: 'https://github.enterprise.com/api/v3',
        authentication: {
          type: 'oauth2',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          authorizationUrl: 'https://github.enterprise.com/login/oauth/authorize',
          tokenUrl: 'https://github.enterprise.com/login/oauth/access_token',
          grantType: 'authorization_code',
        },
        repositories: [
          {
            owner: 'enterprise-org',
            name: 'app',
          },
        ],
      };

      expect(() => GitHubConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full GitHub connector with all features', () => {
      const connector: GitHubConnector = {
        name: 'github_full',
        label: 'GitHub Full Config',
        type: 'saas',
        provider: 'github',
        baseUrl: 'https://api.github.com',
        
        authentication: {
          type: 'oauth2',
          clientId: '${GITHUB_CLIENT_ID}',
          clientSecret: '${GITHUB_CLIENT_SECRET}',
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          grantType: 'authorization_code',
          scopes: ['repo', 'workflow'],
        },
        
        repositories: [
          {
            owner: 'objectstack-ai',
            name: 'spec',
            defaultBranch: 'main',
            autoMerge: false,
            branchProtection: {
              requiredReviewers: 1,
              requireStatusChecks: true,
            },
            topics: ['objectstack', 'metadata'],
          },
        ],
        
        commitConfig: {
          authorName: 'Bot',
          authorEmail: 'bot@example.com',
          useConventionalCommits: true,
        },
        
        pullRequestConfig: {
          defaultReviewers: ['reviewer'],
          defaultLabels: ['automated'],
        },
        
        workflows: [
          {
            name: 'CI',
            path: '.github/workflows/ci.yml',
            triggers: ['push', 'pull_request'],
          },
        ],
        
        releaseConfig: {
          semanticVersioning: true,
          autoReleaseNotes: true,
        },
        
        issueTracking: {
          enabled: true,
          autoCloseStale: {
            enabled: true,
            daysBeforeStale: 60,
            daysBeforeClose: 7,
            staleLabel: 'stale',
          },
        },
        
        enableWebhooks: true,
        webhookEvents: ['push', 'pull_request', 'release'],
        
        status: 'active',
        enabled: true,
      };

      expect(() => GitHubConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept GitHub.com public connector example', () => {
      expect(() => GitHubConnectorSchema.parse(githubPublicConnectorExample)).not.toThrow();
    });

    it('should accept GitHub Enterprise connector example', () => {
      expect(() => GitHubConnectorSchema.parse(githubEnterpriseConnectorExample)).not.toThrow();
    });
  });
});
