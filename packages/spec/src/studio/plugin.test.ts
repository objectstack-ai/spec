import { describe, it, expect } from 'vitest';
import {
  ViewModeSchema,
  MetadataViewerContributionSchema,
  SidebarGroupContributionSchema,
  ActionLocationSchema,
  ActionContributionSchema,
  MetadataIconContributionSchema,
  PanelLocationSchema,
  PanelContributionSchema,
  CommandContributionSchema,
  StudioPluginContributionsSchema,
  ActivationEventSchema,
  StudioPluginManifestSchema,
  defineStudioPlugin,
} from './plugin.zod';

describe('ViewModeSchema', () => {
  it('should accept all valid view modes', () => {
    const modes = ['preview', 'design', 'code', 'data'];
    modes.forEach(m => {
      expect(() => ViewModeSchema.parse(m)).not.toThrow();
    });
  });

  it('should reject invalid mode', () => {
    expect(() => ViewModeSchema.parse('edit')).toThrow();
  });
});

describe('MetadataViewerContributionSchema', () => {
  it('should accept minimal viewer with defaults', () => {
    const viewer = {
      id: 'object-explorer',
      metadataTypes: ['object'],
      label: 'Object Explorer',
    };
    const result = MetadataViewerContributionSchema.parse(viewer);
    expect(result.priority).toBe(0);
    expect(result.modes).toEqual(['preview']);
  });

  it('should accept full viewer', () => {
    const viewer = {
      id: 'flow-canvas',
      metadataTypes: ['flow', 'workflow'],
      label: 'Flow Canvas',
      priority: 100,
      modes: ['design', 'code'],
    };
    expect(() => MetadataViewerContributionSchema.parse(viewer)).not.toThrow();
  });

  it('should reject empty metadataTypes (min 1)', () => {
    expect(() => MetadataViewerContributionSchema.parse({
      id: 'x', metadataTypes: [], label: 'X',
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => MetadataViewerContributionSchema.parse({ id: 'x' })).toThrow();
  });
});

describe('SidebarGroupContributionSchema', () => {
  it('should accept minimal group with defaults', () => {
    const group = { key: 'data', label: 'Data', metadataTypes: ['object', 'field'] };
    const result = SidebarGroupContributionSchema.parse(group);
    expect(result.order).toBe(100);
    expect(result.icon).toBeUndefined();
  });

  it('should accept full group', () => {
    const group = { key: 'automation', label: 'Automation', icon: 'workflow', metadataTypes: ['flow'], order: 50 };
    expect(() => SidebarGroupContributionSchema.parse(group)).not.toThrow();
  });

  it('should reject missing metadataTypes', () => {
    expect(() => SidebarGroupContributionSchema.parse({ key: 'x', label: 'X' })).toThrow();
  });
});

describe('ActionLocationSchema', () => {
  it('should accept all valid locations', () => {
    ['toolbar', 'contextMenu', 'commandPalette'].forEach(loc => {
      expect(() => ActionLocationSchema.parse(loc)).not.toThrow();
    });
  });

  it('should reject invalid location', () => {
    expect(() => ActionLocationSchema.parse('sidebar')).toThrow();
  });
});

describe('ActionContributionSchema', () => {
  it('should accept minimal action with defaults', () => {
    const action = { id: 'deploy', label: 'Deploy', location: 'toolbar' };
    const result = ActionContributionSchema.parse(action);
    expect(result.metadataTypes).toEqual([]);
    expect(result.icon).toBeUndefined();
  });

  it('should accept full action', () => {
    const action = {
      id: 'delete-object',
      label: 'Delete',
      icon: 'trash',
      location: 'contextMenu',
      metadataTypes: ['object'],
    };
    expect(() => ActionContributionSchema.parse(action)).not.toThrow();
  });

  it('should reject missing location', () => {
    expect(() => ActionContributionSchema.parse({ id: 'x', label: 'X' })).toThrow();
  });
});

describe('MetadataIconContributionSchema', () => {
  it('should accept valid icon contribution', () => {
    const icon = { metadataType: 'object', label: 'Objects', icon: 'database' };
    expect(() => MetadataIconContributionSchema.parse(icon)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => MetadataIconContributionSchema.parse({ metadataType: 'x' })).toThrow();
    expect(() => MetadataIconContributionSchema.parse({})).toThrow();
  });
});

describe('PanelLocationSchema', () => {
  it('should accept all valid panel locations', () => {
    ['bottom', 'right', 'modal'].forEach(loc => {
      expect(() => PanelLocationSchema.parse(loc)).not.toThrow();
    });
  });

  it('should reject invalid location', () => {
    expect(() => PanelLocationSchema.parse('top')).toThrow();
  });
});

describe('PanelContributionSchema', () => {
  it('should accept minimal panel with defaults', () => {
    const panel = { id: 'terminal', label: 'Terminal' };
    const result = PanelContributionSchema.parse(panel);
    expect(result.location).toBe('bottom');
    expect(result.icon).toBeUndefined();
  });

  it('should accept full panel', () => {
    const panel = { id: 'output', label: 'Output', icon: 'terminal', location: 'right' };
    expect(() => PanelContributionSchema.parse(panel)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => PanelContributionSchema.parse({})).toThrow();
  });
});

describe('CommandContributionSchema', () => {
  it('should accept minimal command', () => {
    const cmd = { id: 'myPlugin.openSettings', label: 'Open Settings' };
    const result = CommandContributionSchema.parse(cmd);
    expect(result.shortcut).toBeUndefined();
    expect(result.icon).toBeUndefined();
  });

  it('should accept full command', () => {
    const cmd = { id: 'myPlugin.save', label: 'Save', shortcut: 'Ctrl+S', icon: 'save' };
    expect(() => CommandContributionSchema.parse(cmd)).not.toThrow();
  });

  it('should reject missing id', () => {
    expect(() => CommandContributionSchema.parse({ label: 'X' })).toThrow();
  });
});

describe('StudioPluginContributionsSchema', () => {
  it('should accept empty object with all defaults', () => {
    const result = StudioPluginContributionsSchema.parse({});
    expect(result.metadataViewers).toEqual([]);
    expect(result.sidebarGroups).toEqual([]);
    expect(result.actions).toEqual([]);
    expect(result.metadataIcons).toEqual([]);
    expect(result.panels).toEqual([]);
    expect(result.commands).toEqual([]);
  });

  it('should accept full contributions', () => {
    const contrib = {
      metadataViewers: [{ id: 'v1', metadataTypes: ['object'], label: 'Viewer' }],
      sidebarGroups: [{ key: 'g1', label: 'Group', metadataTypes: ['object'] }],
      actions: [{ id: 'a1', label: 'Action', location: 'toolbar' }],
      metadataIcons: [{ metadataType: 'object', label: 'Object', icon: 'db' }],
      panels: [{ id: 'p1', label: 'Panel' }],
      commands: [{ id: 'c1', label: 'Cmd' }],
    };
    expect(() => StudioPluginContributionsSchema.parse(contrib)).not.toThrow();
  });
});

describe('ActivationEventSchema', () => {
  it('should accept valid activation events', () => {
    const events = ['*', 'onMetadataType:object', 'onCommand:myPlugin.do', 'onView:myPanel'];
    events.forEach(e => {
      expect(() => ActivationEventSchema.parse(e)).not.toThrow();
    });
  });

  it('should reject non-string', () => {
    expect(() => ActivationEventSchema.parse(123)).toThrow();
  });
});

describe('StudioPluginManifestSchema', () => {
  const minimalManifest = {
    id: 'objectstack.my-plugin',
    name: 'My Plugin',
  };

  it('should accept minimal manifest with defaults', () => {
    const result = StudioPluginManifestSchema.parse(minimalManifest);
    expect(result.version).toBe('0.0.1');
    expect(result.activationEvents).toEqual(['*']);
    expect(result.contributes).toBeDefined();
    expect(result.description).toBeUndefined();
    expect(result.author).toBeUndefined();
  });

  it('should accept full manifest', () => {
    const manifest = {
      id: 'objectstack.object-designer',
      name: 'Object Designer',
      version: '1.0.0',
      description: 'A full object designer plugin',
      author: 'ObjectStack Team',
      contributes: {
        metadataViewers: [{
          id: 'object-explorer',
          metadataTypes: ['object'],
          label: 'Object Explorer',
          priority: 100,
          modes: ['preview', 'design', 'data'],
        }],
      },
      activationEvents: ['onMetadataType:object'],
    };
    expect(() => StudioPluginManifestSchema.parse(manifest)).not.toThrow();
  });

  it('should reject invalid id format', () => {
    expect(() => StudioPluginManifestSchema.parse({ id: 'Invalid ID!', name: 'Test' })).toThrow();
    expect(() => StudioPluginManifestSchema.parse({ id: 'UPPERCASE', name: 'Test' })).toThrow();
    expect(() => StudioPluginManifestSchema.parse({ id: '123start', name: 'Test' })).toThrow();
  });

  it('should accept valid id formats', () => {
    const validIds = ['my-plugin', 'objectstack.flow-designer', 'org.sub.plugin-name'];
    validIds.forEach(id => {
      expect(() => StudioPluginManifestSchema.parse({ id, name: 'Test' })).not.toThrow();
    });
  });

  it('should reject missing required fields', () => {
    expect(() => StudioPluginManifestSchema.parse({})).toThrow();
    expect(() => StudioPluginManifestSchema.parse({ id: 'test' })).toThrow();
  });
});

describe('defineStudioPlugin', () => {
  it('should return a parsed manifest', () => {
    const result = defineStudioPlugin({
      id: 'objectstack.flow-designer',
      name: 'Flow Designer',
    });
    expect(result.id).toBe('objectstack.flow-designer');
    expect(result.version).toBe('0.0.1');
    expect(result.activationEvents).toEqual(['*']);
  });

  it('should throw on invalid input', () => {
    expect(() => defineStudioPlugin({ id: 'BAD ID', name: 'Test' })).toThrow();
  });
});
