import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  // Hover styles only apply where the device can really hover, so taps never leave a sticky hover.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#15181C', soft: '#545B66', faint: '#5F6670' },
        line: '#E6E8E7',
        surface: { DEFAULT: '#F2F4F3', deep: '#E8ECEA' },
        // Brand green: #08744C clears 4.5:1 on white and on its own tint.
        brand: { DEFAULT: '#08744C', dark: '#065C3C', 50: '#E7F4EE' },
        // Amber is reserved for the "Cheapest" tag and live state.
        signal: { DEFAULT: '#FFB020', ink: '#3A2A00' },
        danger: { DEFAULT: '#B42318', 50: '#FDECEA' },
        mapbg: '#E9EEE9',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        pop: '0 8px 24px -6px rgba(21,24,28,0.18), 0 2px 6px rgba(21,24,28,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
