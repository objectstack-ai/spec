import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pluginCommand } from '../src/commands/plugin';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Plugin Command', () => {
  it('should have plugin command with subcommands', () => {
    expect(pluginCommand.name()).toBe('plugin');
    expect(pluginCommand.description()).toContain('plugin');
  });

  it('should have list subcommand with alias', () => {
    const list = pluginCommand.commands.find(c => c.name() === 'list');
    expect(list).toBeDefined();
    expect(list!.alias()).toBe('ls');
    expect(list!.description()).toContain('List');
  });

  it('should have info subcommand', () => {
    const info = pluginCommand.commands.find(c => c.name() === 'info');
    expect(info).toBeDefined();
    expect(info!.description()).toContain('information');
  });

  it('should have add subcommand', () => {
    const add = pluginCommand.commands.find(c => c.name() === 'add');
    expect(add).toBeDefined();
    expect(add!.description()).toContain('Add');
  });

  it('should have remove subcommand with alias', () => {
    const remove = pluginCommand.commands.find(c => c.name() === 'remove');
    expect(remove).toBeDefined();
    expect(remove!.alias()).toBe('rm');
    expect(remove!.description()).toContain('Remove');
  });
});

describe('Plugin Config Manipulation', () => {
  let tmpDir: string;
  let configPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'os-plugin-test-'));
    configPath = path.join(tmpDir, 'objectstack.config.ts');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('addPluginToConfig (via file manipulation)', () => {
    it('should add plugin import and entry to config with existing plugins array', () => {
      fs.writeFileSync(configPath, `import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    name: 'test-app',
    version: '1.0.0',
  },
  plugins: [
  ],
});
`);

      // Simulate what the add command does
      let content = fs.readFileSync(configPath, 'utf-8');
      const packageName = '@objectstack/plugin-auth';
      const varName = 'authPlugin';
      const importLine = `import ${varName} from '${packageName}';\n`;
      
      // Add import after last import
      const importRegex = /^import .+$/gm;
      let lastImportEnd = 0;
      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportEnd = match.index + match[0].length;
      }
      content = content.slice(0, lastImportEnd) + '\n' + importLine + content.slice(lastImportEnd);
      
      // Add to plugins array
      content = content.replace(
        /(plugins\s*:\s*\[)/,
        `$1\n    ${varName},`
      );

      fs.writeFileSync(configPath, content);
      
      const result = fs.readFileSync(configPath, 'utf-8');
      expect(result).toContain("import authPlugin from '@objectstack/plugin-auth'");
      expect(result).toContain('authPlugin,');
    });

    it('should add plugin to config without existing plugins array', () => {
      fs.writeFileSync(configPath, `import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    name: 'test-app',
    version: '1.0.0',
  },
});
`);

      let content = fs.readFileSync(configPath, 'utf-8');
      const packageName = '@objectstack/plugin-security';
      const varName = 'securityPlugin';
      const importLine = `import ${varName} from '${packageName}';\n`;

      // Add import
      const importRegex = /^import .+$/gm;
      let lastImportEnd = 0;
      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportEnd = match.index + match[0].length;
      }
      content = content.slice(0, lastImportEnd) + '\n' + importLine + content.slice(lastImportEnd);

      // Add plugins array
      if (!/plugins\s*:\s*\[/.test(content)) {
        content = content.replace(
          /(defineStack\(\{[\s\S]*?)(}\s*\))/,
          `$1  plugins: [\n    ${varName},\n  ],\n$2`
        );
      }

      fs.writeFileSync(configPath, content);

      const result = fs.readFileSync(configPath, 'utf-8');
      expect(result).toContain("import securityPlugin from '@objectstack/plugin-security'");
      expect(result).toContain('plugins: [');
      expect(result).toContain('securityPlugin,');
    });
  });

  describe('removePluginFromConfig (via file manipulation)', () => {
    it('should remove plugin import and entry from config', () => {
      fs.writeFileSync(configPath, `import { defineStack } from '@objectstack/spec';
import authPlugin from '@objectstack/plugin-auth';

export default defineStack({
  manifest: {
    name: 'test-app',
    version: '1.0.0',
  },
  plugins: [
    authPlugin,
  ],
});
`);

      let content = fs.readFileSync(configPath, 'utf-8');
      const packageName = '@objectstack/plugin-auth';
      
      // Remove import
      const importRegex = new RegExp(`^import .+['"]${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"].*$\\n?`, 'gm');
      content = content.replace(importRegex, '');

      // Remove from plugins array
      content = content.replace(/\s*authPlugin,?\n?/g, '\n');

      fs.writeFileSync(configPath, content);

      const result = fs.readFileSync(configPath, 'utf-8');
      expect(result).not.toContain('@objectstack/plugin-auth');
      expect(result).not.toContain('authPlugin');
      // The rest of the config should remain intact
      expect(result).toContain("import { defineStack } from '@objectstack/spec'");
      expect(result).toContain('manifest');
    });
  });
});
