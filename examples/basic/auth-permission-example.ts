/**
 * Example: Auth & Permission Protocols
 * 
 * This example demonstrates authentication, authorization, and permission systems in ObjectStack.
 * It covers:
 * - User identity and sessions
 * - Role-based access control (RBAC)
 * - Row-level security (RLS)
 * - Field-level security (FLS)
 * - Sharing and territory management
 */

import type {
  User,
  Role,
  PermissionSet,
  RowLevelSecurity,
  SharingRule,
  Territory,
} from '@objectstack/spec';

/**
 * Example 1: User Identity
 * 
 * User accounts with authentication methods
 */
export const sampleUsers: User[] = [
  {
    id: 'user_001',
    email: 'admin@example.com',
    name: 'Admin User',
    
    // Authentication
    authProvider: 'local',
    emailVerified: true,
    
    // Profile
    avatar: 'https://example.com/avatars/admin.jpg',
    timezone: 'America/New_York',
    locale: 'en-US',
    
    // Status
    active: true,
    lastLogin: '2024-01-29T10:30:00Z',
    
    // Roles
    roles: ['system_administrator'],
  },
  {
    id: 'user_002',
    email: 'sales@example.com',
    name: 'Sales Manager',
    
    authProvider: 'oauth2',
    emailVerified: true,
    
    avatar: 'https://example.com/avatars/sales.jpg',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    
    active: true,
    lastLogin: '2024-01-29T09:15:00Z',
    
    roles: ['sales_manager'],
  },
  {
    id: 'user_003',
    email: 'rep@example.com',
    name: 'Sales Rep',
    
    authProvider: 'oauth2',
    emailVerified: true,
    
    timezone: 'America/Chicago',
    locale: 'en-US',
    
    active: true,
    lastLogin: '2024-01-29T08:45:00Z',
    
    roles: ['sales_rep'],
  },
];

/**
 * Example 2: Role Hierarchy
 * 
 * Organizational role structure with inheritance
 */
export const roleHierarchy: Role[] = [
  // Top-level admin role
  {
    name: 'system_administrator',
    label: 'System Administrator',
    description: 'Full system access',
    
    // No parent = top of hierarchy
    parentRole: undefined,
    
    // Full permissions
    permissions: {
      manageUsers: true,
      manageRoles: true,
      manageObjects: true,
      manageSystem: true,
      viewAllData: true,
      modifyAllData: true,
    },
  },

  // Sales hierarchy
  {
    name: 'sales_manager',
    label: 'Sales Manager',
    description: 'Manages sales team and data',
    
    parentRole: 'system_administrator',
    
    permissions: {
      manageUsers: false,
      manageRoles: false,
      manageObjects: false,
      manageSystem: false,
      viewAllData: true, // Can view all sales data
      modifyAllData: true, // Can modify all sales data
    },
  },
  {
    name: 'sales_rep',
    label: 'Sales Representative',
    description: 'Standard sales user',
    
    parentRole: 'sales_manager', // Inherits from manager
    
    permissions: {
      manageUsers: false,
      manageRoles: false,
      manageObjects: false,
      manageSystem: false,
      viewAllData: false, // Can only view own data
      modifyAllData: false, // Can only modify own data
    },
  },
];

/**
 * Example 3: Permission Sets
 * 
 * Granular object-level permissions
 */
export const permissionSets: PermissionSet[] = [
  {
    name: 'sales_user_permissions',
    label: 'Sales User Permissions',
    description: 'Standard permissions for sales users',
    
    // Object permissions
    objectPermissions: [
      {
        object: 'account',
        create: true,
        read: true,
        update: true,
        delete: false,
        viewAll: false,
        modifyAll: false,
      },
      {
        object: 'contact',
        create: true,
        read: true,
        update: true,
        delete: false,
        viewAll: false,
        modifyAll: false,
      },
      {
        object: 'opportunity',
        create: true,
        read: true,
        update: true,
        delete: false,
        viewAll: false,
        modifyAll: false,
      },
      {
        object: 'lead',
        create: true,
        read: true,
        update: true,
        delete: true, // Can delete own leads
        viewAll: false,
        modifyAll: false,
      },
    ],
    
    // Field-level permissions (Field-Level Security)
    fieldPermissions: [
      {
        object: 'account',
        field: 'annual_revenue',
        read: true,
        update: false, // Can see but not edit revenue
      },
      {
        object: 'opportunity',
        field: 'probability',
        read: true,
        update: false, // Calculated field, read-only
      },
    ],
  },

  {
    name: 'sales_manager_permissions',
    label: 'Sales Manager Permissions',
    description: 'Extended permissions for sales managers',
    
    objectPermissions: [
      {
        object: 'account',
        create: true,
        read: true,
        update: true,
        delete: true,
        viewAll: true, // Can view all accounts
        modifyAll: true, // Can modify all accounts
      },
      {
        object: 'opportunity',
        create: true,
        read: true,
        update: true,
        delete: true,
        viewAll: true,
        modifyAll: true,
      },
      {
        object: 'forecast',
        create: true,
        read: true,
        update: true,
        delete: true,
        viewAll: true,
        modifyAll: true,
      },
    ],
    
    fieldPermissions: [
      {
        object: 'account',
        field: 'annual_revenue',
        read: true,
        update: true, // Managers can edit revenue
      },
      {
        object: 'opportunity',
        field: 'discount_percent',
        read: true,
        update: true, // Managers can approve discounts
      },
    ],
  },
];

/**
 * Example 4: Row-Level Security (RLS)
 * 
 * Fine-grained data access control based on record ownership
 */
export const rowLevelSecurityRules: RowLevelSecurity[] = [
  {
    name: 'opportunity_owner_access',
    object: 'opportunity',
    description: 'Users can only access their own opportunities',
    
    // Rule definition
    rule: {
      operator: 'OR',
      conditions: [
        // Can access if owner
        {
          field: 'owner',
          operator: 'equals',
          value: '$CurrentUser.id',
        },
        // Can access if in their territory
        {
          field: 'territory',
          operator: 'in',
          value: '$CurrentUser.territories',
        },
        // Managers can access team records
        {
          field: 'owner.manager',
          operator: 'equals',
          value: '$CurrentUser.id',
        },
      ],
    },
    
    // Apply to these roles
    roles: ['sales_rep'],
    
    // Operations affected
    operations: ['read', 'update', 'delete'],
  },

  {
    name: 'account_territory_access',
    object: 'account',
    description: 'Territory-based account access',
    
    rule: {
      operator: 'AND',
      conditions: [
        {
          field: 'territory',
          operator: 'in',
          value: '$CurrentUser.territories',
        },
        {
          field: 'active',
          operator: 'equals',
          value: true,
        },
      ],
    },
    
    roles: ['sales_rep'],
    operations: ['read', 'update'],
  },
];

/**
 * Example 5: Sharing Rules
 * 
 * Grant additional access beyond RLS
 */
export const sharingRules: SharingRule[] = [
  {
    name: 'share_opportunities_with_team',
    object: 'opportunity',
    description: 'Share opportunities with entire sales team for visibility',
    
    // Who gets access
    sharedWith: {
      type: 'role',
      roles: ['sales_rep', 'sales_manager'],
    },
    
    // What records to share
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'stage',
          operator: 'notEquals',
          value: 'closed_lost',
        },
        {
          field: 'confidential',
          operator: 'equals',
          value: false,
        },
      ],
    },
    
    // Access level granted
    accessLevel: 'read',
  },

  {
    name: 'share_accounts_with_partners',
    object: 'account',
    description: 'Share partner accounts with partner users',
    
    sharedWith: {
      type: 'role',
      roles: ['partner_user'],
    },
    
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'account_type',
          operator: 'equals',
          value: 'partner',
        },
        {
          field: 'partner_id',
          operator: 'equals',
          value: '$CurrentUser.partnerId',
        },
      ],
    },
    
    accessLevel: 'read',
  },
];

/**
 * Example 6: Territory Management
 * 
 * Geographic or organizational territory assignment
 */
export const territories: Territory[] = [
  {
    name: 'north_america',
    label: 'North America',
    description: 'North American sales territory',
    
    // Territory definition
    criteria: {
      operator: 'OR',
      conditions: [
        {
          field: 'billing_country',
          operator: 'in',
          value: ['USA', 'Canada', 'Mexico'],
        },
      ],
    },
    
    // Assigned users
    members: ['user_002', 'user_003'],
    
    // Parent territory (for hierarchy)
    parentTerritory: undefined,
  },

  {
    name: 'west_coast',
    label: 'West Coast',
    description: 'US West Coast territory',
    
    criteria: {
      operator: 'AND',
      conditions: [
        {
          field: 'billing_country',
          operator: 'equals',
          value: 'USA',
        },
        {
          field: 'billing_state',
          operator: 'in',
          value: ['CA', 'OR', 'WA', 'NV', 'AZ'],
        },
      ],
    },
    
    members: ['user_003'],
    parentTerritory: 'north_america',
  },
];

/**
 * Example 7: Permission Checking
 * 
 * Helper functions for checking permissions
 */
export class PermissionChecker {
  /**
   * Check if user has object permission
   */
  hasObjectPermission(
    user: User,
    object: string,
    operation: 'create' | 'read' | 'update' | 'delete'
  ): boolean {
    // Get user's roles
    const userRoles = user.roles || [];

    // Find permission sets for user's roles
    const userPermissionSets = permissionSets.filter((ps) =>
      // In real implementation, map roles to permission sets
      true
    );

    // Check object permissions
    for (const permSet of userPermissionSets) {
      const objPerm = permSet.objectPermissions?.find((op) => op.object === object);
      if (objPerm && objPerm[operation]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user can access a specific record (RLS)
   */
  canAccessRecord(user: User, object: string, record: any): boolean {
    // Apply RLS rules for user's roles
    const userRoles = user.roles || [];
    const applicableRules = rowLevelSecurityRules.filter(
      (rls) => rls.object === object && rls.roles?.some((r) => userRoles.includes(r))
    );

    // If no RLS rules, check base permissions
    if (applicableRules.length === 0) {
      return this.hasObjectPermission(user, object, 'read');
    }

    // Evaluate RLS rules
    for (const rule of applicableRules) {
      if (this.evaluateRule(rule.rule, record, user)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate a rule against a record
   */
  private evaluateRule(rule: any, record: any, user: User): boolean {
    // Simplified evaluation logic
    // In real implementation, evaluate all conditions with operators
    return true;
  }
}

/**
 * Example 8: Usage Demonstration
 */
export function demonstratePermissions() {
  const user = sampleUsers[2]; // Sales Rep
  const checker = new PermissionChecker();

  console.log('=== Permission Check Demo ===\n');
  console.log(`User: ${user.name} (${user.roles?.join(', ')})\n`);

  // Check object permissions
  console.log('Object Permissions:');
  console.log('- Can create Account:', checker.hasObjectPermission(user, 'account', 'create'));
  console.log('- Can delete Account:', checker.hasObjectPermission(user, 'account', 'delete'));
  console.log('- Can update Opportunity:', checker.hasObjectPermission(user, 'opportunity', 'update'));
  console.log('');

  // Check record access
  const opportunity = {
    id: 'opp_001',
    owner: 'user_003',
    territory: 'west_coast',
  };
  
  console.log('Record Access (RLS):');
  console.log('- Can access own opportunity:', checker.canAccessRecord(user, 'opportunity', opportunity));
}

// Run demonstration
demonstratePermissions();

// Export all examples
export default {
  sampleUsers,
  roleHierarchy,
  permissionSets,
  rowLevelSecurityRules,
  sharingRules,
  territories,
};
