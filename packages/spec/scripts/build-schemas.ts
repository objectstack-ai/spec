import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as Protocol from '../src/index';

const OUT_DIR = path.resolve(__dirname, '../json-schema');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`Generating JSON Schemas to ${OUT_DIR}...`);

let count = 0;

// Protocol now exports namespaces (Data, UI, System, AI, API)
// We need to iterate through each namespace
for (const [namespaceName, namespaceExports] of Object.entries(Protocol)) {
  if (typeof namespaceExports === 'object' && namespaceExports !== null) {
    // Iterate over all exports in each namespace
    for (const [key, value] of Object.entries(namespaceExports)) {
      // Check if it looks like a Zod Schema
      if (value instanceof z.ZodType) {
        const schemaName = key.endsWith('Schema') ? key.replace('Schema', '') : key;
        
        // Convert to JSON Schema
        const jsonSchema = zodToJsonSchema(value, {
          name: schemaName,
          $refStrategy: "none" // We want self-contained schemas for now
        });

        const fileName = `${schemaName}.json`;
        const filePath = path.join(OUT_DIR, fileName);

        fs.writeFileSync(filePath, JSON.stringify(jsonSchema, null, 2));
        console.log(`✓ ${fileName}`);
        count++;
      }
    }
  }
}

console.log(`\nSuccessfully generated ${count} schemas.`);
