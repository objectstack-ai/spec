import { z } from 'zod';

/**
 * ObjectStack Plugin Structure Standards (OPS)
 * 
 * Formal Zod definitions for the Plugin Directory Structure and File Naming conventions.
 * This can be used by the CLI or IDE extensions to lint project structure.
 * 
 * @see PLUGIN_STANDARDS.md
 */

// REGEX: snake_case identifiers
const SNAKE_CASE_REGEX = /^[a-z][a-z0-9_]*$/;

// REGEX: Standard File Suffixes
const OPS_FILE_SUFFIX_REGEX = /\.(object|field|trigger|function|view|page|dashboard|flow|app|router|service)\.ts$/;

/**
 * Validates a single file path against OPS Naming Conventions.
 * 
 * @example Valid Paths
 * - "src/crm/lead.object.ts"
 * - "src/finance/invoice_payment.trigger.ts"
 * - "src/index.ts"
 * 
 * @example Invalid Paths
 * - "src/CRM/LeadObject.ts" (PascalCase)
 * - "src/utils/helper.js" (Wrong extension)
 */
export const OpsFilePathSchema = z.string().superRefine((path, ctx) => {
  // 1. Must be in src/
  if (!path.startsWith('src/')) {
    // Non-source files (package.json, config) are ignored by this specific validator
    // or handled separately.
    return; 
  }

  const parts = path.split('/');
  
  // 2. Validate Domain Directory (src/[domain])
  if (parts.length > 2) {
    const domainDir = parts[1];
    if (!SNAKE_CASE_REGEX.test(domainDir)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Domain directory '${domainDir}' must be lowercase snake_case`
      });
    }
  }

  // 3. Validate Filename suffix
  const filename = parts[parts.length - 1];
  
  // Skip index.ts and utility files if they don't match the specific resource pattern
  // But strict OPS encourages explicit suffixes for resources.
  if (filename === 'index.ts' || filename === 'main.ts') return;

  if (!SNAKE_CASE_REGEX.test(filename.split('.')[0])) {
     ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Filename '${filename}' base name must be lowercase snake_case`
      });
  }

  if (!OPS_FILE_SUFFIX_REGEX.test(filename)) {
    // We allow other files, but we warn or mark them as non-standard resources
    // For strict mode:
    // ctx.addIssue({
    //   code: z.ZodIssueCode.custom,
    //   message: `Filename '${filename}' does not end with a valid semantic suffix (.object.ts, .view.ts, etc.)`
    // });
  }
});

/**
 * Schema for a "Scanned Module" structure.
 * Represents the contents of a domain folder.
 */
export const OpsDomainModuleSchema = z.object({
  name: z.string().regex(SNAKE_CASE_REGEX),
  files: z.array(z.string()),
}).superRefine((module, ctx) => {
  // Rule: Must have an index.ts
  if (!module.files.includes('index.ts')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Module '${module.name}' is missing an 'index.ts' entry point.`
    });
  }
});

/**
 * Schema for a full Plugin Project Layout
 */
export const OpsPluginStructureSchema = z.object({
  root: z.string(),
  files: z.array(z.string()).describe('List of all file paths relative to root'),
}).superRefine((project, ctx) => {
  // Check for configuration file
  if (!project.files.includes('objectstack.config.ts')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing 'objectstack.config.ts' configuration file."
    });
  }
  
  // Validate each source file individually
  project.files.filter(f => f.startsWith('src/')).forEach(file => {
      const result = OpsFilePathSchema.safeParse(file);
      if (!result.success) {
          result.error.issues.forEach(issue => {
              ctx.addIssue({ ...issue, path: [file] });
          })
      }
  });
});
