import { defineStack } from '@objectstack/spec';

// ─── Barrel Imports (one per metadata type) ─────────────────────────
import * as objects from './src/objects';
import * as apis from './src/apis';
import * as actions from './src/actions';
import * as dashboards from './src/dashboards';
import * as reports from './src/reports';
import * as flows from './src/flows';
import * as agents from './src/agents';
import * as ragPipelines from './src/rag';
import * as profiles from './src/profiles';
import * as apps from './src/apps';
import { CrmSeedData } from './src/data';

// ─── Sharing & Security (special: mixed single/array values) ───────
import {
  OrganizationDefaults,
  AccountTeamSharingRule, TerritorySharingRules,
  OpportunitySalesSharingRule,
  CaseEscalationSharingRule,
  RoleHierarchy,
} from './src/sharing';

export default defineStack({
  manifest: {
    id: 'com.example.crm',
    namespace: 'crm',
    version: '3.0.0',
    type: 'app',
    name: 'Enterprise CRM',
    description: 'Comprehensive enterprise CRM demonstrating all ObjectStack Protocol features including AI, security, and automation',
  },

  // Auto-collected from barrel index files via Object.values()
  objects: Object.values(objects),
  apis: Object.values(apis),
  actions: Object.values(actions),
  dashboards: Object.values(dashboards),
  reports: Object.values(reports),
  flows: Object.values(flows) as any,
  agents: Object.values(agents) as any,
  ragPipelines: Object.values(ragPipelines),
  profiles: Object.values(profiles),
  apps: Object.values(apps),

  // Seed Data (top-level, registered as metadata)
  data: CrmSeedData,

  // Sharing & security (requires explicit wiring)
  sharingRules: [
    AccountTeamSharingRule,
    OpportunitySalesSharingRule,
    CaseEscalationSharingRule,
    ...TerritorySharingRules,
  ],
  roleHierarchy: RoleHierarchy,
  organizationDefaults: OrganizationDefaults,
} as any);
