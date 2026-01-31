import { describe, it, expect } from 'vitest';
import {
  DevOpsAgentSchema,
  CodeGenerationConfigSchema,
  TestingConfigSchema,
  PipelineStageSchema,
  CICDPipelineConfigSchema,
  VersionManagementSchema,
  DeploymentStrategySchema,
  MonitoringConfigSchema,
  GitHubIntegrationSchema,
  VercelIntegrationSchema,
  fullStackDevOpsAgentExample,
  type DevOpsAgent,
} from './devops-agent.zod';

describe('CodeGenerationConfigSchema', () => {
  it('should accept minimal code generation config', () => {
    const config = {
      targets: ['frontend', 'backend'] as const,
    };

    const result = CodeGenerationConfigSchema.parse(config);
    expect(result.enabled).toBe(true);
    expect(result.includeTests).toBe(true);
    expect(result.includeDocumentation).toBe(true);
  });

  it('should accept all generation targets', () => {
    const targets = ['frontend', 'backend', 'api', 'database', 'tests', 'documentation', 'infrastructure'] as const;
    
    const config = {
      targets: [...targets],
    };

    expect(() => CodeGenerationConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept all validation modes', () => {
    const modes = ['strict', 'moderate', 'permissive'] as const;
    
    modes.forEach(validationMode => {
      const config = {
        targets: ['frontend'] as const,
        validationMode,
      };
      expect(() => CodeGenerationConfigSchema.parse(config)).not.toThrow();
    });
  });
});

describe('TestingConfigSchema', () => {
  it('should accept minimal testing config', () => {
    const config = {};

    const result = TestingConfigSchema.parse(config);
    expect(result.enabled).toBe(true);
    expect(result.testTypes).toEqual(['unit', 'integration']);
    expect(result.coverageThreshold).toBe(80);
    expect(result.preCommitTests).toBe(true);
  });

  it('should accept all test types', () => {
    const types = ['unit', 'integration', 'e2e', 'performance', 'security', 'accessibility'] as const;
    
    const config = {
      testTypes: [...types],
    };

    expect(() => TestingConfigSchema.parse(config)).not.toThrow();
  });

  it('should enforce coverage threshold limits', () => {
    expect(() => TestingConfigSchema.parse({
      coverageThreshold: -1,
    })).toThrow();

    expect(() => TestingConfigSchema.parse({
      coverageThreshold: 101,
    })).toThrow();

    expect(() => TestingConfigSchema.parse({
      coverageThreshold: 85,
    })).not.toThrow();
  });
});

describe('PipelineStageSchema', () => {
  it('should accept pipeline stage', () => {
    const stage = {
      name: 'Build',
      type: 'build' as const,
      order: 1,
      commands: ['npm run build'],
    };

    const result = PipelineStageSchema.parse(stage);
    expect(result.parallel).toBe(false);
    expect(result.timeout).toBe(600);
    expect(result.retryOnFailure).toBe(false);
  });

  it('should accept all stage types', () => {
    const types = ['build', 'test', 'lint', 'security_scan', 'deploy', 'smoke_test', 'rollback'] as const;
    
    types.forEach(type => {
      const stage = {
        name: 'Test Stage',
        type,
        order: 1,
        commands: ['echo test'],
      };
      expect(() => PipelineStageSchema.parse(stage)).not.toThrow();
    });
  });

  it('should accept stage with retries', () => {
    const stage = {
      name: 'Flaky Test',
      type: 'test' as const,
      order: 1,
      commands: ['npm test'],
      retryOnFailure: true,
      maxRetries: 3,
    };

    expect(() => PipelineStageSchema.parse(stage)).not.toThrow();
  });

  it('should enforce max retries limit', () => {
    expect(() => PipelineStageSchema.parse({
      name: 'Test',
      type: 'test',
      order: 1,
      commands: ['test'],
      maxRetries: 6, // Too high
    })).toThrow();
  });
});

describe('CICDPipelineConfigSchema', () => {
  it('should accept minimal pipeline', () => {
    const pipeline = {
      name: 'CI',
      trigger: 'push' as const,
      stages: [
        {
          name: 'Build',
          type: 'build' as const,
          order: 1,
          commands: ['npm run build'],
        },
      ],
    };

    expect(() => CICDPipelineConfigSchema.parse(pipeline)).not.toThrow();
  });

  it('should accept all trigger types', () => {
    const triggers = ['push', 'pull_request', 'release', 'schedule', 'manual'] as const;
    
    triggers.forEach(trigger => {
      const pipeline = {
        name: 'Test Pipeline',
        trigger,
        stages: [
          {
            name: 'Test',
            type: 'test' as const,
            order: 1,
            commands: ['test'],
          },
        ],
      };
      expect(() => CICDPipelineConfigSchema.parse(pipeline)).not.toThrow();
    });
  });

  it('should accept pipeline with notifications', () => {
    const pipeline = {
      name: 'Production Deploy',
      trigger: 'release' as const,
      stages: [
        {
          name: 'Deploy',
          type: 'deploy' as const,
          order: 1,
          commands: ['deploy.sh'],
        },
      ],
      notifications: {
        onSuccess: true,
        onFailure: true,
        channels: ['slack', 'email'],
      },
    };

    expect(() => CICDPipelineConfigSchema.parse(pipeline)).not.toThrow();
  });
});

describe('VersionManagementSchema', () => {
  it('should accept minimal version management', () => {
    const config = {};

    const result = VersionManagementSchema.parse(config);
    expect(result.scheme).toBe('semver');
    expect(result.autoIncrement).toBe('patch');
    expect(result.prefix).toBe('v');
    expect(result.generateChangelog).toBe(true);
  });

  it('should accept all versioning schemes', () => {
    const schemes = ['semver', 'calver', 'custom'] as const;
    
    schemes.forEach(scheme => {
      const config = { scheme };
      expect(() => VersionManagementSchema.parse(config)).not.toThrow();
    });
  });

  it('should accept all changelog formats', () => {
    const formats = ['conventional', 'keepachangelog', 'custom'] as const;
    
    formats.forEach(changelogFormat => {
      const config = { changelogFormat };
      expect(() => VersionManagementSchema.parse(config)).not.toThrow();
    });
  });
});

describe('DeploymentStrategySchema', () => {
  it('should accept minimal deployment strategy', () => {
    const config = {};

    const result = DeploymentStrategySchema.parse(config);
    expect(result.type).toBe('rolling');
    expect(result.canaryPercentage).toBe(10);
    expect(result.autoRollback).toBe(true);
  });

  it('should accept all deployment types', () => {
    const types = ['rolling', 'blue_green', 'canary', 'recreate'] as const;
    
    types.forEach(type => {
      const config = { type };
      expect(() => DeploymentStrategySchema.parse(config)).not.toThrow();
    });
  });

  it('should enforce canary percentage limits', () => {
    expect(() => DeploymentStrategySchema.parse({
      canaryPercentage: -1,
    })).toThrow();

    expect(() => DeploymentStrategySchema.parse({
      canaryPercentage: 101,
    })).toThrow();

    expect(() => DeploymentStrategySchema.parse({
      canaryPercentage: 25,
    })).not.toThrow();
  });
});

describe('MonitoringConfigSchema', () => {
  it('should accept minimal monitoring config', () => {
    const config = {};

    const result = MonitoringConfigSchema.parse(config);
    expect(result.enabled).toBe(true);
    expect(result.metrics).toEqual(['performance', 'errors', 'availability']);
  });

  it('should accept monitoring with alerts', () => {
    const config = {
      alerts: [
        {
          name: 'High Error Rate',
          metric: 'error_rate',
          threshold: 0.05,
          severity: 'critical' as const,
        },
        {
          name: 'Slow Response',
          metric: 'response_time',
          threshold: 1000,
          severity: 'warning' as const,
        },
      ],
    };

    expect(() => MonitoringConfigSchema.parse(config)).not.toThrow();
  });
});

describe('GitHubIntegrationSchema', () => {
  it('should accept minimal GitHub integration', () => {
    const integration = {
      connector: 'github_production',
      repository: {
        owner: 'objectstack-ai',
        name: 'app',
      },
    };

    const result = GitHubIntegrationSchema.parse(integration);
    expect(result.featureBranch).toBe('develop');
  });

  it('should accept GitHub integration with PR config', () => {
    const integration = {
      connector: 'github_production',
      repository: {
        owner: 'objectstack-ai',
        name: 'app',
      },
      pullRequest: {
        autoCreate: true,
        autoMerge: false,
        requireReviews: true,
        deleteBranchOnMerge: true,
      },
    };

    expect(() => GitHubIntegrationSchema.parse(integration)).not.toThrow();
  });
});

describe('VercelIntegrationSchema', () => {
  it('should accept minimal Vercel integration', () => {
    const integration = {
      connector: 'vercel_production',
      project: 'my-app',
    };

    expect(() => VercelIntegrationSchema.parse(integration)).not.toThrow();
  });

  it('should accept Vercel integration with environment mapping', () => {
    const integration = {
      connector: 'vercel_production',
      project: 'my-app',
      environments: {
        production: 'main',
        preview: ['develop', 'feature/*'],
      },
      deployment: {
        autoDeployProduction: false,
        autoDeployPreview: true,
        requireApproval: true,
      },
    };

    expect(() => VercelIntegrationSchema.parse(integration)).not.toThrow();
  });
});

describe('DevOpsAgentSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal DevOps agent', () => {
      const agent: DevOpsAgent = {
        name: 'devops_test',
        label: 'DevOps Test Agent',
        role: 'DevOps Engineer',
        instructions: 'Test instructions',
        
        developmentConfig: {
          specificationSource: 'packages/spec',
          codeGeneration: {
            targets: ['frontend', 'backend'],
          },
        },
        
        integrations: {
          github: {
            connector: 'github_test',
            repository: {
              owner: 'test-org',
              name: 'test-repo',
            },
          },
          vercel: {
            connector: 'vercel_test',
            project: 'test-project',
          },
        },
      };

      expect(() => DevOpsAgentSchema.parse(agent)).not.toThrow();
    });

    it('should enforce snake_case for agent name', () => {
      const validNames = ['devops_agent', 'automation_bot', '_internal'];
      validNames.forEach(name => {
        expect(() => DevOpsAgentSchema.parse({
          name,
          label: 'Test',
          role: 'Engineer',
          instructions: 'Test',
          developmentConfig: {
            specificationSource: 'spec',
            codeGeneration: { targets: ['frontend'] },
          },
          integrations: {
            github: { connector: 'x', repository: { owner: 'o', name: 'n' } },
            vercel: { connector: 'y', project: 'p' },
          },
        })).not.toThrow();
      });

      const invalidNames = ['devopsAgent', 'DevOps-Agent', '123agent'];
      invalidNames.forEach(name => {
        expect(() => DevOpsAgentSchema.parse({
          name,
          label: 'Test',
          role: 'Engineer',
          instructions: 'Test',
          developmentConfig: {
            specificationSource: 'spec',
            codeGeneration: { targets: ['frontend'] },
          },
          integrations: {
            github: { connector: 'x', repository: { owner: 'o', name: 'n' } },
            vercel: { connector: 'y', project: 'p' },
          },
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full DevOps agent with all features', () => {
      const agent: DevOpsAgent = {
        name: 'full_devops_agent',
        label: 'Full DevOps Agent',
        role: 'Senior DevOps Engineer',
        instructions: 'Comprehensive agent instructions',
        
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          temperature: 0.3,
        },
        
        tools: [
          {
            type: 'code_generation',
            name: 'generate_code',
          },
          {
            type: 'test_execution',
            name: 'run_tests',
          },
        ],
        
        developmentConfig: {
          specificationSource: 'packages/spec',
          codeGeneration: {
            enabled: true,
            targets: ['frontend', 'backend', 'api', 'tests'],
            includeTests: true,
            validationMode: 'strict',
          },
          testing: {
            enabled: true,
            testTypes: ['unit', 'integration', 'e2e'],
            coverageThreshold: 85,
          },
        },
        
        pipelines: [
          {
            name: 'CI',
            trigger: 'pull_request',
            stages: [
              {
                name: 'Build',
                type: 'build',
                order: 1,
                commands: ['npm run build'],
              },
              {
                name: 'Test',
                type: 'test',
                order: 2,
                commands: ['npm test'],
              },
            ],
          },
        ],
        
        versionManagement: {
          scheme: 'semver',
          autoIncrement: 'patch',
          generateChangelog: true,
        },
        
        deploymentStrategy: {
          type: 'rolling',
          autoRollback: true,
        },
        
        monitoring: {
          enabled: true,
          metrics: ['performance', 'errors'],
        },
        
        integrations: {
          github: {
            connector: 'github_production',
            repository: {
              owner: 'objectstack-ai',
              name: 'app',
            },
          },
          vercel: {
            connector: 'vercel_production',
            project: 'objectstack-app',
          },
        },
        
        selfIteration: {
          enabled: true,
          iterationFrequency: '0 0 * * 0',
          optimizationGoals: ['code_quality', 'performance'],
          learningMode: 'balanced',
        },
        
        active: true,
      };

      expect(() => DevOpsAgentSchema.parse(agent)).not.toThrow();
    });
  });

  describe('Self-Iteration Configuration', () => {
    it('should accept all learning modes', () => {
      const modes = ['conservative', 'balanced', 'aggressive'] as const;
      
      modes.forEach(learningMode => {
        const agent: DevOpsAgent = {
          name: 'test_agent',
          label: 'Test',
          role: 'Engineer',
          instructions: 'Test',
          developmentConfig: {
            specificationSource: 'spec',
            codeGeneration: { targets: ['frontend'] },
          },
          integrations: {
            github: { connector: 'x', repository: { owner: 'o', name: 'n' } },
            vercel: { connector: 'y', project: 'p' },
          },
          selfIteration: {
            enabled: true,
            learningMode,
          },
        };
        
        expect(() => DevOpsAgentSchema.parse(agent)).not.toThrow();
      });
    });

    it('should accept all optimization goals', () => {
      const goals = ['performance', 'security', 'code_quality', 'test_coverage', 'documentation'] as const;
      
      const agent: DevOpsAgent = {
        name: 'test_agent',
        label: 'Test',
        role: 'Engineer',
        instructions: 'Test',
        developmentConfig: {
          specificationSource: 'spec',
          codeGeneration: { targets: ['frontend'] },
        },
        integrations: {
          github: { connector: 'x', repository: { owner: 'o', name: 'n' } },
          vercel: { connector: 'y', project: 'p' },
        },
        selfIteration: {
          enabled: true,
          optimizationGoals: [...goals],
        },
      };
      
      expect(() => DevOpsAgentSchema.parse(agent)).not.toThrow();
    });
  });

  describe('Example Configuration', () => {
    it('should accept full-stack DevOps agent example', () => {
      expect(() => DevOpsAgentSchema.parse(fullStackDevOpsAgentExample)).not.toThrow();
    });
  });
});
