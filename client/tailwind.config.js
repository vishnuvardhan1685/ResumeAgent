/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0c0e14',
        surface: '#13151e',
        elevated: '#1a1d2a',
        hover: '#20243a',
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f52d4',
          muted: 'rgba(99,102,241,0.15)',
        },
        border: {
          subtle: '#1e2235',
          DEFAULT: '#252840',
          active: '#3d42a0',
        },
        text: {
          primary: '#e8eaf6',
          secondary: '#8b8fa8',
          muted: '#4a4f6a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [],
};