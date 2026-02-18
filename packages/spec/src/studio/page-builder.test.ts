import { describe, it, expect } from 'vitest';
import {
  CanvasSnapSettingsSchema,
  CanvasZoomSettingsSchema,
  ElementPaletteItemSchema,
  PageBuilderConfigSchema,
  type PageBuilderConfig,
} from './page-builder.zod';

// ---------------------------------------------------------------------------
// CanvasSnapSettingsSchema
// ---------------------------------------------------------------------------
describe('CanvasSnapSettingsSchema', () => {
  it('should accept empty config with defaults', () => {
    const settings = CanvasSnapSettingsSchema.parse({});
    expect(settings.enabled).toBe(true);
    expect(settings.gridSize).toBe(8);
    expect(settings.showGrid).toBe(true);
    expect(settings.showGuides).toBe(true);
  });

  it('should accept custom snap settings', () => {
    const settings = CanvasSnapSettingsSchema.parse({
      enabled: false,
      gridSize: 16,
      showGrid: false,
      showGuides: false,
    });
    expect(settings.enabled).toBe(false);
    expect(settings.gridSize).toBe(16);
  });
});

// ---------------------------------------------------------------------------
// CanvasZoomSettingsSchema
// ---------------------------------------------------------------------------
describe('CanvasZoomSettingsSchema', () => {
  it('should accept empty config with defaults', () => {
    const settings = CanvasZoomSettingsSchema.parse({});
    expect(settings.min).toBe(0.25);
    expect(settings.max).toBe(3);
    expect(settings.default).toBe(1);
    expect(settings.step).toBe(0.1);
  });

  it('should accept custom zoom settings', () => {
    const settings = CanvasZoomSettingsSchema.parse({
      min: 0.5,
      max: 5,
      default: 1.5,
      step: 0.25,
    });
    expect(settings.min).toBe(0.5);
    expect(settings.max).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// ElementPaletteItemSchema
// ---------------------------------------------------------------------------
describe('ElementPaletteItemSchema', () => {
  it('should accept valid palette item', () => {
    const item = ElementPaletteItemSchema.parse({
      type: 'element:button',
      label: 'Button',
      category: 'interactive',
    });
    expect(item.type).toBe('element:button');
    expect(item.defaultWidth).toBe(4);
    expect(item.defaultHeight).toBe(2);
  });

  it('should accept all category values', () => {
    const categories = ['content', 'interactive', 'data', 'layout'] as const;
    categories.forEach(category => {
      expect(() => ElementPaletteItemSchema.parse({
        type: 'element:text',
        label: 'Text',
        category,
      })).not.toThrow();
    });
  });

  it('should reject without required fields', () => {
    expect(() => ElementPaletteItemSchema.parse({})).toThrow();
    expect(() => ElementPaletteItemSchema.parse({ type: 'element:text' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// PageBuilderConfigSchema
// ---------------------------------------------------------------------------
describe('PageBuilderConfigSchema', () => {
  it('should accept empty config with defaults', () => {
    const config: PageBuilderConfig = PageBuilderConfigSchema.parse({});
    expect(config.showLayerPanel).toBe(true);
    expect(config.showPropertyPanel).toBe(true);
    expect(config.undoLimit).toBe(50);
  });

  it('should accept full builder config', () => {
    const config = PageBuilderConfigSchema.parse({
      snap: { enabled: true, gridSize: 4 },
      zoom: { min: 0.5, max: 2 },
      palette: [
        { type: 'element:button', label: 'Button', category: 'interactive' },
        { type: 'element:text', label: 'Text', category: 'content' },
      ],
      showLayerPanel: false,
      showPropertyPanel: true,
      undoLimit: 100,
    });

    expect(config.snap?.gridSize).toBe(4);
    expect(config.palette).toHaveLength(2);
    expect(config.undoLimit).toBe(100);
  });
});
