import { defineProject } from '@objectstack/spec';
import { Project } from './src/project.object.js';
// @ts-ignore
import CRMPlugin from '../../plugin-advanced-crm/objectstack.config.js';

export default defineProject({
  objects: [
    Project
  ],
  apps: [],
  plugins: [
    '@objectstack/plugin-bi',
    CRMPlugin
  ]
});
