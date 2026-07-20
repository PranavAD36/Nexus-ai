import { createBrowserClient } from '@supabase/ssr';

const defaultSiteUrl = 'http://localhost:3000';
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured && configured !== '0.0.0.0' ? configured : defaultSiteUrl;
}

export function getAuthRedirectUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}
