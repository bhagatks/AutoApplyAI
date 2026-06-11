import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runBuilds() {
  console.log('--- Phase 1: Building React UI (Dashboard & Sidepanel) ---');
  await build({
    configFile: false,
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
      rollupOptions: {
        input: {
          dashboard: resolve(__dirname, 'index.html'),
          sidepanel: resolve(__dirname, 'sidepanel.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
    },
  });

  console.log('--- Phase 2: Building Background Service Worker (Self-Contained) ---');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      minify: false,
      lib: {
        entry: resolve(__dirname, 'src/background/index.ts'),
        name: 'background',
        formats: ['es'],
        fileName: () => 'background.js',
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });

  console.log('--- Phase 3: Building Content Script (Self-Contained) ---');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      minify: false,
      lib: {
        entry: resolve(__dirname, 'src/content/index.ts'),
        name: 'content',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });

  console.log('--- Build Complete ---');
}

runBuilds().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
