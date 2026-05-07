// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IMetadataService, AIToolDefinition } from '@objectstack/spec/contracts';
import type { Skill } from '@objectstack/spec/ai';
import { SkillRegistry } from '../skill-registry.js';

function createMockMetadataService(overrides: Partial<IMetadataService> = {}): IMetadataService {
  return {
    register: vi.fn(async () => {}),
    get: vi.fn(async () => undefined),
    list: vi.fn(async () => []),
    unregister: vi.fn(async () => {}),
    exists: vi.fn(async () => false),
    listNames: vi.fn(async () => []),
    getObject: vi.fn(async () => undefined),
    listObjects: vi.fn(async () => []),
    ...overrides,
  };
}

const baseSkill = (over: Partial<Skill> = {}): Skill => ({
  name: 'lead_qualification',
  label: 'Lead Qualification',
  description: 'BANT scoring',
  instructions: 'Qualify the lead.',
  tools: ['analyze_lead'],
  triggerPhrases: ['qualify this lead'],
  active: true,
  ...over,
});

const stubTool = (name: string): AIToolDefinition => ({
  name,
  description: `${name} tool`,
  parameters: { type: 'object', properties: {} } as never,
});

describe('SkillRegistry', () => {
  let metadataService: IMetadataService;
  let registry: SkillRegistry;

  beforeEach(() => {
    metadataService = createMockMetadataService();
    registry = new SkillRegistry(metadataService);
  });

  describe('loadSkill', () => {
    it('returns parsed skill on valid metadata', async () => {
      (metadataService.get as any).mockResolvedValue(baseSkill());
      const skill = await registry.loadSkill('lead_qualification');
      expect(metadataService.get).toHaveBeenCalledWith('skill', 'lead_qualification');
      expect(skill?.name).toBe('lead_qualification');
    });

    it('returns undefined on missing metadata', async () => {
      const skill = await registry.loadSkill('nope');
      expect(skill).toBeUndefined();
    });

    it('returns undefined on malformed metadata (Zod failure)', async () => {
      (metadataService.get as any).mockResolvedValue({ name: 'bad' });
      const skill = await registry.loadSkill('bad');
      expect(skill).toBeUndefined();
    });
  });

  describe('listActiveSkills + matchesContext', () => {
    it('returns all skills when no triggerConditions', async () => {
      (metadataService.list as any).mockResolvedValue([
        baseSkill({ name: 'a' }),
        baseSkill({ name: 'b' }),
      ]);
      const active = await registry.listActiveSkills({ appName: 'crm' });
      expect(active.map((s) => s.name)).toEqual(['a', 'b']);
    });

    it('drops inactive skills', async () => {
      (metadataService.list as any).mockResolvedValue([
        baseSkill({ name: 'a' }),
        baseSkill({ name: 'b', active: false }),
      ]);
      const active = await registry.listActiveSkills();
      expect(active.map((s) => s.name)).toEqual(['a']);
    });

    it('filters by triggerConditions (eq)', async () => {
      (metadataService.list as any).mockResolvedValue([
        baseSkill({
          name: 'lead_only',
          triggerConditions: [{ field: 'objectName', operator: 'eq', value: 'lead' }],
        }),
        baseSkill({ name: 'global' }),
      ]);
      const active = await registry.listActiveSkills({ objectName: 'account' });
      expect(active.map((s) => s.name)).toEqual(['global']);
    });

    it('filters by triggerConditions (in)', async () => {
      (metadataService.list as any).mockResolvedValue([
        baseSkill({
          name: 'sales',
          triggerConditions: [{ field: 'objectName', operator: 'in', value: ['lead', 'opportunity'] }],
        }),
      ]);
      const lead = await registry.listActiveSkills({ objectName: 'lead' });
      const acct = await registry.listActiveSkills({ objectName: 'account' });
      expect(lead.map((s) => s.name)).toEqual(['sales']);
      expect(acct).toEqual([]);
    });

    it('intersects with restrictTo allow-list', async () => {
      (metadataService.list as any).mockResolvedValue([
        baseSkill({ name: 'a' }),
        baseSkill({ name: 'b' }),
        baseSkill({ name: 'c' }),
      ]);
      const active = await registry.listActiveSkills({}, ['b', 'c']);
      expect(active.map((s) => s.name)).toEqual(['b', 'c']);
    });
  });

  describe('flattenToTools', () => {
    it('dedupes tools across skills, preserving first declaration order', () => {
      const skills = [
        baseSkill({ name: 's1', tools: ['analyze_lead', 'suggest_next_action'] }),
        baseSkill({ name: 's2', tools: ['analyze_lead', 'generate_email'] }),
      ];
      const available = [stubTool('analyze_lead'), stubTool('suggest_next_action'), stubTool('generate_email')];
      const flat = registry.flattenToTools(skills, available);
      expect(flat.map((t) => t.name)).toEqual(['analyze_lead', 'suggest_next_action', 'generate_email']);
    });

    it('drops tools missing from available registry', () => {
      const skills = [baseSkill({ tools: ['analyze_lead', 'missing_tool'] })];
      const available = [stubTool('analyze_lead')];
      const flat = registry.flattenToTools(skills, available);
      expect(flat.map((t) => t.name)).toEqual(['analyze_lead']);
    });
  });

  describe('composeInstructionsBlock', () => {
    it('returns empty string for empty skill list', () => {
      expect(registry.composeInstructionsBlock([])).toBe('');
    });

    it('builds Active Skills block with label, name, instructions, tool list', () => {
      const block = registry.composeInstructionsBlock([baseSkill()]);
      expect(block).toContain('Active Skills');
      expect(block).toContain('Lead Qualification (lead_qualification)');
      expect(block).toContain('Qualify the lead.');
      expect(block).toContain('Tools: analyze_lead');
    });
  });

  describe('toSummary', () => {
    it('projects skill to wire-friendly summary', () => {
      const summary = registry.toSummary(baseSkill({ tools: ['a', 'b', 'c'] }));
      expect(summary).toEqual({
        name: 'lead_qualification',
        label: 'Lead Qualification',
        description: 'BANT scoring',
        triggerPhrases: ['qualify this lead'],
        toolCount: 3,
      });
    });
  });
});
