/**
 * Data Query Hooks
 * 
 * React hooks for querying and mutating ObjectStack data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryAST, FilterCondition } from '@objectstack/spec/data';
import { PaginatedResult } from '@objectstack/client';
import { useClient } from './context';

/**
 * Query options for useQuery hook
 */
export interface UseQueryOptions<T = any> {
  /** Query AST or simplified query options */
  query?: Partial<QueryAST>;
  /** Simple field selection */
  select?: string[];
  /** Simple filters */
  filters?: FilterCondition;
  /** Sort configuration */
  sort?: string | string[];
  /** Limit results */
  top?: number;
  /** Skip results (for pagination) */
  skip?: number;
  /** Enable/disable automatic query execution */
  enabled?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
  /** Callback on successful query */
  onSuccess?: (data: PaginatedResult<T>) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Query result for useQuery hook
 */
export interface UseQueryResult<T = any> {
  /** Query result data */
  data: PaginatedResult<T> | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch the query */
  refetch: () => Promise<void>;
  /** Is currently refetching */
  isRefetching: boolean;
}

/**
 * Hook for querying ObjectStack data with automatic caching and refetching
 * 
 * @example
 * ```tsx
 * function TaskList() {
 *   const { data, isLoading, error, refetch } = useQuery('todo_task', {
 *     select: ['id', 'subject', 'priority'],
 *     sort: ['-created_at'],
 *     top: 20
 *   });
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 * 
 *   return (
 *     <div>
 *       {data?.value.map(task => (
 *         <div key={task.id}>{task.subject}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useQuery<T = any>(
  object: string,
  options: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const client = useClient();
  const [data, setData] = useState<PaginatedResult<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const {
    query,
    select,
    filters,
    sort,
    top,
    skip,
    enabled = true,
    refetchInterval,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;
    
    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      let result: PaginatedResult<T>;
      
      if (query) {
        // Use advanced query API
        result = await client.data.query<T>(object, query);
      } else {
        // Use simplified find API
        result = await client.data.find<T>(object, {
          select,
          filters: filters as any,
          sort,
          top,
          skip
        });
      }

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [client, object, query, select, filters, sort, top, skip, enabled, onSuccess, onError]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Setup refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    return undefined;
  }, [refetchInterval, enabled, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  };
}

/**
 * Mutation options for useMutation hook
 */
export interface UseMutationOptions<TData = any, TVariables = any> {
  /** Callback on successful mutation */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Callback on error */
  onError?: (error: Error, variables: TVariables) => void;
  /** Callback when mutation is settled (success or error) */
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

/**
 * Mutation result for useMutation hook
 */
export interface UseMutationResult<TData = any, TVariables = any> {
  /** Execute the mutation */
  mutate: (variables: TVariables) => Promise<TData>;
  /** Async version of mutate that throws errors */
  mutateAsync: (variables: TVariables) => Promise<TData>;
  /** Mutation result data */
  data: TData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Reset mutation state */
  reset: () => void;
}

/**
 * Hook for creating, updating, or deleting ObjectStack data
 * 
 * @example
 * ```tsx
 * function CreateTaskForm() {
 *   const { mutate, isLoading, error } = useMutation('todo_task', 'create', {
 *     onSuccess: (data) => {
 *       console.log('Task created:', data);
 *     }
 *   });
 * 
 *   const handleSubmit = (formData) => {
 *     mutate(formData);
 *   };
 * 
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useMutation<TData = any, TVariables = any>(
  object: string,
  operation: 'create' | 'update' | 'delete' | 'createMany' | 'updateMany' | 'deleteMany',
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const client = useClient();
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError, onSettled } = options;

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: TData;

      switch (operation) {
        case 'create':
          result = await client.data.create<TData>(object, variables as any);
          break;
        case 'update':
          // Expect variables to be { id: string, data: Partial<T> }
          const updateVars = variables as any;
          result = await client.data.update<TData>(object, updateVars.id, updateVars.data);
          break;
        case 'delete':
          // Expect variables to be { id: string }
          const deleteVars = variables as any;
          result = await client.data.delete(object, deleteVars.id) as any;
          break;
        case 'createMany':
          // createMany returns an array, which may not match TData type
          result = await client.data.createMany(object, variables as any) as any;
          break;
        case 'updateMany':
          // Expect variables to be { records: Array<{ id: string, data: Partial<T> }> }
          const updateManyVars = variables as any;
          result = await client.data.updateMany(object, updateManyVars.records, updateManyVars.options) as any;
          break;
        case 'deleteMany':
          // Expect variables to be { ids: string[] }
          const deleteManyVars = variables as any;
          result = await client.data.deleteMany(object, deleteManyVars.ids, deleteManyVars.options) as any;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setData(result);
      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      onError?.(error, variables);
      onSettled?.(undefined, error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, object, operation, onSuccess, onError, onSettled]);

  const mutate = useCallback((variables: TVariables): Promise<TData> => {
    return mutateAsync(variables).catch(() => {
      // Swallow error for non-async version
      // Error is still available in the error state
      return null as any;
    });
  }, [mutateAsync]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    isLoading,
    error,
    reset
  };
}

/**
 * Pagination options for usePagination hook
 */
export interface UsePaginationOptions<T = any> extends Omit<UseQueryOptions<T>, 'top' | 'skip'> {
  /** Page size */
  pageSize?: number;
  /** Initial page (1-based) */
  initialPage?: number;
}

/**
 * Pagination result for usePagination hook
 */
export interface UsePaginationResult<T = any> extends UseQueryResult<T> {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of records */
  totalCount: number;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Hook for paginated data queries
 * 
 * @example
 * ```tsx
 * function PaginatedTaskList() {
 *   const {
 *     data,
 *     isLoading,
 *     page,
 *     totalPages,
 *     nextPage,
 *     previousPage,
 *     hasNextPage,
 *     hasPreviousPage
 *   } = usePagination('todo_task', {
 *     pageSize: 10,
 *     sort: ['-created_at']
 *   });
 * 
 *   return (
 *     <div>
 *       {data?.value.map(task => <div key={task.id}>{task.subject}</div>)}
 *       <button onClick={previousPage} disabled={!hasPreviousPage}>Previous</button>
 *       <span>Page {page} of {totalPages}</span>
 *       <button onClick={nextPage} disabled={!hasNextPage}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePagination<T = any>(
  object: string,
  options: UsePaginationOptions<T> = {}
): UsePaginationResult<T> {
  const { pageSize = 20, initialPage = 1, ...queryOptions } = options;
  const [page, setPage] = useState(initialPage);

  const queryResult = useQuery<T>(object, {
    ...queryOptions,
    top: pageSize,
    skip: (page - 1) * pageSize
  });

  const totalCount = queryResult.data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(p => p + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(p => p - 1);
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback((newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(clampedPage);
  }, [totalPages]);

  return {
    ...queryResult,
    page,
    totalPages,
    totalCount,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage
  };
}

/**
 * Infinite query options for useInfiniteQuery hook
 */
export interface UseInfiniteQueryOptions<T = any> extends Omit<UseQueryOptions<T>, 'skip'> {
  /** Page size for each fetch */
  pageSize?: number;
  /** Get next page parameter */
  getNextPageParam?: (lastPage: PaginatedResult<T>, allPages: PaginatedResult<T>[]) => number | undefined;
}

/**
 * Infinite query result for useInfiniteQuery hook
 */
export interface UseInfiniteQueryResult<T = any> {
  /** All pages of data */
  data: PaginatedResult<T>[];
  /** Flattened data from all pages */
  flatData: T[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Load the next page */
  fetchNextPage: () => Promise<void>;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Is currently fetching next page */
  isFetchingNextPage: boolean;
  /** Refetch all pages */
  refetch: () => Promise<void>;
}

/**
 * Hook for infinite scrolling / load more functionality
 * 
 * @example
 * ```tsx
 * function InfiniteTaskList() {
 *   const {
 *     flatData,
 *     isLoading,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage
 *   } = useInfiniteQuery('todo_task', {
 *     pageSize: 20,
 *     sort: ['-created_at']
 *   });
 * 
 *   return (
 *     <div>
 *       {flatData.map(task => <div key={task.id}>{task.subject}</div>)}
 *       {hasNextPage && (
 *         <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
 *           {isFetchingNextPage ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteQuery<T = any>(
  object: string,
  options: UseInfiniteQueryOptions<T> = {}
): UseInfiniteQueryResult<T> {
  const client = useClient();
  const {
    pageSize = 20,
    // getNextPageParam is reserved for future use
    query,
    select,
    filters,
    sort,
    enabled = true,
    onSuccess,
    onError
  } = options;

  const [pages, setPages] = useState<PaginatedResult<T>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchPage = useCallback(async (skip: number, isNextPage = false) => {
    try {
      if (isNextPage) {
        setIsFetchingNextPage(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      let result: PaginatedResult<T>;

      if (query) {
        result = await client.data.query<T>(object, {
          ...query,
          limit: pageSize,
          offset: skip
        });
      } else {
        result = await client.data.find<T>(object, {
          select,
          filters: filters as any,
          sort,
          top: pageSize,
          skip
        });
      }

      if (isNextPage) {
        setPages(prev => [...prev, result]);
      } else {
        setPages([result]);
      }

      // Determine if there's a next page
      const fetchedCount = result.value.length;
      const hasMore = fetchedCount === pageSize;
      setHasNextPage(hasMore);

      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [client, object, query, select, filters, sort, pageSize, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchPage(0);
    }
  }, [enabled, fetchPage]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    const nextSkip = pages.length * pageSize;
    await fetchPage(nextSkip, true);
  }, [hasNextPage, isFetchingNextPage, pages.length, pageSize, fetchPage]);

  const refetch = useCallback(async () => {
    setPages([]);
    await fetchPage(0);
  }, [fetchPage]);

  const flatData = pages.flatMap(page => page.value);

  return {
    data: pages,
    flatData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  };
}
