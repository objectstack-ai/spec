/**
 * ObjectStack Dashboard — fork-ready console template.
 *
 * This file owns the routing tree — fork and edit it. The building blocks
 * imported from @object-ui/app-shell (ConsoleShell, AuthenticatedRoute,
 * RootRedirect, Default* pages) encapsulate the provider stack and auth guard
 * so you only write JSX.
 *
 * Common customisations:
 *   - add routes: drop a <Route path="/billing" ... /> inside <Routes>
 *   - swap auth: replace <DefaultLoginPage /> with your own component
 *   - skip orgs: <AuthenticatedRoute requireOrganization={false}>
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@object-ui/auth';
import { Toaster } from 'sonner';
import {
  ConsoleShell,
  ConnectedShell,
  AuthenticatedRoute,
  RootRedirect,
  SystemRedirect,
  DefaultLoginPage,
  DefaultRegisterPage,
  DefaultForgotPasswordPage,
  DefaultHomeLayout,
  DefaultHomePage,
  DefaultOrganizationsLayout,
  DefaultOrganizationsPage,
  DefaultAppContent,
} from '@object-ui/app-shell';

const AUTH_URL = `${import.meta.env.VITE_SERVER_URL || ''}/api/v1/auth`;
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

export function App() {
  return (
    <AuthProvider authUrl={AUTH_URL}>
      <Toaster position="bottom-right" />
      <BrowserRouter basename={BASENAME}>
        <ConsoleShell>
          <Routes>
            <Route path="/login" element={<DefaultLoginPage />} />
            <Route path="/register" element={<DefaultRegisterPage />} />
            <Route path="/forgot-password" element={<DefaultForgotPasswordPage />} />
            <Route path="/home" element={
              <AuthenticatedRoute>
                <DefaultHomeLayout><DefaultHomePage /></DefaultHomeLayout>
              </AuthenticatedRoute>
            } />
            <Route path="/organizations" element={
              <AuthenticatedRoute requireOrganization={false}>
                <DefaultOrganizationsLayout><DefaultOrganizationsPage /></DefaultOrganizationsLayout>
              </AuthenticatedRoute>
            } />
            <Route path="/system/*" element={<SystemRedirect />} />
            <Route path="/apps/:appName/*" element={
              <AuthenticatedRoute>
                <DefaultAppContent />
              </AuthenticatedRoute>
            } />
            <Route path="/" element={<ConnectedShell><RootRedirect /></ConnectedShell>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ConsoleShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
