import { describe, it, expect } from 'vitest';
import {
  ValidationErrorSchema,
  ValidationWarningSchema,
  ValidationResultSchema,
  PluginMetadataSchema,
} from './plugin-validator.zod';

describe('Plugin Validator Protocol', () => {
  describe('ValidationErrorSchema', () => {
    it('should validate a valid error', () => {
      const validError = {
        field: 'version',
        message: 'Invalid semver format',
        code: 'INVALID_VERSION',
      };

      const result = ValidationErrorSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('should validate an error without code', () => {
      const errorWithoutCode = {
        field: 'name',
        message: 'Plugin name is required',
      };

      const result = ValidationErrorSchema.safeParse(errorWithoutCode);
      expect(result.success).toBe(true);
    });

    it('should reject invalid error', () => {
      const invalidError = {
        field: 'version',
        // missing message
      };

      const result = ValidationErrorSchema.safeParse(invalidError);
      expect(result.success).toBe(false);
    });
  });

  describe('ValidationWarningSchema', () => {
    it('should validate a valid warning', () => {
      const validWarning = {
        field: 'description',
        message: 'Description is recommended',
        code: 'MISSING_DESCRIPTION',
      };

      const result = ValidationWarningSchema.safeParse(validWarning);
      expect(result.success).toBe(true);
    });
  });

  describe('ValidationResultSchema', () => {
    it('should validate a successful validation result', () => {
      const successResult = {
        valid: true,
      };

      const result = ValidationResultSchema.safeParse(successResult);
      expect(result.success).toBe(true);
    });

    it('should validate a failed validation result with errors', () => {
      const failedResult = {
        valid: false,
        errors: [
          {
            field: 'name',
            message: 'Plugin name is required',
            code: 'REQUIRED_FIELD',
          },
        ],
        warnings: [
          {
            field: 'description',
            message: 'Description is recommended',
          },
        ],
      };

      const result = ValidationResultSchema.safeParse(failedResult);
      expect(result.success).toBe(true);
    });
  });

  describe('PluginMetadataSchema', () => {
    it('should validate minimal plugin metadata', () => {
      const minimalPlugin = {
        name: 'test-plugin',
      };

      const result = PluginMetadataSchema.safeParse(minimalPlugin);
      expect(result.success).toBe(true);
    });

    it('should validate full plugin metadata', () => {
      const fullPlugin = {
        name: 'crm-plugin',
        version: '1.0.0',
        dependencies: ['core-plugin', 'data-plugin'],
        signature: 'abc123def456',
      };

      const result = PluginMetadataSchema.safeParse(fullPlugin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const invalidPlugin = {
        name: 'test-plugin',
        version: '1.0', // invalid semver
      };

      const result = PluginMetadataSchema.safeParse(invalidPlugin);
      expect(result.success).toBe(false);
    });

    it('should accept plugin with additional properties', () => {
      const pluginWithExtra = {
        name: 'test-plugin',
        version: '1.0.0',
        customField: 'custom-value',
        anotherField: 123,
      };

      const result = PluginMetadataSchema.safeParse(pluginWithExtra);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('customField');
      }
    });
  });
});
