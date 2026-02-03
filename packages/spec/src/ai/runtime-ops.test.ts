import { describe, expect, it } from 'vitest';
import {
  AnomalyDetectionConfigSchema,
  SelfHealingActionSchema,
  SelfHealingConfigSchema,
  AutoScalingPolicySchema,
  RootCauseAnalysisRequestSchema,
  RootCauseAnalysisResultSchema,
  PerformanceOptimizationSchema,
  AIOpsAgentConfigSchema,
} from './runtime-ops.zod';

describe('Runtime AI Operations (AIOps) Schemas', () => {
  describe('AnomalyDetectionConfigSchema', () => {
    it('should validate basic anomaly detection config', () => {
      const config = {
        enabled: true,
        metrics: ['cpu-usage' as const, 'memory-usage' as const, 'error-rate' as const],
      };
      const result = AnomalyDetectionConfigSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.metrics).toHaveLength(3);
      expect(result.algorithm).toBe('hybrid');
      expect(result.sensitivity).toBe('medium');
    });

    it('should validate advanced anomaly detection config', () => {
      const config = {
        enabled: true,
        metrics: ['response-time' as const, 'throughput' as const, 'latency' as const],
        algorithm: 'machine-learning' as const,
        sensitivity: 'high' as const,
        timeWindow: 600,
        confidenceThreshold: 90,
        alertOnDetection: true,
      };
      const result = AnomalyDetectionConfigSchema.parse(config);
      expect(result.algorithm).toBe('machine-learning');
      expect(result.sensitivity).toBe('high');
      expect(result.timeWindow).toBe(600);
      expect(result.confidenceThreshold).toBe(90);
    });
  });

  describe('SelfHealingActionSchema', () => {
    it('should validate restart action', () => {
      const action = {
        id: 'auto-restart',
        type: 'restart' as const,
        trigger: {
          healthStatus: ['failed' as const, 'unhealthy' as const],
        },
        maxAttempts: 3,
        cooldown: 60,
        timeout: 300,
      };
      const result = SelfHealingActionSchema.parse(action);
      expect(result.type).toBe('restart');
      expect(result.maxAttempts).toBe(3);
      expect(result.requireApproval).toBe(false);
      expect(result.priority).toBe(5);
    });

    it('should validate scale action with custom condition', () => {
      const action = {
        id: 'scale-up',
        type: 'scale' as const,
        trigger: {
          customCondition: 'cpuUsage > 80 AND duration > 300',
        },
        parameters: {
          direction: 'up',
          instances: 2,
        },
        maxAttempts: 5,
        cooldown: 300,
        timeout: 600,
        requireApproval: true,
        priority: 3,
      };
      const result = SelfHealingActionSchema.parse(action);
      expect(result.type).toBe('scale');
      expect(result.requireApproval).toBe(true);
      expect(result.priority).toBe(3);
    });

    it('should validate adjust-config action', () => {
      const action = {
        id: 'tune-memory',
        type: 'adjust-config' as const,
        trigger: {
          anomalyTypes: ['memory-leak', 'high-memory-usage'],
        },
        parameters: {
          config: {
            maxHeap: 1073741824, // 1GB
            gcStrategy: 'aggressive',
          },
        },
      };
      const result = SelfHealingActionSchema.parse(action);
      expect(result.type).toBe('adjust-config');
      expect(result.trigger.anomalyTypes).toHaveLength(2);
    });
  });

  describe('SelfHealingConfigSchema', () => {
    it('should validate basic self-healing config', () => {
      const config = {
        enabled: true,
        actions: [
          {
            id: 'restart-on-failure',
            type: 'restart' as const,
            trigger: {
              healthStatus: ['failed' as const],
            },
          },
        ],
      };
      const result = SelfHealingConfigSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.strategy).toBe('moderate');
      expect(result.actions).toHaveLength(1);
      expect(result.maxConcurrentHealing).toBe(1);
    });

    it('should validate comprehensive self-healing config', () => {
      const config = {
        enabled: true,
        strategy: 'aggressive' as const,
        actions: [
          {
            id: 'restart',
            type: 'restart' as const,
            trigger: { healthStatus: ['failed' as const] },
          },
          {
            id: 'scale',
            type: 'scale' as const,
            trigger: { customCondition: 'load > 90' },
            parameters: { instances: 2 },
          },
        ],
        anomalyDetection: {
          enabled: true,
          metrics: ['cpu-usage' as const, 'memory-usage' as const],
          algorithm: 'machine-learning' as const,
        },
        maxConcurrentHealing: 3,
        learning: {
          enabled: true,
          feedbackLoop: true,
        },
      };
      const result = SelfHealingConfigSchema.parse(config);
      expect(result.strategy).toBe('aggressive');
      expect(result.actions).toHaveLength(2);
      expect(result.anomalyDetection?.enabled).toBe(true);
      expect(result.learning?.enabled).toBe(true);
    });
  });

  describe('AutoScalingPolicySchema', () => {
    it('should validate CPU-based auto-scaling', () => {
      const policy = {
        enabled: true,
        metric: 'cpu-usage' as const,
        targetValue: 70,
        bounds: {
          minInstances: 2,
          maxInstances: 10,
        },
        scaleUp: {
          threshold: 80,
          stabilizationWindow: 60,
          cooldown: 300,
          stepSize: 2,
        },
        scaleDown: {
          threshold: 50,
          stabilizationWindow: 300,
          cooldown: 600,
          stepSize: 1,
        },
      };
      const result = AutoScalingPolicySchema.parse(policy);
      expect(result.metric).toBe('cpu-usage');
      expect(result.targetValue).toBe(70);
      expect(result.bounds.minInstances).toBe(2);
      expect(result.scaleUp.threshold).toBe(80);
    });

    it('should validate predictive auto-scaling', () => {
      const policy = {
        enabled: true,
        metric: 'request-rate' as const,
        targetValue: 1000,
        bounds: {
          minInstances: 1,
          maxInstances: 20,
          minResources: {
            cpu: '0.5',
            memory: '512Mi',
          },
          maxResources: {
            cpu: '2',
            memory: '2Gi',
          },
        },
        scaleUp: {
          threshold: 1200,
          stabilizationWindow: 120,
          cooldown: 180,
          stepSize: 3,
        },
        scaleDown: {
          threshold: 800,
          stabilizationWindow: 600,
          cooldown: 900,
          stepSize: 1,
        },
        predictive: {
          enabled: true,
          lookAhead: 600,
          confidence: 85,
        },
      };
      const result = AutoScalingPolicySchema.parse(policy);
      expect(result.predictive?.enabled).toBe(true);
      expect(result.predictive?.lookAhead).toBe(600);
      expect(result.bounds.minResources?.cpu).toBe('0.5');
    });
  });

  describe('RootCauseAnalysisRequestSchema', () => {
    it('should validate RCA request', () => {
      const request = {
        incidentId: 'INC-2024-001',
        pluginId: 'com.acme.analytics',
        symptoms: [
          {
            type: 'high-error-rate',
            description: 'Error rate increased to 15%',
            severity: 'critical' as const,
            timestamp: new Date().toISOString(),
          },
          {
            type: 'slow-response',
            description: 'Response time degraded to 5s',
            severity: 'high' as const,
            timestamp: new Date().toISOString(),
          },
        ],
        timeRange: {
          start: new Date(Date.now() - 3600000).toISOString(),
          end: new Date().toISOString(),
        },
        analyzeLogs: true,
        analyzeMetrics: true,
        analyzeDependencies: true,
      };
      const result = RootCauseAnalysisRequestSchema.parse(request);
      expect(result.incidentId).toBe('INC-2024-001');
      expect(result.symptoms).toHaveLength(2);
      expect(result.analyzeLogs).toBe(true);
    });
  });

  describe('RootCauseAnalysisResultSchema', () => {
    it('should validate RCA result', () => {
      const result = {
        analysisId: 'RCA-2024-001',
        incidentId: 'INC-2024-001',
        rootCauses: [
          {
            id: 'cause-1',
            description: 'Database connection pool exhausted',
            confidence: 95,
            category: 'resource-exhaustion' as const,
            evidence: [
              {
                type: 'log' as const,
                content: 'Connection pool timeout after 30s',
                timestamp: new Date().toISOString(),
              },
              {
                type: 'metric' as const,
                content: 'active_connections: 100/100',
              },
            ],
            impact: 'critical' as const,
            recommendations: [
              'Increase connection pool size to 200',
              'Implement connection timeout handling',
              'Add connection pooling metrics',
            ],
          },
        ],
        remediation: {
          immediate: ['Restart plugin to clear connections'],
          shortTerm: ['Increase pool size', 'Add monitoring'],
          longTerm: ['Implement adaptive pooling', 'Add auto-scaling'],
        },
        overallConfidence: 92,
        timestamp: new Date().toISOString(),
      };
      const parsed = RootCauseAnalysisResultSchema.parse(result);
      expect(parsed.rootCauses).toHaveLength(1);
      expect(parsed.rootCauses[0].confidence).toBe(95);
      expect(parsed.remediation?.immediate).toHaveLength(1);
    });
  });

  describe('PerformanceOptimizationSchema', () => {
    it('should validate performance optimization suggestion', () => {
      const optimization = {
        id: 'opt-001',
        pluginId: 'com.acme.analytics',
        type: 'caching' as const,
        description: 'Implement Redis caching for frequently accessed data',
        expectedImpact: {
          performanceGain: 40,
          resourceSavings: {
            cpu: 25,
            memory: 15,
          },
          costReduction: 20,
        },
        difficulty: 'moderate' as const,
        steps: [
          'Install Redis adapter',
          'Configure cache TTL policies',
          'Implement cache invalidation',
          'Add cache metrics',
        ],
        risks: [
          'Cache invalidation complexity',
          'Additional memory overhead',
        ],
        confidence: 88,
        priority: 'high' as const,
      };
      const result = PerformanceOptimizationSchema.parse(optimization);
      expect(result.type).toBe('caching');
      expect(result.expectedImpact.performanceGain).toBe(40);
      expect(result.steps).toHaveLength(4);
      expect(result.priority).toBe('high');
    });
  });

  describe('AIOpsAgentConfigSchema', () => {
    it('should validate complete AIOps agent config', () => {
      const config = {
        agentId: 'aiops-001',
        pluginId: 'com.acme.analytics',
        selfHealing: {
          enabled: true,
          strategy: 'moderate' as const,
          actions: [
            {
              id: 'restart',
              type: 'restart' as const,
              trigger: { healthStatus: ['failed' as const] },
            },
          ],
        },
        autoScaling: [
          {
            enabled: true,
            metric: 'cpu-usage' as const,
            targetValue: 70,
            bounds: {
              minInstances: 1,
              maxInstances: 5,
            },
            scaleUp: {
              threshold: 80,
              stabilizationWindow: 60,
              cooldown: 300,
              stepSize: 1,
            },
            scaleDown: {
              threshold: 50,
              stabilizationWindow: 300,
              cooldown: 600,
              stepSize: 1,
            },
          },
        ],
        monitoring: {
          enabled: true,
          interval: 30000,
          metrics: ['cpu', 'memory', 'latency'],
        },
        optimization: {
          enabled: true,
          scanInterval: 86400,
          autoApply: false,
        },
        incidentResponse: {
          enabled: true,
          autoRCA: true,
          notifications: [
            {
              channel: 'slack' as const,
              config: {
                webhook: 'https://hooks.slack.com/...',
              },
            },
          ],
        },
      };
      const result = AIOpsAgentConfigSchema.parse(config);
      expect(result.agentId).toBe('aiops-001');
      expect(result.selfHealing?.enabled).toBe(true);
      expect(result.autoScaling).toHaveLength(1);
      expect(result.monitoring?.enabled).toBe(true);
      expect(result.incidentResponse?.autoRCA).toBe(true);
    });
  });
});
