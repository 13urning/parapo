import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/**', 'components/**', 'features/**', 'hooks/**', 'lib/**', 'providers/**', 'middleware.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        'tests/**',
        '**/*.config.*',
        '**/*.d.ts',
        '.next/**',
        'public/**',
        // Leaflet needs a real browser canvas; covered by manual/E2E checks.
        'features/plan/TripMap.tsx',
      ],
    },
  },
});
