import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as Protocol from '../src/index';

const OUT_DIR = path.resolve(__dirname, '../json-schema');

/**
 * Safely ensure directory exists with retry logic
 */
function ensureDir(dirPath: string, retries = 3): void {
  for (let i = 0; i < retries; i++) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      // Verify the directory was created successfully
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        return;
      }
    } catch (error) {
      if (i === retries - 1) {
        throw new Error(`Failed to create directory ${dirPath}: ${error}`);
      }
      // Wait a bit before retrying
      const delay = 100 * (i + 1);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
    }
  }
}

/**
 * Safely write file with retry logic
 */
function writeFileWithRetry(filePath: string, content: string, retries = 3): void {
  for (let i = 0; i < retries; i++) {
    try {
      // Ensure the parent directory exists
      const dir = path.dirname(filePath);
      ensureDir(dir);
      
      fs.writeFileSync(filePath, content);
      return;
    } catch (error) {
      if (i === retries - 1) {
        throw new Error(`Failed to write file ${filePath}: ${error}`);
      }
      // Wait a bit before retrying
      const delay = 100 * (i + 1);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
    }
  }
}

// Clean output directory ensures no stale files remain
if (fs.existsSync(OUT_DIR)) {
  console.log(`Cleaning output directory: ${OUT_DIR}`);
  fs.rmSync(OUT_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  
  // Wait a bit to ensure file system has synced
  // This prevents ENOENT errors on some file systems
  const syncDelay = 50;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, syncDelay);
}

// Ensure output directory exists
ensureDir(OUT_DIR);

console.log(`Generating JSON Schemas to ${OUT_DIR}...`);

let count = 0;
let errorCount = 0;

// Protocol now exports namespaces (Data, UI, System, AI, API)
// We need to iterate through each namespace
for (const [namespaceName, namespaceExports] of Object.entries(Protocol)) {
  if (typeof namespaceExports === 'object' && namespaceExports !== null) {
    // Create category subdirectory (e.g., data, ui, system, ai, api)
    const categoryDir = path.join(OUT_DIR, namespaceName.toLowerCase());
    
    try {
      ensureDir(categoryDir);
    } catch (error) {
      console.error(`Failed to create directory for namespace ${namespaceName}:`, error);
      errorCount++;
      continue;
    }

    console.log(`\n[${namespaceName}]`);
    
    // Iterate over all exports in each namespace
    for (const [key, value] of Object.entries(namespaceExports)) {
      // Check if it looks like a Zod Schema
      if (value instanceof z.ZodType) {
        const schemaName = key.endsWith('Schema') ? key.replace('Schema', '') : key;
        
        try {
          // Convert to JSON Schema
          const jsonSchema = zodToJsonSchema(value, {
            name: schemaName,
            $refStrategy: "none" // We want self-contained schemas for now
          });

          const fileName = `${schemaName}.json`;
          const filePath = path.join(categoryDir, fileName);

          writeFileWithRetry(filePath, JSON.stringify(jsonSchema, null, 2));
          console.log(`✓ ${namespaceName.toLowerCase()}/${fileName}`);
          count++;
        } catch (error) {
          console.error(`Failed to generate schema for ${namespaceName}.${key}:`, error);
          errorCount++;
        }
      }
    }
  }
}

if (errorCount > 0) {
  console.error(`\n❌ Completed with ${errorCount} error(s). ${count} schemas generated successfully.`);
  process.exit(1);
}

console.log(`\n✅ Successfully generated ${count} schemas.`);
