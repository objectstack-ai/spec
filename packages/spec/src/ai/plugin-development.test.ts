import { describe, expect, it } from 'vitest';
import {
  CodeGenerationRequestSchema,
  GeneratedCodeSchema,
  AICodeReviewResultSchema,
  PluginCompositionRequestSchema,
  PluginRecommendationRequestSchema,
} from './plugin-development.zod';

describe('AI Plugin Development Schemas', () => {
  describe('CodeGenerationRequestSchema', () => {
    it('should validate basic code generation request', () => {
      const request = {
        description: 'Create a plugin to connect to PostgreSQL database',
        pluginType: 'driver' as const,
      };
      const result = CodeGenerationRequestSchema.parse(request);
      expect(result.description).toBe('Create a plugin to connect to PostgreSQL database');
      expect(result.pluginType).toBe('driver');
      expect(result.outputFormat).toBe('source-code');
      expect(result.language).toBe('typescript');
    });

    it('should validate low-code schema generation request', () => {
      const request = {
        description: 'Create a CRM app with contacts and deals management',
        pluginType: 'app' as const,
        outputFormat: 'low-code-schema' as const,
        schemaOptions: {
          format: 'typescript' as const,
          includeExamples: true,
          strictValidation: true,
          generateUI: true,
          generateDataModels: true,
        },
        options: {
          generateTests: true,
          generateDocs: true,
        },
      };
      const result = CodeGenerationRequestSchema.parse(request);
      expect(result.outputFormat).toBe('low-code-schema');
      expect(result.schemaOptions?.format).toBe('typescript');
      expect(result.schemaOptions?.generateUI).toBe(true);
      expect(result.schemaOptions?.generateDataModels).toBe(true);
    });

    it('should validate DSL generation request', () => {
      const request = {
        description: 'Create a workflow automation plugin',
        pluginType: 'automation' as const,
        outputFormat: 'dsl' as const,
        capabilities: ['flow-execution', 'trigger-management'],
        examples: [
          {
            input: 'When a new contact is created',
            expectedOutput: 'Send welcome email',
            description: 'Welcome email automation',
          },
        ],
      };
      const result = CodeGenerationRequestSchema.parse(request);
      expect(result.outputFormat).toBe('dsl');
      expect(result.capabilities).toHaveLength(2);
      expect(result.examples).toHaveLength(1);
    });

    it('should validate source code generation with framework preferences', () => {
      const request = {
        description: 'Create a UI widget for data visualization',
        pluginType: 'widget' as const,
        outputFormat: 'source-code' as const,
        language: 'typescript' as const,
        framework: {
          runtime: 'browser' as const,
          uiFramework: 'react' as const,
          testing: 'vitest' as const,
        },
        style: {
          indentation: '2spaces' as const,
          quotes: 'single' as const,
          semicolons: true,
          trailingComma: true,
        },
        options: {
          generateTests: true,
          generateDocs: true,
          targetCoverage: 90,
          optimizationLevel: 'aggressive' as const,
        },
      };
      const result = CodeGenerationRequestSchema.parse(request);
      expect(result.framework?.uiFramework).toBe('react');
      expect(result.style?.quotes).toBe('single');
      expect(result.options?.targetCoverage).toBe(90);
    });
  });

  describe('GeneratedCodeSchema', () => {
    it('should validate source code output', () => {
      const generated = {
        outputFormat: 'source-code' as const,
        code: 'export class PostgresDriver implements Driver { ... }',
        language: 'typescript',
        files: [
          {
            path: 'src/index.ts',
            content: 'export * from "./driver";',
          },
          {
            path: 'src/driver.ts',
            content: 'export class PostgresDriver { ... }',
          },
        ],
        tests: [
          {
            path: 'src/driver.test.ts',
            content: 'describe("PostgresDriver", () => { ... })',
            coverage: 85,
          },
        ],
        confidence: 92,
      };
      const result = GeneratedCodeSchema.parse(generated);
      expect(result.outputFormat).toBe('source-code');
      expect(result.files).toHaveLength(2);
      expect(result.tests).toHaveLength(1);
      expect(result.confidence).toBe(92);
    });

    it('should validate low-code schema output', () => {
      const generated = {
        outputFormat: 'low-code-schema' as const,
        schemas: [
          {
            type: 'object' as const,
            path: 'src/objects/contact.object.ts',
            content: 'export const ContactObject = defineObject({ ... })',
            description: 'Contact data model',
          },
          {
            type: 'view' as const,
            path: 'src/views/contact-list.view.ts',
            content: 'export const ContactListView = defineView({ ... })',
            description: 'Contact list view',
          },
          {
            type: 'dashboard' as const,
            path: 'src/dashboards/crm.dashboard.ts',
            content: 'export const CRMDashboard = defineDashboard({ ... })',
            description: 'CRM dashboard',
          },
        ],
        files: [
          {
            path: 'package.json',
            content: '{ "name": "@acme/crm-plugin", ... }',
          },
        ],
        confidence: 88,
        suggestions: [
          'Consider adding more field validations',
          'Add relationship to Deal object',
        ],
      };
      const result = GeneratedCodeSchema.parse(generated);
      expect(result.outputFormat).toBe('low-code-schema');
      expect(result.schemas).toHaveLength(3);
      expect(result.schemas?.[0].type).toBe('object');
      expect(result.schemas?.[1].type).toBe('view');
      expect(result.suggestions).toHaveLength(2);
    });

    it('should validate DSL output', () => {
      const generated = {
        outputFormat: 'dsl' as const,
        files: [
          {
            path: 'workflows/welcome-email.flow',
            content: 'trigger: contact.created\nactions:\n  - send-email\n',
            description: 'Welcome email workflow',
          },
        ],
        confidence: 90,
      };
      const result = GeneratedCodeSchema.parse(generated);
      expect(result.outputFormat).toBe('dsl');
      expect(result.files).toHaveLength(1);
    });
  });

  describe('AICodeReviewResultSchema', () => {
    it('should validate code review result', () => {
      const review = {
        assessment: 'good' as const,
        score: 85,
        issues: [
          {
            severity: 'warning' as const,
            category: 'performance' as const,
            file: 'src/driver.ts',
            line: 42,
            message: 'Consider using connection pooling',
            suggestion: 'Implement pg.Pool instead of creating new connections',
            autoFixable: false,
          },
          {
            severity: 'info' as const,
            category: 'documentation' as const,
            file: 'src/driver.ts',
            line: 15,
            message: 'Missing JSDoc comment',
            autoFixable: true,
            autoFix: '/** Query execution method */',
          },
        ],
        recommendations: [
          {
            priority: 'medium' as const,
            title: 'Add error handling',
            description: 'Implement comprehensive error handling for connection failures',
            effort: 'small' as const,
          },
        ],
      };
      const result = AICodeReviewResultSchema.parse(review);
      expect(result.assessment).toBe('good');
      expect(result.score).toBe(85);
      expect(result.issues).toHaveLength(2);
    });
  });

  describe('PluginCompositionRequestSchema', () => {
    it('should validate plugin composition request', () => {
      const request = {
        goal: 'Create a complete CRM system with email integration',
        availablePlugins: [
          {
            pluginId: 'com.objectstack.crm',
            version: '1.0.0',
            capabilities: ['contact-management', 'deal-tracking'],
          },
          {
            pluginId: 'com.objectstack.email',
            version: '2.0.0',
            capabilities: ['send-email', 'email-templates'],
          },
        ],
        constraints: {
          maxPlugins: 3,
          requiredPlugins: ['com.objectstack.crm'],
          performance: {
            maxLatency: 500,
            maxMemory: 536870912, // 512MB
          },
        },
        optimize: 'reliability' as const,
      };
      const result = PluginCompositionRequestSchema.parse(request);
      expect(result.goal).toBeDefined();
      expect(result.availablePlugins).toHaveLength(2);
      expect(result.constraints?.maxPlugins).toBe(3);
    });
  });

  describe('PluginRecommendationRequestSchema', () => {
    it('should validate plugin recommendation request', () => {
      const request = {
        context: {
          installedPlugins: ['com.objectstack.core'],
          industry: 'healthcare',
          useCases: ['patient-management', 'appointment-scheduling'],
          teamSize: 25,
          budget: 'medium' as const,
        },
        criteria: {
          prioritize: 'compatibility' as const,
          certifiedOnly: true,
          minRating: 4.5,
          maxResults: 10,
        },
      };
      const result = PluginRecommendationRequestSchema.parse(request);
      expect(result.context.industry).toBe('healthcare');
      expect(result.criteria?.certifiedOnly).toBe(true);
      expect(result.criteria?.minRating).toBe(4.5);
    });
  });
});
