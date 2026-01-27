import fs from 'fs';
import path from 'path';

const SCHEMA_DIR = path.resolve(__dirname, '../json-schema');
const SRC_DIR = path.resolve(__dirname, '../src');
// DOCS_DIR output is now handled dynamically per category
const DOCS_ROOT = path.resolve(__dirname, '../../../content/docs/references');

// Dynamically discover categories from src directory
const getCategoryTitle = (dir: string) => {
  const upper = dir.toUpperCase();
  if (['UI', 'AI', 'API'].includes(upper)) return `${upper} Protocol`;
  return `${dir.charAt(0).toUpperCase() + dir.slice(1)} Protocol`;
};

const CATEGORIES = fs.readdirSync(SRC_DIR)
  .filter(file => fs.statSync(path.join(SRC_DIR, file)).isDirectory())
  .reduce((acc, dir) => {
    acc[dir] = getCategoryTitle(dir);
    return acc;
  }, {} as Record<string, string>);

// Map SchemaName -> Category (e.g. 'Object' -> 'data')
const schemaCategoryMap = new Map<string, string>();
// Map SchemaName -> Zod file (e.g. 'Object' -> 'object')
const schemaZodFileMap = new Map<string, string>();
// Track all zod files per category
const categoryZodFiles = new Map<string, Set<string>>();

// Scan source files to build maps
function scanCategories() {
  Object.keys(CATEGORIES).forEach(category => {
    const dir = path.join(SRC_DIR, category);
    if (!fs.existsSync(dir)) return;

    const zodFiles = new Set<string>();
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.zod.ts'));
    
    for (const file of files) {
      const zodFileName = file.replace('.zod.ts', '');
      zodFiles.add(zodFileName);
      
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      
      // Match export const Name = ... OR export const Name: Type = ...
      // Captures name followed by optional whitespace and then either ':' or '='
      const regex = /export const (\w+)\s*(?:[:=])/g;
      
      let match;
      while ((match = regex.exec(content)) !== null) {
        const rawName = match[1];
        const finalName = rawName.endsWith('Schema') ? rawName.replace('Schema', '') : rawName;
        schemaCategoryMap.set(finalName, category);
        schemaZodFileMap.set(finalName, zodFileName);
      }
    }
    
    categoryZodFiles.set(category, zodFiles);
  });
}

scanCategories();

// Helpers to format types
function formatType(prop: any): string {
  if (!prop) return 'any';
  
  if (prop.$ref) {
    const ref = prop.$ref.split('/').pop();
    return `[${ref}](./${ref})`;
  }
  
  if (prop.type === 'array') {
    return `${formatType(prop.items)}[]`;
  }
  
  if (prop.enum) {
    return `Enum<${prop.enum.map((e: any) => `'${e}'`).join(' | ')}>`;
  }
  
  if (prop.anyOf || prop.oneOf) {
    const variants = prop.anyOf || prop.oneOf;
    return variants.map(formatType).join(' | ');
  }

  if (prop.type === 'object' && prop.additionalProperties) {
    return `Record<string, ${formatType(prop.additionalProperties)}>`;
  }

  return prop.type || 'any';
}

function generateMarkdown(schemaName: string, schema: any, category: string, zodFile: string) {
  const defs = schema.definitions || {};
  const mainDef = defs[schemaName] || Object.values(defs)[0];

  if (!mainDef) return '';

  // Enhanced frontmatter with more metadata
  let md = `---\ntitle: ${schemaName}\ndescription: ${mainDef.description || schemaName + ' Schema Reference'}\n`;
  md += `category: ${category}\n`;
  md += `zodFile: ${zodFile}\n`;
  md += `---\n\n`;
  
  // Add breadcrumb navigation
  const categoryTitle = getCategoryTitle(category);
  md += `import { Card, Cards } from 'fumadocs-ui/components/card';\n`;
  md += `import { Tab, Tabs } from 'fumadocs-ui/components/tabs';\n`;
  md += `import { Callout } from 'fumadocs-ui/components/callout';\n\n`;
  
  // Add description with better formatting
  if (mainDef.description) {
    md += `${mainDef.description}\n\n`;
  }
  
  // Add source code reference
  md += `<Callout type="info">\n`;
  md += `**Source:** \`packages/spec/src/${category}/${zodFile}.zod.ts\`\n`;
  md += `</Callout>\n\n`;

  if (mainDef.type === 'object' && mainDef.properties) {
    md += `## Properties\n\n`;
    md += `| Property | Type | Required | Description |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    const required = new Set(mainDef.required || []);
    
    for (const [key, prop] of Object.entries(mainDef.properties) as [string, any][]) {
      const typeStr = formatType(prop).replace(/\|/g, '\\|'); // Escape pipes for table
      const isReq = required.has(key) ? '✅' : 'optional';
      let desc = (prop.description || '').replace(/\n/g, ' ');
      // Wrap inline examples containing braces in code spans to avoid MDX expression parsing
      desc = desc.replace(/\{[^}]*\}/g, (m) => `\`${m}\``);
      
      md += `| **${key}** | \`${typeStr}\` | ${isReq} | ${desc} |\n`;
    }
    
    // Add TypeScript usage example
    md += `\n## TypeScript Usage\n\n`;
    md += `\`\`\`typescript\n`;
    md += `import { ${schemaName}Schema } from '@objectstack/spec/${category}';\n`;
    md += `import type { ${schemaName} } from '@objectstack/spec/${category}';\n\n`;
    md += `// Validate data\n`;
    md += `const result = ${schemaName}Schema.parse(data);\n\n`;
    md += `// Type-safe usage\n`;
    md += `const my${schemaName}: ${schemaName} = {\n`;
    
    // Generate example based on required fields
    const requiredProps = Array.from(required).slice(0, 3); // Show first 3 required fields
    requiredProps.forEach((propName, idx) => {
      const prop = (mainDef.properties as any)[propName];
      const exampleValue = getExampleValue(prop, propName as string);
      md += `  ${propName}: ${exampleValue}${idx < requiredProps.length - 1 || mainDef.required?.length > 3 ? ',' : ''}\n`;
    });
    
    if (mainDef.required?.length > 3) {
      md += `  // ... other fields\n`;
    }
    
    md += `};\n`;
    md += `\`\`\`\n\n`;
    
  } else if (mainDef.type === 'string' && mainDef.enum) {
    md += `## Allowed Values\n\n`;
    md += mainDef.enum.map((e: string) => `* \`${e}\``).join('\n');
    md += `\n\n## TypeScript Usage\n\n`;
    md += `\`\`\`typescript\n`;
    md += `import { ${schemaName} } from '@objectstack/spec/${category}';\n\n`;
    md += `// Type-safe enum value\n`;
    md += `const value: ${schemaName} = '${mainDef.enum[0]}';\n`;
    md += `\`\`\`\n\n`;
  }
  
  // Add "See Also" section with related schemas
  const relatedSchemas = findRelatedSchemas(schemaName, mainDef, category);
  if (relatedSchemas.length > 0) {
    md += `## Related\n\n`;
    md += `<Cards>\n`;
    relatedSchemas.forEach(related => {
      md += `  <Card href="../${related.zodFile}/${related.name}" title="${related.name}" />\n`;
    });
    md += `</Cards>\n\n`;
  }

  return md;
}

// Helper to generate example values for fields
function getExampleValue(prop: any, fieldName: string): string {
  if (prop.type === 'string') {
    if (prop.enum) return `'${prop.enum[0]}'`;
    if (fieldName.includes('name')) return `'${fieldName.replace(/_/g, ' ')}'`;
    if (fieldName.includes('email')) return `'user@example.com'`;
    if (fieldName.includes('url')) return `'https://example.com'`;
    return `'example'`;
  }
  if (prop.type === 'number') return prop.default !== undefined ? prop.default : '0';
  if (prop.type === 'boolean') return prop.default !== undefined ? String(prop.default) : 'false';
  if (prop.type === 'array') return '[]';
  if (prop.type === 'object') return '{}';
  return 'null';
}

// Helper to find related schemas (referenced in properties)
function findRelatedSchemas(schemaName: string, mainDef: any, category: string): Array<{name: string, zodFile: string}> {
  const related: Array<{name: string, zodFile: string}> = [];
  const seen = new Set<string>();
  
  if (mainDef.properties) {
    for (const prop of Object.values(mainDef.properties) as any[]) {
      if (prop.$ref) {
        const refName = prop.$ref.split('/').pop();
        if (refName && refName !== schemaName && !seen.has(refName)) {
          const zodFile = schemaZodFileMap.get(refName);
          if (zodFile && schemaCategoryMap.get(refName) === category) {
            related.push({ name: refName, zodFile });
            seen.add(refName);
          }
        }
      }
    }
  }
  
  return related.slice(0, 6); // Limit to 6 related items
}

// 2. Clean up old documentation structure
// IMPORTANT: This removes old .mdx files and subdirectories to ensure a clean state.
// Only category roots are cleaned (data/, ui/, system/, ai/, api/). The root meta.json is preserved.
// All necessary directories and files are regenerated in step 3, so this is safe.
Object.keys(CATEGORIES).forEach(category => {
  const dir = path.join(DOCS_ROOT, category);
  if (fs.existsSync(dir)) {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const entryPath = path.join(dir, entry);
      const stat = fs.statSync(entryPath);
      
      // Remove old .mdx files from category root (these will be moved to subfolders)
      if (stat.isFile() && entry.endsWith('.mdx')) {
        fs.unlinkSync(entryPath);
        console.log(`Removed old file: ${category}/${entry}`);
      }
      // Remove old subdirectories (will be recreated with correct structure in step 3)
      // Note: meta.json is preserved as it's not a directory
      else if (stat.isDirectory()) {
        fs.rmSync(entryPath, { recursive: true, force: true });
        console.log(`Removed old directory: ${category}/${entry}`);
      }
    });
  }
});

// 3. Prepare Directories
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

// Generate meta.json for categories and zod file subfolders
Object.entries(CATEGORIES).forEach(([key, title]) => {
  const dir = path.join(DOCS_ROOT, key);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const zodFiles = categoryZodFiles.get(key) || new Set<string>();
  
  // Create top-level meta.json for the protocol
  const meta: any = { 
    title,
  };
  
  // Sort zod files alphabetically for consistent ordering
  const sortedZodFiles = Array.from(zodFiles).sort();
  
  if (sortedZodFiles.length > 0) {
    // Enforce order using 'pages'
    meta.pages = sortedZodFiles;
  }

  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));

  // Create zod file directories and meta.json files
  sortedZodFiles.forEach(zodFile => {
    const subDir = path.join(dir, zodFile);
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    
    const subTitle = zodFile.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    fs.writeFileSync(path.join(subDir, 'meta.json'), JSON.stringify({ title: subTitle }, null, 2));
  });
});

// 4. Generate Docs
// Read JSON schema files from category subdirectories
Object.keys(CATEGORIES).forEach(category => {
  const categorySchemaDir = path.join(SCHEMA_DIR, category);
  
  if (!fs.existsSync(categorySchemaDir)) {
    console.log(`Warning: Schema directory ${categorySchemaDir} does not exist`);
    return;
  }
  
  const files = fs.readdirSync(categorySchemaDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const schemaName = file.replace('.json', '');
    const schemaPath = path.join(categorySchemaDir, file);
    const content = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const zodFile = schemaZodFileMap.get(schemaName) || 'misc';
    const mdx = generateMarkdown(schemaName, content, category, zodFile);
    
    if (mdx) {
      // Determine output directory
      let outDir = path.join(DOCS_ROOT, category);
      if (zodFile) {
        outDir = path.join(outDir, zodFile);
      }

      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      
      const fileName = `${schemaName}.mdx`;
      fs.writeFileSync(path.join(outDir, fileName), mdx);
      
      console.log(`✓ Generated docs for ${schemaName} in ${category}${zodFile ? '/' + zodFile : ''}`);
    }
  });
});

// 4.5. Generate Protocol Overview Pages
// Create index.mdx for each category with overview of all schemas
Object.entries(CATEGORIES).forEach(([category, title]) => {
  const categoryDir = path.join(DOCS_ROOT, category);
  const zodFiles = categoryZodFiles.get(category) || new Set<string>();
  
  if (zodFiles.size === 0) return;
  
  let overviewMd = `---\ntitle: ${title} Overview\ndescription: Complete reference for all ${title.toLowerCase()} schemas\n---\n\n`;
  overviewMd += `import { Card, Cards } from 'fumadocs-ui/components/card';\n`;
  overviewMd += `import { Database, Cpu, Zap } from 'lucide-react';\n\n`;
  
  overviewMd += `# ${title}\n\n`;
  overviewMd += `This section contains all protocol schemas for the ${category} layer of ObjectStack.\n\n`;
  
  // Group schemas by zod file
  const zodFileGroups = new Map<string, string[]>();
  
  // Read category schema directory to get all schemas
  const categorySchemaDir = path.join(SCHEMA_DIR, category);
  if (fs.existsSync(categorySchemaDir)) {
    const schemaFiles = fs.readdirSync(categorySchemaDir).filter(f => f.endsWith('.json'));
    schemaFiles.forEach(file => {
      const schemaName = file.replace('.json', '');
      const zodFile = schemaZodFileMap.get(schemaName) || 'misc';
      
      if (!zodFileGroups.has(zodFile)) {
        zodFileGroups.set(zodFile, []);
      }
      zodFileGroups.get(zodFile)!.push(schemaName);
    });
  }
  
  // Generate overview sections
  const sortedZodFiles = Array.from(zodFiles).sort();
  sortedZodFiles.forEach(zodFile => {
    const schemas = zodFileGroups.get(zodFile) || [];
    if (schemas.length === 0) return;
    
    const zodTitle = zodFile.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    overviewMd += `## ${zodTitle}\n\n`;
    overviewMd += `Source: \`packages/spec/src/${category}/${zodFile}.zod.ts\`\n\n`;
    overviewMd += `<Cards>\n`;
    
    schemas.sort().forEach(schemaName => {
      // Read schema to get description
      const schemaPath = path.join(categorySchemaDir, `${schemaName}.json`);
      if (fs.existsSync(schemaPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        const defs = schema.definitions || {};
        const mainDef = defs[schemaName] || Object.values(defs)[0];
        const description = mainDef?.description || `${schemaName} schema reference`;
        
        overviewMd += `  <Card href="./${zodFile}/${schemaName}" title="${schemaName}" description="${description.split('\n')[0].substring(0, 100)}${description.length > 100 ? '...' : ''}" />\n`;
      }
    });
    
    overviewMd += `</Cards>\n\n`;
  });
  
  // Write overview page
  fs.writeFileSync(path.join(categoryDir, 'index.mdx'), overviewMd);
  console.log(`✓ Generated overview page for ${category}`);
});

// 5. Update Root meta.json
// We want references to list categories in specific order
const rootMetaProps = {
  title: "Protocol Reference",
  pages: [
    "data",
    "ui",
    "automation",
    "system",
    "permission",
    "ai",
    "api",
    "driver"
  ]
};
fs.writeFileSync(path.join(DOCS_ROOT, 'meta.json'), JSON.stringify(rootMetaProps, null, 2));

console.log(`\nDocumentation generated in ${DOCS_ROOT} organized by zod files.`);
console.log('Each category is now organized into subfolders based on source zod files.');
