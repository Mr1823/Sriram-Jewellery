import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Port 5000 is reserved by AirPlay Receiver on macOS, so the API port has to
  // be overridable. Defaults to 5000 so existing setups are unaffected.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@moxy/react-animate-text': path.resolve(__dirname, './src/components/AnimateText/AnimateText.jsx'),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        external: ['pdfjs-dist', 'pdfjs-dist/build/pdf.worker.entry'],
      },
    },
    server: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        external: ['pdfjs-dist', 'pdfjs-dist/build/pdf.worker.entry'],
      },
    },
  };
});
