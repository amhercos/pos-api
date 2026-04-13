import path from "path"
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isTauri = process.env.TAURI_PLATFORM !== undefined;

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    clearScreen: false,
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },


    server: {
      port: 47897,
      strictPort: true,
      host: true,
      watch: {
        usePolling: !isTauri, 
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:5130', 
          secure: false,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('proxy error', err);
            });
          },
        }
      }
    },

   
    envPrefix: ['VITE_', 'TAURI_'],

    build: {
      target: 'chrome120', 
      minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
      sourcemap: !!process.env.TAURI_DEBUG,
    },
  };
});