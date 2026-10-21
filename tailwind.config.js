/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        // Per-world accent, driven by a CSS variable that shifts as you travel.
        accent: 'rgb(var(--accent) / <alpha-value>)',
        signal: 'rgb(var(--signal) / <alpha-value>)',
        // section-scoped tokens (only defined inside certain themes)
        lane: 'rgb(var(--lane) / <alpha-value>)',
        ball: 'rgb(var(--ball) / <alpha-value>)',
        blau: 'rgb(var(--blau) / <alpha-value>)',
        grana: 'rgb(var(--grana) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        magenta: 'rgb(var(--magenta) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      fontSize: {
        colossal: 'clamp(3.5rem, 16vw, 18rem)',
        giant: 'clamp(2.75rem, 10vw, 9rem)',
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        cine: 'cubic-bezier(0.7, 0, 0.3, 1)',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        drift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        blink: 'blink 1.1s steps(1) infinite',
        drift: 'drift 3s ease-in-out infinite alternate',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
