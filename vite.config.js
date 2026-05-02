
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@theme/tailwindcss';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
