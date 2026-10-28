import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Jeepney livery: sun yellow, signal red, route blue on warm neutrals.
        jeep: {
          yellow: { DEFAULT: '#FFC20E', dark: '#E5AA00', soft: '#FFF4CC' },
          red: { DEFAULT: '#C8102E', dark: '#9E0C24', soft: '#FDE8EB' },
          blue: { DEFAULT: '#1D4E89', dark: '#143A68', soft: '#E4EDF8' },
        },
        ink: { DEFAULT: '#14171F', soft: '#4B5160', faint: '#6B7280' },
        paper: { DEFAULT: '#F7F5F0', card: '#FFFFFF', line: '#E4E0D6' },
      },
      fontFamily: {
        display: ['"Trebuchet MS"', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(20,23,31,0.04), 0 8px 24px -12px rgba(20,23,31,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
