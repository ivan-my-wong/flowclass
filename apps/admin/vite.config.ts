import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    envDir: path.resolve(__dirname, '../..'),
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
      },
    }
  } as UserConfig
})
