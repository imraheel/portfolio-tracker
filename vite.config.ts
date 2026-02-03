import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Path aliases (same as Next.js)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Base path for Electron (relative paths required for file:// protocol)
  base: './',
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        // Use relative paths for Electron compatibility
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return 'assets/[name]-[hash][extname]';
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge', 'sonner']
        }
      }
    }
  },
  
  // Development server
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  
  // Environment variable prefix
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    devSourcemap: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'zod',
      'sonner',
      'lucide-react'
    ]
  }
});
