/**
 * Custom React Hooks for MSW Data Operations
 * 
 * This file provides reusable hooks for working with MSW-mocked APIs.
 * These hooks handle common patterns like data fetching, mutations,
 * loading states, and error handling.
 */

import { useState, useEffect, useCallback } from 'react';

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
 * Hook for fetching data from MSW-mocked endpoints
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
  const { baseUrl = '/api/v1', autoFetch = true } = options || {};
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = id 
        ? `${baseUrl}/data/${objectName}/${id}`
        : `${baseUrl}/data/${objectName}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${objectName}: ${response.statusText}`);
      }
      
      const result = await response.json();
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
 * Hook for creating records via MSW-mocked POST endpoints
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
  const { baseUrl = '/api/v1', onSuccess, onError } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (payload: T) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/data/${objectName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create ${objectName}: ${response.statusText}`);
      }
      
      const result = await response.json();
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
 * Hook for updating records via MSW-mocked PATCH endpoints
 * 
 * @example
 * ```tsx
 * const { execute: updateUser, loading } = useUpdateData('user');
 * await updateUser('123', { name: 'John Updated' });
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
  const { baseUrl = '/api/v1', onSuccess, onError } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async ({ id, data: payload }: { id: string; data: Partial<T> }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/data/${objectName}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update ${objectName}: ${response.statusText}`);
      }
      
      const result = await response.json();
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
 * Hook for deleting records via MSW-mocked DELETE endpoints
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
  const { baseUrl = '/api/v1', onSuccess, onError } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/data/${objectName}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${objectName}: ${response.statusText}`);
      }
      
      const result = await response.json();
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
 * Hook for fetching metadata via MSW-mocked endpoints
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
  const { baseUrl = '/api/v1', autoFetch = true } = options || {};
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${baseUrl}/meta/${metaType}`;
      if (metaName) {
        url += `/${metaName}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
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
