import { runDriverAcceptance } from './_acceptance';

/**
 * Boots `pnpm dev` with `OS_DATABASE_URL=mongodb://...`
 * (driver auto-inferred from the URL  no OS_DATABASE_DRIVER needed).scheme 
 * Requires a local mongod listening on the URL.
 */
runDriverAcceptance({ label: 'MongoDB' });
