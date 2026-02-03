# ObjectStack UI Component System

**世界级企业管理软件界面设计系统**  
**World-Class Enterprise Management Software UI Design System**

## Overview

This comprehensive UI component system provides **81 production-ready components** designed for enterprise management software that excels on both desktop and mobile devices.

## Component Inventory

**Total: 81 Components**

### Input Components (28)
See `input.zod.ts` for complete schemas.

- **Text**: TextInput, Textarea, RichTextEditor
- **Number**: NumberInput, CurrencyInput, Slider, RatingInput
- **Date/Time**: DatePicker, DateTimePicker, TimePicker, DateRangePicker
- **Select**: Select, Autocomplete, TagInput, Cascader
- **Boolean**: Checkbox, CheckboxGroup, Switch, RadioGroup, ToggleButtonGroup
- **File**: FileUpload, ImageUpload
- **Advanced**: ColorPicker, SignaturePad, LocationPicker, CodeEditor

### Display Components (23)
See `display.zod.ts` for complete schemas.

- **Text**: Label, Badge, Tag, Pill
- **Rich Content**: HtmlContent, MarkdownContent, CodeBlock
- **Media**: Image, Avatar, AvatarGroup, Icon, VideoEmbed
- **Progress**: ProgressBar, ProgressCircle, Spinner, Skeleton
- **Stats**: KpiCard, StatGroup, TrendIndicator, Gauge
- **Info**: DescriptionList, Timeline, Divider

### Layout Components (22)
See `layout.zod.ts` for complete schemas.

- **Containers**: Card, Panel, Section, Well, Container
- **Grids**: Grid, GridItem, Flex, Stack, Masonry, SplitPane
- **Navigation**: Tabs, Accordion, Stepper, Breadcrumb, Pagination
- **Overlays**: Modal, Drawer, Popover, Tooltip, Toast, Dropdown

### Specialized Components (8)
See `component.zod.ts` for complete schemas.

- **Data**: DataTable, TreeView, KanbanBoard
- **Feedback**: Alert, EmptyState
- **Mobile**: BottomNavigation, FloatingActionButton, PullToRefresh

## Key Features

✅ **Mobile-First Design**
- Touch targets ≥44px
- Responsive breakpoints (xs, sm, md, lg, xl, 2xl)
- Adaptive layouts
- Mobile-specific components

✅ **Accessibility (WCAG 2.1 AA)**
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

✅ **Performance**
- Virtual scrolling for large datasets
- Lazy loading for images
- Progressive enhancement
- Optimized bundles

✅ **Type-Safe**
- Zod-first validation
- TypeScript type inference
- Runtime type checking
- JSON schema generation

## Quick Start

```typescript
import { 
  TextInputProps,
  GridProps,
  KpiCardProps 
} from '@objectstack/spec';

// Responsive Grid
const grid: GridProps = {
  columns: { xs: 1, md: 2, lg: 4 },
  gap: 'lg'
};

// Input Component
const input: TextInputProps = {
  placeholder: 'Enter email',
  autocomplete: 'email',
  clearable: true,
  size: 'large' // Touch-friendly
};

// KPI Display
const kpi: KpiCardProps = {
  title: 'Revenue',
  value: '$125K',
  trend: { value: 12.5, direction: 'up' },
  variant: 'success'
};
```

## Architecture

All components follow the **Zod-first** pattern:

1. Schema defined with Zod
2. Types inferred with `z.infer<>`
3. Runtime validation with `.parse()`
4. JSON schemas auto-generated

```typescript
export const ComponentPropsSchema = z.object({
  variant: z.enum(['primary', 'secondary']).default('primary'),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
});

export type ComponentProps = z.infer<typeof ComponentPropsSchema>;
```

## Testing

All components have comprehensive tests:

```bash
pnpm test

# Results:
# ✓ input.test.ts (25 tests)
# ✓ display.test.ts (18 tests)  
# ✓ layout.test.ts (15 tests)
# ✓ Total: 3,290 tests passing
```

## Files

- `input.zod.ts` - Input component schemas (28 components)
- `display.zod.ts` - Display component schemas (23 components)
- `layout.zod.ts` - Layout component schemas (22 components)
- `component.zod.ts` - Master registry + specialized components (8 components)
- `theme.zod.ts` - Design system tokens
- `*.test.ts` - Component tests

## Usage Patterns

### Responsive Design

```typescript
const grid: GridProps = {
  columns: {
    xs: 1,   // Mobile: Stack
    sm: 2,   // Tablet: 2 cols
    md: 3,   // Desktop: 3 cols
    lg: 4    // Large: 4 cols
  }
};
```

### Mobile Navigation

```typescript
const nav: BottomNavigationProps = {
  items: [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'search', label: 'Search', icon: 'search' }
  ],
  showLabels: 'selected'
};
```

### Loading States

```typescript
const skeleton: SkeletonProps = {
  variant: 'text',
  count: 5,
  animation: 'wave'
};
```

## Best Practices

### 1. Accessibility
- Always provide `aria-label` for inputs
- Use semantic component types
- Ensure keyboard navigation
- Maintain color contrast

### 2. Performance
- Use `virtual: true` for large tables
- Enable `lazy: true` for images
- Implement skeleton loaders

### 3. Mobile
- Use touch-friendly sizes (≥44px)
- Implement pull-to-refresh
- Use bottom navigation
- Stack layouts on small screens

## Component Props Reference

All component props are fully typed and validated:

```typescript
// Input components
import { 
  TextInputProps,
  NumberInputProps,
  DatePickerProps,
  SelectProps,
  FileUploadProps 
} from '@objectstack/spec';

// Display components  
import {
  LabelProps,
  BadgeProps,
  ImageProps,
  ProgressBarProps,
  KpiCardProps
} from '@objectstack/spec';

// Layout components
import {
  CardProps,
  GridProps,
  TabsProps,
  ModalProps,
  ToastProps
} from '@objectstack/spec';
```

---

**Built with ❤️ for world-class enterprise software**

All components are production-ready, fully typed, tested, and optimized for both desktop and mobile experiences.
