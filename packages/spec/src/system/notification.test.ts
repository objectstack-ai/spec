import { describe, it, expect } from 'vitest';
import {
  EmailTemplateSchema,
  SMSTemplateSchema,
  PushNotificationSchema,
  InAppNotificationSchema,
  NotificationChannelSchema,
  NotificationConfigSchema,
  type NotificationConfig,
  type EmailTemplate,
  type SMSTemplate,
} from './notification.zod';

describe('EmailTemplateSchema', () => {
  it('should validate complete email template', () => {
    const validTemplate: EmailTemplate = {
      id: 'welcome-email',
      subject: 'Welcome to {{company_name}}',
      body: '<h1>Welcome {{user_name}}!</h1>',
      bodyType: 'html',
      variables: ['company_name', 'user_name'],
      attachments: [
        {
          name: 'guide.pdf',
          url: 'https://example.com/guide.pdf',
        },
      ],
    };

    expect(() => EmailTemplateSchema.parse(validTemplate)).not.toThrow();
  });

  it('should accept minimal email template', () => {
    const minimalTemplate = {
      id: 'simple-email',
      subject: 'Test Email',
      body: 'Simple text body',
    };

    expect(() => EmailTemplateSchema.parse(minimalTemplate)).not.toThrow();
  });

  it('should default bodyType to html', () => {
    const template = {
      id: 'test',
      subject: 'Test',
      body: 'Body',
    };

    const parsed = EmailTemplateSchema.parse(template);
    expect(parsed.bodyType).toBe('html');
  });

  it('should accept text bodyType', () => {
    const template = {
      id: 'text-email',
      subject: 'Plain Text',
      body: 'Plain text body',
      bodyType: 'text' as const,
    };

    expect(() => EmailTemplateSchema.parse(template)).not.toThrow();
  });

  it('should accept markdown bodyType', () => {
    const template = {
      id: 'markdown-email',
      subject: 'Markdown Email',
      body: '# Header\n\nContent',
      bodyType: 'markdown' as const,
    };

    expect(() => EmailTemplateSchema.parse(template)).not.toThrow();
  });

  it('should validate attachment URLs', () => {
    const invalidTemplate = {
      id: 'email-1',
      subject: 'Test',
      body: 'Body',
      attachments: [
        {
          name: 'file.pdf',
          url: 'not-a-url',
        },
      ],
    };

    expect(() => EmailTemplateSchema.parse(invalidTemplate)).toThrow();
  });
});

describe('SMSTemplateSchema', () => {
  it('should validate complete SMS template', () => {
    const validTemplate: SMSTemplate = {
      id: 'verification-sms',
      message: 'Your verification code is {{code}}',
      maxLength: 160,
      variables: ['code'],
    };

    expect(() => SMSTemplateSchema.parse(validTemplate)).not.toThrow();
  });

  it('should accept minimal SMS template', () => {
    const minimalTemplate = {
      id: 'simple-sms',
      message: 'Hello World',
    };

    expect(() => SMSTemplateSchema.parse(minimalTemplate)).not.toThrow();
  });

  it('should default maxLength to 160', () => {
    const template = {
      id: 'sms-1',
      message: 'Test message',
    };

    const parsed = SMSTemplateSchema.parse(template);
    expect(parsed.maxLength).toBe(160);
  });

  it('should accept custom maxLength', () => {
    const template = {
      id: 'long-sms',
      message: 'Long message',
      maxLength: 320,
    };

    const parsed = SMSTemplateSchema.parse(template);
    expect(parsed.maxLength).toBe(320);
  });
});

describe('PushNotificationSchema', () => {
  it('should validate complete push notification', () => {
    const validPush = {
      title: 'New Message',
      body: 'You have a new message from John',
      icon: 'https://example.com/icon.png',
      badge: 5,
      data: { messageId: 'msg_123' },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    expect(() => PushNotificationSchema.parse(validPush)).not.toThrow();
  });

  it('should accept minimal push notification', () => {
    const minimalPush = {
      title: 'Alert',
      body: 'Something happened',
    };

    expect(() => PushNotificationSchema.parse(minimalPush)).not.toThrow();
  });

  it('should validate icon URL', () => {
    const invalidPush = {
      title: 'Test',
      body: 'Body',
      icon: 'not-a-url',
    };

    expect(() => PushNotificationSchema.parse(invalidPush)).toThrow();
  });

  it('should accept custom data payload', () => {
    const push = {
      title: 'Order Update',
      body: 'Your order has shipped',
      data: {
        orderId: 'ord_123',
        trackingNumber: 'TRK456',
        status: 'shipped',
      },
    };

    expect(() => PushNotificationSchema.parse(push)).not.toThrow();
  });
});

describe('InAppNotificationSchema', () => {
  it('should validate complete in-app notification', () => {
    const validNotification = {
      title: 'System Update',
      message: 'New features are now available',
      type: 'info' as const,
      actionUrl: '/updates',
      dismissible: true,
      expiresAt: 1704067200000,
    };

    expect(() => InAppNotificationSchema.parse(validNotification)).not.toThrow();
  });

  it('should accept minimal in-app notification', () => {
    const minimalNotification = {
      title: 'Alert',
      message: 'Important message',
      type: 'warning' as const,
    };

    expect(() => InAppNotificationSchema.parse(minimalNotification)).not.toThrow();
  });

  it('should default dismissible to true', () => {
    const notification = {
      title: 'Test',
      message: 'Message',
      type: 'info' as const,
    };

    const parsed = InAppNotificationSchema.parse(notification);
    expect(parsed.dismissible).toBe(true);
  });

  it('should accept all notification types', () => {
    const types = ['info', 'success', 'warning', 'error'] as const;

    types.forEach((type) => {
      const notification = {
        title: 'Test',
        message: 'Message',
        type,
      };

      expect(() => InAppNotificationSchema.parse(notification)).not.toThrow();
    });
  });

  it('should reject invalid notification type', () => {
    const invalidNotification = {
      title: 'Test',
      message: 'Message',
      type: 'invalid',
    };

    expect(() => InAppNotificationSchema.parse(invalidNotification)).toThrow();
  });
});

describe('NotificationChannelSchema', () => {
  it('should accept all valid channels', () => {
    const validChannels = [
      'email',
      'sms',
      'push',
      'in-app',
      'slack',
      'teams',
      'webhook',
    ];

    validChannels.forEach((channel) => {
      expect(() => NotificationChannelSchema.parse(channel)).not.toThrow();
    });
  });

  it('should reject invalid channel', () => {
    expect(() => NotificationChannelSchema.parse('invalid')).toThrow();
  });
});

describe('NotificationConfigSchema', () => {
  it('should validate email notification config', () => {
    const validConfig: NotificationConfig = {
      id: 'welcome-email',
      name: 'Welcome Email',
      channel: 'email',
      template: {
        id: 'tpl-001',
        subject: 'Welcome to ObjectStack',
        body: '<h1>Welcome!</h1>',
        bodyType: 'html',
      },
      recipients: {
        to: ['user@example.com'],
      },
    };

    expect(() => NotificationConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should validate SMS notification config', () => {
    const validConfig = {
      id: 'verification-sms',
      name: 'Verification SMS',
      channel: 'sms',
      template: {
        id: 'sms-001',
        message: 'Your code is {{code}}',
      },
      recipients: {
        to: ['+1234567890'],
      },
    };

    expect(() => NotificationConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should validate push notification config', () => {
    const validConfig = {
      id: 'push-alert',
      name: 'Push Alert',
      channel: 'push',
      template: {
        title: 'New Message',
        body: 'You have a new message',
      },
      recipients: {
        to: ['device_token_123'],
      },
    };

    expect(() => NotificationConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should validate in-app notification config', () => {
    const validConfig = {
      id: 'system-alert',
      name: 'System Alert',
      channel: 'in-app',
      template: {
        title: 'Update Available',
        message: 'A new version is available',
        type: 'info' as const,
      },
      recipients: {
        to: ['user_123'],
      },
    };

    expect(() => NotificationConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should accept CC and BCC recipients', () => {
    const config = {
      id: 'email-with-cc',
      name: 'Email with CC',
      channel: 'email',
      template: {
        id: 'tpl-002',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
        cc: ['manager@example.com'],
        bcc: ['archive@example.com'],
      },
    };

    expect(() => NotificationConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate immediate schedule', () => {
    const config = {
      id: 'immediate-notification',
      name: 'Immediate',
      channel: 'email',
      template: {
        id: 'tpl-003',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
      },
      schedule: {
        type: 'immediate' as const,
      },
    };

    expect(() => NotificationConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate delayed schedule', () => {
    const config = {
      id: 'delayed-notification',
      name: 'Delayed',
      channel: 'email',
      template: {
        id: 'tpl-004',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
      },
      schedule: {
        type: 'delayed' as const,
        delay: 3600000, // 1 hour
      },
    };

    expect(() => NotificationConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate scheduled notification', () => {
    const config = {
      id: 'scheduled-notification',
      name: 'Scheduled',
      channel: 'email',
      template: {
        id: 'tpl-005',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
      },
      schedule: {
        type: 'scheduled' as const,
        scheduledAt: 1704067200000,
      },
    };

    expect(() => NotificationConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate retry policy with defaults', () => {
    const config = {
      id: 'notification-with-retry',
      name: 'With Retry',
      channel: 'email',
      template: {
        id: 'tpl-006',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
      },
      retryPolicy: {
        backoffStrategy: 'exponential' as const,
      },
    };

    const parsed = NotificationConfigSchema.parse(config);
    expect(parsed.retryPolicy?.enabled).toBe(true);
    expect(parsed.retryPolicy?.maxRetries).toBe(3);
  });

  it('should validate retry policy backoff strategies', () => {
    const strategies = ['exponential', 'linear', 'fixed'] as const;

    strategies.forEach((strategy) => {
      const config = {
        id: `retry-${strategy}`,
        name: 'Test',
        channel: 'email',
        template: {
          id: 'tpl-007',
          subject: 'Test',
          body: 'Body',
        },
        recipients: {
          to: ['user@example.com'],
        },
        retryPolicy: {
          backoffStrategy: strategy,
        },
      };

      expect(() => NotificationConfigSchema.parse(config)).not.toThrow();
    });
  });

  it('should validate tracking configuration with defaults', () => {
    const config = {
      id: 'notification-with-tracking',
      name: 'With Tracking',
      channel: 'email',
      template: {
        id: 'tpl-008',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
      },
      tracking: {},
    };

    const parsed = NotificationConfigSchema.parse(config);
    expect(parsed.tracking?.trackOpens).toBe(false);
    expect(parsed.tracking?.trackClicks).toBe(false);
    expect(parsed.tracking?.trackDelivery).toBe(true);
  });

  it('should accept custom tracking configuration', () => {
    const config = {
      id: 'notification-custom-tracking',
      name: 'Custom Tracking',
      channel: 'email',
      template: {
        id: 'tpl-009',
        subject: 'Test',
        body: 'Body',
      },
      recipients: {
        to: ['user@example.com'],
      },
      tracking: {
        trackOpens: true,
        trackClicks: true,
        trackDelivery: true,
      },
    };

    expect(() => NotificationConfigSchema.parse(config)).not.toThrow();
  });

  it('should validate complete notification config with all options', () => {
    const completeConfig: NotificationConfig = {
      id: 'complete-notification',
      name: 'Complete Notification',
      channel: 'email',
      template: {
        id: 'tpl-complete',
        subject: 'Complete Email {{user_name}}',
        body: '<html><body>{{content}}</body></html>',
        bodyType: 'html',
        variables: ['user_name', 'content'],
        attachments: [
          {
            name: 'report.pdf',
            url: 'https://example.com/reports/report.pdf',
          },
        ],
      },
      recipients: {
        to: ['user@example.com', 'admin@example.com'],
        cc: ['manager@example.com'],
        bcc: ['archive@example.com'],
      },
      schedule: {
        type: 'scheduled',
        scheduledAt: 1704067200000,
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 5,
        backoffStrategy: 'exponential',
      },
      tracking: {
        trackOpens: true,
        trackClicks: true,
        trackDelivery: true,
      },
    };

    expect(() => NotificationConfigSchema.parse(completeConfig)).not.toThrow();
  });
});
