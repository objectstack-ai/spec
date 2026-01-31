# @objectstack/client-react

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
