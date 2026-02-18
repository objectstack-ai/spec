#!/usr/bin/env node

import { execute } from '@oclif/core';

await execute({ type: 'esm', dir: import.meta.url });
