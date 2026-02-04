import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';
import { FileMetadataSchema } from '../system/object-storage.zod';

/**
 * Storage Service Protocol
 * 
 * Defines the API contract for client-side file operations.
 * Focuses on secure, direct-to-cloud uploads (Presigned URLs)
 * rather than proxying bytes through the API server.
 */

// ==========================================
// Requests
// ==========================================

export const GetPresignedUrlRequestSchema = z.object({
  filename: z.string().describe('Original filename'),
  mimeType: z.string().describe('File MIME type'),
  size: z.number().describe('File size in bytes'),
  scope: z.string().default('user').describe('Target storage scope (e.g. user, private, public)'),
  bucket: z.string().optional().describe('Specific bucket override (admin only)'),
});

export const CompleteUploadRequestSchema = z.object({
  fileId: z.string().describe('File ID returned from presigned request'),
  eTag: z.string().optional().describe('S3 ETag verification'),
});

// ==========================================
// Responses
// ==========================================

export const PresignedUrlResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    uploadUrl: z.string().describe('PUT/POST URL for direct upload'),
    downloadUrl: z.string().optional().describe('Public/Private preview URL'),
    fileId: z.string().describe('Temporary File ID'),
    method: z.enum(['PUT', 'POST']).describe('HTTP Method to use'),
    headers: z.record(z.string(), z.string()).optional().describe('Required headers for upload'),
    expiresIn: z.number().describe('URL expiry in seconds'),
  }),
});

export const FileUploadResponseSchema = BaseResponseSchema.extend({
  data: FileMetadataSchema.describe('Uploaded file metadata'),
});
