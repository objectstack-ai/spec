/**
 * Component Registry
 * 
 * Maps component type names to React component implementations.
 * This registry is used by the UI renderer to instantiate components
 * based on metadata.
 */

import { CustomButton } from './components/CustomButton';
import { CustomDataGrid } from './components/CustomDataGrid';

export interface ComponentRegistryType {
  [key: string]: React.ComponentType<any>;
}

/**
 * Global component registry
 * 
 * Components are registered here and referenced by their type name
 * in the UI metadata.
 */
export const ComponentRegistry: ComponentRegistryType = {
  // Custom components
  'custom-button': CustomButton,
  'custom-data-grid': CustomDataGrid,
  
  // You can add more components here
  // 'custom-chart': CustomChart,
  // 'custom-form': CustomForm,
  // 'custom-card': CustomCard,
};

/**
 * Helper function to register a component
 */
export function registerComponent(name: string, component: React.ComponentType<any>) {
  ComponentRegistry[name] = component;
}

/**
 * Helper function to get a component by name
 */
export function getComponent(name: string): React.ComponentType<any> | undefined {
  return ComponentRegistry[name];
}

/**
 * Helper function to check if a component is registered
 */
export function hasComponent(name: string): boolean {
  return name in ComponentRegistry;
}
