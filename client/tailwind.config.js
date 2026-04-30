/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1a1a',
          soft: '#2a2a2a',
          muted: '#6b6b6b',
        },
        paper: {
          DEFAULT: '#faf9f5',
          soft: '#f5f3ed',
          card: '#ffffff',
        },
        accent: {
          DEFAULT: '#c8553d',
          soft: '#e8b8af',
        },
        border: {
          DEFAULT: '#e8e4d8',
          strong: '#d4cfbf',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26, 26, 26, 0.04), 0 1px 3px rgba(26, 26, 26, 0.06)',
        card: '0 1px 2px rgba(26, 26, 26, 0.04), 0 4px 12px rgba(26, 26, 26, 0.04)',
      },
    },
  },
  plugins: [],
};
