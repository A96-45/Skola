import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-progress',
      '@radix-ui/react-switch',
      'uuid',
      'date-fns',
      'recharts',
      'framer-motion',
      'next-themes',
      'react-day-picker'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
