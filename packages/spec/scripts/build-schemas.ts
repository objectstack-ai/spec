import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as Protocol from '../src/index';

const OUT_DIR = path.resolve(__dirname, '../json-schema');

// Retry and delay configuration
const RETRY_DELAY_BASE_MS = 100; // Base delay in ms, multiplied by retry attempt number
const FS_SYNC_DELAY_MS = 50;     // Delay after rmSync to ensure filesystem consistency
const MAX_RETRIES = 3;            // Maximum number of retry attempts

/**
 * Synchronous sleep utility using a busy-wait loop
 * Only use for short delays in build scripts where blocking is acceptable
 * 
 * Note: This blocks the event loop and consumes CPU. For production code,
 * use async/await with setTimeout. For build scripts, this simple synchronous
 * approach is acceptable as we need to ensure filesystem operations complete
 * before proceeding.
 */
function sleepSync(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy wait
  }
}

/**
 * Safely ensure directory exists with retry logic
 */
function ensureDir(dirPath: string, retries = MAX_RETRIES): void {
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
      // Wait a bit before retrying with exponential backoff
      const delay = RETRY_DELAY_BASE_MS * (i + 1);
      sleepSync(delay);
    }
  }
}

/**
 * Safely write file with retry logic
 */
function writeFileWithRetry(filePath: string, content: string, retries = MAX_RETRIES): void {
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
      // Wait a bit before retrying with exponential backoff
      const delay = RETRY_DELAY_BASE_MS * (i + 1);
      sleepSync(delay);
    }
  }
}

/**
 * Recursively remove directory with retry logic
 * More robust than fs.rmSync for handling ENOTEMPTY errors in CI
 */
function removeDirRecursive(dirPath: string, retries = MAX_RETRIES): void {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (!fs.existsSync(dirPath)) {
        return; // Already removed
      }

      // Read all entries in the directory
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      // Process each entry
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively remove subdirectory
          removeDirRecursive(fullPath, retries);
        } else {
          // Remove file with retry
          for (let fileRetry = 0; fileRetry < retries; fileRetry++) {
            try {
              fs.unlinkSync(fullPath);
              break;
            } catch (error) {
              if (fileRetry === retries - 1) {
                throw error;
              }
              sleepSync(RETRY_DELAY_BASE_MS * (fileRetry + 1));
            }
          }
        }
      }
      
      // Now remove the empty directory
      fs.rmdirSync(dirPath);
      return; // Success
      
    } catch (error) {
      if (attempt === retries - 1) {
        throw new Error(`Failed to remove directory ${dirPath} after ${retries} attempts: ${error}`);
      }
      // Wait before retrying with exponential backoff
      const delay = RETRY_DELAY_BASE_MS * (attempt + 1);
      sleepSync(delay);
    }
  }
}

// Clean output directory ensures no stale files remain
if (fs.existsSync(OUT_DIR)) {
  console.log(`Cleaning output directory: ${OUT_DIR}`);
  removeDirRecursive(OUT_DIR);
  
  // Wait a bit to ensure file system has synced
  // This prevents ENOENT errors on some file systems, particularly in CI environments
  sleepSync(FS_SYNC_DELAY_MS);
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
  console.error(`\nNote: Partial schema generation occurred. Some schemas may be missing.`);
  console.error(`This typically indicates a Zod schema definition error or file system issue.`);
  process.exit(1);
}

console.log(`\n✅ Successfully generated ${count} schemas.`);
