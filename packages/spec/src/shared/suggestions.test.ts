import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  findClosestMatches,
  suggestFieldType,
  formatSuggestion,
} from './suggestions.zod';

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('text', 'text')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should return length of other string when one is empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  it('should compute correct distances', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('text', 'textarea')).toBe(4);
    expect(levenshteinDistance('select', 'selct')).toBe(1);
  });

  it('should handle single character differences', () => {
    expect(levenshteinDistance('text', 'test')).toBe(1);
    expect(levenshteinDistance('date', 'data')).toBe(1);
  });
});

describe('findClosestMatches', () => {
  const candidates = ['text', 'textarea', 'number', 'boolean', 'select', 'lookup'];

  it('should find close matches', () => {
    const matches = findClosestMatches('texta', candidates);
    expect(matches).toContain('text');
  });

  it('should return empty array for very different strings', () => {
    const matches = findClosestMatches('xyzzy_completely_different', candidates, 3);
    expect(matches).toEqual([]);
  });

  it('should normalize input (lowercase, hyphens to underscores)', () => {
    const matches = findClosestMatches('Texta', candidates);
    expect(matches).toContain('text');
  });

  it('should respect maxResults', () => {
    const matches = findClosestMatches('te', candidates, 5, 2);
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it('should sort by distance (closest first)', () => {
    const matches = findClosestMatches('selec', candidates);
    expect(matches[0]).toBe('select');
  });
});

describe('suggestFieldType', () => {
  it('should suggest via alias map for common alternatives', () => {
    expect(suggestFieldType('string')).toEqual(['text']);
    expect(suggestFieldType('String')).toEqual(['text']);
    expect(suggestFieldType('int')).toEqual(['number']);
    expect(suggestFieldType('integer')).toEqual(['number']);
    expect(suggestFieldType('bool')).toEqual(['boolean']);
    expect(suggestFieldType('checkbox')).toEqual(['boolean']);
    expect(suggestFieldType('dropdown')).toEqual(['select']);
    expect(suggestFieldType('picklist')).toEqual(['select']);
    expect(suggestFieldType('reference')).toEqual(['lookup']);
    expect(suggestFieldType('timestamp')).toEqual(['datetime']);
  });

  it('should suggest via alias for common typos', () => {
    expect(suggestFieldType('text_area')).toEqual(['textarea']);
    expect(suggestFieldType('rich_text')).toEqual(['richtext']);
    expect(suggestFieldType('multi_select')).toEqual(['multiselect']);
    expect(suggestFieldType('auto_number')).toEqual(['autonumber']);
  });

  it('should suggest via alias for abbreviations', () => {
    expect(suggestFieldType('md')).toEqual(['markdown']);
    expect(suggestFieldType('img')).toEqual(['image']);
    expect(suggestFieldType('fk')).toEqual(['lookup']);
    expect(suggestFieldType('ref')).toEqual(['lookup']);
  });

  it('should fall back to fuzzy matching for unknown typos', () => {
    const suggestions = suggestFieldType('textt');
    expect(suggestions).toContain('text');
  });

  it('should return empty for completely unrelated input', () => {
    const suggestions = suggestFieldType('xyzzy_absolutely_nothing');
    expect(suggestions).toEqual([]);
  });

  it('should handle hyphenated input', () => {
    expect(suggestFieldType('text-area')).toEqual(['textarea']);
  });

  it('should handle space-separated input', () => {
    expect(suggestFieldType('text area')).toEqual(['textarea']);
  });
});

describe('formatSuggestion', () => {
  it('should return empty string for no suggestions', () => {
    expect(formatSuggestion([])).toBe('');
  });

  it('should format single suggestion', () => {
    expect(formatSuggestion(['text'])).toBe("Did you mean 'text'?");
  });

  it('should format multiple suggestions', () => {
    const result = formatSuggestion(['text', 'textarea']);
    expect(result).toBe("Did you mean one of: 'text', 'textarea'?");
  });
});
