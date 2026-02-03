import { defineStack } from '@objectstack/spec';
import { Project } from './src/project.object.js';

export default defineStack({
  manifest: {
    id: 'com.example.cli-guide',
    version: '1.0.0',
    type: 'app',
    name: 'CLI Usage Guide',
    description: 'Example project demonstrating ObjectStack CLI usage'
  },
  objects: [
    Project
  ],
  apps: [],
  plugins: [
    '@objectstack/plugin-bi'
  ]
});
