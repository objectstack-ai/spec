import { redirect } from 'next/navigation';
import { i18n } from '@/lib/i18n';

export default function RootPage() {
  // Middleware should handle this, but as a fallback
  redirect(`/${i18n.defaultLanguage}`);
}
