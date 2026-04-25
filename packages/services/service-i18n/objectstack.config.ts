// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineStack } from '@objectstack/spec';

export default defineStack({
  manifest: {
    id: 'com.objectstack.service-i18n',
    namespace: 'sys',
    version: '1.0.0',
    type: 'plugin',
    scope: 'system',
    name: 'I18n Service',
    description: 'File-based internationalization service for ObjectStack (locales, translations, field labels)',
  },
});
