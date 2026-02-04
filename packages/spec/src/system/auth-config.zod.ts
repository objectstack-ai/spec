import { z } from 'zod';

/**
 * Better-Auth Configuration Protocol
 * 
 * Defines the configuration required to initialize the Better-Auth kernel.
 * Used in server-side configuration injection.
 */

export const AuthProviderConfigSchema = z.object({
  id: z.string().describe('Provider ID (github, google)'),
  clientId: z.string().describe('OAuth Client ID'),
  clientSecret: z.string().describe('OAuth Client Secret'),
  scope: z.array(z.string()).optional().describe('Requested permissions'),
});

export const AuthPluginConfigSchema = z.object({
  organization: z.boolean().default(false).describe('Enable Organization/Teams support'),
  twoFactor: z.boolean().default(false).describe('Enable 2FA'),
  passkeys: z.boolean().default(false).describe('Enable Passkey support'),
  magicLink: z.boolean().default(false).describe('Enable Magic Link login'),
});

export const AuthConfigSchema = z.object({
  secret: z.string().describe('Encryption secret'),
  baseUrl: z.string().describe('Base URL for auth routes'),
  databaseUrl: z.string().optional().describe('Database connection string'),
  providers: z.array(AuthProviderConfigSchema).optional(),
  plugins: AuthPluginConfigSchema.optional(),
  session: z.object({
    expiresIn: z.number().default(60 * 60 * 24 * 7).describe('Session duration in seconds'),
    updateAge: z.number().default(60 * 60 * 24).describe('Session update frequency'),
  }).optional(),
});
