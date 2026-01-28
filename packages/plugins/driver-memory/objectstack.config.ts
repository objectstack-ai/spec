import { ObjectStackManifest } from '@objectstack/spec/system';

const MemoryDriverPlugin: ObjectStackManifest = {
  id: 'com.objectstack.driver.memory',
  name: 'In-Memory Driver',
  version: '1.0.0',
  type: 'driver',
  description: 'A reference specificiation implementation of the DriverInterface using in-memory arrays.',
  
  configuration: {
    title: 'Memory Driver Settings',
    properties: {
      seedData: {
        type: 'boolean',
        default: false,
        description: 'Pre-populate the database with example data on startup'
      }
    }
  },

  contributes: {
     // If there was a 'drivers' definition here, we would use it.
     // For now, we register via code (src/index.ts)
  }
};

export default MemoryDriverPlugin;
