/**
 * OpenAI Function Tool Definition
 */
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

/**
 * Task 3: Tool Definitions (OpenAI Function Calling Schema)
 * 
 * Generates standard tool definitions for ObjectQL operations.
 * Allows the AI to understand how to query the database.
 */
export function generateOpenAITools(): OpenAITool[] {
  return [
    {
      type: 'function',
      function: {
        name: 'objectql_search',
        description: 'Search for records in the database using ObjectQL. Use this to retrieve data.',
        parameters: {
          type: 'object',
          properties: {
            objectName: {
              type: 'string',
              description: 'The machine name of the object to query (e.g. "project_task", "account")',
            },
            filters: {
              type: 'array',
              description: 'List of filter conditions. Logic is implicitly AND.',
              items: {
                type: 'array',
                description: 'A triple of [field, operator, value]',
                prefixItems: [
                  { type: 'string', description: 'Field name (e.g. "status")' },
                  { type: 'string', enum: ['=', '!=', '>', '>=', '<', '<=', 'contains', 'startswith'], description: 'Operator' },
                  { type: ['string', 'number', 'boolean'], description: 'Value to compare' }
                ]
              }
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific fields to select. Leave empty to get default fields.'
            },
            sort: {
              type: 'string',
              description: 'Sort expression (e.g. "created_at desc")'
            },
            top: {
              type: 'number',
              description: 'Max number of records to return'
            }
          },
          required: ['objectName']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'objectql_create',
        description: 'Create a new record in the database.',
        parameters: {
          type: 'object',
          properties: {
            objectName: {
              type: 'string',
              description: 'The machine name of the object (e.g. "lead")',
            },
            data: {
              type: 'object',
              description: 'Key-value pairs of data to insert',
              additionalProperties: true
            }
          },
          required: ['objectName', 'data']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'objectql_update',
        description: 'Update an existing record.',
        parameters: {
          type: 'object',
          properties: {
            objectName: { type: 'string' },
            id: { type: 'string', description: 'The _id of the record to update' },
            data: {
              type: 'object',
              description: 'Fields to change',
            }
          },
          required: ['objectName', 'id', 'data']
        }
      }
    }
  ];
}
