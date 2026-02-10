// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectStackProtocolImplementation } from './protocol.js';
import { ObjectQL } from './engine.js';

describe('ObjectStackProtocolImplementation - Dynamic Service Discovery', () => {
  let protocol: ObjectStackProtocolImplementation;
  let engine: ObjectQL;
  
  beforeEach(() => {
    engine = new ObjectQL();
  });

  it('should return unavailable auth service when no services registered', async () => {
    // Create protocol without service registry
    protocol = new ObjectStackProtocolImplementation(engine);
    
    const discovery = await protocol.getDiscovery();
    
    expect(discovery.services.auth).toBeDefined();
    expect(discovery.services.auth.enabled).toBe(false);
    expect(discovery.services.auth.status).toBe('unavailable');
    expect(discovery.services.auth.message).toContain('plugin-auth');
    expect(discovery.capabilities.workflow).toBe(false);
  });

  it('should return available auth service when auth is registered', async () => {
    // Mock service registry with auth service
    const mockServices = new Map<string, any>();
    mockServices.set('auth', { /* mock auth service */ });
    
    protocol = new ObjectStackProtocolImplementation(engine, () => mockServices);
    
    const discovery = await protocol.getDiscovery();
    
    expect(discovery.services.auth).toBeDefined();
    expect(discovery.services.auth.enabled).toBe(true);
    expect(discovery.services.auth.status).toBe('available');
    expect(discovery.services.auth.route).toBe('/api/v1/auth');
    expect(discovery.services.auth.provider).toBe('plugin-auth');
    expect(discovery.endpoints.auth).toBe('/api/v1/auth');
  });

  it('should return available workflow when automation service is registered', async () => {
    const mockServices = new Map<string, any>();
    mockServices.set('automation', { /* mock automation service */ });
    
    protocol = new ObjectStackProtocolImplementation(engine, () => mockServices);
    
    const discovery = await protocol.getDiscovery();
    
    expect(discovery.services.automation).toBeDefined();
    expect(discovery.services.automation.enabled).toBe(true);
    expect(discovery.services.automation.status).toBe('available');
    expect(discovery.capabilities.workflow).toBe(true);
  });

  it('should return multiple available services when registered', async () => {
    const mockServices = new Map<string, any>();
    mockServices.set('auth', {});
    mockServices.set('realtime', {});
    mockServices.set('ai', {});
    
    protocol = new ObjectStackProtocolImplementation(engine, () => mockServices);
    
    const discovery = await protocol.getDiscovery();
    
    // Check auth
    expect(discovery.services.auth.enabled).toBe(true);
    expect(discovery.services.auth.status).toBe('available');
    
    // Check realtime
    expect(discovery.services.realtime.enabled).toBe(true);
    expect(discovery.services.realtime.status).toBe('available');
    expect(discovery.capabilities.websockets).toBe(true);
    
    // Check AI
    expect(discovery.services.ai.enabled).toBe(true);
    expect(discovery.services.ai.status).toBe('available');
    expect(discovery.capabilities.ai).toBe(true);
    
    // Endpoints should include available services
    expect(discovery.endpoints.auth).toBe('/api/v1/auth');
    expect(discovery.endpoints.realtime).toBe('/api/v1/realtime');
    expect(discovery.endpoints.ai).toBe('/api/v1/ai');
  });

  it('should always show core services as available', async () => {
    protocol = new ObjectStackProtocolImplementation(engine);
    
    const discovery = await protocol.getDiscovery();
    
    // Core services should always be available
    expect(discovery.services.metadata.enabled).toBe(true);
    expect(discovery.services.metadata.status).toBe('degraded');
    expect(discovery.services.data.enabled).toBe(true);
    expect(discovery.services.data.status).toBe('available');
    expect(discovery.services.analytics.enabled).toBe(true);
    expect(discovery.services.analytics.status).toBe('available');
    
    // Core capabilities
    expect(discovery.capabilities.analytics).toBe(true);
  });

  it('should map file-storage service to storage endpoint', async () => {
    const mockServices = new Map<string, any>();
    mockServices.set('file-storage', {});
    
    protocol = new ObjectStackProtocolImplementation(engine, () => mockServices);
    
    const discovery = await protocol.getDiscovery();
    
    expect(discovery.services['file-storage'].enabled).toBe(true);
    expect(discovery.services['file-storage'].status).toBe('available');
    expect(discovery.endpoints.storage).toBe('/api/v1/storage');
    expect(discovery.capabilities.files).toBe(true);
  });

  it('should handle workflow capability from either automation or workflow service', async () => {
    // Test with workflow service
    const mockServicesWithWorkflow = new Map<string, any>();
    mockServicesWithWorkflow.set('workflow', {});
    
    protocol = new ObjectStackProtocolImplementation(engine, () => mockServicesWithWorkflow);
    let discovery = await protocol.getDiscovery();
    expect(discovery.capabilities.workflow).toBe(true);
    
    // Test with automation service
    const mockServicesWithAutomation = new Map<string, any>();
    mockServicesWithAutomation.set('automation', {});
    
    protocol = new ObjectStackProtocolImplementation(engine, () => mockServicesWithAutomation);
    discovery = await protocol.getDiscovery();
    expect(discovery.capabilities.workflow).toBe(true);
  });
});
