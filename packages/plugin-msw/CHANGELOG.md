# @objectstack/plugin-msw

## 0.4.1

### Patch Changes

- Version synchronization and dependency updates

  - Synchronized plugin-msw version to 0.4.1
  - Updated runtime peer dependency versions to ^0.4.1
  - Fixed internal dependency version mismatches

- Updated dependencies
  - @objectstack/spec@0.4.1
  - @objectstack/types@0.4.1
  - @objectstack/runtime@0.4.1

## 0.3.3

### Patch Changes

- Updated dependencies
  - @objectstack/spec@0.3.3
  - @objectstack/runtime@0.3.3
  - @objectstack/types@0.3.3

## 0.3.2

### Patch Changes

- Patch release for maintenance and stability improvements
- Updated dependencies
  - @objectstack/runtime@0.3.2
  - @objectstack/spec@0.3.2
  - @objectstack/types@0.3.2

## 0.3.1

### Added

- Initial release of MSW plugin for ObjectStack
- `MSWPlugin` class implementing RuntimePlugin interface
- `ObjectStackServer` mock server for handling API calls
- Automatic generation of MSW handlers for ObjectStack API endpoints
- Support for browser and Node.js environments
- Custom handler support
- Comprehensive documentation and examples
- TypeScript type definitions

### Features

- Discovery endpoint mocking
- Metadata endpoint mocking
- Data CRUD operation mocking
- UI protocol endpoint mocking
- Request logging support
- Configurable base URL
- Integration with ObjectStack Runtime Protocol
