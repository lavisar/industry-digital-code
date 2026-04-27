import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@scaffold': path.resolve(__dirname, 'src/scaffold'),
    },
  },
  test: {
    include: ['src/**/*.spec.ts'],
  },
});
