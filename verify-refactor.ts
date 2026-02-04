
import { ObjectKernel, ObjectRegistry } from './packages/objectql/src';
import { CoreServiceName } from './packages/spec/src/system/service-registry.zod';
import { HttpDispatcher } from './packages/runtime/src/http-dispatcher';
import { ObjectStackClient } from './packages/client/src';

async function verify() {
    console.log("--- Verifying ObjectStack Components ---");

    // 1. ObjectQL Engine & Registry
    console.log("\n1. Testing ObjectQL Engine Status:");
    const registry = new ObjectRegistry();
    const kernel = new ObjectKernel(registry);
    const status = kernel.getStatus();
    console.log("Kernel Status:", JSON.stringify(status, null, 2));

    if (status.service !== CoreServiceName.data) {
        console.error("FAIL: Kernel service name mismatch.");
    } else {
        console.log("PASS: Kernel service name matches.");
    }


    // 2. Runtime Dispatcher
    console.log("\n2. Testing Runtime HttpDispatcher:");
    const dispatcher = new HttpDispatcher();
    const dataService = dispatcher.getService(CoreServiceName.data);
    const analyticsService = dispatcher.getService(CoreServiceName.analytics);

    console.log(`Data Service URL: ${dataService?.url}`);
    console.log(`Analytics Service URL: ${analyticsService?.url}`);

    if (dataService?.url && analyticsService?.url) {
         console.log("PASS: Services resolved correctly.");
    } else {
         console.error("FAIL: Service resolution failed.");
    }

    // 3. Client SDK
     console.log("\n3. Testing Client SDK Structure:");
     const client = new ObjectStackClient({
         baseUrl: 'http://localhost:5000'
     });

     if (typeof client.analytics === 'object' && typeof client.hub === 'object') {
         console.log("PASS: Client has 'analytics' and 'hub' namespaces.");
         if (typeof client.analytics.query === 'function' && typeof client.hub.spaces.list === 'function') {
              console.log("PASS: Client methods are functions.");
         } else {
              console.error("FAIL: Client methods are missing.");
         }
     } else {
          console.error("FAIL: Client missing namespaces.");
     }

}

verify().catch(console.error);
