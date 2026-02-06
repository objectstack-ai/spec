/**
 * Organization-Wide Defaults (OWD)
 * Define the baseline access level for each object.
 */
export const OrganizationDefaults = {
  lead:        { internalAccess: 'private',              externalAccess: 'private' },
  account:     { internalAccess: 'private',              externalAccess: 'private' },
  contact:     { internalAccess: 'controlled_by_parent', externalAccess: 'private' },
  opportunity: { internalAccess: 'private',              externalAccess: 'private' },
  case:        { internalAccess: 'private',              externalAccess: 'private' },
  campaign:    { internalAccess: 'public_read_only',     externalAccess: 'private' },
  product:     { internalAccess: 'public_read_only',     externalAccess: 'private' },
  task:        { internalAccess: 'private',              externalAccess: 'private' },
};
