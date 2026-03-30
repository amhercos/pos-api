import path from "path"
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load env file based on current mode ('development' by default)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 47897,
      host: true,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://localhost:7191', 
          secure: false,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('proxy error', err);
            });
          },
        }
      }
    }
  };
});