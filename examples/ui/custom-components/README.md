# Custom UI Components Example

This example demonstrates how to implement custom UI components for ObjectStack.

## Overview

ObjectStack UI Protocol defines metadata for UI components, but the actual implementation is done by frontend frameworks like React, Vue, or Angular. This example shows how to create custom React components that integrate with the ObjectStack UI system.

## Structure

```
custom-components/
├── README.md                    # This file
├── package.json                 # Dependencies
├── src/
│   ├── components/             # Custom component implementations
│   │   ├── CustomButton.tsx    # Custom button component
│   │   ├── CustomDataGrid.tsx  # Custom data grid component
│   │   ├── CustomChart.tsx     # Custom chart component
│   │   └── CustomForm.tsx      # Custom form component
│   ├── registry.ts             # Component registration
│   └── index.ts                # Main exports
└── tsconfig.json
```

## Key Concepts

### 1. Component Props Interface

Every custom component receives standardized props from the ObjectStack renderer:

```typescript
interface ComponentProps {
  // Component configuration from metadata
  properties: Record<string, any>;
  
  // Current data context
  data?: any;
  
  // Callbacks for user interactions
  onChange?: (value: any) => void;
  onAction?: (action: string, params?: any) => void;
  
  // Theme and styling
  theme?: Theme;
}
```

### 2. Component Registration

Components are registered in a component registry that maps component type names to implementations:

```typescript
import { ComponentRegistry } from '@objectstack/ui-renderer';

ComponentRegistry.register('custom-button', CustomButton);
ComponentRegistry.register('custom-data-grid', CustomDataGrid);
```

### 3. Metadata Integration

Components are referenced in UI metadata by their registered type name:

```typescript
const page: Page = {
  name: 'custom_page',
  type: 'app',
  regions: [
    {
      name: 'main',
      components: [
        {
          type: 'custom-button',  // References registered component
          properties: {
            label: 'Click Me',
            variant: 'primary',
          },
        },
      ],
    },
  ],
};
```

## Components Included

### CustomButton

A customizable button component with various styles and interaction handlers.

**Features:**
- Multiple variants (primary, secondary, success, danger)
- Icon support
- Loading states
- Disabled states

**Usage:**
```typescript
{
  type: 'custom-button',
  properties: {
    label: 'Save',
    variant: 'primary',
    icon: 'save',
    disabled: false,
    loading: false,
  },
}
```

### CustomDataGrid

An advanced data grid with sorting, filtering, and pagination.

**Features:**
- Column configuration
- Row selection
- Sorting and filtering
- Pagination
- Custom cell renderers
- Inline editing

**Usage:**
```typescript
{
  type: 'custom-data-grid',
  properties: {
    columns: [
      { field: 'name', label: 'Name', sortable: true },
      { field: 'email', label: 'Email', sortable: true },
      { field: 'status', label: 'Status', filterable: true },
    ],
    data: [...],
    selectable: true,
    pageSize: 25,
  },
}
```

### CustomChart

A chart component supporting multiple visualization types.

**Features:**
- Multiple chart types (bar, line, pie, donut)
- Interactive tooltips
- Legend customization
- Responsive design

**Usage:**
```typescript
{
  type: 'custom-chart',
  properties: {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Revenue',
        data: [1000, 1500, 1200],
      }],
    },
    options: {
      responsive: true,
      legend: { position: 'bottom' },
    },
  },
}
```

### CustomForm

A dynamic form builder that renders fields based on metadata.

**Features:**
- Dynamic field rendering
- Validation
- Conditional fields
- Multi-step forms

**Usage:**
```typescript
{
  type: 'custom-form',
  properties: {
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'tel' },
    ],
    onSubmit: 'handleSubmit',
  },
}
```

## Installation

```bash
cd examples/ui/custom-components
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Best Practices

### 1. Type Safety

Always define TypeScript interfaces for your component props:

```typescript
interface CustomButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = 'primary',
  ...props
}) => {
  // Implementation
};
```

### 2. Accessibility

Ensure components are accessible:

```typescript
<button
  aria-label={label}
  aria-disabled={disabled}
  role="button"
  tabIndex={0}
>
  {label}
</button>
```

### 3. Theme Integration

Use the theme prop for consistent styling:

```typescript
const CustomButton: React.FC<ComponentProps> = ({ theme, properties }) => {
  const styles = {
    backgroundColor: theme?.colors.primary,
    color: theme?.colors.text,
    borderRadius: theme?.borderRadius.md,
  };
  
  return <button style={styles}>{properties.label}</button>;
};
```

### 4. Error Handling

Handle errors gracefully:

```typescript
const CustomDataGrid: React.FC<ComponentProps> = ({ properties, data }) => {
  if (!data) {
    return <div>No data available</div>;
  }
  
  if (!properties.columns) {
    return <div>Column configuration is required</div>;
  }
  
  // Render grid
};
```

### 5. Performance

Optimize rendering with React hooks:

```typescript
const CustomChart: React.FC<ComponentProps> = ({ properties }) => {
  const chartConfig = useMemo(
    () => buildChartConfig(properties),
    [properties]
  );
  
  return <Chart config={chartConfig} />;
};
```

## Integration with ObjectStack

### Server-Side

The server provides metadata through the UI API:

```typescript
// GET /api/ui/pages/custom_page
{
  "name": "custom_page",
  "regions": [
    {
      "components": [
        {
          "type": "custom-button",
          "properties": { ... }
        }
      ]
    }
  ]
}
```

### Client-Side

The React renderer interprets the metadata and renders components:

```typescript
import { PageRenderer } from '@objectstack/ui-renderer';
import { ComponentRegistry } from './registry';

function App() {
  const [pageMetadata, setPageMetadata] = useState(null);
  
  useEffect(() => {
    fetch('/api/ui/pages/custom_page')
      .then(res => res.json())
      .then(setPageMetadata);
  }, []);
  
  return (
    <PageRenderer
      page={pageMetadata}
      registry={ComponentRegistry}
    />
  );
}
```

## Advanced Topics

### Dynamic Imports

Load components on demand for better performance:

```typescript
const CustomChart = lazy(() => import('./components/CustomChart'));

ComponentRegistry.register('custom-chart', CustomChart);
```

### Component Variants

Create component variants for different use cases:

```typescript
// Base component
const BaseButton: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

// Variants
export const PrimaryButton = (props) => <BaseButton variant="primary" {...props} />;
export const SecondaryButton = (props) => <BaseButton variant="secondary" {...props} />;
```

### Composable Components

Build complex components from simpler ones:

```typescript
const CustomCard: React.FC<ComponentProps> = ({ properties }) => (
  <div className="card">
    <CustomButton properties={properties.headerButton} />
    <div className="card-content">
      {properties.content}
    </div>
    <CustomDataGrid properties={properties.grid} />
  </div>
);
```

## Testing

Example test for a custom component:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('renders with label', () => {
    render(<CustomButton properties={{ label: 'Click Me' }} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(
      <CustomButton
        properties={{ label: 'Click Me' }}
        onAction={onClick}
      />
    );
    fireEvent.click(screen.getByText('Click Me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Related Examples

- `../react-renderer` - Shows how to render ObjectStack UI metadata with React
- `../src/view.examples.ts` - View metadata examples
- `../src/page.examples.ts` - Page metadata examples

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ObjectStack UI Protocol](../../packages/spec/src/ui/)
