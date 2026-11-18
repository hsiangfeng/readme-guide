import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '#layers/core': fileURLToPath(new URL('./layers/core', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['layers/**/tests/**/*.spec.ts'],
  },
})
