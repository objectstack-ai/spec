// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { agentPlaygroundPlugin, toolPlaygroundPlugin } from '../src/plugins/built-in';

describe('Playground Plugins', () => {
  describe('Agent Playground Plugin', () => {
    it('should have correct manifest structure', () => {
      expect(agentPlaygroundPlugin.manifest).toBeDefined();
      expect(agentPlaygroundPlugin.manifest.id).toBe('objectstack.agent-playground');
      expect(agentPlaygroundPlugin.manifest.name).toBe('Agent Playground');
      expect(agentPlaygroundPlugin.activate).toBeTypeOf('function');
    });

    it('should contribute agent viewer for preview mode', () => {
      const viewers = agentPlaygroundPlugin.manifest.contributes?.metadataViewers || [];
      expect(viewers).toHaveLength(1);

      const viewer = viewers[0];
      expect(viewer.id).toBe('agent-playground');
      expect(viewer.metadataTypes).toContain('agent');
      expect(viewer.label).toBe('Playground');
      expect(viewer.priority).toBe(10); // Higher than default inspector (-1)
      expect(viewer.modes).toContain('preview');
    });

    it('should register viewer on activation', () => {
      const registeredViewers: string[] = [];
      const mockAPI = {
        registerViewer: (id: string) => registeredViewers.push(id),
        registerPanel: () => {},
        registerAction: () => {},
        registerCommand: () => {},
        registerMetadataIcon: () => {},
      };

      agentPlaygroundPlugin.activate(mockAPI as any);
      expect(registeredViewers).toContain('agent-playground');
    });
  });

  describe('Tool Playground Plugin', () => {
    it('should have correct manifest structure', () => {
      expect(toolPlaygroundPlugin.manifest).toBeDefined();
      expect(toolPlaygroundPlugin.manifest.id).toBe('objectstack.tool-playground');
      expect(toolPlaygroundPlugin.manifest.name).toBe('Tool Playground');
      expect(toolPlaygroundPlugin.activate).toBeTypeOf('function');
    });

    it('should contribute tool viewer for preview mode', () => {
      const viewers = toolPlaygroundPlugin.manifest.contributes?.metadataViewers || [];
      expect(viewers).toHaveLength(1);

      const viewer = viewers[0];
      expect(viewer.id).toBe('tool-playground');
      expect(viewer.metadataTypes).toContain('tool');
      expect(viewer.label).toBe('Playground');
      expect(viewer.priority).toBe(10); // Higher than default inspector (-1)
      expect(viewer.modes).toContain('preview');
    });

    it('should register viewer on activation', () => {
      const registeredViewers: string[] = [];
      const mockAPI = {
        registerViewer: (id: string) => registeredViewers.push(id),
        registerPanel: () => {},
        registerAction: () => {},
        registerCommand: () => {},
        registerMetadataIcon: () => {},
      };

      toolPlaygroundPlugin.activate(mockAPI as any);
      expect(registeredViewers).toContain('tool-playground');
    });
  });

  describe('Plugin Priority', () => {
    it('both playground plugins should have priority higher than default inspector', () => {
      const agentViewers = agentPlaygroundPlugin.manifest.contributes?.metadataViewers || [];
      const toolViewers = toolPlaygroundPlugin.manifest.contributes?.metadataViewers || [];

      const agentPriority = agentViewers[0]?.priority ?? 0;
      const toolPriority = toolViewers[0]?.priority ?? 0;

      const defaultInspectorPriority = -1; // As defined in default-plugin.tsx

      expect(agentPriority).toBeGreaterThan(defaultInspectorPriority);
      expect(toolPriority).toBeGreaterThan(defaultInspectorPriority);
    });
  });
});
