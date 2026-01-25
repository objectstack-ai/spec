import React from 'react';
import type { Page, PageComponent, Theme } from '@objectstack/spec/ui';
import { ComponentRenderer } from './ComponentRenderer';

interface PageRendererProps {
  /** Page metadata */
  page: Page;
  
  /** Data context for the page */
  data?: any;
  
  /** Component registry */
  registry: Record<string, React.ComponentType<any>>;
  
  /** Theme configuration */
  theme?: Theme;
  
  /** Action handler */
  onAction?: (action: string, params?: any) => void;
}

/**
 * PageRenderer
 * 
 * Renders a complete page from ObjectStack Page metadata.
 */
export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  data,
  registry,
  theme,
  onAction,
}) => {
  if (!page) {
    return <div className="page-error">No page metadata provided</div>;
  }

  // Render regions
  const renderRegion = (region: any) => {
    const regionStyle: React.CSSProperties = {
      padding: '16px',
      ...(region.width === 'small' && { maxWidth: '300px' }),
      ...(region.width === 'medium' && { maxWidth: '600px' }),
      ...(region.width === 'large' && { maxWidth: '900px' }),
    };

    return (
      <div key={region.name} className={`region-${region.name}`} style={regionStyle}>
        {region.components?.map((component: PageComponent, index: number) => (
          <ComponentRenderer
            key={component.id || index}
            component={component}
            data={data}
            registry={registry}
            theme={theme}
            onAction={onAction}
          />
        ))}
      </div>
    );
  };

  const pageStyle: React.CSSProperties = {
    backgroundColor: theme?.colors?.background || '#FFFFFF',
    color: theme?.colors?.text || '#000000',
    fontFamily: theme?.typography?.fontFamily?.base || 'sans-serif',
  };

  return (
    <div className={`page page-${page.type}`} style={pageStyle}>
      {page.regions?.map(renderRegion)}
    </div>
  );
};

PageRenderer.displayName = 'PageRenderer';
