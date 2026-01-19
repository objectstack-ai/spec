import { NextRequest, NextResponse } from 'next/server';
import Negotiator from 'negotiator';
import { i18n } from '@/lib/i18n';

const LOCALE_COOKIE = 'FD_LOCALE';

/**
 * Helper to check if a language is supported
 */
const SUPPORTED_LANGUAGES = i18n.languages as readonly string[];

/**
 * Language code mapping
 * Maps browser language codes to our supported language codes
 */
const LANGUAGE_MAPPING: Record<string, string> = {
  'zh': 'cn',      // Chinese -> cn
  'zh-CN': 'cn',   // Chinese (China) -> cn
  'zh-TW': 'cn',   // Chinese (Taiwan) -> cn
  'zh-HK': 'cn',   // Chinese (Hong Kong) -> cn
};

/**
 * Normalize language code to match our supported languages
 */
function normalizeLanguage(lang: string): string {
  // Check direct mapping first
  if (LANGUAGE_MAPPING[lang]) {
    return LANGUAGE_MAPPING[lang];
  }
  
  // Check if the base language (without region) is mapped
  const baseLang = lang.split('-')[0];
  if (LANGUAGE_MAPPING[baseLang]) {
    return LANGUAGE_MAPPING[baseLang];
  }
  
  return lang;
}

/**
 * Get the preferred language from the request
 */
function getPreferredLanguage(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && SUPPORTED_LANGUAGES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Then check Accept-Language header
  const negotiatorHeaders = Object.fromEntries(request.headers.entries());
  const negotiator = new Negotiator({ headers: negotiatorHeaders });
  const browserLanguages = negotiator.languages();
  
  // Normalize browser languages to match our supported languages
  const normalizedLanguages = browserLanguages.map(normalizeLanguage);
  
  // Find the first match
  for (const lang of normalizedLanguages) {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      return lang;
    }
  }
  
  return i18n.defaultLanguage;
}

/**
 * Middleware for automatic language detection and redirection
 * 
 * This middleware:
 * - Detects the user's preferred language from browser settings or cookies
 * - Redirects users to the appropriate localized version
 * - For default language (en): keeps URL as "/" (with internal rewrite)
 * - For other languages (cn): redirects to "/cn/"
 * - Stores language preference as a cookie
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale
  const pathnameHasLocale = i18n.languages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract the locale from the pathname
    const locale = pathname.split('/')[1];
    
    // If it's the default locale and hideLocale is 'default-locale', redirect to remove locale prefix
    if (locale === i18n.defaultLanguage && i18n.hideLocale === 'default-locale') {
      const url = new URL(request.url);
      url.pathname = pathname.replace(`/${i18n.defaultLanguage}`, '') || '/';
      const response = NextResponse.redirect(url);
      response.cookies.set(LOCALE_COOKIE, locale);
      return response;
    }
    
    return NextResponse.next();
  }

  // Pathname doesn't have a locale, determine preferred language
  const preferredLanguage = getPreferredLanguage(request);

  // If preferred language is the default, rewrite internally (keep URL clean)
  if (preferredLanguage === i18n.defaultLanguage && i18n.hideLocale === 'default-locale') {
    const url = new URL(request.url);
    url.pathname = `/${i18n.defaultLanguage}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // For non-default languages, redirect to the localized path
  const url = new URL(request.url);
  url.pathname = `/${preferredLanguage}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, preferredLanguage);
  return response;
}

export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Next.js static files (/_next/static/*)
  // - Next.js image optimization (/_next/image/*)
  // - Favicon and other static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
