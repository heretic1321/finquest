import path from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-three-fiber': ['@react-three/fiber'],
          'react-three-drei': ['@react-three/drei'],
          leva: ['leva'],
          three: ['three'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@client': '/src',
      '@server': path.resolve(__dirname, 'server/src'),
    },
  },
})
