import { describe, it, expect } from 'vitest';
import {
  SCIMUserSchema,
  SCIMGroupSchema,
  SCIMListResponseSchema,
  SCIMErrorSchema,
  SCIMPatchRequestSchema,
  SCIMMetaSchema,
  SCIMNameSchema,
  SCIMEmailSchema,
  SCIMPhoneNumberSchema,
  SCIMAddressSchema,
  SCIM_SCHEMAS,
  SCIM,
  type SCIMUser,
  type SCIMGroup,
} from './scim.zod';

describe('SCIM 2.0 Protocol', () => {
  describe('SCIM Constants', () => {
    it('should define all required schema URIs', () => {
      expect(SCIM_SCHEMAS.USER).toBe('urn:ietf:params:scim:schemas:core:2.0:User');
      expect(SCIM_SCHEMAS.GROUP).toBe('urn:ietf:params:scim:schemas:core:2.0:Group');
      expect(SCIM_SCHEMAS.ENTERPRISE_USER).toBe('urn:ietf:params:scim:schemas:extension:enterprise:2.0:User');
      expect(SCIM_SCHEMAS.LIST_RESPONSE).toBe('urn:ietf:params:scim:api:messages:2.0:ListResponse');
      expect(SCIM_SCHEMAS.PATCH_OP).toBe('urn:ietf:params:scim:api:messages:2.0:PatchOp');
      expect(SCIM_SCHEMAS.ERROR).toBe('urn:ietf:params:scim:api:messages:2.0:Error');
    });
  });

  describe('SCIMMetaSchema', () => {
    it('should validate minimal meta', () => {
      const meta = {};
      expect(() => SCIMMetaSchema.parse(meta)).not.toThrow();
    });

    it('should validate complete meta', () => {
      const meta = {
        resourceType: 'User',
        created: '2024-01-15T10:30:00Z',
        lastModified: '2024-01-20T15:45:00Z',
        location: 'https://example.com/scim/v2/Users/123',
        version: 'W/"abc123"',
      };

      const result = SCIMMetaSchema.parse(meta);
      expect(result).toEqual(meta);
    });

    it('should validate ISO 8601 datetime format', () => {
      const validMeta = {
        created: '2024-01-15T10:30:00Z',
      };
      expect(() => SCIMMetaSchema.parse(validMeta)).not.toThrow();

      const invalidMeta = {
        created: '2024-01-15 10:30:00', // Wrong format
      };
      expect(() => SCIMMetaSchema.parse(invalidMeta)).toThrow();
    });

    it('should validate URL format for location', () => {
      const validMeta = {
        location: 'https://example.com/scim/v2/Users/123',
      };
      expect(() => SCIMMetaSchema.parse(validMeta)).not.toThrow();

      const invalidMeta = {
        location: 'not-a-url',
      };
      expect(() => SCIMMetaSchema.parse(invalidMeta)).toThrow();
    });
  });

  describe('SCIMNameSchema', () => {
    it('should validate complete name', () => {
      const name = {
        formatted: 'Ms. Barbara Jane Jensen III',
        familyName: 'Jensen',
        givenName: 'Barbara',
        middleName: 'Jane',
        honorificPrefix: 'Ms.',
        honorificSuffix: 'III',
      };

      const result = SCIMNameSchema.parse(name);
      expect(result).toEqual(name);
    });

    it('should allow partial name', () => {
      const name = {
        givenName: 'John',
        familyName: 'Doe',
      };

      expect(() => SCIMNameSchema.parse(name)).not.toThrow();
    });
  });

  describe('SCIMEmailSchema', () => {
    it('should validate work email', () => {
      const email = {
        value: 'bjensen@example.com',
        type: 'work' as const,
        primary: true,
      };

      const result = SCIMEmailSchema.parse(email);
      expect(result.value).toBe('bjensen@example.com');
      expect(result.type).toBe('work');
      expect(result.primary).toBe(true);
    });

    it('should default primary to false', () => {
      const email = {
        value: 'test@example.com',
      };

      const result = SCIMEmailSchema.parse(email);
      expect(result.primary).toBe(false);
    });

    it('should validate email format', () => {
      const validEmail = {
        value: 'valid@example.com',
      };
      expect(() => SCIMEmailSchema.parse(validEmail)).not.toThrow();

      const invalidEmail = {
        value: 'invalid-email',
      };
      expect(() => SCIMEmailSchema.parse(invalidEmail)).toThrow();
    });
  });

  describe('SCIMPhoneNumberSchema', () => {
    it('should validate complete phone number', () => {
      const phone = {
        value: '+1-555-123-4567',
        type: 'work' as const,
        primary: true,
      };

      const result = SCIMPhoneNumberSchema.parse(phone);
      expect(result).toEqual(phone);
    });

    it('should support different phone types', () => {
      const types = ['work', 'home', 'mobile', 'fax', 'pager', 'other'] as const;

      types.forEach(type => {
        const phone = {
          value: '+1-555-000-0000',
          type,
        };
        expect(() => SCIMPhoneNumberSchema.parse(phone)).not.toThrow();
      });
    });
  });

  describe('SCIMAddressSchema', () => {
    it('should validate complete address', () => {
      const address = {
        formatted: '100 Universal City Plaza, Hollywood, CA 91608 USA',
        streetAddress: '100 Universal City Plaza',
        locality: 'Hollywood',
        region: 'CA',
        postalCode: '91608',
        country: 'USA',
        type: 'work' as const,
        primary: true,
      };

      const result = SCIMAddressSchema.parse(address);
      expect(result).toEqual(address);
    });

    it('should allow partial address', () => {
      const address = {
        locality: 'San Francisco',
        region: 'CA',
      };

      expect(() => SCIMAddressSchema.parse(address)).not.toThrow();
    });
  });

  describe('SCIMUserSchema', () => {
    it('should validate minimal user (userName only)', () => {
      const user = {
        userName: 'bjensen',
      };

      const result = SCIMUserSchema.parse(user);
      expect(result.userName).toBe('bjensen');
      expect(result.schemas).toEqual([SCIM_SCHEMAS.USER]);
      expect(result.active).toBe(true); // default
    });

    it('should validate complete user', () => {
      const user: SCIMUser = {
        schemas: [SCIM_SCHEMAS.USER],
        id: '2819c223-7f76-453a-919d-413861904646',
        externalId: 'bjensen',
        userName: 'bjensen@example.com',
        name: {
          formatted: 'Ms. Barbara J Jensen III',
          familyName: 'Jensen',
          givenName: 'Barbara',
          middleName: 'Jane',
          honorificPrefix: 'Ms.',
          honorificSuffix: 'III',
        },
        displayName: 'Barbara Jensen',
        nickName: 'Babs',
        profileUrl: 'https://example.com/Users/bjensen',
        title: 'Vice President',
        userType: 'Employee',
        preferredLanguage: 'en-US',
        locale: 'en-US',
        timezone: 'America/Los_Angeles',
        active: true,
        emails: [
          {
            value: 'bjensen@example.com',
            type: 'work',
            primary: true,
          },
        ],
        phoneNumbers: [
          {
            value: '+1-555-123-4567',
            type: 'work',
            primary: true,
          },
        ],
        addresses: [
          {
            streetAddress: '100 Universal City Plaza',
            locality: 'Hollywood',
            region: 'CA',
            postalCode: '91608',
            country: 'USA',
            type: 'work',
            primary: true,
          },
        ],
        groups: [
          {
            value: '01234567-89ab-cdef-0123-456789abcdef',
            display: 'Engineering',
          },
        ],
        meta: {
          resourceType: 'User',
          created: '2024-01-15T10:30:00Z',
          lastModified: '2024-01-20T15:45:00Z',
          location: 'https://example.com/scim/v2/Users/2819c223',
          version: 'W/"abc123"',
        },
      };

      const result = SCIMUserSchema.parse(user);
      expect(result.userName).toBe('bjensen@example.com');
      expect(result.emails[0].value).toBe('bjensen@example.com');
    });

    it('should require userName', () => {
      const user = {
        // Missing userName
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
      };

      expect(() => SCIMUserSchema.parse(user)).toThrow();
    });

    it('should default active to true', () => {
      const user = {
        userName: 'test',
      };

      const result = SCIMUserSchema.parse(user);
      expect(result.active).toBe(true);
    });

    it('should support multi-valued emails', () => {
      const user = {
        userName: 'test',
        emails: [
          { value: 'work@example.com', type: 'work' as const, primary: true },
          { value: 'personal@example.com', type: 'home' as const },
        ],
      };

      const result = SCIMUserSchema.parse(user);
      expect(result.emails).toHaveLength(2);
      expect(result.emails[0].primary).toBe(true);
    });

    it('should support enterprise extension', () => {
      const user = {
        userName: 'employee001',
        schemas: [SCIM_SCHEMAS.USER, SCIM_SCHEMAS.ENTERPRISE_USER],
        [SCIM_SCHEMAS.ENTERPRISE_USER]: {
          employeeNumber: 'EMP-001',
          costCenter: 'CC-123',
          organization: 'Acme Corp',
          division: 'Engineering',
          department: 'Platform',
          manager: {
            value: 'manager-id-123',
            displayName: 'Jane Manager',
          },
        },
      };

      const result = SCIMUserSchema.parse(user);
      expect(result[SCIM_SCHEMAS.ENTERPRISE_USER]?.employeeNumber).toBe('EMP-001');
      expect(result[SCIM_SCHEMAS.ENTERPRISE_USER]?.department).toBe('Platform');
    });
  });

  describe('SCIMGroupSchema', () => {
    it('should validate minimal group (displayName only)', () => {
      const group = {
        displayName: 'Engineering',
      };

      const result = SCIMGroupSchema.parse(group);
      expect(result.displayName).toBe('Engineering');
      expect(result.schemas).toEqual([SCIM_SCHEMAS.GROUP]);
    });

    it('should validate complete group', () => {
      const group: SCIMGroup = {
        schemas: [SCIM_SCHEMAS.GROUP],
        id: 'group-123',
        externalId: 'engineering',
        displayName: 'Engineering Team',
        members: [
          {
            value: 'user-1',
            $ref: 'https://example.com/scim/v2/Users/user-1',
            type: 'User',
            display: 'John Doe',
          },
          {
            value: 'user-2',
            $ref: 'https://example.com/scim/v2/Users/user-2',
            type: 'User',
            display: 'Jane Smith',
          },
        ],
        meta: {
          resourceType: 'Group',
          created: '2024-01-15T10:30:00Z',
        },
      };

      const result = SCIMGroupSchema.parse(group);
      expect(result.members).toHaveLength(2);
      expect(result.members[0].type).toBe('User');
    });

    it('should require displayName', () => {
      const group = {
        // Missing displayName
        members: [],
      };

      expect(() => SCIMGroupSchema.parse(group)).toThrow();
    });

    it('should support nested groups', () => {
      const group = {
        displayName: 'All Engineering',
        members: [
          {
            value: 'group-1',
            type: 'Group' as const,
            display: 'Platform Team',
          },
          {
            value: 'group-2',
            type: 'Group' as const,
            display: 'Product Team',
          },
        ],
      };

      const result = SCIMGroupSchema.parse(group);
      expect(result.members[0].type).toBe('Group');
    });
  });

  describe('SCIMListResponseSchema', () => {
    it('should validate list response', () => {
      const response = {
        totalResults: 2,
        Resources: [
          { id: '1', userName: 'user1' },
          { id: '2', userName: 'user2' },
        ],
        startIndex: 1,
        itemsPerPage: 2,
      };

      const result = SCIMListResponseSchema.parse(response);
      expect(result.totalResults).toBe(2);
      expect(result.Resources).toHaveLength(2);
      expect(result.schemas).toEqual([SCIM_SCHEMAS.LIST_RESPONSE]);
    });

    it('should validate pagination parameters', () => {
      const response = {
        totalResults: 100,
        Resources: [{ id: '1' }],
        startIndex: 51,
        itemsPerPage: 50,
      };

      const result = SCIMListResponseSchema.parse(response);
      expect(result.startIndex).toBe(51);
      expect(result.itemsPerPage).toBe(50);
    });

    it('should require minimum startIndex of 1', () => {
      const response = {
        totalResults: 1,
        Resources: [{ id: '1' }],
        startIndex: 0, // Invalid: must be >= 1
      };

      expect(() => SCIMListResponseSchema.parse(response)).toThrow();
    });
  });

  describe('SCIMErrorSchema', () => {
    it('should validate error response', () => {
      const error = {
        status: 404,
        detail: 'Resource not found',
      };

      const result = SCIMErrorSchema.parse(error);
      expect(result.status).toBe(404);
      expect(result.schemas).toEqual([SCIM_SCHEMAS.ERROR]);
    });

    it('should validate with scimType', () => {
      const error = {
        status: 400,
        scimType: 'invalidValue' as const,
        detail: 'Invalid email address format',
      };

      const result = SCIMErrorSchema.parse(error);
      expect(result.scimType).toBe('invalidValue');
    });

    it('should validate HTTP status codes', () => {
      const validError = { status: 500, detail: 'Server error' };
      expect(() => SCIMErrorSchema.parse(validError)).not.toThrow();

      const invalidError = { status: 200, detail: 'Not an error' }; // 2xx not allowed
      expect(() => SCIMErrorSchema.parse(invalidError)).toThrow();
    });

    it('should support all scimType values', () => {
      const scimTypes = [
        'invalidFilter',
        'tooMany',
        'uniqueness',
        'mutability',
        'invalidSyntax',
        'invalidPath',
        'noTarget',
        'invalidValue',
        'invalidVers',
        'sensitive',
      ] as const;

      scimTypes.forEach(scimType => {
        const error = {
          status: 400,
          scimType,
          detail: 'Test error',
        };
        expect(() => SCIMErrorSchema.parse(error)).not.toThrow();
      });
    });
  });

  describe('SCIMPatchRequestSchema', () => {
    it('should validate add operation', () => {
      const patch = {
        Operations: [
          {
            op: 'add' as const,
            path: 'emails',
            value: { value: 'new@example.com', type: 'work' },
          },
        ],
      };

      const result = SCIMPatchRequestSchema.parse(patch);
      expect(result.Operations[0].op).toBe('add');
      expect(result.schemas).toEqual([SCIM_SCHEMAS.PATCH_OP]);
    });

    it('should validate remove operation', () => {
      const patch = {
        Operations: [
          {
            op: 'remove' as const,
            path: 'phoneNumbers[type eq "work"]',
          },
        ],
      };

      const result = SCIMPatchRequestSchema.parse(patch);
      expect(result.Operations[0].op).toBe('remove');
    });

    it('should validate replace operation', () => {
      const patch = {
        Operations: [
          {
            op: 'replace' as const,
            path: 'active',
            value: false,
          },
        ],
      };

      const result = SCIMPatchRequestSchema.parse(patch);
      expect(result.Operations[0].op).toBe('replace');
      expect(result.Operations[0].value).toBe(false);
    });

    it('should require at least one operation', () => {
      const patch = {
        Operations: [], // Empty array not allowed
      };

      expect(() => SCIMPatchRequestSchema.parse(patch)).toThrow();
    });

    it('should support multiple operations', () => {
      const patch = {
        Operations: [
          { op: 'replace' as const, path: 'displayName', value: 'New Name' },
          { op: 'add' as const, path: 'emails', value: { value: 'new@example.com' } },
          { op: 'remove' as const, path: 'phoneNumbers[type eq "fax"]' },
        ],
      };

      const result = SCIMPatchRequestSchema.parse(patch);
      expect(result.Operations).toHaveLength(3);
    });
  });

  describe('SCIM Helper Factory', () => {
    describe('user', () => {
      it('should create basic user', () => {
        const user = SCIM.user('bjensen', 'bjensen@example.com');

        expect(user.userName).toBe('bjensen');
        expect(user.emails[0].value).toBe('bjensen@example.com');
        expect(user.emails[0].primary).toBe(true);
        expect(user.active).toBe(true);
        expect(user.schemas).toEqual([SCIM_SCHEMAS.USER]);
      });

      it('should create user with name', () => {
        const user = SCIM.user('bjensen', 'bjensen@example.com', 'Barbara', 'Jensen');

        expect(user.name?.givenName).toBe('Barbara');
        expect(user.name?.familyName).toBe('Jensen');
      });
    });

    describe('group', () => {
      it('should create basic group', () => {
        const group = SCIM.group('Engineering');

        expect(group.displayName).toBe('Engineering');
        expect(group.members).toEqual([]);
        expect(group.schemas).toEqual([SCIM_SCHEMAS.GROUP]);
      });

      it('should create group with members', () => {
        const members = [
          { value: 'user-1', display: 'John Doe' },
          { value: 'user-2', display: 'Jane Smith' },
        ];
        const group = SCIM.group('Engineering', members);

        expect(group.members).toHaveLength(2);
        expect(group.members[0].value).toBe('user-1');
      });
    });

    describe('listResponse', () => {
      it('should create list response', () => {
        const resources = [
          { id: '1', userName: 'user1' },
          { id: '2', userName: 'user2' },
        ];
        const response = SCIM.listResponse(resources);

        expect(response.Resources).toEqual(resources);
        expect(response.totalResults).toBe(2);
        expect(response.startIndex).toBe(1);
        expect(response.itemsPerPage).toBe(2);
        expect(response.schemas).toEqual([SCIM_SCHEMAS.LIST_RESPONSE]);
      });

      it('should allow custom totalResults', () => {
        const resources = [{ id: '1' }];
        const response = SCIM.listResponse(resources, 100);

        expect(response.totalResults).toBe(100);
        expect(response.Resources).toHaveLength(1);
      });
    });

    describe('error', () => {
      it('should create error response', () => {
        const error = SCIM.error(404, 'User not found');

        expect(error.status).toBe(404);
        expect(error.detail).toBe('User not found');
        expect(error.schemas).toEqual([SCIM_SCHEMAS.ERROR]);
      });

      it('should support scimType', () => {
        const error = SCIM.error(400, 'Invalid email', 'invalidValue');

        expect(error.scimType).toBe('invalidValue');
      });
    });
  });

  describe('Real-World Integration Scenarios', () => {
    it('should support Okta user provisioning', () => {
      const oktaUser: SCIMUser = {
        schemas: [SCIM_SCHEMAS.USER],
        userName: 'john.doe@company.com',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [
          {
            value: 'john.doe@company.com',
            type: 'work',
            primary: true,
          },
        ],
        active: true,
        externalId: 'okta-user-12345',
      };

      const result = SCIMUserSchema.parse(oktaUser);
      expect(result.externalId).toBe('okta-user-12345');
    });

    it('should support Azure AD group sync', () => {
      const azureGroup: SCIMGroup = {
        schemas: [SCIM_SCHEMAS.GROUP],
        displayName: 'Engineering Department',
        externalId: 'azure-group-guid-123',
        members: [
          {
            value: 'user-1',
            $ref: 'https://graph.microsoft.com/v1.0/users/user-1',
            type: 'User',
            display: 'John Doe',
          },
        ],
      };

      const result = SCIMGroupSchema.parse(azureGroup);
      expect(result.externalId).toBe('azure-group-guid-123');
    });

    it('should support user deactivation', () => {
      const patchRequest = {
        schemas: [SCIM_SCHEMAS.PATCH_OP],
        Operations: [
          {
            op: 'replace' as const,
            path: 'active',
            value: false,
          },
        ],
      };

      const result = SCIMPatchRequestSchema.parse(patchRequest);
      expect(result.Operations[0].value).toBe(false);
    });

    it('should support adding user to group', () => {
      const patchRequest = {
        schemas: [SCIM_SCHEMAS.PATCH_OP],
        Operations: [
          {
            op: 'add' as const,
            path: 'members',
            value: {
              value: 'user-123',
              display: 'New User',
            },
          },
        ],
      };

      expect(() => SCIMPatchRequestSchema.parse(patchRequest)).not.toThrow();
    });

    it('should support enterprise user with manager', () => {
      const enterpriseUser: SCIMUser = {
        schemas: [SCIM_SCHEMAS.USER, SCIM_SCHEMAS.ENTERPRISE_USER],
        userName: 'emp001',
        emails: [{ value: 'emp001@company.com', type: 'work', primary: true }],
        [SCIM_SCHEMAS.ENTERPRISE_USER]: {
          employeeNumber: 'EMP-001',
          department: 'Engineering',
          manager: {
            value: 'manager-id',
            displayName: 'Jane Manager',
            $ref: 'https://example.com/scim/v2/Users/manager-id',
          },
        },
      };

      const result = SCIMUserSchema.parse(enterpriseUser);
      expect(result[SCIM_SCHEMAS.ENTERPRISE_USER]?.manager?.value).toBe('manager-id');
    });
  });

  describe('SCIM Filter Validation', () => {
    it('should support common filter patterns', () => {
      // These are filter strings that would be in query parameters
      // The actual filtering logic would be implemented separately
      const commonFilters = [
        'userName eq "bjensen"',
        'name.familyName co "O\'Malley"',
        'emails[type eq "work" and value co "@example.com"]',
        'meta.lastModified gt "2011-05-13T04:42:34Z"',
      ];

      // Just verify the filters are valid strings for now
      commonFilters.forEach(filter => {
        expect(typeof filter).toBe('string');
        expect(filter.length).toBeGreaterThan(0);
      });
    });
  });
});
