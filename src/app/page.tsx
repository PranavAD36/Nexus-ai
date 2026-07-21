"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Orbit, ShieldCheck, Cpu, Layers3, Github, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/landing/auth-button';
import { SectionShell } from '@/components/landing/section-shell';
import { SpaceScene } from '@/components/landing/space-scene';
import { createClient } from '@/lib/supabase/client';

const features = [
  {
    title: 'Cognitive Layer',
    description: 'A luminous control surface for orchestrating advanced AI experiences with elegance.',
    icon: Cpu,
  },
  {
    title: 'Adaptive Design',
    description: 'Shapes and transitions respond with cinematic fluidity across every viewport.',
    icon: Layers3,
  },
  {
    title: 'Secure by Tone',
    description: 'A refined foundation built for clarity, trust, and premium performance.',
    icon: ShieldCheck,
  },
];

const navItems = ['Home', 'Features', 'About', 'Contact'];

export default function Home() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        router.replace('/chat');
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    };

    void syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        router.replace('/chat');
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (authState === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 px-8 py-6 text-center shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-xl"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Nexus-AI</p>
          <p className="mt-3 text-lg font-medium">Preparing your workspace…</p>
        </motion.div>
      </main>
    );
  }

  if (authState !== 'authenticated') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-8%] top-[-8%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-[-5%] top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.16),transparent_25%)]" />
        </div>

        <motion.header
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8"
        >
          <a href="#home" className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/90 to-violet-500/90 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
              <Orbit size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.3em] text-white">NEXUS-AI</p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Future interface</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-slate-300 backdrop-blur-xl md:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-white">
                {item}
              </a>
            ))}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-white" aria-label="GitHub">
              <Github size={18} />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <AuthButton />
            </div>
            <Button variant="ghost" size="sm" className="md:hidden" aria-label="Toggle menu" onClick={() => setMobileMenuOpen((prev) => !prev)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </motion.header>

        {mobileMenuOpen ? (
          <div className="mx-6 mb-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                GitHub
              </a>
              <div className="pt-2">
                <AuthButton />
              </div>
            </div>
          </div>
        ) : null}

        <section id="home" className="mx-auto flex max-w-7xl flex-col px-6 pb-24 pt-6 lg:px-8 lg:pb-32 lg:pt-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100 backdrop-blur-xl">
                <Sparkles size={14} />
                Premium AI experience, reimagined
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
                Nexus-AI
              </h1>
              <p className="mt-4 text-2xl font-medium text-cyan-100/90 sm:text-3xl">
                The next generation AI assistant.
              </p>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                A beautifully crafted workspace for focused conversations, elegant automation, and quietly powerful AI support.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="group" onClick={() => router.push('/chat')}>
                  Start Chat <ArrowRight className="transition group-hover:translate-x-1" size={18} />
                </Button>
                <Button variant="secondary" size="lg" onClick={() => router.push('/chat')}>
                  Login
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-500/20 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_80px_rgba(34,211,238,0.14)] backdrop-blur-2xl">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <p className="text-sm text-slate-400">Signal status</p>
                    <p className="mt-1 text-lg font-medium text-white">Aurora Core Online</p>
                  </div>
                  <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity }} className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-cyan-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    Live
                  </motion.div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Latency', value: '12ms' },
                    { label: 'Clarity', value: '99.2%' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <SpaceScene />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionShell id="features" eyebrow="Experience" title="Crafted for visionary teams.">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-premium backdrop-blur-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-100">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
                  <div className="mt-6 h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500 group-hover:w-full" />
                  </div>
                </motion.article>
              );
            })}
          </div>
        </SectionShell>

        <section id="about" className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 shadow-premium backdrop-blur-xl">
              <p className="text-lg leading-8 text-slate-300">Next.js, TypeScript, Tailwind, Framer Motion, Supabase, and Three.js combine to form a premium platform foundation.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 shadow-premium backdrop-blur-xl">
              <p className="text-lg leading-8 text-slate-300">The structure is designed to scale cleanly as the product grows into a full AI platform.</p>
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 px-6 py-8 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 Nexus-AI. Designed for the future.</p>
          <div className="flex items-center gap-5">
            <a href="#home" className="transition hover:text-white">Home</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#about" className="transition hover:text-white">About</a>
          </div>
        </footer>
      </main>
    );
  }

  return null;
}
