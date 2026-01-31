# @objectstack/client-react

## 0.7.2

### Patch Changes

- fb41cc0: Patch release: Updated documentation and JSON schemas
- Updated dependencies [fb41cc0]
  - @objectstack/spec@0.7.2
  - @objectstack/core@0.7.2
  - @objectstack/client@0.7.2

## 0.7.1

### Patch Changes

- Updated dependencies
  - @objectstack/spec@0.7.1
  - @objectstack/client@0.7.1
  - @objectstack/core@0.7.1

## 0.6.1

### Added

- Initial release of React hooks for ObjectStack Client
- **Data Query Hooks**:
  - `useQuery` - Query data with automatic caching and refetching
  - `useMutation` - Create, update, or delete data
  - `usePagination` - Paginated data queries with navigation
  - `useInfiniteQuery` - Infinite scrolling / load more functionality
- **Metadata Hooks**:
  - `useObject` - Fetch object schema/metadata
  - `useView` - Fetch view configuration
  - `useFields` - Get fields list from object schema
  - `useMetadata` - Generic metadata queries
- **Context Provider**:
  - `ObjectStackProvider` - React context provider for ObjectStackClient
  - `useClient` - Access ObjectStackClient from context
- Full TypeScript support with generic types
- Comprehensive documentation and examples
