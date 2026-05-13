import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      '.trycloudflare.com',
      '.loca.lt',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app',
      '.pinggy.io',
      '.serveo.net',
    ],
    proxy: {
      '/socket.io': { target: 'http://localhost:3001', ws: true },
    },
  },
});
