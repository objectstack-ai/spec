import { describe, it, expect } from 'vitest';
import {
  OrganizationSchema,
  MemberSchema,
  InvitationSchema,
  InvitationStatus,
  type Organization,
  type Member,
  type Invitation,
} from "./organization.zod";

describe('OrganizationSchema', () => {
  it('should accept valid organization data', () => {
    const org: Organization = {
      id: 'org_123',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      logo: 'https://example.com/logo.png',
      metadata: {
        industry: 'Technology',
        size: 'Enterprise',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => OrganizationSchema.parse(org)).not.toThrow();
  });

  it('should accept minimal organization data', () => {
    const org = {
      id: 'org_123',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => OrganizationSchema.parse(org)).not.toThrow();
  });

  it('should validate slug format', () => {
    const validSlugs = [
      'acme-corp',
      'my_organization',
      'test123',
      'org-123',
      'my_org-123',
    ];

    validSlugs.forEach((slug) => {
      const org = {
        id: 'org_123',
        name: 'Test Org',
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => OrganizationSchema.parse(org)).not.toThrow();
    });
  });

  it('should reject invalid slug format', () => {
    const invalidSlugs = [
      'Acme Corp', // spaces and uppercase
      'acme.corp', // dots
      'acme@corp', // special characters
      'ACME', // uppercase
      'acme corp', // spaces
    ];

    invalidSlugs.forEach((slug) => {
      const org = {
        id: 'org_123',
        name: 'Test Org',
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => OrganizationSchema.parse(org)).toThrow();
    });
  });

  it('should validate logo URL format', () => {
    const org = {
      id: 'org_123',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      logo: 'not-a-url',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => OrganizationSchema.parse(org)).toThrow();
  });

  it('should accept organization with metadata', () => {
    const org = {
      id: 'org_123',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      metadata: {
        industry: 'Technology',
        size: 'Enterprise',
        customField: 'Custom Value',
        nested: {
          key: 'value',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => OrganizationSchema.parse(org)).not.toThrow();
  });
});

describe('MemberSchema', () => {
  it('should accept valid member data', () => {
    const member: Member = {
      id: 'member_123',
      organizationId: 'org_123',
      userId: 'user_123',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => MemberSchema.parse(member)).not.toThrow();
  });

  it('should accept different role types', () => {
    const roles = ['owner', 'admin', 'member', 'guest', 'viewer', 'editor'];

    roles.forEach((role) => {
      const member = {
        id: 'member_123',
        organizationId: 'org_123',
        userId: 'user_123',
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => MemberSchema.parse(member)).not.toThrow();
    });
  });

  it('should require all mandatory fields', () => {
    const incompleteMember = {
      id: 'member_123',
      organizationId: 'org_123',
      // missing userId and role
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => MemberSchema.parse(incompleteMember)).toThrow();
  });
});

describe('InvitationStatus', () => {
  it('should accept valid invitation statuses', () => {
    const statuses = ['pending', 'accepted', 'rejected', 'expired'];

    statuses.forEach((status) => {
      expect(() => InvitationStatus.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => InvitationStatus.parse('invalid')).toThrow();
  });
});

describe('InvitationSchema', () => {
  it('should accept valid invitation data', () => {
    const invitation: Invitation = {
      id: 'invite_123',
      organizationId: 'org_123',
      email: 'newuser@example.com',
      role: 'member',
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      inviterId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => InvitationSchema.parse(invitation)).not.toThrow();
  });

  it('should use default status of pending', () => {
    const invitation = {
      id: 'invite_123',
      organizationId: 'org_123',
      email: 'newuser@example.com',
      role: 'member',
      expiresAt: new Date().toISOString(),
      inviterId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = InvitationSchema.parse(invitation);
    expect(result.status).toBe('pending');
  });

  it('should accept all valid statuses', () => {
    const statuses: Array<'pending' | 'accepted' | 'rejected' | 'expired'> = [
      'pending',
      'accepted',
      'rejected',
      'expired',
    ];

    statuses.forEach((status) => {
      const invitation = {
        id: 'invite_123',
        organizationId: 'org_123',
        email: 'newuser@example.com',
        role: 'member',
        status,
        expiresAt: new Date().toISOString(),
        inviterId: 'user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => InvitationSchema.parse(invitation)).not.toThrow();
    });
  });

  it('should validate email format', () => {
    const invitation = {
      id: 'invite_123',
      organizationId: 'org_123',
      email: 'invalid-email',
      role: 'member',
      expiresAt: new Date().toISOString(),
      inviterId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => InvitationSchema.parse(invitation)).toThrow();
  });

  it('should accept different role types', () => {
    const roles = ['admin', 'member', 'guest', 'viewer', 'editor'];

    roles.forEach((role) => {
      const invitation = {
        id: 'invite_123',
        organizationId: 'org_123',
        email: 'newuser@example.com',
        role,
        expiresAt: new Date().toISOString(),
        inviterId: 'user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => InvitationSchema.parse(invitation)).not.toThrow();
    });
  });

  it('should require all mandatory fields', () => {
    const incompleteInvitation = {
      id: 'invite_123',
      organizationId: 'org_123',
      // missing email, role, expiresAt, inviterId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => InvitationSchema.parse(incompleteInvitation)).toThrow();
  });
});

describe('Type inference', () => {
  it('should correctly infer Organization type', () => {
    const org: Organization = {
      id: 'org_123',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(org.id).toBe('org_123');
    expect(org.name).toBe('Acme Corporation');
    expect(org.slug).toBe('acme-corp');
  });

  it('should correctly infer Member type', () => {
    const member: Member = {
      id: 'member_123',
      organizationId: 'org_123',
      userId: 'user_123',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(member.role).toBe('admin');
    expect(member.organizationId).toBe('org_123');
  });

  it('should correctly infer Invitation type', () => {
    const invitation: Invitation = {
      id: 'invite_123',
      organizationId: 'org_123',
      email: 'newuser@example.com',
      role: 'member',
      status: 'pending',
      expiresAt: new Date().toISOString(),
      inviterId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(invitation.email).toBe('newuser@example.com');
    expect(invitation.status).toBe('pending');
  });
});
