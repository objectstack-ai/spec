import { describe, it, expect } from 'vitest';
import {
  ResponsiveConfigSchema,
  PerformanceConfigSchema,
  BreakpointName,
  type ResponsiveConfig,
  type PerformanceConfig,
} from './responsive.zod';

describe('BreakpointName', () => {
  it('should accept all valid breakpoint names', () => {
    const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

    names.forEach(name => {
      expect(() => BreakpointName.parse(name)).not.toThrow();
    });
  });

  it('should reject invalid breakpoint names', () => {
    expect(() => BreakpointName.parse('xxl')).toThrow();
    expect(() => BreakpointName.parse('mobile')).toThrow();
    expect(() => BreakpointName.parse('')).toThrow();
  });
});

describe('ResponsiveConfigSchema', () => {
  it('should accept empty config', () => {
    expect(() => ResponsiveConfigSchema.parse({})).not.toThrow();
  });

  it('should accept config with breakpoint visibility', () => {
    const config: ResponsiveConfig = {
      breakpoint: 'md',
    };

    const result = ResponsiveConfigSchema.parse(config);
    expect(result.breakpoint).toBe('md');
  });

  it('should accept config with hiddenOn breakpoints', () => {
    const config: ResponsiveConfig = {
      hiddenOn: ['xs', 'sm'],
    };

    const result = ResponsiveConfigSchema.parse(config);
    expect(result.hiddenOn).toEqual(['xs', 'sm']);
  });

  it('should accept config with column mapping', () => {
    const config: ResponsiveConfig = {
      columns: { xs: 12, sm: 6, md: 4, lg: 3 },
    };

    const result = ResponsiveConfigSchema.parse(config);
    expect(result.columns?.xs).toBe(12);
    expect(result.columns?.lg).toBe(3);
  });

  it('should reject columns outside 1-12 range', () => {
    expect(() => ResponsiveConfigSchema.parse({
      columns: { xs: 0 },
    })).toThrow();

    expect(() => ResponsiveConfigSchema.parse({
      columns: { xs: 13 },
    })).toThrow();
  });

  it('should accept config with display order', () => {
    const config: ResponsiveConfig = {
      order: { xs: 2, lg: 1 },
    };

    const result = ResponsiveConfigSchema.parse(config);
    expect(result.order?.xs).toBe(2);
    expect(result.order?.lg).toBe(1);
  });

  it('should accept full responsive config', () => {
    const config: ResponsiveConfig = {
      breakpoint: 'sm',
      hiddenOn: ['xs'],
      columns: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
      order: { xs: 3, lg: 1 },
    };

    expect(() => ResponsiveConfigSchema.parse(config)).not.toThrow();
  });
});

describe('PerformanceConfigSchema', () => {
  it('should accept empty config', () => {
    expect(() => PerformanceConfigSchema.parse({})).not.toThrow();
  });

  it('should accept lazy load config', () => {
    const config: PerformanceConfig = {
      lazyLoad: true,
    };

    const result = PerformanceConfigSchema.parse(config);
    expect(result.lazyLoad).toBe(true);
  });

  it('should accept virtual scroll config', () => {
    const config: PerformanceConfig = {
      virtualScroll: {
        enabled: true,
        itemHeight: 40,
        overscan: 5,
      },
    };

    const result = PerformanceConfigSchema.parse(config);
    expect(result.virtualScroll?.enabled).toBe(true);
    expect(result.virtualScroll?.itemHeight).toBe(40);
    expect(result.virtualScroll?.overscan).toBe(5);
  });

  it('should accept cache strategy config', () => {
    const strategies = ['none', 'cache-first', 'network-first', 'stale-while-revalidate'] as const;

    strategies.forEach(strategy => {
      expect(() => PerformanceConfigSchema.parse({ cacheStrategy: strategy })).not.toThrow();
    });
  });

  it('should accept full performance config', () => {
    const config: PerformanceConfig = {
      lazyLoad: true,
      virtualScroll: { enabled: true, itemHeight: 48, overscan: 3 },
      cacheStrategy: 'stale-while-revalidate',
      prefetch: true,
      pageSize: 50,
      debounceMs: 300,
    };

    expect(() => PerformanceConfigSchema.parse(config)).not.toThrow();
  });

  it('should reject invalid cache strategy', () => {
    expect(() => PerformanceConfigSchema.parse({
      cacheStrategy: 'invalid',
    })).toThrow();
  });
});
