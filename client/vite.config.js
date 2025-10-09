import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set the development server port to 5173
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Assuming the Vercel dev server runs on port 3000
        changeOrigin: true,
      },
    },
  },
});