// Type declarations for optional peer dependencies
declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: any);
    send(command: any): Promise<any>;
  }
  export class PutObjectCommand {
    constructor(input: any);
  }
  export class GetObjectCommand {
    constructor(input: any);
  }
  export class DeleteObjectCommand {
    constructor(input: any);
  }
  export class HeadObjectCommand {
    constructor(input: any);
  }
  export class ListObjectsV2Command {
    constructor(input: any);
  }
  export class CreateMultipartUploadCommand {
    constructor(input: any);
  }
  export class UploadPartCommand {
    constructor(input: any);
  }
  export class CompleteMultipartUploadCommand {
    constructor(input: any);
  }
  export class AbortMultipartUploadCommand {
    constructor(input: any);
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: any, command: any, options?: any): Promise<string>;
}
