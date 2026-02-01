/**
 * @objectstack/client-react
 * 
 * React hooks for ObjectStack Client SDK
 * 
 * Provides type-safe React hooks for:
 * - Data queries (useQuery, useMutation, usePagination, useInfiniteQuery)
 * - Metadata access (useObject, useView, useFields, useMetadata)
 * - Client context (ObjectStackProvider, useClient)
 */

// Context & Provider
export {
  ObjectStackProvider,
  ObjectStackContext,
  useClient,
  type ObjectStackProviderProps
} from './context';

// Data Hooks
export {
  useQuery,
  useMutation,
  usePagination,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  type UsePaginationOptions,
  type UsePaginationResult,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult
} from './data-hooks';

// Metadata Hooks
export {
  useObject,
  useView,
  useFields,
  useMetadata,
  type UseMetadataOptions,
  type UseMetadataResult
} from './metadata-hooks';

// Re-export ObjectStackClient and types from @objectstack/client
export { ObjectStackClient, type ClientConfig } from '@objectstack/client';
