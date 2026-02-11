import { describe, it, expect } from 'vitest';
import type { IGraphQLService, GraphQLRequest, GraphQLResponse } from './graphql-service';

describe('GraphQL Service Contract', () => {
  it('should allow a minimal IGraphQLService implementation with required methods', () => {
    const service: IGraphQLService = {
      execute: async (_request, _context?) => ({ data: null }),
    };

    expect(typeof service.execute).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IGraphQLService = {
      execute: async () => ({ data: null }),
      handleRequest: async (_request) => new Response('OK'),
      getSchema: () => 'type Query { hello: String }',
    };

    expect(service.handleRequest).toBeDefined();
    expect(service.getSchema).toBeDefined();
  });

  it('should execute a GraphQL query', async () => {
    const service: IGraphQLService = {
      execute: async (request): Promise<GraphQLResponse> => {
        if (request.query.includes('hello')) {
          return { data: { hello: 'world' } };
        }
        return { data: null, errors: [{ message: 'Unknown query' }] };
      },
    };

    const result = await service.execute({ query: '{ hello }' });
    expect(result.data).toEqual({ hello: 'world' });
    expect(result.errors).toBeUndefined();
  });

  it('should return errors for invalid queries', async () => {
    const service: IGraphQLService = {
      execute: async (): Promise<GraphQLResponse> => ({
        data: null,
        errors: [{
          message: 'Cannot query field "invalid"',
          locations: [{ line: 1, column: 3 }],
        }],
      }),
    };

    const result = await service.execute({ query: '{ invalid }' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0].message).toContain('invalid');
  });

  it('should support variables in queries', async () => {
    const service: IGraphQLService = {
      execute: async (request: GraphQLRequest): Promise<GraphQLResponse> => {
        const id = request.variables?.id;
        return { data: { user: { id, name: 'Alice' } } };
      },
    };

    const result = await service.execute({
      query: 'query GetUser($id: ID!) { user(id: $id) { id name } }',
      operationName: 'GetUser',
      variables: { id: 'u1' },
    });

    expect(result.data?.user).toEqual({ id: 'u1', name: 'Alice' });
  });

  it('should return SDL schema', () => {
    const service: IGraphQLService = {
      execute: async () => ({ data: null }),
      getSchema: () => 'type Query { users: [User] }\ntype User { id: ID! name: String }',
    };

    const schema = service.getSchema!();
    expect(schema).toContain('type Query');
    expect(schema).toContain('User');
  });
});
