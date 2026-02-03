import { describe, it, expect } from 'vitest';
import {
  LabelPropsSchema,
  BadgePropsSchema,
  TagPropsSchema,
  ImagePropsSchema,
  AvatarPropsSchema,
  ProgressBarPropsSchema,
  SpinnerPropsSchema,
  KpiCardPropsSchema,
  TimelinePropsSchema,
} from './display.zod';

describe('LabelPropsSchema', () => {
  it('should accept minimal label config', () => {
    const props = {
      text: 'Hello World',
    };
    const result = LabelPropsSchema.parse(props);
    expect(result.text).toBe('Hello World');
    expect(result.size).toBe('base');
    expect(result.weight).toBe('normal');
  });

  it('should accept full label config', () => {
    const props = {
      text: 'Important Text',
      size: 'xl',
      weight: 'bold',
      color: 'primary',
      align: 'center',
      truncate: true,
      maxLines: 3,
    };
    const result = LabelPropsSchema.parse(props);
    expect(result.weight).toBe('bold');
    expect(result.truncate).toBe(true);
  });
});

describe('BadgePropsSchema', () => {
  it('should accept badge with defaults', () => {
    const props = {
      text: '5',
    };
    const result = BadgePropsSchema.parse(props);
    expect(result.variant).toBe('default');
    expect(result.size).toBe('medium');
    expect(result.shape).toBe('rounded');
  });

  it('should accept badge with pulse animation', () => {
    const props = {
      text: 'New',
      variant: 'error',
      pulse: true,
      shape: 'pill',
    };
    const result = BadgePropsSchema.parse(props);
    expect(result.pulse).toBe(true);
    expect(result.variant).toBe('error');
  });

  it('should accept dot badge', () => {
    const props = {
      text: '',
      dot: true,
      position: 'top-right',
    };
    const result = BadgePropsSchema.parse(props);
    expect(result.dot).toBe(true);
  });
});

describe('ImagePropsSchema', () => {
  it('should accept minimal image config', () => {
    const props = {
      src: 'https://example.com/image.jpg',
      alt: 'Example image',
    };
    const result = ImagePropsSchema.parse(props);
    expect(result.fit).toBe('cover');
    expect(result.lazy).toBe(true);
  });

  it('should accept full image config', () => {
    const props = {
      src: 'https://example.com/image.jpg',
      alt: 'Product photo',
      width: 400,
      height: 300,
      fit: 'contain',
      shape: 'rounded',
      preview: true,
      showSkeleton: true,
    };
    const result = ImagePropsSchema.parse(props);
    expect(result.preview).toBe(true);
    expect(result.shape).toBe('rounded');
  });
});

describe('AvatarPropsSchema', () => {
  it('should accept avatar with name only', () => {
    const props = {
      name: 'John Doe',
    };
    const result = AvatarPropsSchema.parse(props);
    expect(result.name).toBe('John Doe');
    expect(result.size).toBe('md');
    expect(result.shape).toBe('circle');
  });

  it('should accept avatar with status', () => {
    const props = {
      src: 'https://example.com/avatar.jpg',
      name: 'Jane Smith',
      size: 'lg',
      status: 'online',
      statusPosition: 'bottom-right',
      showBorder: true,
    };
    const result = AvatarPropsSchema.parse(props);
    expect(result.status).toBe('online');
    expect(result.showBorder).toBe(true);
  });
});

describe('ProgressBarPropsSchema', () => {
  it('should accept progress bar with value', () => {
    const props = {
      value: 75,
    };
    const result = ProgressBarPropsSchema.parse(props);
    expect(result.value).toBe(75);
    expect(result.variant).toBe('primary');
  });

  it('should accept animated striped progress', () => {
    const props = {
      value: 50,
      variant: 'success',
      striped: true,
      animated: true,
      showLabel: true,
    };
    const result = ProgressBarPropsSchema.parse(props);
    expect(result.striped).toBe(true);
    expect(result.animated).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(() => ProgressBarPropsSchema.parse({ value: 150 })).toThrow();
    expect(() => ProgressBarPropsSchema.parse({ value: -10 })).toThrow();
  });
});

describe('SpinnerPropsSchema', () => {
  it('should accept spinner with defaults', () => {
    const props = {};
    const result = SpinnerPropsSchema.parse(props);
    expect(result.size).toBe('md');
    expect(result.type).toBe('circle');
  });

  it('should accept custom spinner', () => {
    const props = {
      size: 'lg',
      type: 'dots',
      variant: 'primary',
      label: 'Loading...',
      showLabel: true,
    };
    const result = SpinnerPropsSchema.parse(props);
    expect(result.type).toBe('dots');
    expect(result.showLabel).toBe(true);
  });
});

describe('KpiCardPropsSchema', () => {
  it('should accept KPI with minimal config', () => {
    const props = {
      title: 'Total Revenue',
      value: '$125,000',
    };
    const result = KpiCardPropsSchema.parse(props);
    expect(result.title).toBe('Total Revenue');
    expect(result.variant).toBe('default');
  });

  it('should accept KPI with trend', () => {
    const props = {
      title: 'Active Users',
      value: 1250,
      trend: {
        value: 12.5,
        direction: 'up',
        label: 'vs last month',
      },
      variant: 'success',
      icon: 'users',
    };
    const result = KpiCardPropsSchema.parse(props);
    expect(result.trend?.value).toBe(12.5);
    expect(result.trend?.direction).toBe('up');
  });
});

describe('TimelinePropsSchema', () => {
  it('should accept timeline with events', () => {
    const props = {
      items: [
        {
          timestamp: '2024-01-15T10:00:00Z',
          title: 'Order placed',
          description: 'Customer placed order #12345',
        },
        {
          timestamp: '2024-01-15T11:30:00Z',
          title: 'Order shipped',
          status: 'success',
        },
      ],
    };
    const result = TimelinePropsSchema.parse(props);
    expect(result.items).toHaveLength(2);
    expect(result.mode).toBe('left');
  });

  it('should accept alternate timeline', () => {
    const props = {
      items: [
        {
          timestamp: '2024-01-01',
          title: 'Event 1',
        },
      ],
      mode: 'alternate',
      reverse: true,
    };
    const result = TimelinePropsSchema.parse(props);
    expect(result.mode).toBe('alternate');
    expect(result.reverse).toBe(true);
  });
});
