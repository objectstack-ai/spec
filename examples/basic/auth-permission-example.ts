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

import type { Auth, Permission } from '@objectstack/spec';

/**
 * Example 1: User Identity
 * 
 * User accounts with authentication methods
 */
export const sampleUsers: Auth.User[] = [
  {
    id: 'user_001',
    email: 'admin@example.com',
    name: 'Admin User',
    emailVerified: true,
    image: 'https://example.com/avatars/admin.jpg',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-29T10:30:00Z'),
  },
  {
    id: 'user_002',
    email: 'sales@example.com',
    name: 'Sales Manager',
    emailVerified: true,
    image: 'https://example.com/avatars/sales.jpg',
    createdAt: new Date('2024-01-05T00:00:00Z'),
    updatedAt: new Date('2024-01-29T09:15:00Z'),
  },
  {
    id: 'user_003',
    email: 'rep@example.com',
    name: 'Sales Rep',
    emailVerified: true,
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-29T08:45:00Z'),
  },
];

/**
 * Example 2: Role Hierarchy
 * 
 * Organizational role structure with inheritance
 * Note: Roles define reporting structure and hierarchy, not permissions.
 * Permissions are defined separately in PermissionSets.
 */
export const roleHierarchy: Auth.Role[] = [
  // Top-level admin role
  {
    name: 'system_administrator',
    label: 'System Administrator',
    description: 'Top-level system administrator',
    // No parent = top of hierarchy
    parent: undefined,
  },

  // Sales hierarchy
  {
    name: 'sales_manager',
    label: 'Sales Manager',
    description: 'Manages sales team and data',
    parent: 'system_administrator',
  },
  {
    name: 'sales_rep',
    label: 'Sales Representative',
    description: 'Standard sales user',
    parent: 'sales_manager', // Inherits from manager
  },
];

/**
 * Example 3: Permission Sets
 * 
 * Granular object-level permissions
 */
export const permissionSets: Permission.PermissionSet[] = [
  {
    name: 'sales_user_permissions',
    label: 'Sales User Permissions',
    isProfile: false,

    // Object permissions (record of ObjectPermission)
    objects: {
      account: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: false,
        allowTransfer: false,
        allowRestore: false,
        allowPurge: false,
        viewAllRecords: false,
        modifyAllRecords: false,
      },
      contact: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: false,
        allowTransfer: false,
        allowRestore: false,
        allowPurge: false,
        viewAllRecords: false,
        modifyAllRecords: false,
      },
      opportunity: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: false,
        allowTransfer: false,
        allowRestore: false,
        allowPurge: false,
        viewAllRecords: false,
        modifyAllRecords: false,
      },
      lead: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: true, // Can delete own leads
        allowTransfer: false,
        allowRestore: false,
        allowPurge: false,
        viewAllRecords: false,
        modifyAllRecords: false,
      },
    },

    // Field-level permissions (Field-Level Security, record of FieldPermission)
    fields: {
      'account.annual_revenue': {
        readable: true,
        editable: false, // Can see but not edit revenue
      },
      'opportunity.probability': {
        readable: true,
        editable: false, // Calculated field, read-only
      },
    },
  },

  {
    name: 'sales_manager_permissions',
    label: 'Sales Manager Permissions',
    isProfile: false,

    // Object permissions (record of ObjectPermission)
    objects: {
      account: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: true,
        allowTransfer: true,
        allowRestore: true,
        allowPurge: false,
        viewAllRecords: true, // Can view all accounts
        modifyAllRecords: true, // Can modify all accounts
      },
      opportunity: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: true,
        allowTransfer: true,
        allowRestore: true,
        allowPurge: false,
        viewAllRecords: true,
        modifyAllRecords: true,
      },
      forecast: {
        allowCreate: true,
        allowRead: true,
        allowEdit: true,
        allowDelete: true,
        allowTransfer: false,
        allowRestore: false,
        allowPurge: false,
        viewAllRecords: true,
        modifyAllRecords: true,
      },
    },

    // Field-level permissions (Field-Level Security, record of FieldPermission)
    fields: {
      'account.annual_revenue': {
        readable: true,
        editable: true, // Managers can edit revenue
      },
      'opportunity.discount_percent': {
        readable: true,
        editable: true, // Managers can approve discounts
      },
    },
  },
];

/**
 * Example 4: Row-Level Security (RLS)
 * 
 * Fine-grained data access control based on record ownership
 */
export const rowLevelSecurityRules: Permission.RowLevelSecurityPolicy[] = [
  {
    name: 'opportunity_owner_access',
    label: 'Opportunity Owner Access',
    object: 'opportunity',
    description: 'Users can only access their own opportunities',
    operation: 'select',
    priority: 100,
    
    // USING clause - Filter condition
    using: `owner_id = current_user.id OR territory IN (SELECT id FROM territories WHERE user_id = current_user.id) OR owner_manager_id = current_user.id`,
    
    // Apply to these roles
    roles: ['sales_rep'],
    enabled: true,
  },

  {
    name: 'account_territory_access',
    label: 'Account Territory Access',
    object: 'account',
    description: 'Territory-based account access',
    operation: 'select',
    priority: 100,
    
    using: `territory IN (SELECT id FROM territories WHERE user_id = current_user.id) AND status = 'active'`,
    
    roles: ['sales_rep'],
    enabled: true,
  },
];

/**
 * Example 5: Sharing Rules
 * 
 * Grant additional access beyond RLS
 */
export const sharingRules: Permission.SharingRule[] = [
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
export const territories: Permission.Territory[] = [
  {
    name: 'north_america',
    label: 'North America',
    modelId: 'global_sales_territories',
    type: 'geography',
    
    // Territory assignment rule
    assignmentRule: `billing_country IN ('USA', 'Canada', 'Mexico')`,
    
    // Assigned users
    assignedUsers: ['user_002', 'user_003'],
    
    // Access levels
    accountAccess: 'edit',
    opportunityAccess: 'edit',
    caseAccess: 'read',
  },

  {
    name: 'west_coast',
    label: 'West Coast',
    modelId: 'global_sales_territories',
    type: 'geography',
    parent: 'north_america',
    
    assignmentRule: `billing_country = 'USA' AND billing_state IN ('CA', 'OR', 'WA', 'NV', 'AZ')`,
    
    assignedUsers: ['user_003'],
    
    accountAccess: 'edit',
    opportunityAccess: 'edit',
    caseAccess: 'read',
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
    user: Auth.User,
    object: string,
    operation: 'create' | 'read' | 'update' | 'delete'
  ): boolean {
    // Find permission sets (example implementation uses all permission sets)
    const userPermissionSets = permissionSets;

    // Map operation to permission field
    const operationMap = {
      create: 'allowCreate',
      read: 'allowRead',
      update: 'allowEdit',
      delete: 'allowDelete',
    } as const;

    // Check object permissions
    for (const permSet of userPermissionSets) {
      const objPerm = permSet.objects[object];
      if (objPerm && objPerm[operationMap[operation]]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user can access a specific record (RLS)
   */
  canAccessRecord(user: Auth.User & { roles?: string[] }, object: string, record: any): boolean {
    // Apply RLS rules for user's roles
    const userRoles = user.roles || [];
    const applicableRules = rowLevelSecurityRules.filter(
      (rls) => rls.object === object && rls.roles?.some((r: string) => userRoles.includes(r))
    );

    // If no RLS rules, check base permissions
    if (applicableRules.length === 0) {
      return this.hasObjectPermission(user, object, 'read');
    }

    // Evaluate RLS rules
    for (const rule of applicableRules) {
      if (this.evaluateRule(rule.using, record, user)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate a rule against a record
   */
  private evaluateRule(rule: any, record: any, user: Auth.User & { roles?: string[] }): boolean {
    // Simplified evaluation logic
    // In real implementation, evaluate all conditions with operators
    return true;
  }
}

/**
 * Example 8: Usage Demonstration
 */
export function demonstratePermissions() {
  const user = { ...sampleUsers[2], roles: ['sales_rep'] }; // Sales Rep with role
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

// Run demonstration (uncomment to run)
// demonstratePermissions();

// Export all examples
export default {
  sampleUsers,
  roleHierarchy,
  permissionSets,
  rowLevelSecurityRules,
  sharingRules,
  territories,
};
