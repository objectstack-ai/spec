// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ObjectStack React Context
 * 
 * Provides ObjectStackClient instance to React components via Context API
 */

import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { ObjectStackClient } from '@objectstack/client';

export interface ObjectStackProviderProps {
  client: ObjectStackClient;
  children: ReactNode;
}

export const ObjectStackContext = createContext<ObjectStackClient | null>(null);

/**
 * Provider component that makes ObjectStackClient available to all child components
 * 
 * @example
 * ```tsx
 * const client = new ObjectStackClient({ baseUrl: 'http://localhost:3000' });
 * 
 * function App() {
 *   return (
 *     <ObjectStackProvider client={client}>
 *       <YourComponents />
 *     </ObjectStackProvider>
 *   );
 * }
 * ```
 */
export function ObjectStackProvider({ client, children }: ObjectStackProviderProps) {
  return (
    <ObjectStackContext.Provider value={client}>
      {children}
    </ObjectStackContext.Provider>
  );
}

/**
 * Hook to access the ObjectStackClient instance from context
 * 
 * @throws Error if used outside of ObjectStackProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const client = useClient();
 *   // Use client.data.find(), etc.
 * }
 * ```
 */
export function useClient(): ObjectStackClient {
  const client = useContext(ObjectStackContext);
  
  if (!client) {
    throw new Error(
      'useClient must be used within an ObjectStackProvider. ' +
      'Make sure your component is wrapped with <ObjectStackProvider client={...}>.'
    );
  }
  
  return client;
}
