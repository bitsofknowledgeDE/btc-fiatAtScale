import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    /**
     * The shared CI components live outside the site folder (../../CI), so a
     * bare `lucide-react` import inside CI/web/ShareOnX.tsx has no
     * node_modules to resolve against. Map it back into this site — the same
     * wiring the tsconfig `paths` already do for the type checker (pattern:
     * Websites/btc-realATH/vite.config.ts).
     */
    alias: {
      'lucide-react': path.resolve(here, './node_modules/lucide-react/dist/esm/lucide-react.js'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * WP-2.4: the site used to ship one ~1.54 MB chunk. Vendor code that
         * does not change between releases gets its own long-lived immutable
         * chunk (netlify.toml caches /assets/* for a year); recharts is only
         * reached through a React.lazy section, so it never blocks the first
         * paint. The app code stays small.
         *
         * framer-motion is deliberately NOT listed here: every use was a
         * trivial fade/slide and is now a CSS transition (`.reveal*`/`.pop-in`
         * in src/index.css), so the library is no longer imported at all. The
         * dependency stays in package.json (no uninstall in this pass) but
         * never reaches the bundle.
         */
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client'],
          recharts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
