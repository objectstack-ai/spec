import React from 'react';
import type { PageComponent, Theme } from '@objectstack/spec/ui';
import { resolveTemplate } from '../utils/templateResolver';

interface ComponentRendererProps {
  component: PageComponent;
  data?: any;
  registry: Record<string, React.ComponentType<any>>;
  theme?: Theme;
  onAction?: (action: string, params?: any) => void;
}

/**
 * ComponentRenderer - Base renderer for individual components
 */
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  data,
  registry,
  theme,
  onAction,
}) => {
  const Component = registry[component.type];

  if (!Component) {
    return (
      <div style={{ padding: '16px', border: '2px dashed #FF0000', color: '#FF0000' }}>
        Unknown component: {component.type}
      </div>
    );
  }

  // Resolve template expressions
  const resolvedProperties = Object.entries(component.properties || {}).reduce(
    (acc, [key, value]) => {
      acc[key] = resolveTemplate(value, data);
      return acc;
    },
    {} as Record<string, any>
  );

  return (
    <Component
      properties={resolvedProperties}
      data={data}
      theme={theme}
      onAction={onAction}
    />
  );
};

ComponentRenderer.displayName = 'ComponentRenderer';
