/**
 * Custom React Hooks for ObjectStack Data Operations
 * 
 * This file provides reusable hooks for working with ObjectStack APIs
 * using the @objectstack/client package. These hooks handle common patterns
 * like data fetching, mutations, loading states, and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { ObjectStackClient } from '@objectstack/client';

/**
 * Response type for API operations
 */
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Response type for mutation operations
 */
interface MutationResponse<T> {
  execute: (data: T) => Promise<any>;
  loading: boolean;
  error: string | null;
  data: any;
}

/**
 * Get or create a singleton client instance
 */
let clientInstance: ObjectStackClient | null = null;

function getClient(baseUrl: string = 'http://localhost:3000'): ObjectStackClient {
  if (!clientInstance) {
    clientInstance = new ObjectStackClient({ baseUrl });
  }
  return clientInstance;
}

/**
 * Hook for fetching data using ObjectStack Client
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useObjectData('user');
 * ```
 */
export function useObjectData<T = any>(
  objectName: string,
  id?: string,
  options?: {
    baseUrl?: string;
    autoFetch?: boolean;
  }
): ApiResponse<T> {
  const { baseUrl = 'http://localhost:3000', autoFetch = true } = options || {};
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient(baseUrl);
      
      let result: any;
      if (id) {
        // Get single record
        result = await client.data.get<T>(objectName, id);
      } else {
        // Get list of records
        const response = await client.data.find<T>(objectName);
        result = response.value; // Extract array from paginated result
      }
      
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to fetch ${objectName}`;
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [objectName, id, baseUrl]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for creating records using ObjectStack Client
 * 
 * @example
 * ```tsx
 * const { execute: createUser, loading, error } = useCreateData('user');
 * await createUser({ name: 'John', email: 'john@example.com' });
 * ```
 */
export function useCreateData<T = any>(
  objectName: string,
  options?: {
    baseUrl?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
  }
): MutationResponse<T> {
  const { baseUrl = 'http://localhost:3000', onSuccess, onError } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (payload: T) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient(baseUrl);
      const result = await client.data.create<T>(objectName, payload);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to create ${objectName}`;
      setError(message);
      
      if (onError) {
        onError(message);
      }
      
      console.error('Create error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [objectName, baseUrl, onSuccess, onError]);

  return {
    execute,
    loading,
    error,
    data,
  };
}

/**
 * Hook for updating records using ObjectStack Client
 * 
 * @example
 * ```tsx
 * const { execute: updateUser, loading } = useUpdateData('user');
 * await updateUser({ id: '123', data: { name: 'John Updated' } });
 * ```
 */
export function useUpdateData<T = any>(
  objectName: string,
  options?: {
    baseUrl?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
  }
): MutationResponse<{ id: string; data: Partial<T> }> {
  const { baseUrl = 'http://localhost:3000', onSuccess, onError } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async ({ id, data: payload }: { id: string; data: Partial<T> }) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient(baseUrl);
      const result = await client.data.update<T>(objectName, id, payload);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to update ${objectName}`;
      setError(message);
      
      if (onError) {
        onError(message);
      }
      
      console.error('Update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [objectName, baseUrl, onSuccess, onError]);

  return {
    execute,
    loading,
    error,
    data,
  };
}

/**
 * Hook for deleting records using ObjectStack Client
 * 
 * @example
 * ```tsx
 * const { execute: deleteUser, loading } = useDeleteData('user');
 * await deleteUser('123');
 * ```
 */
export function useDeleteData(
  objectName: string,
  options?: {
    baseUrl?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }
): MutationResponse<string> {
  const { baseUrl = 'http://localhost:3000', onSuccess, onError } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient(baseUrl);
      const result = await client.data.delete(objectName, id);
      setData(result);
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to delete ${objectName}`;
      setError(message);
      
      if (onError) {
        onError(message);
      }
      
      console.error('Delete error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [objectName, baseUrl, onSuccess, onError]);

  return {
    execute,
    loading,
    error,
    data,
  };
}

/**
 * Hook for fetching metadata using ObjectStack Client
 * 
 * @example
 * ```tsx
 * const { data: objectMeta } = useMetadata('object', 'user');
 * ```
 */
export function useMetadata<T = any>(
  metaType: string,
  metaName?: string,
  options?: {
    baseUrl?: string;
    autoFetch?: boolean;
  }
): ApiResponse<T> {
  const { baseUrl = 'http://localhost:3000', autoFetch = true } = options || {};
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient(baseUrl);
      
      // For now, only support 'object' type since that's what the client exposes
      if (metaType === 'object' && metaName) {
        const result = await client.meta.getObject(metaName);
        setData(result);
      } else {
        throw new Error('useMetadata currently only supports fetching object metadata');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch metadata';
      setError(message);
      console.error('Metadata fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [metaType, metaName, baseUrl]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
