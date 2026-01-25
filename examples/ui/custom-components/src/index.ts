/**
 * Custom Components Example - Main Exports
 */

export { CustomButton } from './components/CustomButton';
export { CustomDataGrid } from './components/CustomDataGrid';
export type { ComponentProps } from './components/CustomButton';

export {
  ComponentRegistry,
  registerComponent,
  getComponent,
  hasComponent,
} from './registry';
