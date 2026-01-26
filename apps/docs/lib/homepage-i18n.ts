/**
 * Homepage Internationalization
 * 
 * Translations for the ObjectStack homepage
 * Supports: en (English), cn (Chinese/中文)
 */

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
      secondary: string;
    };
  };
  
  // Code Preview
  codePreview: {
    filename: string;
  };
  
  // Features Section
  features: {
    objectql: {
      title: string;
      description: string;
    };
    objectui: {
      title: string;
      description: string;
    };
    objectos: {
      title: string;
      description: string;
    };
    security: {
      title: string;
      description: string;
    };
    zodFirst: {
      title: string;
      description: string;
    };
    universal: {
      title: string;
      description: string;
    };
  };
  
  // Personas Section
  personas: {
    heading: string;
    architect: {
      title: string;
      description: string;
      action: string;
    };
    aiEngineer: {
      title: string;
      description: string;
      action: string;
    };
    frameworkBuilder: {
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
    status: 'Protocol Specification',
    version: 'v0.3.3 (Draft)',
  },
  hero: {
    title: {
      line1: 'The ObjectStack',
      line2: 'Protocol',
    },
    subtitle: {
      line1: 'The Open Standard for Metadata-Driven Enterprise Software.',
      line2: 'Validatable. Database-Agnostic. AI-Native.',
    },
    cta: {
      primary: 'Start Building',
      secondary: 'Read Specification',
    },
  },
  codePreview: {
    filename: 'contract.zod.ts',
  },
  features: {
    objectql: {
      title: 'ObjectQL Data Layer',
      description: 'Strict JSON schemas for entities, fields, and relationships. It is the SQL you can send over the wire.',
    },
    objectui: {
      title: 'ObjectUI View Layer',
      description: 'Server-Driven UI protocol defining forms, grids, and dashboards. Decouples logic from the frontend implementation.',
    },
    objectos: {
      title: 'ObjectOS Kernel',
      description: 'The runtime contract for permissions, workflows, and automation. Stateless business logic execution.',
    },
    security: {
      title: 'Zero-Trust Security',
      description: 'Policy-as-Code. ACLs and Field Level Security are compiled into the database query engine.',
    },
    zodFirst: {
      title: 'Zod-First Definition',
      description: 'The entire protocol is defined in Zod. Runtime validation and static type inference come for free.',
    },
    universal: {
      title: 'Universal Backend',
      description: 'Protocol adapters for Postgres, MongoDB, REST and GraphQL. Write once, run on any infrastructure.',
    },
  },
  personas: {
    heading: 'Built for Builders',
    architect: {
      title: 'Platform Architects',
      description: 'Design scalable Internal Developer Platforms (IDP) that unify your data silos.',
      action: 'Explore Patterns',
    },
    aiEngineer: {
      title: 'AI Engineers',
      description: 'Feed LLMs with perfectly structured, deterministic JSON schemas they can actually understand.',
      action: 'View Codex',
    },
    frameworkBuilder: {
      title: 'Framework Builders',
      description: 'Implement the protocol in your language. Write drivers for React, Vue, Flutter, or Go.',
      action: 'Read Spec',
    },
  },
};

/**
 * Chinese Translations (中文翻译)
 */
export const cn: HomepageTranslations = {
  badge: {
    status: '协议规范',
    version: 'v1.0',
  },
  hero: {
    title: {
      line1: 'ObjectStack',
      line2: '协议',
    },
    subtitle: {
      line1: '元数据驱动企业软件的开放标准。',
      line2: '可验证。数据库无关。AI 原生。',
    },
    cta: {
      primary: '开始构建',
      secondary: '阅读规范',
    },
  },
  codePreview: {
    filename: 'contract.zod.ts',
  },
  features: {
    objectql: {
      title: 'ObjectQL 数据层',
      description: '严格的 JSON 模式定义实体、字段和关系。这是可以在网络上传输的 SQL。',
    },
    objectui: {
      title: 'ObjectUI 视图层',
      description: '定义表单、网格和仪表板的服务器驱动 UI 协议。将逻辑与前端实现解耦。',
    },
    objectos: {
      title: 'ObjectOS 内核',
      description: '权限、工作流和自动化的运行时契约。无状态业务逻辑执行。',
    },
    security: {
      title: '零信任安全',
      description: '策略即代码。ACL 和字段级安全被编译到数据库查询引擎中。',
    },
    zodFirst: {
      title: 'Zod 优先定义',
      description: '整个协议都用 Zod 定义。运行时验证和静态类型推断免费获得。',
    },
    universal: {
      title: '通用后端',
      description: 'Postgres、MongoDB、REST 和 GraphQL 的协议适配器。一次编写，在任何基础设施上运行。',
    },
  },
  personas: {
    heading: '为构建者而建',
    architect: {
      title: '平台架构师',
      description: '设计可扩展的内部开发者平台（IDP），统一你的数据孤岛。',
      action: '探索模式',
    },
    aiEngineer: {
      title: 'AI 工程师',
      description: '为 LLM 提供结构完美、确定性强的 JSON 模式，让它们能够真正理解。',
      action: '查看代码库',
    },
    frameworkBuilder: {
      title: '框架构建者',
      description: '用你的语言实现协议。为 React、Vue、Flutter 或 Go 编写驱动程序。',
      action: '阅读规范',
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
