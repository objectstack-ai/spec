/**
 * CRM Generation Orchestration
 * 
 * End-to-end workflow for autonomous CRM application generation
 * using AI agents and the ObjectStack protocol.
 */

import { AIOrchestration } from '@objectstack/spec';

/**
 * Complete CRM Generation Workflow
 * 
 * This orchestration defines the entire process of building a CRM application
 * from natural language requirements to deployed production code.
 * 
 * Workflow Stages:
 * 1. Requirements Analysis - Parse and structure user input
 * 2. Data Model Design - Generate object schemas
 * 3. UI Design - Create views and dashboards
 * 4. Code Generation - Produce TypeScript files
 * 5. Validation - Verify code quality
 * 6. Test Generation - Create test suite
 * 7. Deployment - Commit, push, and deploy
 */
export const CRMGenerationOrchestration: AIOrchestration = {
  name: 'crm_generation_workflow',
  label: 'CRM Application Generation',
  description: 'End-to-end autonomous CRM application generation from requirements',
  
  // Target object for tracking generation requests
  objectName: 'generation_request',
  
  // Trigger: Manual initiation by user
  trigger: 'manual',
  
  // Entry criteria: Must have a valid requirement description
  entryCriteria: 'user_description != null && user_description.length > 10',
  
  // AI Tasks executed in sequence
  aiTasks: [
    // ========================================
    // STEP 1: Requirements Analysis
    // ========================================
    {
      name: 'Analyze Requirements',
      type: 'extract',
      model: 'gpt-4-turbo',
      inputFields: ['user_description'],
      outputField: 'requirements_doc',
      outputFormat: 'json',
      extractionSchema: {
        type: 'object',
        properties: {
          objects: {
            type: 'array',
            description: 'List of business objects to create',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                fields: { type: 'array' },
              },
            },
          },
          relationships: {
            type: 'array',
            description: 'Relationships between objects',
          },
          workflows: {
            type: 'array',
            description: 'Business workflows to implement',
          },
          ui_requirements: {
            type: 'object',
            description: 'UI/UX requirements',
          },
        },
      },
      description: 'Parse natural language requirements into structured specifications',
    },
    
    // ========================================
    // STEP 2: Data Model Design
    // ========================================
    {
      name: 'Design Data Model',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'data_model_design_prompt',
      inputFields: ['requirements_doc'],
      outputField: 'object_schemas',
      outputFormat: 'json',
      temperature: 0.2, // Low temperature for structured output
      description: 'Generate ObjectStack object definitions with fields and relationships',
    },
    
    // ========================================
    // STEP 3: UI Design
    // ========================================
    {
      name: 'Design UI',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'ui_design_prompt',
      inputFields: ['requirements_doc', 'object_schemas'],
      outputField: 'ui_definitions',
      outputFormat: 'json',
      temperature: 0.3,
      description: 'Generate views (grid, kanban, forms), dashboards, and reports',
    },
    
    // ========================================
    // STEP 4: Business Logic Design
    // ========================================
    {
      name: 'Design Business Logic',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'logic_design_prompt',
      inputFields: ['requirements_doc', 'object_schemas'],
      outputField: 'logic_definitions',
      outputFormat: 'json',
      temperature: 0.2,
      description: 'Generate validation rules, workflows, and automation',
    },
    
    // ========================================
    // STEP 5: Code Generation
    // ========================================
    {
      name: 'Generate Code',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'code_generation_prompt',
      inputFields: ['object_schemas', 'ui_definitions', 'logic_definitions'],
      outputField: 'generated_files',
      outputFormat: 'json',
      temperature: 0.1, // Very low temperature for code precision
      maxLength: 10000,
      description: 'Generate TypeScript files with Zod schemas and JSDoc',
    },
    
    // ========================================
    // STEP 6: Code Validation
    // ========================================
    {
      name: 'Validate Code',
      type: 'classify',
      model: 'gpt-4-turbo',
      inputFields: ['generated_files'],
      outputField: 'validation_result',
      classes: ['valid', 'needs_fixes', 'failed'],
      description: 'Validate generated code for correctness, conventions, and quality',
    },
    
    // ========================================
    // STEP 7: Fix Issues (if needed)
    // ========================================
    {
      name: 'Fix Code Issues',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'code_fix_prompt',
      inputFields: ['generated_files', 'validation_result'],
      outputField: 'fixed_files',
      outputFormat: 'json',
      temperature: 0.1,
      condition: 'validation_result == "needs_fixes"',
      description: 'Automatically fix detected issues in generated code',
    },
    
    // ========================================
    // STEP 8: Test Generation
    // ========================================
    {
      name: 'Generate Tests',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'test_generation_prompt',
      inputFields: ['generated_files'],
      outputField: 'test_files',
      outputFormat: 'json',
      temperature: 0.2,
      condition: 'validation_result == "valid" || validation_result == "needs_fixes"',
      description: 'Generate comprehensive test suite (unit, integration)',
    },
    
    // ========================================
    // STEP 9: Documentation Generation
    // ========================================
    {
      name: 'Generate Documentation',
      type: 'generate',
      model: 'gpt-4-turbo',
      promptTemplate: 'documentation_prompt',
      inputFields: ['requirements_doc', 'object_schemas', 'ui_definitions'],
      outputField: 'documentation',
      outputFormat: 'text',
      maxLength: 5000,
      description: 'Generate README and user documentation',
    },
  ],
  
  // Post-processing actions after AI tasks complete
  postActions: [
    // Commit to Git
    {
      type: 'trigger_flow',
      name: 'Git Commit and Push',
      config: {
        flowName: 'git_commit_and_push',
        inputs: {
          files: '${generated_files}',
          tests: '${test_files}',
          docs: '${documentation}',
          branch: 'ai-generated/${timestamp}',
          message: 'feat: AI-generated CRM application',
        },
      },
      condition: 'validation_result == "valid"',
    },
    
    // Create Pull Request
    {
      type: 'webhook',
      name: 'Create GitHub PR',
      config: {
        url: '${github_api_url}/pulls',
        method: 'POST',
        payload: {
          title: '🤖 AI Generated: ${requirements_doc.summary}',
          body: '${documentation}',
          head: 'ai-generated/${timestamp}',
          base: 'main',
        },
        headers: {
          'Authorization': 'Bearer ${github_token}',
        },
      },
      condition: 'validation_result == "valid"',
    },
    
    // Deploy to Vercel Preview
    {
      type: 'webhook',
      name: 'Deploy to Vercel',
      config: {
        url: '${vercel_webhook_url}',
        method: 'POST',
        payload: {
          name: 'objectstack-crm-${timestamp}',
          branch: 'ai-generated/${timestamp}',
          target: 'preview',
        },
        headers: {
          'Authorization': 'Bearer ${vercel_token}',
        },
      },
      condition: 'validation_result == "valid"',
    },
    
    // Notify user of completion
    {
      type: 'send_email',
      name: 'Notification Email',
      config: {
        to: '${requester_email}',
        subject: '✅ Your CRM application is ready!',
        template: 'generation_complete',
        variables: {
          preview_url: '${deployment_url}',
          pr_url: '${pull_request_url}',
          objects_created: '${object_schemas.length}',
        },
      },
      condition: 'validation_result == "valid"',
    },
  ],
  
  // Execution configuration
  executionMode: 'sequential', // Tasks run one after another
  stopOnError: false, // Continue to collect all errors
  timeout: 600, // 10 minutes timeout
  priority: 'high', // High priority for user-initiated generations
  
  // Monitoring & logging
  enableLogging: true,
  enableMetrics: true,
  notifyOnFailure: ['admin@example.com'],
  
  // Metadata
  active: true,
  version: '1.0.0',
  tags: ['generation', 'crm', 'autonomous'],
  category: 'code_generation',
  owner: 'ai_factory_system',
};
