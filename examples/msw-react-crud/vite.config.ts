import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      'msw', 
      'msw/browser',
      '@objectstack/spec/data', // Force pre-bundling for CJS compatibility
      '@objectstack/spec/system',
      '@objectstack/spec/ui'
    ]
  }
});
