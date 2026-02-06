// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

describe('DOM Rendering Verification', () => {
  it('should manipulate the DOM directly', () => {
    // Basic DOM check
    const div = document.createElement('div');
    div.id = 'native-dom-test';
    div.textContent = 'Native DOM';
    document.body.appendChild(div);

    const found = document.getElementById('native-dom-test');
    expect(found).not.toBeNull();
    expect(found?.textContent).toBe('Native DOM');
    
    // Cleanup
    document.body.removeChild(div);
  });

  it('should render React components into the DOM', () => {
    // Create a container for React
    const container = document.createElement('div');
    container.id = 'react-container';
    document.body.appendChild(container); // attach to body to be "real"

    const root = createRoot(container);
    
    // Use flushSync to force synchronous rendering for checking immediately
    flushSync(() => {
        root.render(
            <div data-testid="hello-react">
                Hello React World
            </div>
        );
    });

    // Check DOM
    const element = document.querySelector('[data-testid="hello-react"]');
    expect(element).not.toBeNull();
    expect(element?.textContent).toBe('Hello React World');

    // Cleanup
    flushSync(() => {
        root.unmount();
    });
    container.remove();
  });
});
