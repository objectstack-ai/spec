import { defineStack } from '@objectstack/spec';
import { Project } from './src/project.object.js';
import BiPlugin from '@objectstack/plugin-bi';
// @ts-ignore
import CRMPlugin from '../../plugin-advanced-crm/objectstack.config.js';

export default defineStack({
  objects: [
    Project
  ],
  apps: [],
  plugins: [
    BiPlugin,
    CRMPlugin
  ]
});
