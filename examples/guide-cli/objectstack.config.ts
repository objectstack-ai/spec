import { defineStack } from '@objectstack/spec';
import { Project } from './src/project.object.js';
// @ts-ignore
import CRMPlugin from '../../plugin-advanced-crm/objectstack.config.js';

export default defineStack({
  objects: [
    Project
  ],
  apps: [],
  plugins: [
    '@objectstack/plugin-bi',
    CRMPlugin
  ]
});
