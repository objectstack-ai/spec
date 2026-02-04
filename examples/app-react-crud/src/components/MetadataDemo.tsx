import { useState, useEffect } from 'react';
import { MetadataManager, RemoteLoader } from '@objectstack/metadata';

export function MetadataDemo() {
  const [manager, setManager] = useState<MetadataManager | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Metadata Manager with Remote Loader pointing to MSW
    // MSW is configured at /api/v1
    // MSW Plugin exposes metadata at /meta/:type/:name
    // So RemoteLoader should target /api/v1/meta
    const mgr = new MetadataManager({
      loaders: [
        new RemoteLoader('/api/v1/meta')
      ]
    });
    setManager(mgr);
  }, []);

  const loadMetadata = async () => {
    if (!manager) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log('Fetching metadata for object: todo_task...');
      const result = await manager.load('objects', 'todo_task');
      console.log('Result:', result);
      
      if (result) {
        setData(result);
      } else {
        setError('Metadata not found');
      }
    } catch (err) {
      console.error('Metadata load error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="text-lg font-bold mb-2">Remote Loader Demo (Browser)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Fetches metadata via <code>RemoteLoader</code> → <code>fetch</code> → <code>MSW Interceptor</code> → <code>ObjectStack Kernel</code>
      </p>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={loadMetadata} 
          disabled={loading || !manager}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load TodoTask Metadata'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-2">
          {error}
        </div>
      )}

      {data && (
        <div className="bg-white p-3 rounded border overflow-auto max-h-60">
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
