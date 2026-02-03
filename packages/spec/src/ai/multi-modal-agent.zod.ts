import { z } from 'zod';

/**
 * Multi-Modal Agent Protocol
 * 
 * Enables agents to interact through multiple modalities including
 * text, voice, vision, and streaming capabilities.
 * 
 * @module ai/multi-modal-agent
 */

/**
 * Supported modality types for agent interactions
 */
export const ModalityTypeSchema = z.enum([
  'text',      // Text-based interactions (default)
  'audio',     // Voice/audio input and output
  'image',     // Image understanding and generation
  'video',     // Video analysis and generation
  'stream'     // Real-time streaming interactions
]);

export type ModalityType = z.infer<typeof ModalityTypeSchema>;

/**
 * Configuration for a specific modality
 */
export const ModalityConfigSchema = z.object({
  /** Type of modality */
  type: ModalityTypeSchema,
  
  /** Supported input formats (e.g., 'mp3', 'wav' for audio) */
  inputFormats: z.array(z.string()),
  
  /** Supported output formats */
  outputFormats: z.array(z.string()),
  
  /** Maximum input size in bytes */
  maxInputSize: z.number().optional(),
  
  /** Maximum output size in bytes */
  maxOutputSize: z.number().optional(),
  
  /** Processing timeout in milliseconds */
  timeout: z.number().default(30000),
  
  /** Quality settings for the modality */
  quality: z.object({
    /** Resolution for images/video (e.g., '1920x1080') */
    resolution: z.string().optional(),
    
    /** Bitrate for audio/video (e.g., '128kbps') */
    bitrate: z.string().optional(),
    
    /** Sample rate for audio (e.g., 44100) */
    sampleRate: z.number().optional(),
    
    /** Compression level (0-100) */
    compression: z.number().min(0).max(100).optional()
  }).optional()
});

export type ModalityConfig = z.infer<typeof ModalityConfigSchema>;

/**
 * Agent capabilities for multi-modal interactions
 */
export const MultiModalCapabilitiesSchema = z.object({
  /** Text interaction support (always true) */
  text: z.boolean().default(true),
  
  /** Voice/audio interaction support */
  voice: z.boolean().default(false),
  
  /** Image understanding and generation */
  vision: z.boolean().default(false),
  
  /** Video processing capabilities */
  video: z.boolean().default(false),
  
  /** Real-time streaming support */
  streaming: z.boolean().default(false),
  
  /** Screen sharing and remote control */
  screenShare: z.boolean().default(false),
  
  /** Document parsing and analysis */
  documentAnalysis: z.boolean().default(false)
});

export type MultiModalCapabilities = z.infer<typeof MultiModalCapabilitiesSchema>;

/**
 * Context configuration for multi-modal agent
 */
export const MultiModalContextSchema = z.object({
  /** Maximum tokens for context window */
  maxTokens: z.number().default(4096),
  
  /** Temperature for response generation (0-2) */
  temperature: z.number().min(0).max(2).default(0.7),
  
  /** Top-p sampling parameter */
  topP: z.number().min(0).max(1).default(1),
  
  /** Enable streaming responses */
  streaming: z.boolean().default(false),
  
  /** Maximum number of conversation turns to maintain */
  maxTurns: z.number().default(10),
  
  /** Retain media files in context */
  retainMedia: z.boolean().default(false),
  
  /** Context compression strategy */
  compression: z.enum(['none', 'summarize', 'prune']).default('none')
});

export type MultiModalContext = z.infer<typeof MultiModalContextSchema>;

/**
 * Multi-Modal Agent Definition
 * 
 * Extends the basic Agent schema with multi-modal capabilities
 */
export const MultiModalAgentSchema = z.object({
  /** Agent name (unique identifier) */
  name: z.string().min(1).regex(/^[a-z_][a-z0-9_]*$/),
  
  /** Human-readable label */
  label: z.string().min(1),
  
  /** Agent description */
  description: z.string().optional(),
  
  /** Multi-modal capabilities */
  capabilities: MultiModalCapabilitiesSchema,
  
  /** Modality configurations */
  modalities: z.array(ModalityConfigSchema),
  
  /** Context configuration */
  context: MultiModalContextSchema,
  
  /** System instructions for the agent */
  instructions: z.string(),
  
  /** Tools/functions available to the agent */
  tools: z.array(z.string()).optional(),
  
  /** Memory configuration */
  memory: z.object({
    /** Enable persistent memory */
    enabled: z.boolean().default(false),
    
    /** Memory storage backend */
    backend: z.enum(['redis', 'postgres', 'memory']).default('memory'),
    
    /** Maximum memory entries */
    maxEntries: z.number().default(1000),
    
    /** Memory retention period in seconds */
    ttl: z.number().optional()
  }).optional(),
  
  /** Safety and moderation settings */
  safety: z.object({
    /** Enable content moderation */
    moderation: z.boolean().default(true),
    
    /** Content filters to apply */
    filters: z.array(z.enum(['violence', 'hate', 'sexual', 'self-harm'])).optional(),
    
    /** PII detection and masking */
    piiProtection: z.boolean().default(true),
    
    /** Rate limiting configuration */
    rateLimit: z.object({
      maxRequestsPerMinute: z.number(),
      maxRequestsPerHour: z.number()
    }).optional()
  }).optional(),
  
  /** Agent metadata */
  metadata: z.record(z.any()).optional()
});

export type MultiModalAgent = z.infer<typeof MultiModalAgentSchema>;

/**
 * Multi-modal interaction request
 */
export const MultiModalInteractionSchema = z.object({
  /** Agent to interact with */
  agent: z.string(),
  
  /** Input modality */
  modality: ModalityTypeSchema,
  
  /** Interaction content */
  content: z.union([
    z.string(),                    // Text content
    z.object({                     // Binary content
      data: z.instanceof(Buffer).or(z.string()), // Base64 or Buffer
      mimeType: z.string(),
      filename: z.string().optional()
    })
  ]),
  
  /** Conversation ID for context */
  conversationId: z.string().optional(),
  
  /** Additional context */
  context: z.record(z.any()).optional(),
  
  /** Response preferences */
  response: z.object({
    /** Preferred output modality */
    modality: ModalityTypeSchema.optional(),
    
    /** Enable streaming */
    streaming: z.boolean().default(false),
    
    /** Response format */
    format: z.string().optional()
  }).optional()
});

export type MultiModalInteraction = z.infer<typeof MultiModalInteractionSchema>;

/**
 * Multi-modal interaction response
 */
export const MultiModalResponseSchema = z.object({
  /** Conversation ID */
  conversationId: z.string(),
  
  /** Response modality */
  modality: ModalityTypeSchema,
  
  /** Response content */
  content: z.union([
    z.string(),                    // Text response
    z.object({                     // Binary response
      data: z.string(),            // Base64 encoded
      mimeType: z.string(),
      size: z.number()
    })
  ]),
  
  /** Usage statistics */
  usage: z.object({
    inputTokens: z.number().optional(),
    outputTokens: z.number().optional(),
    processingTime: z.number(),
    cost: z.number().optional()
  }),
  
  /** Agent metadata */
  metadata: z.record(z.any()).optional()
});

export type MultiModalResponse = z.infer<typeof MultiModalResponseSchema>;

// Re-export for convenience
export * from './agent.zod';
