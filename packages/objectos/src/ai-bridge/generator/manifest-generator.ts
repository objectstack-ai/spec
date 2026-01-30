import { ObjectDef } from './ts-generator';

export interface AIManifestOptions {
  includeDescription?: boolean;
  userPermissions?: Record<string, string[]>; // e.g. 'project': ['read', 'create']
}

export interface AIManifestObject {
  name: string;
  description?: string;
  fields: string[];
  capabilities: string[];
}

export interface AIManifest {
  objects: AIManifestObject[];
  apis?: any[]; // Placeholder for API definitions
}

/**
 * Task 2: Runtime Introspection Manifest
 * 
 * Generates a minimized schema representation for LLM System Prompts.
 * Focuses on saving tokens while maintaining semantic meaning.
 */
export function generateAIManifest(objects: ObjectDef[], options: AIManifestOptions = {}): AIManifest {
  const manifestObjects = objects.map(obj => {
    // 1. Filter fields: Send only name mainly, maybe type if critical. 
    // For extreme token saving, just list names.
    const fieldNames = Object.keys(obj.fields);
    
    // 2. Determine capabilities based on permissions
    const capabilities = options.userPermissions 
      ? (options.userPermissions[obj.name] || [])
      : ['read', 'create', 'update', 'delete', 'query']; // Default to all if no context

    // 3. Construct the lightweight object
    const result: AIManifestObject = {
      name: obj.name,
      fields: fieldNames,
      capabilities
    };

    if (options.includeDescription && obj.description) {
      result.description = obj.description;
    }

    return result;
  });

  return {
    objects: manifestObjects,
    apis: [] // To be populated if APIs are passed
  };
}
