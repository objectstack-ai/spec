import fs from 'fs';
import path from 'path';

const SCHEMA_DIR = path.resolve(__dirname, '../json-schema');
const SRC_DIR = path.resolve(__dirname, '../src');
// DOCS_DIR output is now handled dynamically per category
const DOCS_ROOT = path.resolve(__dirname, '../../../content/docs/references');

const CATEGORIES: Record<string, string> = {
  data: 'Data Protocol',
  ui: 'UI Protocol',
  system: 'System Protocol',
  ai: 'AI Protocol'
};

// Map SchemaName -> Category Key (e.g. 'Object' -> 'data')
const schemaCategoryMap = new Map<string, string>();


// 1. Scan source files to build map
Object.keys(CATEGORIES).forEach(category => {
  const dir = path.join(SRC_DIR, category);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      
      // Regex to find exported const schemas (e.g. "export const ObjectSchema = ...")
      // also matches "export const ObjectCapabilities = ..."
      // We assume conventions are followed
      const matches = content.matchAll(/export const (\w+)(?:Schema)?\s*=\s*z\./g);
      for (const match of matches) {
        // match[1] is the name (e.g. Object).
        // Note: build-schemas.ts strips 'Schema' suffix. 
        // We match (\w+) which captures 'ObjectSchema' or 'ObjectCapabilities'.
        // logic in build-schemas: `key.endsWith('Schema') ? key.replace('Schema', '') : key`
        
        let schemaName = match[1]; // e.g. Object from ObjectSchema
        if (!content.includes(`export const ${schemaName}Schema =`)) {
           // Wait, regex above captures "Object" from "ObjectSchema" IF I put Schema in non-capturing group?
           // No, (\w+) captures "ObjectSchema". (?:Schema)? is applied to verify/consume suffix but regex is tricky.
           // Simplified regex: /export const (\w+)\s*=/
           // Then apply naming logic.
        }
      }
    }
  }
});
// Redo scanning with simpler logic
function scanCategories() {
  Object.keys(CATEGORIES).forEach(category => {
    const dir = path.join(SRC_DIR, category);
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      
      // Match all exports that look like schemas
      // We look for: export const Name = z.
      const regex = /export const (\w+)\s*=\s*z\./g;
      
      let match;
      while ((match = regex.exec(content)) !== null) {
        const rawName = match[1];
        const finalName = rawName.endsWith('Schema') ? rawName.replace('Schema', '') : rawName;
        schemaCategoryMap.set(finalName, category);
      }
    }
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

function generateMarkdown(schemaName: string, schema: any) {
  const defs = schema.definitions || {};
  const mainDef = defs[schemaName] || Object.values(defs)[0];

  if (!mainDef) return '';

  let md = `---\ntitle: ${schemaName}\ndescription: ${mainDef.description || schemaName + ' Schema Reference'}\n---\n\n`;
  
  if (mainDef.description) {
    md += `${mainDef.description}\n\n`;
  }

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
  } else if (mainDef.type === 'string' && mainDef.enum) {
    md += `## Allowed Values\n\n`;
    md += mainDef.enum.map((e: string) => `* \`${e}\``).join('\n');
  }

  return md;
}

// 2. Prepare Directories
const miscDir = path.join(DOCS_ROOT, 'misc');
if (!fs.existsSync(DOCS_ROOT)) {
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

// Generate meta.json for categories
Object.entries(CATEGORIES).forEach(([key, title]) => {
  const dir = path.join(DOCS_ROOT, key);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ title }, null, 2));
});

// Clean up: We DO NOT delete the root folder to be safe, but we should probably clear old mdx files in root?
// Be careful not to delete meta.json in root if we want to preserve it, but we will overwrite it.

// 3. Generate Docs
const files = fs.readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const schemaName = file.replace('.json', '');
  const content = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf-8'));
  const mdx = generateMarkdown(schemaName, content);
  
  if (mdx) {
    const category = schemaCategoryMap.get(schemaName) || 'misc';
    const outDir = path.join(DOCS_ROOT, category);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    fs.writeFileSync(path.join(outDir, `${schemaName}.mdx`), mdx);
    console.log(`✓ Generated docs for ${schemaName} in ${category}`);
  }
});

// 4. Update Root meta.json
// We want references to list categories in specific order
const rootMetaProps = {
  label: "API References",
  order: 100,
  pages: [
    "data",
    "ui",
    "system",
    "ai",
    "misc" 
  ]
};
fs.writeFileSync(path.join(DOCS_ROOT, 'meta.json'), JSON.stringify(rootMetaProps, null, 2));

console.log(`\nDocumentation generated in ${DOCS_ROOT} organized by protocol.`);
console.log('NOTE: You may need to manually delete old flat .mdx files in references/ if any exist.');
