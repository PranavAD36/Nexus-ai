"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAuthRedirectUrl } from '@/lib/supabase/site-url';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles } from 'lucide-react';

export function AuthButton() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsSignedIn(Boolean(data.session));
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthRedirectUrl() },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
