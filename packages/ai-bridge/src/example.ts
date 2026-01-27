import { generateTypeScriptDefinition, ObjectDef } from './generator/ts-generator';
import { generateAIManifest } from './generator/manifest-generator';
import { generateOpenAITools } from './generator/tool-generator';

// Example Mock Data
const sampleObjects: ObjectDef[] = [
  {
    name: 'project_task',
    description: 'A task within a project',
    fields: {
      name: { type: 'text', label: 'Task Name', required: true },
      status: { type: 'select', options: ['todo', 'doing', 'done'], label: 'Status' },
      due_date: { type: 'date', label: 'Due Date' },
      owner: { type: 'lookup', reference: 'users', label: 'Assigned To' }
    }
  },
  {
    name: 'users',
    description: 'System User',
    fields: {
      name: { type: 'text', label: 'Full Name' },
      email: { type: 'email', label: 'Email Address' }
    }
  }
];

console.log('--- Task 1: TypeScript Definition ---');
console.log(generateTypeScriptDefinition(sampleObjects));

console.log('\n--- Task 2: AI Runtime Manifest ---');
const manifest = generateAIManifest(sampleObjects, { 
  includeDescription: true,
  userPermissions: { 'project_task': ['read', 'create'], 'users': ['read'] }
});
console.log(JSON.stringify(manifest, null, 2));

console.log('\n--- Task 3: OpenAI Tools ---');
console.log(JSON.stringify(generateOpenAITools(), null, 2));
