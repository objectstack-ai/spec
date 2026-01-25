/**
 * MSW Demo - Exports
 * 
 * This file exports all components, hooks, and utilities for easy importing.
 */

// Components
export { UserManagement } from './components/UserManagement';
export { UserList } from './components/UserList';

// Hooks
export {
  useObjectData,
  useCreateData,
  useUpdateData,
  useDeleteData,
  useMetadata,
} from './hooks/useObjectData';

// Demo App
export { DemoApp, setupMSW, main } from './demo';

// MSW Setup (from browser.ts)
export { worker } from './browser';
