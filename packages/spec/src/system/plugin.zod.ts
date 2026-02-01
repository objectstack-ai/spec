import { z } from 'zod';

// Helper to create async function schema compatible with Zod v4
// In Zod v4, z.function with z.promise doesn't infer correctly, so we use z.custom for proper typing
const createAsyncFunctionSchema = <T extends z.ZodFunction<any, any>>(_schema: T) =>
  z.custom<Parameters<T['implementAsync']>[0]>((fn) => typeof fn === 'function');

// We use z.any() for services that are interfaces with methods, 
// as Zod cannot easily validate function signatures at runtime.
export const PluginContextSchema = z.object({
  ql: z.object({
    object: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.any()
    }), // Return any to allow method chaining
    query: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.any()
    }),
  }).passthrough().describe('ObjectQL Engine Interface'),

  os: z.object({
    getCurrentUser: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.any()
    }),
    getConfig: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.any()
    }),
  }).passthrough().describe('ObjectStack Kernel Interface'),

  logger: z.object({
    debug: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.void()
    }),
    info: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.void()
    }),
    warn: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.void()
    }),
    error: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.void()
    }),
  }).passthrough().describe('Logger Interface'),

  storage: z.object({
    get: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.any()
    }),
    set: createAsyncFunctionSchema(
      z.function({
        input: z.tuple([]).rest(z.any()),
        output: z.promise(z.void())
      })
    ),
    delete: createAsyncFunctionSchema(
      z.function({
        input: z.tuple([]).rest(z.any()),
        output: z.promise(z.void())
      })
    ),
  }).passthrough().describe('Storage Interface'),

  i18n: z.object({
    t: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.string()
    }),
    getLocale: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.string()
    }),
  }).passthrough().describe('Internationalization Interface'),

  metadata: z.record(z.string(), z.any()),
  events: z.record(z.string(), z.any()),
  
  app: z.object({
    router: z.object({
      get: z.function({
        input: z.tuple([]).rest(z.any()),
        output: z.any()
      }),
      post: z.function({
        input: z.tuple([]).rest(z.any()),
        output: z.any()
      }),
      use: z.function({
        input: z.tuple([]).rest(z.any()),
        output: z.any()
      }),
    }).passthrough()
  }).passthrough().describe('App Framework Interface'),

  drivers: z.object({
    register: z.function({
      input: z.tuple([]).rest(z.any()),
      output: z.void()
    }),
  }).passthrough().describe('Driver Registry'),
});

export type PluginContextData = z.infer<typeof PluginContextSchema>;

export const PluginLifecycleSchema = z.object({
  onInstall: createAsyncFunctionSchema(
    z.function({
      input: z.tuple([PluginContextSchema]),
      output: z.promise(z.void())
    })
  ).optional(),
  
  onEnable: createAsyncFunctionSchema(
    z.function({
      input: z.tuple([PluginContextSchema]),
      output: z.promise(z.void())
    })
  ).optional(),
  
  onDisable: createAsyncFunctionSchema(
    z.function({
      input: z.tuple([PluginContextSchema]),
      output: z.promise(z.void())
    })
  ).optional(),
  
  onUninstall: createAsyncFunctionSchema(
    z.function({
      input: z.tuple([PluginContextSchema]),
      output: z.promise(z.void())
    })
  ).optional(),
  
  onUpgrade: createAsyncFunctionSchema(
    z.function({
      input: z.tuple([PluginContextSchema, z.string(), z.string()]),
      output: z.promise(z.void())
    })
  ).optional(),
});

export type PluginLifecycleHooks = z.infer<typeof PluginLifecycleSchema>;

export const PluginSchema = PluginLifecycleSchema.extend({
  id: z.string().min(1).optional().describe('Unique Plugin ID (e.g. com.example.crm)'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional().describe('Semantic Version'),
  description: z.string().optional(),
  author: z.string().optional(),
  homepage: z.string().url().optional(),
});

export type PluginDefinition = z.infer<typeof PluginSchema>;
