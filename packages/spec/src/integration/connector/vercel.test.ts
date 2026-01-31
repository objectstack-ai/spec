import { describe, it, expect } from 'vitest';
import {
  VercelConnectorSchema,
  VercelProjectSchema,
  GitRepositoryConfigSchema,
  BuildConfigSchema,
  DeploymentConfigSchema,
  DomainConfigSchema,
  EnvironmentVariablesSchema,
  EdgeFunctionConfigSchema,
  vercelNextJsConnectorExample,
  vercelStaticSiteConnectorExample,
  type VercelConnector,
} from './vercel.zod';

describe('GitRepositoryConfigSchema', () => {
  it('should accept minimal git repo config', () => {
    const config = {
      type: 'github' as const,
      repo: 'owner/repo',
    };

    const result = GitRepositoryConfigSchema.parse(config);
    expect(result.productionBranch).toBe('main');
    expect(result.autoDeployProduction).toBe(true);
    expect(result.autoDeployPreview).toBe(true);
  });

  it('should accept all git provider types', () => {
    const providers = ['github', 'gitlab', 'bitbucket'] as const;
    
    providers.forEach(type => {
      const config = { type, repo: 'owner/repo' };
      expect(() => GitRepositoryConfigSchema.parse(config)).not.toThrow();
    });
  });
});

describe('BuildConfigSchema', () => {
  it('should accept empty build config', () => {
    const config = {};
    expect(() => BuildConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept full build config', () => {
    const config = {
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      installCommand: 'npm ci',
      devCommand: 'npm run dev',
      nodeVersion: '20.x',
      env: {
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
      },
    };

    expect(() => BuildConfigSchema.parse(config)).not.toThrow();
  });
});

describe('DeploymentConfigSchema', () => {
  it('should accept minimal deployment config', () => {
    const config = {};

    const result = DeploymentConfigSchema.parse(config);
    expect(result.autoDeployment).toBe(true);
    expect(result.enablePreview).toBe(true);
    expect(result.previewComments).toBe(true);
  });

  it('should accept deployment with regions', () => {
    const config = {
      regions: ['iad1', 'sfo1', 'fra1'],
    };

    expect(() => DeploymentConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept deployment with deploy hooks', () => {
    const config = {
      deployHooks: [
        {
          name: 'main-deploy',
          url: 'https://api.vercel.com/v1/integrations/deploy/xxx',
          branch: 'main',
        },
      ],
    };

    expect(() => DeploymentConfigSchema.parse(config)).not.toThrow();
  });
});

describe('DomainConfigSchema', () => {
  it('should accept minimal domain config', () => {
    const config = {
      domain: 'app.example.com',
    };

    const result = DomainConfigSchema.parse(config);
    expect(result.httpsRedirect).toBe(true);
  });

  it('should accept domain with custom SSL', () => {
    const config = {
      domain: 'secure.example.com',
      customCertificate: {
        cert: '-----BEGIN CERTIFICATE-----',
        key: '-----BEGIN PRIVATE KEY-----',
        ca: '-----BEGIN CERTIFICATE-----',
      },
    };

    expect(() => DomainConfigSchema.parse(config)).not.toThrow();
  });
});

describe('EnvironmentVariablesSchema', () => {
  it('should accept environment variable', () => {
    const envVar = {
      key: 'API_KEY',
      value: 'secret-value',
      target: ['production'] as const,
    };

    const result = EnvironmentVariablesSchema.parse(envVar);
    expect(result.isSecret).toBe(false);
  });

  it('should accept secret environment variable', () => {
    const envVar = {
      key: 'DATABASE_URL',
      value: 'postgresql://...',
      target: ['production', 'preview'] as const,
      isSecret: true,
    };

    expect(() => EnvironmentVariablesSchema.parse(envVar)).not.toThrow();
  });

  it('should accept all target environments', () => {
    const targets = ['production', 'preview', 'development'] as const;
    
    targets.forEach(target => {
      const envVar = {
        key: 'TEST',
        value: 'value',
        target: [target],
      };
      expect(() => EnvironmentVariablesSchema.parse(envVar)).not.toThrow();
    });
  });
});

describe('EdgeFunctionConfigSchema', () => {
  it('should accept minimal edge function', () => {
    const func = {
      name: 'api-handler',
      path: '/api/*',
    };

    const result = EdgeFunctionConfigSchema.parse(func);
    expect(result.memoryLimit).toBe(1024);
    expect(result.timeout).toBe(10);
  });

  it('should accept edge function with custom limits', () => {
    const func = {
      name: 'heavy-processor',
      path: '/api/process',
      regions: ['iad1', 'sfo1'],
      memoryLimit: 3008,
      timeout: 60,
    };

    expect(() => EdgeFunctionConfigSchema.parse(func)).not.toThrow();
  });

  it('should enforce memory limits', () => {
    expect(() => EdgeFunctionConfigSchema.parse({
      name: 'test',
      path: '/test',
      memoryLimit: 100, // Too low
    })).toThrow();

    expect(() => EdgeFunctionConfigSchema.parse({
      name: 'test',
      path: '/test',
      memoryLimit: 5000, // Too high
    })).toThrow();
  });

  it('should enforce timeout limits', () => {
    expect(() => EdgeFunctionConfigSchema.parse({
      name: 'test',
      path: '/test',
      timeout: 0, // Too low
    })).toThrow();

    expect(() => EdgeFunctionConfigSchema.parse({
      name: 'test',
      path: '/test',
      timeout: 400, // Too high
    })).toThrow();
  });
});

describe('VercelProjectSchema', () => {
  it('should accept minimal project', () => {
    const project = {
      name: 'my-app',
    };

    expect(() => VercelProjectSchema.parse(project)).not.toThrow();
  });

  it('should accept all framework types', () => {
    const frameworks = ['nextjs', 'react', 'vue', 'nuxtjs', 'gatsby', 'remix', 'astro', 'sveltekit', 'solid', 'angular', 'static', 'other'] as const;
    
    frameworks.forEach(framework => {
      const project = {
        name: 'test-app',
        framework,
      };
      expect(() => VercelProjectSchema.parse(project)).not.toThrow();
    });
  });

  it('should accept full project configuration', () => {
    const project = {
      name: 'full-app',
      framework: 'nextjs' as const,
      gitRepository: {
        type: 'github' as const,
        repo: 'owner/repo',
        productionBranch: 'main',
      },
      buildConfig: {
        buildCommand: 'npm run build',
        outputDirectory: '.next',
      },
      deploymentConfig: {
        regions: ['iad1', 'sfo1'],
        enablePreview: true,
      },
      domains: [
        { domain: 'app.example.com' },
      ],
      environmentVariables: [
        {
          key: 'API_KEY',
          value: 'test',
          target: ['production'] as const,
        },
      ],
      edgeFunctions: [
        {
          name: 'api',
          path: '/api/*',
        },
      ],
      rootDirectory: 'apps/web',
    };

    expect(() => VercelProjectSchema.parse(project)).not.toThrow();
  });
});

describe('VercelConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal Vercel connector', () => {
      const connector: VercelConnector = {
        name: 'vercel_test',
        label: 'Vercel Test',
        type: 'saas',
        provider: 'vercel',
        authentication: {
          type: 'bearer',
          token: 'test-token',
        },
        projects: [
          {
            name: 'test-project',
          },
        ],
      };

      const result = VercelConnectorSchema.parse(connector);
      expect(result.baseUrl).toBe('https://api.vercel.com');
      expect(result.enableWebhooks).toBe(true);
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['vercel_test', 'vercel_production', '_internal'];
      validNames.forEach(name => {
        expect(() => VercelConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'vercel',
          authentication: { type: 'bearer', token: 'x' },
          projects: [{ name: 'test' }],
        })).not.toThrow();
      });

      const invalidNames = ['vercelTest', 'Vercel-Test', '123vercel'];
      invalidNames.forEach(name => {
        expect(() => VercelConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'vercel',
          authentication: { type: 'bearer', token: 'x' },
          projects: [{ name: 'test' }],
        })).toThrow();
      });
    });
  });

  describe('Team Configuration', () => {
    it('should accept team configuration', () => {
      const connector: VercelConnector = {
        name: 'vercel_team',
        label: 'Vercel Team',
        type: 'saas',
        provider: 'vercel',
        authentication: {
          type: 'bearer',
          token: 'test-token',
        },
        team: {
          teamId: 'team_xxx',
          teamName: 'My Team',
        },
        projects: [
          {
            name: 'team-project',
          },
        ],
      };

      expect(() => VercelConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Monitoring Configuration', () => {
    it('should accept monitoring configuration', () => {
      const connector: VercelConnector = {
        name: 'vercel_monitored',
        label: 'Vercel Monitored',
        type: 'saas',
        provider: 'vercel',
        authentication: {
          type: 'bearer',
          token: 'test-token',
        },
        projects: [{ name: 'test' }],
        monitoring: {
          enableWebAnalytics: true,
          enableSpeedInsights: true,
          logDrains: [
            {
              name: 'datadog',
              url: 'https://logs.datadoghq.com',
              headers: { 'DD-API-KEY': 'xxx' },
              sources: ['lambda', 'edge'],
            },
          ],
        },
      };

      expect(() => VercelConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Webhook Configuration', () => {
    it('should accept webhook events', () => {
      const events = [
        'deployment.created',
        'deployment.succeeded',
        'deployment.failed',
        'deployment.ready',
        'deployment.error',
        'deployment.canceled',
        'deployment-checks-completed',
        'deployment-prepared',
        'project.created',
        'project.removed',
      ] as const;

      const connector: VercelConnector = {
        name: 'vercel_webhooks',
        label: 'Vercel Webhooks',
        type: 'saas',
        provider: 'vercel',
        authentication: { type: 'bearer', token: 'x' },
        projects: [{ name: 'test' }],
        enableWebhooks: true,
        webhookEvents: [...events],
      };

      expect(() => VercelConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept Next.js connector example', () => {
      expect(() => VercelConnectorSchema.parse(vercelNextJsConnectorExample)).not.toThrow();
    });

    it('should accept static site connector example', () => {
      expect(() => VercelConnectorSchema.parse(vercelStaticSiteConnectorExample)).not.toThrow();
    });
  });
});
