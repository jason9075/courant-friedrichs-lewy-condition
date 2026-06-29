import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/courant-friedrichs-lewy-condition/' : '/',
  server: {
    port: 8080,
  },
  build: {
    outDir: 'dist',
  },
});
