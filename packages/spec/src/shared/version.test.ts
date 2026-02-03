import { describe, it, expect } from 'vitest';
import {
  SemanticVersionSchema,
  VersionRangeSchema,
  VersionConstraintSchema,
  ReleaseChannelSchema,
  VersionMetadataSchema,
} from './version.zod';

describe('Version Schemas', () => {
  describe('SemanticVersionSchema', () => {
    describe('Valid versions', () => {
      it('should accept basic semantic versions', () => {
        expect(() => SemanticVersionSchema.parse('0.0.0')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('0.1.0')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('0.0.1')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('10.20.30')).not.toThrow();
      });

      it('should accept versions with prerelease', () => {
        expect(() => SemanticVersionSchema.parse('1.0.0-alpha')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-alpha.1')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-beta.2')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-rc.1')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-0.3.7')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-x.7.z.92')).not.toThrow();
      });

      it('should accept versions with build metadata', () => {
        expect(() => SemanticVersionSchema.parse('1.0.0+20130313144700')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0+exp.sha.5114f85')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0+21AF26D3-117B344092BD')).not.toThrow();
      });

      it('should accept versions with prerelease and build metadata', () => {
        expect(() => SemanticVersionSchema.parse('1.0.0-alpha+001')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-beta+exp.sha.5114f85')).not.toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.0-rc.1+build.123')).not.toThrow();
      });

      it('should accept large version numbers', () => {
        expect(() => SemanticVersionSchema.parse('999.999.999')).not.toThrow();
      });
    });

    describe('Invalid versions', () => {
      it('should reject versions missing components', () => {
        expect(() => SemanticVersionSchema.parse('1')).toThrow();
        expect(() => SemanticVersionSchema.parse('1.0')).toThrow();
      });

      it('should reject versions with v prefix', () => {
        expect(() => SemanticVersionSchema.parse('v1.0.0')).toThrow();
        expect(() => SemanticVersionSchema.parse('V1.0.0')).toThrow();
      });

      it('should reject versions with leading zeros', () => {
        expect(() => SemanticVersionSchema.parse('01.0.0')).toThrow();
        expect(() => SemanticVersionSchema.parse('1.01.0')).toThrow();
        expect(() => SemanticVersionSchema.parse('1.0.01')).toThrow();
      });

      it('should reject versions with trailing dots', () => {
        expect(() => SemanticVersionSchema.parse('1.0.0.')).toThrow();
      });

      it('should reject non-numeric versions', () => {
        expect(() => SemanticVersionSchema.parse('a.b.c')).toThrow();
        expect(() => SemanticVersionSchema.parse('1.a.0')).toThrow();
      });

      it('should reject empty or invalid strings', () => {
        expect(() => SemanticVersionSchema.parse('')).toThrow();
        expect(() => SemanticVersionSchema.parse('invalid')).toThrow();
      });
    });
  });

  describe('VersionRangeSchema', () => {
    it('should accept exact versions', () => {
      expect(() => VersionRangeSchema.parse('1.0.0')).not.toThrow();
    });

    it('should accept caret ranges', () => {
      expect(() => VersionRangeSchema.parse('^1.0.0')).not.toThrow();
      expect(() => VersionRangeSchema.parse('^0.2.3')).not.toThrow();
    });

    it('should accept tilde ranges', () => {
      expect(() => VersionRangeSchema.parse('~1.0.0')).not.toThrow();
      expect(() => VersionRangeSchema.parse('~1.2')).not.toThrow();
    });

    it('should accept comparison operators', () => {
      expect(() => VersionRangeSchema.parse('>=1.0.0')).not.toThrow();
      expect(() => VersionRangeSchema.parse('>1.0.0')).not.toThrow();
      expect(() => VersionRangeSchema.parse('<=2.0.0')).not.toThrow();
      expect(() => VersionRangeSchema.parse('<2.0.0')).not.toThrow();
    });

    it('should accept wildcards', () => {
      expect(() => VersionRangeSchema.parse('*')).not.toThrow();
      expect(() => VersionRangeSchema.parse('1.x')).not.toThrow();
      expect(() => VersionRangeSchema.parse('1.0.*')).not.toThrow();
    });

    it('should accept range expressions', () => {
      expect(() => VersionRangeSchema.parse('>=1.0.0 <2.0.0')).not.toThrow();
      expect(() => VersionRangeSchema.parse('1.0.0 - 2.0.0')).not.toThrow();
    });

    it('should reject empty strings', () => {
      expect(() => VersionRangeSchema.parse('')).toThrow();
    });
  });

  describe('VersionConstraintSchema', () => {
    it('should accept valid constraints', () => {
      const constraint1 = VersionConstraintSchema.parse({
        operator: '>=',
        version: '1.0.0',
      });
      expect(constraint1.operator).toBe('>=');
      expect(constraint1.version).toBe('1.0.0');

      const constraint2 = VersionConstraintSchema.parse({
        operator: '^',
        version: '2.1.0',
      });
      expect(constraint2.operator).toBe('^');
      expect(constraint2.version).toBe('2.1.0');
    });

    it('should accept all valid operators', () => {
      const operators = ['=', '>', '>=', '<', '<=', '^', '~'];
      operators.forEach((op) => {
        expect(() =>
          VersionConstraintSchema.parse({
            operator: op,
            version: '1.0.0',
          })
        ).not.toThrow();
      });
    });

    it('should reject invalid operators', () => {
      expect(() =>
        VersionConstraintSchema.parse({
          operator: '!=',
          version: '1.0.0',
        })
      ).toThrow();
    });

    it('should reject invalid versions', () => {
      expect(() =>
        VersionConstraintSchema.parse({
          operator: '>=',
          version: 'invalid',
        })
      ).toThrow();
    });
  });

  describe('ReleaseChannelSchema', () => {
    it('should accept all valid channels', () => {
      const channels = ['stable', 'beta', 'alpha', 'nightly', 'canary'];
      channels.forEach((channel) => {
        expect(() => ReleaseChannelSchema.parse(channel)).not.toThrow();
      });
    });

    it('should reject invalid channels', () => {
      expect(() => ReleaseChannelSchema.parse('production')).toThrow();
      expect(() => ReleaseChannelSchema.parse('dev')).toThrow();
      expect(() => ReleaseChannelSchema.parse('test')).toThrow();
    });
  });

  describe('VersionMetadataSchema', () => {
    it('should accept minimal version metadata', () => {
      const metadata = VersionMetadataSchema.parse({
        version: '1.0.0',
      });
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.channel).toBe('stable'); // default
    });

    it('should accept complete version metadata', () => {
      const metadata = VersionMetadataSchema.parse({
        version: '1.2.3',
        channel: 'beta',
        buildNumber: '12345',
        gitCommit: 'a1b2c3d4e5f',
        publishedAt: '2024-01-15T10:30:00Z',
      });

      expect(metadata.version).toBe('1.2.3');
      expect(metadata.channel).toBe('beta');
      expect(metadata.buildNumber).toBe('12345');
      expect(metadata.gitCommit).toBe('a1b2c3d4e5f');
      expect(metadata.publishedAt).toBe('2024-01-15T10:30:00Z');
    });

    it('should accept version metadata with custom metadata', () => {
      const versionData = VersionMetadataSchema.parse({
        version: '1.2.3',
        metadata: {
          platform: 'linux',
          arch: 'x64',
        },
      });

      expect(versionData.metadata).toEqual({
        platform: 'linux',
        arch: 'x64',
      });
    });

    it('should use default channel when not specified', () => {
      const metadata = VersionMetadataSchema.parse({
        version: '1.0.0',
      });
      expect(metadata.channel).toBe('stable');
    });

    it('should accept valid datetime for publishedAt', () => {
      expect(() =>
        VersionMetadataSchema.parse({
          version: '1.0.0',
          publishedAt: '2024-01-15T10:30:00Z',
        })
      ).not.toThrow();

      expect(() =>
        VersionMetadataSchema.parse({
          version: '1.0.0',
          publishedAt: '2024-01-15T10:30:00.123Z',
        })
      ).not.toThrow();
    });

    it('should reject invalid datetime for publishedAt', () => {
      expect(() =>
        VersionMetadataSchema.parse({
          version: '1.0.0',
          publishedAt: 'invalid-date',
        })
      ).toThrow();

      expect(() =>
        VersionMetadataSchema.parse({
          version: '1.0.0',
          publishedAt: '2024-01-15',
        })
      ).toThrow();
    });

    it('should reject invalid version', () => {
      expect(() =>
        VersionMetadataSchema.parse({
          version: 'invalid',
        })
      ).toThrow();
    });

    it('should reject invalid channel', () => {
      expect(() =>
        VersionMetadataSchema.parse({
          version: '1.0.0',
          channel: 'invalid',
        })
      ).toThrow();
    });
  });
});
