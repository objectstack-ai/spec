import { describe, it, expect } from 'vitest';
import { Lead } from '../src/domains/sales/lead.object';
import { ObjectSchema } from '@objectstack/spec/data';

describe('CRM Domain - Lead', () => {
  it('should have a valid object schema definition', () => {
    // This parses the Lead object definition against the Zod schema
    // If the schema is invalid (e.g. invalid state machine), this will throw
    expect(() => ObjectSchema.parse(Lead)).not.toThrow();
  });

  it('should have a configured state machine', () => {
    expect(Lead.stateMachine).toBeDefined();
    expect(Lead.stateMachine?.id).toBe('lead_process');
    expect(Lead.stateMachine?.initial).toBe('new');
    expect(Lead.stateMachine?.states['new']).toBeDefined();
    expect(Lead.stateMachine?.states['converted'].type).toBe('final');
  });

  it('should have strict AI instructions in states', () => {
    const newMeta = Lead.stateMachine?.states['new'].meta;
    expect(newMeta?.aiInstructions).toContain('Verify email');

    const qualifiedMeta = Lead.stateMachine?.states['qualified'].meta;
    expect(qualifiedMeta?.aiInstructions).toContain('Prepare for conversion');
  });
});
