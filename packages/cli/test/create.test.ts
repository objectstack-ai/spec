import { describe, it, expect } from 'vitest';
import { templates } from '../src/commands/create';

describe('Create Command Templates', () => {
  describe('Example Template', () => {
    it('should generate correct package.json scripts', () => {
      const packageJsonFn = templates.example.files['package.json'];
      const packageJson = packageJsonFn('test-app');
      
      expect(packageJson.scripts.dev).toBe('objectstack dev');
      expect(packageJson.scripts.build).toBe('objectstack compile');
      expect(packageJson.dependencies['@objectstack/cli']).toBe('workspace:*');
    });
  });

  describe('Plugin Template', () => {
    it('should generate correct dependencies', () => {
        const packageJsonFn = templates.plugin.files['package.json'];
        const packageJson = packageJsonFn('test-plugin');
        
        expect(packageJson.dependencies).toHaveProperty('@objectstack/spec');
        expect(packageJson.keywords).toContain('test-plugin');
    });
  });
});
