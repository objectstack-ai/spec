
import { MetadataManager } from '@objectstack/metadata';
import { RemoteLoader } from '@objectstack/metadata';

// Mock global fetch to simulate MSW (Mock Service Worker)
// In a real app, MSW would intercept the requests network-level.
const mockDatabase: Record<string, any> = {
  'objects/customer': {
    name: 'customer',
    label: 'Customer',
    fields: {
      name: { type: 'text' }
    }
  },
  'views/all_customers': {
    name: 'all_customers',
    object: 'customer',
    type: 'grid'
  }
};

global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = input.toString();
  console.log(`[MockNetwork] ${init?.method || 'GET'} ${url}`);

  if (init?.method === 'GET') {
    // URL format: http://api.example.com/metadata/{type}/{name}
    const parts = url.split('/');
    const name = parts.pop();
    const type = parts.pop();
    const key = `${type}/${name}`;
    
    if (mockDatabase[key]) {
      return new Response(JSON.stringify(mockDatabase[key]), { status: 200 });
    }
    return new Response(null, { status: 404 });
  }

  // Handle loadMany (list)
  // URL format: http://api.example.com/metadata/{type}
  // This is a naive check, improvements needed for robust routing
  if (init?.method === 'GET' && !url.split('/').pop()?.includes('_')) {
     // Simplifying for demo: returns empty list for directory listing if not specific match above
     return new Response(JSON.stringify([]), { status: 200 });
  }

  return new Response(null, { status: 404 });
};


async function runRemoteDemo() {
  console.log('--- Starting Remote Loader Demo (Simulating MSW) ---');

  // 1. Initialize Manager with RemoteLoader
  const manager = new MetadataManager({
    loaders: [
      new RemoteLoader('http://api.example.com/metadata')
    ]
  });

  // 2. Load Item (Network Request -> Mocked Response)
  console.log('\nLoading Customer Object...');
  const customer = await manager.load('objects', 'customer');
  console.log('Result:', customer ? customer.label : 'Not Found');

  // 3. Load Missing Item
  console.log('\nLoading Missing Object...');
  const missing = await manager.load('objects', 'ghost');
  console.log('Result:', missing ? 'Found' : 'Correctly returned null');

  console.log('\n--- Demo Complete ---');
}

runRemoteDemo().catch(console.error);
