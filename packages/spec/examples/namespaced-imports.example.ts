/**
 * Example: Using Namespaced Imports
 * 
 * This example demonstrates how to use the new namespaced import style
 * to organize code and prevent naming conflicts.
 */

// ============================================================================
// STYLE 1: Flat Imports (Backward Compatible)
// ============================================================================

import { Field, FieldType, ObjectSchema } from '@objectstack/spec';

// Use directly without namespace
const field1: Field = {
  name: 'employee_name',
  label: 'Employee Name',
  type: 'text' as FieldType,
  required: true,
};

// ============================================================================
// STYLE 2: Namespaced Imports (Recommended for New Code)
// ============================================================================

import * as Data from '@objectstack/spec/data';
import * as UI from '@objectstack/spec/ui';
import * as System from '@objectstack/spec/system';
import * as AI from '@objectstack/spec/ai';

// Use with namespace prefix for clarity
const field2: Data.Field = {
  name: 'task_title',
  label: 'Task Title',
  type: 'text' as Data.FieldType,
  required: true,
};

// Define an object using namespaced types
const taskObject: Data.ServiceObject = {
  name: 'project_task',
  label: 'Task',
  fields: {
    title: field2,
    description: {
      name: 'description',
      label: 'Description',
      type: 'textarea' as Data.FieldType,
    },
    status: {
      name: 'status',
      label: 'Status',
      type: 'select' as Data.FieldType,
      options: [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    assignee: {
      name: 'assignee',
      label: 'Assignee',
      type: 'lookup' as Data.FieldType,
      reference: 'system_user',
    },
  },
};

// Validate using namespaced schema
const result = Data.ObjectSchema.safeParse(taskObject);

if (result.success) {
  console.log('✓ Object definition is valid');
} else {
  console.error('✗ Validation errors:', result.error);
}

// Define UI components using namespaced types
const taskView: UI.View = {
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

// Define system configuration using namespaced types
const adminUser: System.User = {
  id: 'user_admin_001',
  email: 'admin@example.com',
  name: 'System Admin',
  emailVerified: new Date(),
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Define AI agent using namespaced types
const salesAgent: AI.Agent = {
  name: 'sales_assistant',
  label: 'Sales Assistant',
  description: 'AI agent to help with sales tasks',
  model: {
    provider: 'openai' as AI.ModelProvider,
    name: 'gpt-4',
  },
  tools: [],
  knowledge: [],
  instructions: 'You are a helpful sales assistant.',
};

// ============================================================================
// BENEFITS OF NAMESPACED IMPORTS
// ============================================================================

/**
 * 1. Clear Domain Boundaries
 *    - Immediately obvious which protocol a type belongs to
 *    - Easier to navigate and understand the codebase
 * 
 * 2. No Naming Conflicts
 *    - If Data.User and System.User both existed, no confusion
 *    - Safe to add new types without worrying about conflicts
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
