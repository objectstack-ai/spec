import { DynamicModule, Module, Global, Inject, Provider, Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, Res, All, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ObjectKernel } from '@objectstack/runtime';

export const OBJECT_KERNEL = 'OBJECT_KERNEL';

export const ConnectReq = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest();
  },
);

// --- Service ---

@Injectable()
export class ObjectStackService {
  public dispatcher: HttpDispatcher;

  constructor(@Inject(OBJECT_KERNEL) private readonly kernel: ObjectKernel) {
    this.dispatcher = new HttpDispatcher(kernel);
  }

  getKernel() {
    return this.kernel;
  }

  async call(action: string, params: any, request: any) {
    const k = this.kernel as any;
    if (k.broker) {
        return k.broker.call(action, params, { request });
    }
    throw new Error('Kernel Broker not available');
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
    return this.service.dispatcher.getDiscoveryInfo('/api');
  }

  @Post('graphql')
  async graphql(@Body() body: any, @Req() req: any) {
    return this.service.dispatcher.handleGraphQL(body, { request: req });
  }

  // Auth (Generic Auth Handler)
  @All('auth/*')
  async auth(@Req() req: any, @Res() res: any, @Body() body: any) {
    try {
        const path = req.params[0] || req.url.split('/auth/')[1]?.split('?')[0] || '';

        const result = await this.service.dispatcher.handleAuth(path, req.method, body, { request: req, response: res });
        
        if (result.handled) {
            if (result.response) {
                 res.status(result.response.status);
                 if (result.response.headers) {
                     Object.entries(result.response.headers).forEach(([k, v]) => res.setHeader(k, v));
                 }
                 return res.json(result.response.body);
            }
            if (result.result) {
               const response = result.result;
               // If response is a standard Response object
               if (response && typeof response.status === 'number' && typeof response.text === 'function') {
                    res.status(response.status);
                    if (response.headers && typeof response.headers.forEach === 'function') {
                        response.headers.forEach((v: string, k: string) => res.setHeader(k, v));
                    }
                    const text = await response.text();
                    res.send(text);
                    return;
               }
               return res.status(200).json(response);
            }
        }
        
        return res.status(404).json({ success: false, error: { message: 'Auth provider not configured', code: 404 } });
        
    } catch (err: any) {
        return res.status(err.statusCode || 500).json({ 
            success: false, 
            error: { 
                message: err.message || 'Internal Server Error', 
                code: err.statusCode || 500
            } 
        });
    }
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
