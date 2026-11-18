import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * 檢查產生出來的靜態網站（.output/public）：SEO、無障礙的基本要求。要先跑 pnpm generate。
 * 跟一般的測試分開，因為它要等建置完才有東西可以檢查。
 */
export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests-output/**/*.spec.ts'],
  },
})
