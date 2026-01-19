const fs = require('fs');
const path = require('path');
const glob = require('glob');

const docsDir = path.resolve(__dirname, '../content/docs');

// Find all MDX files in content/docs
const files = glob.sync('**/*.mdx', { 
    cwd: docsDir, 
    ignore: 'references/**', // Ignore generated references
    absolute: true 
});

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check for frontmatter
    const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
        const frontmatter = match[0];
        const bodyWithImports = content.slice(frontmatter.length);
        
        // Split body into lines to handle imports and spacing safely
        const lines = bodyWithImports.split('\n');
        
        // Find the first line that is a H1 header (# Title)
        // We iterate and stop at the first non-empty/non-import line to see if it's a H1
        // Actually, easiest is just to find the first line starting with "# "
        
        const h1Index = lines.findIndex(line => line.trim().startsWith('# '));
        
        if (h1Index !== -1) {
             console.log(`Fixing ${path.relative(docsDir, file)}`);
             lines.splice(h1Index, 1); // Remove the header line
             
             // If the next line is empty, maybe remove it too to avoid double spacing? 
             // But usually it's fine.
             
             const newContent = frontmatter + lines.join('\n');
             fs.writeFileSync(file, newContent, 'utf8');
        }
    }
});
