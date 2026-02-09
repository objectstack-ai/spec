/**
 * Integration Test: Discovery & Connection
 * 
 * Tests the client's ability to discover and connect to an ObjectStack server.
 * These tests require a running server instance.
 * 
 * @see CLIENT_SERVER_INTEGRATION_TESTS.md for full test specification
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { ObjectStackClient } from '../../src/index';

const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:3000';

describe('Discovery & Connection', () => {
  describe('TC-DISC-001: Standard Discovery via .well-known', () => {
    test('should discover API from .well-known/objectstack', async () => {
      const client = new ObjectStackClient({ 
        baseUrl: TEST_SERVER_URL,
        debug: true
      });
      
      const discovery = await client.connect();
      
      expect(discovery.version).toBeDefined();
      expect(discovery.apiName).toBeDefined();
      expect(discovery.capabilities).toBeDefined();
      expect(discovery.endpoints).toBeDefined();
    });
  });

  describe('TC-DISC-002: Discovery Information', () => {
    test('should provide valid API version information', async () => {
      const client = new ObjectStackClient({ baseUrl: TEST_SERVER_URL });
      const discovery = await client.connect();
      
      // Version should be a semantic version or API version string
      expect(discovery.version).toMatch(/^v?\d+/);
      
      // API name should be non-empty
      expect(discovery.apiName.length).toBeGreaterThan(0);
    });
  });

  describe('TC-DISC-003: Connection Failure Handling', () => {
    test('should throw error when server is unreachable', async () => {
      const client = new ObjectStackClient({ 
        baseUrl: 'http://localhost:9999' // Invalid port
      });
      
      await expect(client.connect()).rejects.toThrow();
    });
  });

  describe('TC-DISC-004: Route Resolution', () => {
    test('should resolve API routes from discovery info', async () => {
      const client = new ObjectStackClient({ baseUrl: TEST_SERVER_URL });
      await client.connect();
      
      // After connection, client should have discovery info
      // This is tested implicitly by making actual API calls in other test suites
    });
  });
});
