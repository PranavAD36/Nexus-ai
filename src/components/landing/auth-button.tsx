  "use client";

  import { useEffect, useRef, useState } from 'react';
  import { createClient } from '@/lib/supabase/client';
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
      };

      getSession();

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(Boolean(session));
      });

      return () => authListener.subscription.unsubscribe();
    }, [supabase]);

    const signInWithGoogle = async () => {
      await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectUrl() },
      });
    };

    const signOut = async () => {
      await getSupabase().auth.signOut();
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
