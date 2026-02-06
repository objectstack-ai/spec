import { describe, it, expect } from 'vitest';
import { Lead } from '../src/objects/lead.object';
import { ObjectSchema } from '@objectstack/spec/data';

describe('CRM Domain - Lead', () => {
  it('should have a valid object schema definition', () => {
    // This parses the Lead object definition against the Zod schema
    // If the schema is invalid (e.g. invalid state machine), this will throw
    expect(() => ObjectSchema.parse(Lead)).not.toThrow();
  });

  it('should have a configured state machine via stateMachines (plural)', () => {
    expect(Lead.stateMachines).toBeDefined();
    
    const lifecycle = Lead.stateMachines!.lifecycle;
    expect(lifecycle).toBeDefined();
    expect(lifecycle.id).toBe('lead_process');
    expect(lifecycle.initial).toBe('new');
    expect(lifecycle.states['new']).toBeDefined();
    expect(lifecycle.states['converted'].type).toBe('final');
  });

  it('should have strict AI instructions in states', () => {
    const lifecycle = Lead.stateMachines!.lifecycle;
    
    const newMeta = lifecycle.states['new'].meta;
    expect(newMeta?.aiInstructions).toContain('Verify email');

    const qualifiedMeta = lifecycle.states['qualified'].meta;
    expect(qualifiedMeta?.aiInstructions).toContain('Prepare for conversion');
  });
});
