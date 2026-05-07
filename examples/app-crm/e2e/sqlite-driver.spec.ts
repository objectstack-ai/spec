import { runDriverAcceptance } from './_acceptance';

/**
 * Boots `pnpm dev` with `OS_DATABASE_URL=file:./<dir>/proj_local.db`
 * (driver auto-inferred → SqlDriver(client:'better-sqlite3')).
 * Requires no external services — runs anywhere.
 */
runDriverAcceptance({ label: 'SQLite' });
