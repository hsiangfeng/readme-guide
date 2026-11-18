import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { addPrerenderRoutes, addServerHandler, defineNuxtModule } from 'nuxt/kit'
import { GUIDE_ASSET_DIRS, listGuideFiles } from '../server/utils/guideFiles'

/** repo 根目錄 */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * 把撰寫指南的原始檔放上網站（清單與網址見 server/utils/guideFiles.ts）：
 * 1. 三個來源資料夾登記成伺服器資源，建置時打包進去（開發模式直接讀 repo 裡的檔案）。
 * 2. 每個檔案的網址交給同一個處理程式（server/handlers/guideFile.ts），照原文回應。
 * 3. 加進預先產生的清單，輸出成 .output/public 裡的靜態檔；網站地圖不列它們。
 * 4. 網址清單放進伺服器端的設定，llms.txt 用它列出網址。
 */
export default defineNuxtModule({
  meta: { name: 'guide-files' },
  setup(_options, nuxt) {
    const files = listGuideFiles(repoRoot)

    nuxt.options.nitro.serverAssets ||= []
    for (const [baseName, dir] of Object.entries(GUIDE_ASSET_DIRS)) {
      nuxt.options.nitro.serverAssets.push({ baseName, dir: join(repoRoot, dir) })
    }

    const handler = join(dirname(fileURLToPath(import.meta.url)), '../server/handlers/guideFile.ts')
    for (const file of files) addServerHandler({ route: file.path, handler })

    addPrerenderRoutes(files.map((file) => file.path))

    // 只在伺服器端（不在 public 底下），不會進到瀏覽器
    nuxt.options.runtimeConfig.guideFiles = files.map((file) => file.path)
  },
})
