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

  let md = '';
  
  // Add schema heading
  md += `## ${schemaName}\n\n`;
  
  // Add description with better formatting
  if (mainDef.description) {
    md += `${mainDef.description}\n\n`;
  }

  if (mainDef.type === 'object' && mainDef.properties) {
    md += `### Properties\n\n`;
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
    
    md += `\n`;
    
  } else if (mainDef.type === 'string' && mainDef.enum) {
    md += `### Allowed Values\n\n`;
    md += mainDef.enum.map((e: string) => `* \`${e}\``).join('\n');
    md += `\n\n`;
  }

  return md;
}

// New function to generate combined documentation for all schemas in a zod file
function generateZodFileMarkdown(zodFile: string, schemas: Array<{name: string, content: any}>, category: string): string {
  const zodTitle = zodFile.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  let md = `---\n`;
  md += `title: ${zodTitle}\n`;
  md += `description: ${zodTitle} protocol schemas\n`;
  md += `---\n\n`;
  
  md += `import { Card, Cards } from 'fumadocs-ui/components/card';\n`;
  md += `import { Callout } from 'fumadocs-ui/components/callout';\n\n`;
  
  md += `# ${zodTitle}\n\n`;
  
  // Add source reference
  md += `<Callout type="info">\n`;
  md += `**Source:** \`packages/spec/src/${category}/${zodFile}.zod.ts\`\n`;
  md += `</Callout>\n\n`;
  
  // Add TypeScript usage example
  md += `## TypeScript Usage\n\n`;
  md += `\`\`\`typescript\n`;
  md += `import { `;
  
  // Import all schemas
  const schemaNames = schemas.map(s => s.name + 'Schema').join(', ');
  md += schemaNames;
  md += ` } from '@objectstack/spec/${category}';\n`;
  md += `import type { `;
  md += schemas.map(s => s.name).join(', ');
  md += ` } from '@objectstack/spec/${category}';\n\n`;
  md += `// Validate data\n`;
  md += `const result = ${schemas[0].name}Schema.parse(data);\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  
  // Generate documentation for each schema
  schemas.forEach((schema, idx) => {
    md += generateMarkdown(schema.name, schema.content, category, zodFile);
    if (idx < schemas.length - 1) {
      md += `---\n\n`;
    }
  });
  
  return md;
}


// 2. Clean up old documentation structure
// Remove old .mdx files and subdirectories to ensure a clean state.
Object.keys(CATEGORIES).forEach(category => {
  const dir = path.join(DOCS_ROOT, category);
  if (fs.existsSync(dir)) {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const entryPath = path.join(dir, entry);
      const stat = fs.statSync(entryPath);
      
      // Remove old .mdx files (will be regenerated)
      if (stat.isFile() && entry.endsWith('.mdx') && entry !== 'index.mdx') {
        fs.unlinkSync(entryPath);
        console.log(`Removed old file: ${category}/${entry}`);
      }
      // Remove old subdirectories (schemas are now in single files)
      else if (stat.isDirectory()) {
        fs.rmSync(entryPath, { recursive: true, force: true });
        console.log(`Removed old directory: ${category}/${entry}`);
      }
    });
  }
});

// 3. Prepare Directories and Generate meta.json
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

// Generate meta.json for categories - now just listing zod files
Object.entries(CATEGORIES).forEach(([key, title]) => {
  const dir = path.join(DOCS_ROOT, key);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const zodFiles = categoryZodFiles.get(key) || new Set<string>();
  
  // Create top-level meta.json for the protocol with zod files as pages
  const meta: any = { 
    title,
  };
  
  // Sort zod files alphabetically for consistent ordering
  const sortedZodFiles = Array.from(zodFiles).sort();
  
  if (sortedZodFiles.length > 0) {
    meta.pages = sortedZodFiles;
  }

  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
});

// 4. Generate Docs - One file per zod file containing all schemas
// Group schemas by zod file
Object.keys(CATEGORIES).forEach(category => {
  const categorySchemaDir = path.join(SCHEMA_DIR, category);
  
  if (!fs.existsSync(categorySchemaDir)) {
    console.log(`Warning: Schema directory ${categorySchemaDir} does not exist`);
    return;
  }
  
  const files = fs.readdirSync(categorySchemaDir).filter(f => f.endsWith('.json'));
  
  // Group schemas by their zod file
  const zodFileSchemas = new Map<string, Array<{name: string, content: any}>>();
  
  files.forEach(file => {
    const schemaName = file.replace('.json', '');
    const schemaPath = path.join(categorySchemaDir, file);
    const content = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const zodFile = schemaZodFileMap.get(schemaName) || 'misc';
    
    if (!zodFileSchemas.has(zodFile)) {
      zodFileSchemas.set(zodFile, []);
    }
    zodFileSchemas.get(zodFile)!.push({ name: schemaName, content });
  });
  
  // Generate one file per zod file
  zodFileSchemas.forEach((schemas, zodFile) => {
    const outDir = path.join(DOCS_ROOT, category);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    const mdx = generateZodFileMarkdown(zodFile, schemas, category);
    const fileName = `${zodFile}.mdx`;
    fs.writeFileSync(path.join(outDir, fileName), mdx);
    
    console.log(`✓ Generated docs for ${zodFile}.zod.ts in ${category} (${schemas.length} schemas)`);
  });
});

// 4.5. Generate Protocol Overview Pages
// Create index.mdx for each category with overview of all zod files
Object.entries(CATEGORIES).forEach(([category, title]) => {
  const categoryDir = path.join(DOCS_ROOT, category);
  const zodFiles = categoryZodFiles.get(category) || new Set<string>();
  
  if (zodFiles.size === 0) return;
  
  let overviewMd = `---\ntitle: ${title} Overview\ndescription: Complete reference for all ${title.toLowerCase()} schemas\n---\n\n`;
  overviewMd += `import { Card, Cards } from 'fumadocs-ui/components/card';\n\n`;
  
  overviewMd += `# ${title}\n\n`;
  overviewMd += `This section contains all protocol schemas for the ${category} layer of ObjectStack.\n\n`;
  
  // List all zod files
  const sortedZodFiles = Array.from(zodFiles).sort();
  
  overviewMd += `<Cards>\n`;
  sortedZodFiles.forEach(zodFile => {
    const zodTitle = zodFile.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    overviewMd += `  <Card href="./${zodFile}" title="${zodTitle}" description="Source: packages/spec/src/${category}/${zodFile}.zod.ts" />\n`;
  });
  overviewMd += `</Cards>\n\n`;
  
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
