---
"@objectstack/plugin-hono-server": patch
"@objectstack/objectql": patch
---

refactor: fix service registration compatibility and improve logging
- plugin-hono-server: register 'http.server' service alias to match core requirements
- plugin-hono-server: fix console log to show the actual bound port instead of configured port
- plugin-hono-server: reduce log verbosity (moved non-essential logs to debug level)
- objectql: automatically register 'metadata', 'data', 'and 'auth' services during initialization to satisfy kernel contracts
