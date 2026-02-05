
import { docs } from '../.source/server';
import path from 'path';

console.log('CWD:', process.cwd());
console.log('Resolved Content Path (Reference):', path.resolve(process.cwd(), '../../content/docs'));

console.log('--- Loaded Docs ---');
// docs is a collection.
// It might be an array or map depending on implementation.
// Fumadocs collections usually export the list of items.

// Check if docs is array or object
if (Array.isArray(docs)) {
    console.log(`Found ${docs.length} docs.`);
    docs.forEach((doc: any) => {
        console.log(`- ${doc.data.title} (${doc.file.path})`);
    });
} else {
    console.log('Docs object:', docs);
}
