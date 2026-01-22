/**
 * Example: Using Namespaced Imports
 * 
 * This example demonstrates the three import styles supported by @objectstack/spec.
 * Note: Flat imports are NO LONGER SUPPORTED. Use one of the styles below.
 */

// ============================================================================
// STYLE 1: Namespace Imports from Root
// ============================================================================

import { Data, UI, System, AI } from '@objectstack/spec';

// Use with namespace prefix
const field1: Data.Field = {
  name: 'employee_name',
  label: 'Employee Name',
  type: 'text' as Data.FieldType,
  required: true,
};

// ============================================================================
// STYLE 2: Namespace Imports via Subpath
// ============================================================================

import * as DataNS from '@objectstack/spec/data';
import * as UINS from '@objectstack/spec/ui';
import * as SystemNS from '@objectstack/spec/system';
import * as AINS from '@objectstack/spec/ai';

// Use with namespace prefix for clarity
const field2: DataNS.Field = {
  name: 'task_title',
  label: 'Task Title',
  type: 'text' as DataNS.FieldType,
  required: true,
};

// ============================================================================
// STYLE 3: Direct Subpath Imports
// ============================================================================

import { Field, FieldType, ObjectSchema, ServiceObject } from '@objectstack/spec/data';
import { View } from '@objectstack/spec/ui';
import { User } from '@objectstack/spec/system';
import { Agent, ModelProvider } from '@objectstack/spec/ai';

// Use directly without namespace prefix
const field3: Field = {
  name: 'task_description',
  label: 'Task Description',
  type: 'textarea' as FieldType,
  required: false,
};

// Define an object using direct imports
const taskObject: ServiceObject = {
  name: 'project_task',
  label: 'Task',
  fields: {
    title: field3,
    description: {
      name: 'description',
      label: 'Description',
      type: 'textarea' as FieldType,
    },
    status: {
      name: 'status',
      label: 'Status',
      type: 'select' as FieldType,
      options: [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    assignee: {
      name: 'assignee',
      label: 'Assignee',
      type: 'lookup' as FieldType,
      reference: 'system_user',
    },
  },
};

// Validate using direct import
const result = ObjectSchema.safeParse(taskObject);

if (result.success) {
  console.log('✓ Object definition is valid');
} else {
  console.error('✗ Validation errors:', result.error);
}

// Define UI components using direct imports
const taskView: View = {
  name: 'task_list',
  label: 'Task List',
  object: 'project_task',
  type: 'list',
  listView: {
    type: 'grid',
    columns: ['title', 'status', 'assignee'],
    defaultSort: [{ field: 'created_at', direction: 'desc' }],
  },
};

// Define system configuration using direct imports
const adminUser: User = {
  id: 'user_admin_001',
  email: 'admin@example.com',
  name: 'System Admin',
  emailVerified: new Date(),
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Define AI agent using direct imports
const salesAgent: Agent = {
  name: 'sales_assistant',
  label: 'Sales Assistant',
  description: 'AI agent to help with sales tasks',
  model: {
    provider: 'openai' as ModelProvider,
    name: 'gpt-4',
  },
  tools: [],
  knowledge: [],
  instructions: 'You are a helpful sales assistant.',
};

// ============================================================================
// COMPARISON OF THE THREE STYLES
// ============================================================================

/**
 * Style 1: Namespace from Root
 * - Pro: Single import line for multiple protocols
 * - Pro: Clear namespace boundaries
 * - Con: Longer variable type declarations
 * 
 * Style 2: Namespace via Subpath
 * - Pro: Better tree-shaking
 * - Pro: Explicit about which protocols are used
 * - Con: Multiple import lines
 * 
 * Style 3: Direct Subpath Imports
 * - Pro: Most concise syntax
 * - Pro: No namespace prefix needed
 * - Con: Need to know which subpath contains each type
 * 
 * BENEFITS ACROSS ALL STYLES:
 * 
 * 1. Zero Naming Conflicts
 *    - Namespace boundaries completely eliminate collision risk
 *    - Safe to add new types without worrying about conflicts
 * 
 * 2. Clear Domain Boundaries
 *    - Immediately obvious which protocol a type belongs to
 *    - Easier to navigate and understand the codebase
 * 
 * 3. Better IDE Autocomplete
 *    - Type "Data." and see all data protocol types
 *    - Discover related types within a namespace
 * 
 * 4. Self-Documenting Code
 *    - Reading "System.User" is clearer than just "User"
 *    - Helps new developers understand the architecture
 */

export {
  field1,
  field2,
  taskObject,
  taskView,
  adminUser,
  salesAgent,
  result,
};
