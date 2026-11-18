import { guideAsset, guideFileHeaders } from '../utils/guideFiles'

/**
 * 撰寫指南的原始檔（/skill.md、/skill/references/*、/templates/<語言>/*、/rules/*.json）：照原文回應，一個位元組都不改。
 * 由 modules/guideFiles.ts 逐一註冊網址（只有清單上的檔案會到這裡），建置時再預先產生成靜態檔。
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const asset = guideAsset(path)
  const body = asset ? await useStorage(`assets:${asset.base}`).getItemRaw(asset.key) : null
  if (body === null || body === undefined) throw createError({ statusCode: 404, statusMessage: `找不到 ${path}` })
  setResponseHeaders(event, guideFileHeaders(path.endsWith('.json') ? 'json' : 'markdown'))
  return body
})
