import { DynamicModule, Module, Global, Inject, Provider, Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, Res, All, UseGuards, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ObjectKernel } from '@objectstack/runtime';

export const OBJECT_KERNEL = 'OBJECT_KERNEL';

export const ConnectReq = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest();
  },
);

// --- Service ---

@Injectable()
export class ObjectStackService {
  constructor(@Inject(OBJECT_KERNEL) private readonly kernel: any) {}

  getKernel() {
    return this.kernel;
  }

  async executeGraphQL(query: string, variables: any, request: any) {
    return this.kernel.graphql(query, variables, { request });
  }

  async call(action: string, params: any, request: any) {
    return this.kernel.broker.call(action, params, { request });
  }
}

// --- Controller ---

@Controller('api')
export class ObjectStackController {
  constructor(private readonly service: ObjectStackService) {}

  private success(data: any, meta?: any) {
    return { success: true, data, meta };
  }

  // --- Discovery Endpoint ---
  @Get()
  discovery() {
    const prefix = '/api'; // NestJS controller is mapped to 'api'
    const kernel = this.service.getKernel() as any;
    const services = kernel.services || {};
    const hasGraphQL = !!(services['graphql'] || kernel.graphql);
    // NestJS adapter doesn't expose services map directly but we have access to kernel
    // We can try to guess or use safe default
    
    return {
      name: 'ObjectOS',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      routes: {
        data: `${prefix}/data`,
        metadata: `${prefix}/metadata`,
        auth: `${prefix}/auth`,
        graphql: hasGraphQL ? `${prefix}/graphql` : undefined,
        storage: `${prefix}/storage`, // NestJS implementation below
      },
      features: {
        graphql: hasGraphQL,
        search: false,
        websockets: false, // NestJS Gateway is separate usually
        files: true, // Implemented below
      },
    };
  }

  @Post('graphql')
  async graphql(@Body() body: any, @Req() req: any) {
    const { query, variables } = body;
    return this.service.executeGraphQL(query, variables, req);
  }

  // Auth (Generic Auth Handler)
  @All('auth/*')
  async auth(@Req() req: any, @Res() res: any, @Body() body: any) {
    const kernel = this.service.getKernel() as any;
    const authService = kernel.getService?.('auth') || kernel.services?.['auth'];
    
    if (authService && authService.handler) {
       const response = await authService.handler(req, res);
       
       if (response instanceof Response) {
           res.status(response.status);
           response.headers.forEach((v, k) => res.setHeader(k, v));
           const text = await response.text();
           res.send(text);
           return;
       }
       
       return response;
    }
    
    // Fallback: Legacy login
    if (req.path.endsWith('/login') && req.method === 'POST') {
       const result = await this.service.call('auth.login', body, req);
       return res.json(result);
    }
    
    return res.status(404).json({ success: false, error: { message: 'Auth provider not configured', code: 404 } });
  }

  // Metadata
  @Get('metadata')
  async listObjects(@Req() req: any) {
    const data = await this.service.call('metadata.objects', {}, req);
    return this.success(data);
  }

  @Get('metadata/:objectName')
  async getObject(@Param('objectName') objectName: string, @Req() req: any) {
    const data = await this.service.call('metadata.getObject', { objectName }, req);
    return this.success(data);
  }

  // Data
  @Get('data/:objectName')
  async list(@Param('objectName') objectName: string, @Query() query: any, @Req() req: any) {
    const result = await this.service.call('data.query', { object: objectName, filters: query }, req);
    return this.success(result.data, { count: result.count });
  }

  @Post('data/:objectName/query')
  async query(@Param('objectName') objectName: string, @Body() body: any, @Req() req: any) {
    const result = await this.service.call('data.query', { object: objectName, ...body }, req);
    return this.success(result.data, { count: result.count, limit: body.limit, skip: body.skip });
  }

  @Get('data/:objectName/:id')
  async get(@Param('objectName') objectName: string, @Param('id') id: string, @Query() query: any, @Req() req: any) {
    const data = await this.service.call('data.get', { object: objectName, id, ...query }, req);
    return this.success(data);
  }

  @Post('data/:objectName')
  async create(@Param('objectName') objectName: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.call('data.create', { object: objectName, data: body }, req);
    return this.success(data);
  }

  @Patch('data/:objectName/:id')
  async update(@Param('objectName') objectName: string, @Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.call('data.update', { object: objectName, id, data: body }, req);
    return this.success(data);
  }

  @Delete('data/:objectName/:id')
  async delete(@Param('objectName') objectName: string, @Param('id') id: string, @Req() req: any) {
    await this.service.call('data.delete', { object: objectName, id }, req);
    return this.success({ id, deleted: true });
  }

  @Post('data/:objectName/batch')
  async batch(@Param('objectName') objectName: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.call('data.batch', { object: objectName, operations: body.operations }, req);
    return this.success(data);
  }

  // --- Storage (Files) ---
  
  // Note: Handling file uploads in NestJS in abstract Adapter is hard because we don't want to enforce multer/platform-express.
  // We will assume the request object is raw or handled by a global interceptor if available.
  // But for now, we provide the definition.
  
  @Post('storage/upload')
  async upload(@ConnectReq() req: any) {
      // We need to access the kernel service
      const kernel = this.service.getKernel() as any;
      const storageService = kernel.getService?.('file-storage') || kernel.services?.['file-storage'];
      if (!storageService) throw { statusCode: 501, message: 'File storage not configured' };
      
      // In NestJS/Express, file is usually in req.file or req.files if multer is used.
      // If using Fastify, it's different.
      // We will try to find the file or pass the request.
      const file = req.file || req.files?.file;
      
      if (!file && !req.body) throw { statusCode: 400, message: 'No file provided' };
      
      // Pass underlying object
      const result = await storageService.upload(file || req, { request: req });
      return this.success(result);
  }

  @Get('storage/file/:id')
  async download(@Param('id') id: string, @Req() req: any, @Res() res: any) {
      const kernel = this.service.getKernel() as any;
      const storageService = kernel.getService?.('file-storage') || kernel.services?.['file-storage'];
      if (!storageService) throw { statusCode: 501, message: 'File storage not configured' };
      
      const result = await storageService.download(id, { request: req });
      
      if (result.url && result.redirect) {
          return res.redirect(result.url);
      }
      
      if (result.stream) {
          res.set({
              'Content-Type': result.mimeType || 'application/octet-stream',
              'Content-Length': result.size,
          });
          result.stream.pipe(res);
          return;
      }
      
      return res.json(this.success(result));
  }
}

// --- Module ---

@Global()
@Module({})
export class ObjectStackModule {
  static forRoot(kernel: ObjectKernel): DynamicModule {
    const kernelProvider: Provider = {
      provide: OBJECT_KERNEL,
      useValue: kernel,
    };

    return {
      module: ObjectStackModule,
      controllers: [ObjectStackController],
      providers: [kernelProvider, ObjectStackService],
      exports: [kernelProvider, ObjectStackService],
    };
  }
}
