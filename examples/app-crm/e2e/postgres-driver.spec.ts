import { runDriverAcceptance } from './_acceptance';

/**
 * Boots `pnpm dev` with `OS_DATABASE_URL=postgres://...`
 * (driver auto-inferred → SqlDriver(client:'pg')).
 * Requires a running PostgreSQL instance reachable at the URL.
 */
runDriverAcceptance({ label: 'PostgreSQL' });
