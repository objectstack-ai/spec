import fs from 'fs';
import path from 'path';

const SCHEMA_DIR = path.resolve(__dirname, '../json-schema');
const DOCS_DIR = path.resolve(__dirname, '../../../content/docs/references');

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
  
  md += `# ${schemaName}\n\n`;
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
      const desc = (prop.description || '').replace(/\n/g, ' ');
      
      md += `| **${key}** | \`${typeStr}\` | ${isReq} | ${desc} |\n`;
    }
  } else if (mainDef.type === 'string' && mainDef.enum) {
    md += `## Allowed Values\n\n`;
    md += mainDef.enum.map((e: string) => `* \`${e}\``).join('\n');
  }

  return md;
}

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

const files = fs.readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const schemaName = file.replace('.json', '');
  const content = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf-8'));
  const mdx = generateMarkdown(schemaName, content);
  
  if (mdx) {
    fs.writeFileSync(path.join(DOCS_DIR, `${schemaName}.mdx`), mdx);
    console.log(`✓ Generated docs for ${schemaName}`);
  }
});

console.log(`\nDocumentation generated in ${DOCS_DIR}`);
