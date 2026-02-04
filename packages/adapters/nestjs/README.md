# @objectstack/nestjs

The official NestJS integration for ObjectStack.

## Features
- `ObjectStackModule`: Global module for DI.
- `ObjectStackService`: Injectable wrapper for the Kernel.
- Compatible with all NestJS features (Guards, Interceptors, Pipes).

## Usage

```typescript
import { Module } from '@nestjs/common';
import { ObjectStackModule } from '@objectstack/nestjs';
import { kernel } from './kernel';

@Module({
  imports: [
    ObjectStackModule.forRoot(kernel)
  ]
})
export class AppModule {}
```
