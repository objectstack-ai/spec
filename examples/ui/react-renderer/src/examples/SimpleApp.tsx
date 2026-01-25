import React, { useState } from 'react';
import { PageRenderer } from '../renderers/PageRenderer';
import { CustomButton, CustomDataGrid, ComponentRegistry } from '../../custom-components/src';
import type { Page } from '@objectstack/spec/ui';

/**
 * Simple App Example
 * 
 * Demonstrates rendering a page from metadata with custom components
 */
export function SimpleApp() {
  const [customer] = useState({
    id: 1,
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    status: 'active',
  });

  // Page metadata - this could come from an API
  const pageMetadata: Page = {
    name: 'customer_page',
    label: 'Customer Details',
    type: 'record',
    object: 'customer',
    template: 'header-main',
    isDefault: false,
    
    regions: [
      {
        name: 'header',
        components: [
          {
            type: 'custom-button',
            properties: {
              label: 'Edit {name}',  // Template expression
              variant: 'primary',
              size: 'large',
            },
          },
        ],
      },
      {
        name: 'main',
        components: [
          {
            type: 'custom-data-grid',
            properties: {
              columns: [
                { field: 'label', label: 'Field' },
                { field: 'value', label: 'Value' },
              ],
              pageSize: 10,
            },
          },
        ],
      },
    ],
  };

  const handleAction = (action: string, params?: any) => {
    console.log('Action triggered:', action, params);
    alert(`Action: ${action}\nParams: ${JSON.stringify(params, null, 2)}`);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Simple ObjectStack App</h1>
      <p>This example shows how to render UI from JSON metadata.</p>
      
      <div style={{ marginTop: '24px', padding: '24px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
        <PageRenderer
          page={pageMetadata}
          data={customer}
          registry={ComponentRegistry}
          onAction={handleAction}
        />
      </div>

      <details style={{ marginTop: '24px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          View Page Metadata (JSON)
        </summary>
        <pre style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#F8F9FA',
          borderRadius: '4px',
          overflow: 'auto',
        }}>
          {JSON.stringify(pageMetadata, null, 2)}
        </pre>
      </details>

      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          View Data Context
        </summary>
        <pre style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#F8F9FA',
          borderRadius: '4px',
          overflow: 'auto',
        }}>
          {JSON.stringify(customer, null, 2)}
        </pre>
      </details>
    </div>
  );
}
