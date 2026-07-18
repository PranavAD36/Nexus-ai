"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Orbit, ShieldCheck, Cpu, Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <main className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 -z-10 bg-aurora opacity-90" />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-5%] top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
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
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            Theme
          </Button>
          <Button size="sm" className="rounded-full">
            Get Started <ArrowRight size={16} />
          </Button>
        </div>
      </motion.header>

      <section id="home" className="mx-auto flex max-w-7xl flex-col px-6 pb-24 pt-6 lg:px-8 lg:pb-32 lg:pt-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100 backdrop-blur-xl">
              <Sparkles size={14} />
              Premium AI experience, reimagined
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
              Build the next era of intelligent products.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              A luxurious command center for ambitious teams crafting the future with clarity, motion, and cosmic elegance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="group">
                Explore Platform <ArrowRight className="transition group-hover:translate-x-1" size={18} />
              </Button>
              <Button variant="secondary" size="lg">
                View Vision
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-500/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-premium backdrop-blur-2xl">
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
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4.2, repeat: Infinity }} className="mt-6 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Holistic synthesis</span>
                  <span>∞</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Experience</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Crafted for visionary teams.</h2>
          </div>
          <Button variant="ghost" className="hidden sm:flex">
            Discover more
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
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
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-premium backdrop-blur-2xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">About</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">A sleek foundation for bold intelligent ideas.</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p className="text-lg leading-8">
                Nexus-AI presents a striking launch point for products shaped by clarity, motion, and modern aesthetics.
              </p>
              <p className="leading-8">
                Every surface is intentionally composed to feel calm, elevated, and ready for product storytelling.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 px-6 py-8 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
