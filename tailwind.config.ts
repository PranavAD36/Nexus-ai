import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#04070d',
        foreground: '#f5f7ff',
        accent: '#7c3aed',
        glow: '#22d3ee',
      },
      boxShadow: {
        premium: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 70px rgba(2,6,23,0.55)',
      },
      backgroundImage: {
        aurora: 'radial-gradient(circle at top left, rgba(34,211,238,0.25), transparent 32%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.22), transparent 24%), linear-gradient(135deg, rgba(2,6,23,0.9), rgba(15,23,42,0.95))',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 18s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(40px,-40px,0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
