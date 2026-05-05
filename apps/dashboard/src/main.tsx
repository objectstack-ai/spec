import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '@object-ui/i18n';
import './index.css';
import { App } from './App';

import '@object-ui/plugin-grid';
import '@object-ui/plugin-kanban';
import '@object-ui/plugin-calendar';
import '@object-ui/plugin-charts';
import '@object-ui/plugin-list';
import '@object-ui/plugin-detail';
import '@object-ui/plugin-view';
import '@object-ui/plugin-form';
import '@object-ui/plugin-dashboard';
import '@object-ui/plugin-report';

async function loadLanguage(lang: string): Promise<Record<string, unknown>> {
  try {
    const serverUrl = import.meta.env.VITE_SERVER_URL || '';
    const res = await fetch(`${serverUrl}/api/v1/i18n/translations/${lang}`);
    if (!res.ok) return {};
    const json = await res.json();
    return json?.data?.translations ?? json ?? {};
  } catch {
    return {};
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider loadLanguage={loadLanguage}>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
