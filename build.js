import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cpSync, existsSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyPublicAssets() {
  const publicDir = resolve(__dirname, 'public');
  const distDir = resolve(__dirname, 'dist');
  if (!existsSync(publicDir)) return;
  for (const name of readdirSync(publicDir)) {
    cpSync(resolve(publicDir, name), resolve(distDir, name), { force: true });
  }
  console.log('--- Copied public/ assets to dist/ ---');
}

async function runBuilds() {
  console.log('--- Phase 1: Building React UI (Dashboard & Sidepanel) ---');
  await build({
    configFile: false,
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
      rollupOptions: {
        input: {
          landing: resolve(__dirname, 'index.html'),
          dashboard: resolve(__dirname, 'dashboard.html'),
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
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
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
  copyPublicAssets();
}

runBuilds().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
