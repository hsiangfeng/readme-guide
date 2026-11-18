import { assetUrl } from '#shared/utils/seo'

/**
 * 爬蟲規則：一般搜尋引擎與「AI 搜尋」放行，「AI 訓練」擋掉，最後宣告內容用途與網站地圖。
 * 這是全站唯一會寫出這些爬蟲名稱的地方（機器讀的檔案，沒有別的寫法）；其他頁面與文件都不寫 AI 廠商名稱，測試會檢查。
 */

/** AI 搜尋、使用者叫 AI 來讀的時候用的爬蟲：放行 */
const AI_SEARCH_AGENTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot']

/** 蒐集資料拿去訓練模型的爬蟲：擋掉 */
const AI_TRAINING_AGENTS = ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Bytespider', 'cohere-ai', 'FacebookBot', 'Applebot-Extended']

export default defineEventHandler((event) => {
  const group = (agents: string[], rule: string) => `${agents.map((agent) => `User-agent: ${agent}`).join('\n')}\n${rule}`
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return [
    group(AI_TRAINING_AGENTS, 'Disallow: /'),
    group(AI_SEARCH_AGENTS, 'Allow: /'),
    // 其他爬蟲（一般搜尋引擎）全部放行；內容用途：不給訓練、可以出現在搜尋、不拿去當 AI 的輸入
    'User-agent: *\nContent-Signal: ai-train=no, search=yes, ai-input=no\nAllow: /',
    `Sitemap: ${assetUrl('/sitemap.xml')}`,
  ].join('\n\n') + '\n'
})
