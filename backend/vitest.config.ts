import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': './src',
      '@/auth': './src/auth',
      '@/onboarding': './src/onboarding',
      '@/db': './src/db',
      '@/lib': './src/lib',
      '@/tests': './tests',
    },
  },
  tsconfig: './tsconfig.test.json',
});
