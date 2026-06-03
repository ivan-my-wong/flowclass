import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv, UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const root = path.resolve(__dirname, '../..');
  const env = loadEnv(mode, root, '');
  const webBaseUrl = env.NEXT_PUBLIC_WEB_BASE_URL || env.VITE_WEB_BASE_URL || 'http://localhost:3001';

  return {
    envDir: root,
    define: {
      'import.meta.env.VITE_WEB_BASE_URL': JSON.stringify(webBaseUrl),
    },
    plugins: [react(), visualizer({ filename: 'analyze.html', gzipSize: true })],
    assetsInclude: ['**/*.md', '**/*.csv'],
    server: {
      port: 3000,
      // dev proxy server
      proxy: {
        ...(mode === 'development'
          ? {
            '/api': {
              target: 'https://flowclass.io',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          }
          : {}),
      },
    },
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          warn(warning);
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, "./src"),
        'lodash': 'lodash-es'
      },
    }
  } as UserConfig
})
