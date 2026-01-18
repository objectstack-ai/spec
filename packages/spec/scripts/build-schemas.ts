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

// Iterate over all exports in the protocol
for (const [key, value] of Object.entries(Protocol)) {
  // Check if it looks like a Zod Schema
  // Zod schemas usually have a parse method and safeParse method, or we can check instanceof
  if (value instanceof z.ZodType) {
    const schemaName = key.endsWith('Schema') ? key.replace('Schema', '') : key;
    
    // Convert to JSON Schema
    const jsonSchema = zodToJsonSchema(value, {
      name: schemaName,
      $refStrategy: "none" // We want self-contained schemas for now, or use 'relative' if we handle refs
    });

    const fileName = `${schemaName}.json`;
    const filePath = path.join(OUT_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(jsonSchema, null, 2));
    console.log(`✓ ${fileName}`);
    count++;
  }
}

console.log(`\nSuccessfully generated ${count} schemas.`);
