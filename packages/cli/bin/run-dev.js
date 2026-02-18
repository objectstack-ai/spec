#!/usr/bin/env tsx

import { execute } from '@oclif/core';

await execute({ type: 'esm', development: true, dir: import.meta.url });
