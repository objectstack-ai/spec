// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '@object-ui/i18n';
import App from './App';
import './index.css';
import { DEFAULT_LANGUAGE, loadLanguage } from './i18n';

const initialLanguage =
  (typeof localStorage !== 'undefined' && localStorage.getItem('account.lang')) ||
  (typeof navigator !== 'undefined' && navigator.language) ||
  DEFAULT_LANGUAGE;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider
      config={{
        defaultLanguage: initialLanguage,
        fallbackLanguage: DEFAULT_LANGUAGE,
      }}
      loadLanguage={loadLanguage}
    >
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
