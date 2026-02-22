
import { describe, it, expect } from 'vitest';
import { 
  GetDataRequestSchema, 
  GetDataResponseSchema,
  FindDataRequestSchema,
  FindDataResponseSchema,
  CreateDataRequestSchema,
  CreateDataResponseSchema,
  UpdateDataRequestSchema,
  DeleteDataResponseSchema,
  BatchDataRequestSchema,
  CreateManyDataResponseSchema,
  UpdateManyDataRequestSchema,
  DeleteManyDataRequestSchema,
  // Views
  ListViewsRequestSchema,
  ListViewsResponseSchema,
  GetViewRequestSchema,
  CreateViewRequestSchema,
  UpdateViewRequestSchema,
  DeleteViewRequestSchema,
  DeleteViewResponseSchema,
  // Permissions
  CheckPermissionRequestSchema,
  CheckPermissionResponseSchema,
  GetObjectPermissionsRequestSchema,
  GetObjectPermissionsResponseSchema,
  GetEffectivePermissionsResponseSchema,
  // Workflows
  GetWorkflowConfigRequestSchema,
  WorkflowStateSchema,
  GetWorkflowStateRequestSchema,
  WorkflowTransitionRequestSchema,
  WorkflowTransitionResponseSchema,
  WorkflowApproveRequestSchema,
  WorkflowRejectRequestSchema,
  // Realtime
  RealtimeConnectRequestSchema,
  RealtimeConnectResponseSchema,
  RealtimeSubscribeRequestSchema,
  RealtimeSubscribeResponseSchema,
  SetPresenceRequestSchema,
  GetPresenceResponseSchema,
  // Notifications
  RegisterDeviceRequestSchema,
  RegisterDeviceResponseSchema,
  NotificationPreferencesSchema,
  NotificationSchema,
  ListNotificationsRequestSchema,
  ListNotificationsResponseSchema,
  MarkNotificationsReadRequestSchema,
  // AI
  AiNlqRequestSchema,
  AiNlqResponseSchema,
  AiChatRequestSchema,
  AiChatResponseSchema,
  AiSuggestRequestSchema,
  AiSuggestResponseSchema,
  AiInsightsRequestSchema,
  AiInsightsResponseSchema,
  // i18n
  GetLocalesResponseSchema,
  GetTranslationsRequestSchema,
  GetTranslationsResponseSchema,
  GetFieldLabelsRequestSchema,
  GetFieldLabelsResponseSchema,
} from './protocol.zod';

describe('ObjectStack Protocol', () => {

  it('validates GetData', () => {
    const request = {
      object: 'project',
      id: 'p1'
    };
    expect(GetDataRequestSchema.safeParse(request).success).toBe(true);

    const response = {
      object: 'project',
      id: 'p1',
      record: { id: 'p1', name: 'Project A' }
    };
    expect(GetDataResponseSchema.safeParse(response).success).toBe(true);
  });

  it('validates FindData', () => {
    const request = {
      object: 'project',
      query: {
        object: 'project',
        where: { status: 'active' }
      }
    };
    expect(FindDataRequestSchema.safeParse(request).success).toBe(true);

    const response = {
      object: 'project',
      records: [
        { id: 'p1', name: 'Project A', status: 'active' }
      ],
      total: 1
    };
    expect(FindDataResponseSchema.safeParse(response).success).toBe(true);
  });

  it('validates CRUD Operations', () => {
    const createReq = {
      object: 'task',
      data: { title: 'New Task' }
    };
    expect(CreateDataRequestSchema.safeParse(createReq).success).toBe(true);

    const createRes = {
        object: 'task',
        id: 't1',
        record: { id: 't1', title: 'New Task' }
    };
    expect(CreateDataResponseSchema.safeParse(createRes).success).toBe(true);

    const updateReq = {
      object: 'task',
      id: 't1',
      data: { status: 'completed' }
    };
    expect(UpdateDataRequestSchema.safeParse(updateReq).success).toBe(true);

    const deleteRes = {
      object: 'task',
      id: 't1',
      success: true
    };
    expect(DeleteDataResponseSchema.safeParse(deleteRes).success).toBe(true);
  });

  it('validates Batch Operations', () => {
    const batchReq = {
      object: 'task',
      request: {
        operation: 'create',
        records: [{ data: { title: 'T1' } }]
      }
    };
    expect(BatchDataRequestSchema.safeParse(batchReq).success).toBe(true);
  });

  it('validates Bulk Operations', () => {
    const createManyRes = {
      object: 'task',
      records: [{ id: 't1' }, { id: 't2' }],
      count: 2
    };
    expect(CreateManyDataResponseSchema.safeParse(createManyRes).success).toBe(true);

    const updateManyReq = {
      object: 'task',
      records: [{ id: 't1', data: { status: 'done' } }],
      options: { atomic: true }
    };
    expect(UpdateManyDataRequestSchema.safeParse(updateManyReq).success).toBe(true);

    const deleteManyReq = {
      object: 'task',
      ids: ['t1', 't2'],
      options: { atomic: false }
    };
    expect(DeleteManyDataRequestSchema.safeParse(deleteManyReq).success).toBe(true);
  });

  it('validates Views operations', () => {
    expect(ListViewsRequestSchema.safeParse({ object: 'project', type: 'list' }).success).toBe(true);
    expect(ListViewsResponseSchema.safeParse({
      object: 'project',
      views: [{ list: { columns: [] } }],
    }).success).toBe(true);
    expect(GetViewRequestSchema.safeParse({ object: 'project', viewId: 'v1' }).success).toBe(true);
    expect(CreateViewRequestSchema.safeParse({
      object: 'project',
      data: { list: { columns: [] } },
    }).success).toBe(true);
    expect(UpdateViewRequestSchema.safeParse({
      object: 'project',
      viewId: 'v1',
      data: { list: { columns: [] } },
    }).success).toBe(true);
    expect(DeleteViewRequestSchema.safeParse({ object: 'project', viewId: 'v1' }).success).toBe(true);
    expect(DeleteViewResponseSchema.safeParse({ object: 'project', viewId: 'v1', success: true }).success).toBe(true);
  });

  it('validates Permissions operations', () => {
    expect(CheckPermissionRequestSchema.safeParse({
      object: 'account',
      action: 'edit',
      recordId: 'a1',
    }).success).toBe(true);
    expect(CheckPermissionResponseSchema.safeParse({ allowed: false, reason: 'Insufficient privileges' }).success).toBe(true);
    expect(GetObjectPermissionsRequestSchema.safeParse({ object: 'account' }).success).toBe(true);
    expect(GetObjectPermissionsResponseSchema.safeParse({
      object: 'account',
      permissions: { allowCreate: true, allowRead: true, allowEdit: false, allowDelete: false },
      fieldPermissions: { email: { readable: true, editable: false } },
    }).success).toBe(true);
    expect(GetEffectivePermissionsResponseSchema.safeParse({
      objects: { account: { allowRead: true } },
      systemPermissions: ['manage_users', 'view_reports'],
    }).success).toBe(true);
  });

  it('validates Workflow operations', () => {
    expect(GetWorkflowConfigRequestSchema.safeParse({ object: 'lead' }).success).toBe(true);
    const state = {
      currentState: 'open',
      availableTransitions: [
        { name: 'approve', targetState: 'approved', label: 'Approve', requiresApproval: true },
      ],
      history: [{
        fromState: 'draft', toState: 'open', action: 'submit',
        userId: 'u1', timestamp: '2024-01-15T10:00:00Z',
      }],
    };
    expect(WorkflowStateSchema.safeParse(state).success).toBe(true);
    expect(GetWorkflowStateRequestSchema.safeParse({ object: 'lead', recordId: 'l1' }).success).toBe(true);
    expect(WorkflowTransitionRequestSchema.safeParse({
      object: 'lead', recordId: 'l1', transition: 'approve', comment: 'Looks good',
    }).success).toBe(true);
    expect(WorkflowTransitionResponseSchema.safeParse({
      object: 'lead', recordId: 'l1', success: true, state,
    }).success).toBe(true);
    expect(WorkflowApproveRequestSchema.safeParse({
      object: 'lead', recordId: 'l1', comment: 'Approved',
    }).success).toBe(true);
    expect(WorkflowRejectRequestSchema.safeParse({
      object: 'lead', recordId: 'l1', reason: 'Missing info',
    }).success).toBe(true);
  });

  it('validates Realtime operations', () => {
    expect(RealtimeConnectRequestSchema.safeParse({
      transport: 'websocket', channels: ['project.updates'], token: 'tok_abc',
    }).success).toBe(true);
    expect(RealtimeConnectResponseSchema.safeParse({
      connectionId: 'conn_1', transport: 'websocket', url: 'wss://rt.example.com',
    }).success).toBe(true);
    expect(RealtimeSubscribeRequestSchema.safeParse({
      channel: 'project.updates', events: ['record.created', 'record.updated'],
    }).success).toBe(true);
    expect(RealtimeSubscribeResponseSchema.safeParse({
      subscriptionId: 'sub_1', channel: 'project.updates',
    }).success).toBe(true);
    expect(SetPresenceRequestSchema.safeParse({
      channel: 'project.updates',
      state: { userId: 'u1', status: 'online', lastSeen: '2024-01-15T10:00:00Z' },
    }).success).toBe(true);
    expect(GetPresenceResponseSchema.safeParse({
      channel: 'project.updates',
      members: [{ userId: 'u1', status: 'online', lastSeen: '2024-01-15T10:00:00Z' }],
    }).success).toBe(true);
  });

  it('validates Notification operations', () => {
    expect(RegisterDeviceRequestSchema.safeParse({
      token: 'fcm_token_xyz', platform: 'android', deviceId: 'dev_1', name: 'Pixel 8',
    }).success).toBe(true);
    expect(RegisterDeviceResponseSchema.safeParse({ deviceId: 'dev_1', success: true }).success).toBe(true);
    expect(NotificationPreferencesSchema.safeParse({
      email: true, push: true, inApp: true, digest: 'daily',
      channels: { alerts: { enabled: true, push: false } },
    }).success).toBe(true);
    expect(NotificationSchema.safeParse({
      id: 'n1', type: 'task_assigned', title: 'New Task', body: 'You were assigned a task',
      read: false, actionUrl: '/tasks/t1', createdAt: '2024-01-15T10:00:00Z',
    }).success).toBe(true);
    expect(ListNotificationsRequestSchema.safeParse({ read: false, limit: 10 }).success).toBe(true);
    expect(ListNotificationsResponseSchema.safeParse({
      notifications: [{ id: 'n1', type: 'info', title: 'Hi', body: 'Hello', read: false, createdAt: '2024-01-15T10:00:00Z' }],
      unreadCount: 1,
    }).success).toBe(true);
    expect(MarkNotificationsReadRequestSchema.safeParse({ ids: ['n1', 'n2'] }).success).toBe(true);
  });

  it('validates AI operations', () => {
    expect(AiNlqRequestSchema.safeParse({ query: 'show me all open tasks', object: 'task' }).success).toBe(true);
    expect(AiNlqResponseSchema.safeParse({
      query: { object: 'task', where: { status: 'open' } },
      explanation: 'Find all tasks with open status', confidence: 0.92,
    }).success).toBe(true);
    expect(AiChatRequestSchema.safeParse({ message: 'How many tasks are overdue?', conversationId: 'c1' }).success).toBe(true);
    expect(AiChatResponseSchema.safeParse({
      message: 'There are 5 overdue tasks.', conversationId: 'c1',
      actions: [{ type: 'navigate', label: 'View overdue tasks' }],
    }).success).toBe(true);
    expect(AiSuggestRequestSchema.safeParse({ object: 'task', field: 'priority', partial: 'hi' }).success).toBe(true);
    expect(AiSuggestResponseSchema.safeParse({
      suggestions: [{ value: 'high', label: 'High', confidence: 0.95, reason: 'Matches partial input' }],
    }).success).toBe(true);
    expect(AiInsightsRequestSchema.safeParse({ object: 'task', type: 'trends' }).success).toBe(true);
    expect(AiInsightsResponseSchema.safeParse({
      insights: [{ type: 'trends', title: 'Task Completion Rate', description: 'Completion rate increased by 15% this month', confidence: 0.88 }],
    }).success).toBe(true);
  });

  it('validates i18n operations', () => {
    expect(GetLocalesResponseSchema.safeParse({
      locales: [
        { code: 'en-US', label: 'English (US)', isDefault: true },
        { code: 'es-ES', label: 'Spanish (Spain)' },
      ],
    }).success).toBe(true);
    expect(GetTranslationsRequestSchema.safeParse({ locale: 'en-US', namespace: 'objects' }).success).toBe(true);
    expect(GetTranslationsResponseSchema.safeParse({
      locale: 'en-US',
      translations: { objects: { task: { label: 'Task', pluralLabel: 'Tasks' } }, messages: { save: 'Save' } },
    }).success).toBe(true);
    expect(GetFieldLabelsRequestSchema.safeParse({ object: 'task', locale: 'en-US' }).success).toBe(true);
    expect(GetFieldLabelsResponseSchema.safeParse({
      object: 'task', locale: 'en-US',
      labels: { status: { label: 'Status', help: 'Current task status', options: { open: 'Open', closed: 'Closed' } } },
    }).success).toBe(true);
  });

});

// ==========================================
// GetDiscoveryResponseSchema — capabilities
// ==========================================
import { GetDiscoveryResponseSchema } from './protocol.zod';

describe('GetDiscoveryResponseSchema (capabilities)', () => {
  it('should accept response with well-known capabilities', () => {
    const result = GetDiscoveryResponseSchema.safeParse({
      version: 'v1',
      apiName: 'ObjectStack API',
      capabilities: {
        feed: true,
        comments: true,
        automation: false,
        cron: false,
        search: true,
        export: false,
        chunkedUpload: true,
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capabilities?.feed).toBe(true);
      expect(result.data.capabilities?.automation).toBe(false);
    }
  });

  it('should accept response without capabilities (optional)', () => {
    const result = GetDiscoveryResponseSchema.safeParse({
      version: 'v1',
      apiName: 'ObjectStack API',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capabilities).toBeUndefined();
    }
  });

  it('should reject capabilities with missing fields', () => {
    const result = GetDiscoveryResponseSchema.safeParse({
      version: 'v1',
      apiName: 'ObjectStack API',
      capabilities: { feed: true },
    });
    expect(result.success).toBe(false);
  });
});
