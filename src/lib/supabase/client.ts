import { createBrowserClient } from '@supabase/ssr';

const defaultSiteUrl = 'http://localhost:3000';

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured && configured !== '0.0.0.0' ? configured : defaultSiteUrl;
}

export function getAuthRedirectUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
