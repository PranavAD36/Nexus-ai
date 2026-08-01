  "use client";

  import { useEffect, useRef, useState } from 'react';
  import { createClient, resetClient } from '@/lib/supabase/client';
  import { getAuthRedirectUrl } from '@/lib/supabase/site-url';
  import { Button } from '@/components/ui/button';
  import { LogOut, Sparkles } from 'lucide-react';

  export function AuthButton() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

    const getSupabase = () => {
      if (!supabaseRef.current) {
        supabaseRef.current = createClient();
      }
      return supabaseRef.current;
    };

    useEffect(() => {
      const getSession = async () => {
        const { data } = await getSupabase().auth.getSession();
        setIsSignedIn(Boolean(data.session));
        setLoading(false);
      };

      getSession();

      const { data: authListener } = getSupabase().auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(Boolean(session));
      });

      return () => authListener.subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
      await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(),
          queryParams: { prompt: 'select_account' },
        },
      });
    };

    const signOut = async () => {
      const supabase = getSupabase();
      await supabase.auth.signOut({ scope: 'global' });
      await supabase.auth.getSession();
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      resetClient();
      setIsSignedIn(false);
      setLoading(false);
      window.location.assign('/');
    };

    if (loading) {
      return <Button variant="ghost" size="sm" disabled>Loading</Button>;
    }

    return isSignedIn ? (
      <Button variant="ghost" size="sm" onClick={signOut}>
        <LogOut size={16} /> Sign out
      </Button>
    ) : (
      <Button size="sm" onClick={signInWithGoogle}>
        <Sparkles size={16} /> Login
      </Button>
    );
  }
