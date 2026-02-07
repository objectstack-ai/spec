/**
 * Homepage Internationalization
 * 
 * Translations for the ObjectStack homepage
 * Supports: en (English), cn (Chinese/中文)
 */

import { SPEC_VERSION } from './version';

export interface HomepageTranslations {
  // Hero Section
  badge: {
    status: string;
    version: string;
  };
  hero: {
    title: {
      line1: string;
      line2: string;
    };
    subtitle: {
      line1: string;
      line2: string;
    };
    cta: {
      primary: string;
      primaryHref: string;
      secondary: string;
      secondaryHref: string;
    };
    quickStart: {
      label: string;
      commands: string[];
    };
  };

  // Features Section
  features: {
    restApi: {
      title: string;
      description: string;
    };
    studio: {
      title: string;
      description: string;
    };
    multiDb: {
      title: string;
      description: string;
    };
    typeSafety: {
      title: string;
      description: string;
    };
    namespace: {
      title: string;
      description: string;
    };
    plugins: {
      title: string;
      description: string;
    };
  };

  // Personas Section
  personas: {
    heading: string;
    fullStack: {
      title: string;
      description: string;
      action: string;
    };
    platformTeam: {
      title: string;
      description: string;
      action: string;
    };
    lowCode: {
      title: string;
      description: string;
      action: string;
    };
  };
}

/**
 * English Translations
 */
export const en: HomepageTranslations = {
  badge: {
    status: 'Open Source',
    version: SPEC_VERSION,
  },
  hero: {
    title: {
      line1: 'Define Once,',
      line2: 'Run Everywhere',
    },
    subtitle: {
      line1: 'A metadata-driven framework that turns object definitions into REST APIs, admin consoles, and database schemas.',
      line2: 'No boilerplate. No code generation.',
    },
    cta: {
      primary: 'Get Started',
      primaryHref: '/docs/getting-started/quick-start',
      secondary: 'Live Demo',
      secondaryHref: 'https://play.objectstack.ai',
    },
    quickStart: {
      label: 'Terminal',
      commands: [
        'npx @objectstack/cli init my-app',
        'cd my-app',
        'npx os studio',
      ],
    },
  },
  features: {
    restApi: {
      title: 'Object → REST API',
      description: 'Define your data objects and get fully typed CRUD endpoints automatically. No route files, no controllers.',
    },
    studio: {
      title: 'Built-in Console',
      description: 'Run `os studio` to get a visual admin panel for browsing data, editing records, and inspecting your schema.',
    },
    multiDb: {
      title: 'Multi-Database',
      description: 'PostgreSQL, MongoDB, SQLite — same object schema, any backend. Switch databases without changing a single line of code.',
    },
    typeSafety: {
      title: 'Full Type Safety',
      description: 'Zod-first schema definitions with complete TypeScript inference. Catch errors at compile time, validate at runtime.',
    },
    namespace: {
      title: 'Namespace Isolation',
      description: 'Multi-tenant by design. Each plugin gets its own namespace — no field collisions, clean data boundaries.',
    },
    plugins: {
      title: 'Plugin System',
      description: 'Compose applications from reusable plugins. CRM, BI, Auth — mix and match building blocks for your stack.',
    },
  },
  personas: {
    heading: 'Who Is It For?',
    fullStack: {
      title: 'Full-Stack Developers',
      description: 'Build internal tools, admin dashboards, and CRUD apps in minutes with just object definitions.',
      action: 'Developer Guide',
    },
    platformTeam: {
      title: 'Platform Teams',
      description: 'Standardize data models and APIs across microservices with a shared metadata protocol.',
      action: 'Read Architecture',
    },
    lowCode: {
      title: 'Low-Code Builders',
      description: 'Visual schema design via Console UI, with full code extensibility when you need it.',
      action: 'Try Examples',
    },
  },
};

/**
 * Chinese Translations (中文翻译)
 */
export const cn: HomepageTranslations = {
  badge: {
    status: '开源项目',
    version: SPEC_VERSION,
  },
  hero: {
    title: {
      line1: '定义一次，',
      line2: '随处运行',
    },
    subtitle: {
      line1: '元数据驱动框架，将对象定义自动转换为 REST API、管理控制台和数据库表结构。',
      line2: '无模板代码。无代码生成。',
    },
    cta: {
      primary: '快速开始',
      primaryHref: '/docs/getting-started/quick-start',
      secondary: '在线演示',
      secondaryHref: 'https://playground.objectstack.ai',
    },
    quickStart: {
      label: '终端',
      commands: [
        'npx @objectstack/cli init my-app',
        'cd my-app',
        'npx os studio',
      ],
    },
  },
  features: {
    restApi: {
      title: '对象 → REST API',
      description: '定义数据对象，自动获得完整的 CRUD 接口。无需路由文件，无需控制器。',
    },
    studio: {
      title: '内置管理控制台',
      description: '运行 `os studio` 即可获得可视化管理面板，浏览数据、编辑记录、查看 Schema。',
    },
    multiDb: {
      title: '多数据库支持',
      description: 'PostgreSQL、MongoDB、SQLite — 同一套对象定义，任意数据库后端。切换数据库无需改一行代码。',
    },
    typeSafety: {
      title: '完整类型安全',
      description: 'Zod 优先的 Schema 定义，完整的 TypeScript 类型推断。编译时捕获错误，运行时验证数据。',
    },
    namespace: {
      title: '命名空间隔离',
      description: '原生多租户设计。每个插件拥有独立命名空间 — 无字段冲突，干净的数据边界。',
    },
    plugins: {
      title: '插件系统',
      description: '用可复用插件组合应用。CRM、BI、认证 — 像积木一样自由搭建你的技术栈。',
    },
  },
  personas: {
    heading: '适合谁使用？',
    fullStack: {
      title: '全栈开发者',
      description: '只需定义对象，几分钟内构建内部工具、管理面板和 CRUD 应用。',
      action: '开发者指南',
    },
    platformTeam: {
      title: '平台团队',
      description: '使用统一的元数据协议标准化微服务间的数据模型和 API。',
      action: '阅读架构',
    },
    lowCode: {
      title: '低代码构建者',
      description: '通过 Console UI 可视化设计 Schema，需要时可完全用代码扩展。',
      action: '试用示例',
    },
  },
};

/**
 * Get translations for a specific language
 */
export function getHomepageTranslations(lang: string): HomepageTranslations {
  switch (lang) {
    case 'cn':
      return cn;
    case 'en':
    default:
      return en;
  }
}
